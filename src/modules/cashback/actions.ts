"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/mail";

export async function getCashbackConfig() {
  let config = await db.cashbackConfig.findFirst();
  if (!config) {
    config = await db.cashbackConfig.create({
      data: { percentage: 5, minOrderAmount: 0, maxCashbackAmount: 50, expiresInDays: 90, isActive: true },
    });
  }
  return {
    percentage: config.percentage,
    minOrderAmount: Number(config.minOrderAmount),
    maxCashbackAmount: Number(config.maxCashbackAmount),
    expiresInDays: config.expiresInDays,
    isActive: config.isActive,
  };
}

export async function calculateCashback(orderTotal: number): Promise<number> {
  const config = await getCashbackConfig();
  if (!config.isActive) return 0;
  if (orderTotal < config.minOrderAmount) return 0;

  const raw = (orderTotal * config.percentage) / 100;
  return Math.min(raw, config.maxCashbackAmount);
}

export async function creditCashback(userId: string, orderId: string, amount: number) {
  if (amount <= 0) return;

  await db.cashbackTransaction.create({
    data: {
      userId,
      orderId,
      type: "EARNED",
      amount,
      reference: `Cashback ganado por pedido #${orderId.slice(0, 8)}`,
    },
  });

  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (user) {
    sendMail({
      to: user.email,
      subject: `¡Ganaste $${amount.toFixed(2)} en cashback!`,
      html: `<h3>¡Cashback acreditado!</h3><p>Hola ${user.name ?? ""}, has ganado <strong>$${amount.toFixed(2)}</strong> en cashback por tu compra.</p><p>Úsalo en tu próxima compra desde el checkout.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rewards">Ver mi saldo</a></p>`,
    }).catch(() => {});
  }

  revalidatePath("/dashboard/rewards");
}

export async function getUserBalance(userId: string): Promise<number> {
  const [earned, spent] = await Promise.all([
    db.cashbackTransaction.aggregate({ where: { userId, type: "EARNED" }, _sum: { amount: true } }),
    db.cashbackTransaction.aggregate({ where: { userId, type: "SPENT" }, _sum: { amount: true } }),
  ]);
  return Number(earned._sum.amount ?? 0) - Number(spent._sum.amount ?? 0);
}

export async function spendCashback(userId: string, orderId: string, amount: number) {
  if (amount <= 0) return;
  await db.cashbackTransaction.create({
    data: {
      userId,
      orderId,
      type: "SPENT",
      amount,
      reference: `Cashback usado en pedido #${orderId.slice(0, 8)}`,
    },
  });
  revalidatePath("/dashboard/rewards");
}

export async function getCashbackTransactions(userId: string) {
  return db.cashbackTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getTotalEarned(userId: string): Promise<number> {
  const agg = await db.cashbackTransaction.aggregate({
    where: { userId, type: "EARNED" },
    _sum: { amount: true },
  });
  return Number(agg._sum.amount ?? 0);
}

// Admin
export async function updateCashbackConfigAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "No autorizado" };

  const percentage = parseFloat(formData.get("percentage") as string) || 5;
  const minOrder = parseFloat(formData.get("minOrderAmount") as string) || 0;
  const maxCashback = parseFloat(formData.get("maxCashbackAmount") as string) || 50;
  const expires = parseInt(formData.get("expiresInDays") as string) || 90;
  const active = formData.get("isActive") === "true";

  const existing = await db.cashbackConfig.findFirst();
  if (existing) {
    await db.cashbackConfig.update({
      where: { id: existing.id },
      data: { percentage, minOrderAmount: minOrder, maxCashbackAmount: maxCashback, expiresInDays: expires, isActive: active },
    });
  } else {
    await db.cashbackConfig.create({
      data: { percentage, minOrderAmount: minOrder, maxCashbackAmount: maxCashback, expiresInDays: expires, isActive: active },
    });
  }

  revalidatePath("/admin/cashback");
  return { success: "Configuración guardada" };
}

export async function getCashbackStats() {
  const [totalEarned, totalSpent, totalUsers] = await Promise.all([
    db.cashbackTransaction.aggregate({ where: { type: "EARNED" }, _sum: { amount: true } }),
    db.cashbackTransaction.aggregate({ where: { type: "SPENT" }, _sum: { amount: true } }),
    db.cashbackTransaction.groupBy({ by: ["userId"], where: { type: "EARNED" } }).then((r) => r.length),
  ]);

  return {
    totalEarned: Number(totalEarned._sum.amount ?? 0),
    totalSpent: Number(totalSpent._sum.amount ?? 0),
    totalUsers,
  };
}
