"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { sanitizeText } from "@/lib/sanitize";

const favoriteSchema = z.object({
  productId: z.string().min(1),
});

export async function toggleFavoriteAction(input: { productId: string }) {
  const parsed = favoriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Necesitas iniciar sesión" };
  }

  const ip = await getClientIp();
  const limit = rateLimit({ key: `fav:${session.user.id}`, limit: 30, windowMs: 60_000 });
  if (!limit.success) {
    return { success: false, error: "Demasiadas solicitudes" };
  }

  const existing = await db.favorite.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId: parsed.data.productId },
    },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    await db.product.update({
      where: { id: parsed.data.productId },
      data: { favoriteCount: { decrement: 1 } },
    });
    revalidatePath("/dashboard/favorites");
    return { success: true, action: "removed" as const };
  }

  await db.favorite.create({
    data: { userId: session.user.id, productId: parsed.data.productId },
  });
  await db.product.update({
    where: { id: parsed.data.productId },
    data: { favoriteCount: { increment: 1 } },
  });
  revalidatePath("/dashboard/favorites");
  return { success: true, action: "added" as const };
}

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  body: z.string().min(10).max(2000),
  pros: z.array(z.string()).max(5).optional(),
  cons: z.array(z.string()).max(5).optional(),
});

export async function createReviewAction(input: z.infer<typeof reviewSchema>) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos", issues: parsed.error.issues };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Necesitas iniciar sesión" };
  }

  const ip = await getClientIp();
  const limit = rateLimit({ key: `review:${session.user.id}`, limit: 5, windowMs: 60_000 });
  if (!limit.success) {
    return { success: false, error: "Demasiadas solicitudes" };
  }

  // Verificar compra
  const hasPurchased = await db.order.findFirst({
    where: {
      userId: session.user.id,
      status: "PAID",
      items: { some: { productId: parsed.data.productId } },
    },
  });

  const data = sanitizeText(parsed.data.body);

  try {
    await db.review.create({
      data: {
        userId: session.user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        title: sanitizeText(parsed.data.title),
        body: data,
        pros: parsed.data.pros ?? [],
        cons: parsed.data.cons ?? [],
        verified: Boolean(hasPurchased),
        status: "APPROVED",
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Ya has valorado este producto" };
    }
    throw error;
  }

  // Recalcular rating
  const agg = await db.review.aggregate({
    where: { productId: parsed.data.productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.product.update({
    where: { id: parsed.data.productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count._all,
    },
  });

  revalidatePath(`/product/[slug]`, "page");
  return { success: true };
}
