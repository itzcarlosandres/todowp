"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const applyCouponSchema = z.object({
  code: z.string().min(1).max(40).toUpperCase(),
  orderTotal: z.number().min(0),
});

export async function applyCouponAction(input: { code: string; orderTotal: number }) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Necesitas iniciar sesión" };

  const parsed = applyCouponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Datos inválidos" };

  const ip = await getClientIp();
  const limit = rateLimit({ key: `coupon:${session.user.id}`, limit: 10, windowMs: 60_000 });
  if (!limit.success) return { success: false, error: "Demasiadas solicitudes" };

  const coupon = await db.coupon.findUnique({ where: { code: parsed.data.code } });

  if (!coupon || !coupon.isActive) {
    return { success: false, error: "Cupón no válido" };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { success: false, error: "Cupón expirado" };
  }
  if (coupon.startsAt && coupon.startsAt > new Date()) {
    return { success: false, error: "Cupón aún no disponible" };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { success: false, error: "Cupón agotado" };
  }
  if (coupon.minOrderAmount && parsed.data.orderTotal < Number(coupon.minOrderAmount)) {
    return {
      success: false,
      error: `Mínimo de compra: $${Number(coupon.minOrderAmount)}`,
    };
  }

  const userOrders = await db.order.count({
    where: { userId: session.user.id, couponId: coupon.id, status: "PAID" },
  });
  if (userOrders >= coupon.maxUsesPerUser) {
    return { success: false, error: "Ya has usado este cupón" };
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? (parsed.data.orderTotal * Number(coupon.value)) / 100
      : Number(coupon.value);

  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
    },
    discount: Math.min(discount, parsed.data.orderTotal),
  };
}
