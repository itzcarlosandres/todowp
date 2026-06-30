"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const schema = z.object({
  email: z.string().email().toLowerCase(),
  source: z.string().optional(),
});

export async function subscribeNewsletterAction(input: { email: string; source?: string }) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Email inválido" };
  }

  const ip = await getClientIp();
  const limit = rateLimit({ key: `newsletter:${ip}`, limit: 5, windowMs: 60_000 });
  if (!limit.success) return { success: false, error: "Demasiadas solicitudes" };

  const existing = await db.newsletter.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    if (existing.isSubscribed) {
      return { success: true, alreadySubscribed: true };
    }
    await db.newsletter.update({
      where: { email: parsed.data.email },
      data: { isSubscribed: true, unsubscribedAt: null },
    });
  } else {
    await db.newsletter.create({
      data: {
        email: parsed.data.email,
        tags: parsed.data.source ? [parsed.data.source] : [],
      },
    });
  }

  return { success: true };
}
