import { db } from "@/lib/db";
import { calculateCashback, creditCashback } from "@/modules/cashback";
import { sendReactEmail, sendMail } from "@/lib/mail";
import { PurchaseConfirmationEmail } from "@/emails/purchase-confirmation";

export async function handlePaymentCompleted(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order || !order.userId) return;

    const metadata = order.metadata as any;
    if (metadata?.isMembership) return;

    // Cashback
    const cashback = await calculateCashback(Number(order.total));
    if (cashback > 0) {
      await creditCashback(order.userId, order.id, cashback);
    }

    // Purchase confirmation email
    if (order.user?.email) {
      const items = order.items.map((item) => ({
        title: item.productTitle,
        price: Number(item.unitPrice),
        currency: order.currency,
      }));

      sendReactEmail(
        order.user.email,
        `Confirmación de compra #${order.orderNumber} — TodoWP`,
        PurchaseConfirmationEmail({
          name: order.user.name ?? "Cliente",
          orderNumber: order.orderNumber,
          total: Number(order.total),
          currency: order.currency,
          items,
          downloadAllUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/downloads`,
        }),
      ).catch(() => {});
    }
  } catch (e) {
    console.error("[WEBHOOK_COMPLETED_ERROR]", e);
  }
}
