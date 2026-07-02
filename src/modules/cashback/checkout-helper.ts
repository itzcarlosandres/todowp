import { db } from "@/lib/db";
import { getUserBalance, spendCashback } from "@/modules/cashback";

export async function applyCashbackToOrder(userId: string, orderId: string, subtotal: number): Promise<{ discount: number; finalTotal: number }> {
  let discount = 0;
  try {
    const balance = await getUserBalance(userId);
    if (balance > 0) {
      discount = Math.min(balance, subtotal);
      if (discount > 0) {
        await spendCashback(userId, orderId, discount);
      }
    }
  } catch { /* cashback is optional, don't block checkout */ }

  return {
    discount,
    finalTotal: Math.max(subtotal - discount, 0),
  };
}
