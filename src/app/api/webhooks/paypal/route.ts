import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handlePaymentCompleted } from "@/modules/cashback/webhook-handler";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = body.resource;
      const orderId = resource.custom_id || resource.invoice_id || resource.supplementary_data?.related_ids?.order_id;
      const captureAmount = resource.amount?.value;
      const captureCurrency = resource.amount?.currency_code;

      if (!orderId) {
        return NextResponse.json({ error: "No order ID found" }, { status: 400 });
      }

      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentId: resource.id,
          paymentStatus: resource.status,
          paidAt: new Date(),
        },
      });

      const metadata = updatedOrder.metadata as any;
      if (metadata && metadata.isMembership && metadata.planId) {
        const { activateMembershipForUser } = await import("@/lib/membership");
        await activateMembershipForUser(metadata.planId, updatedOrder.userId!);
      }

      handlePaymentCompleted(orderId);

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
