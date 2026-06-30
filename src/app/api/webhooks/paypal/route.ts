import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Evento de captura completada
    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = body.resource;
      const orderId = resource.custom_id || resource.invoice_id || resource.supplementary_data?.related_ids?.order_id;
      
      // En nuestra implementación, la referencia se pasó como reference_id o lo capturamos
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
      
      // Activar membresía si aplica
      const metadata = updatedOrder.metadata as any;
      if (metadata && metadata.isMembership && metadata.planId) {
        const { activateMembershipForUser } = await import("@/lib/membership");
        await activateMembershipForUser(metadata.planId, updatedOrder.userId!);
      }
      
      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
