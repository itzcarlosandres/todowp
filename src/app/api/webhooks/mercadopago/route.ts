import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "payment.created" && body.data?.id) {
      const paymentId = body.data.id;

      // Obtener Token de la BD
      const settings = await db.setting.findMany({
        where: { key: "payment_mp_access_token" },
      });
      const accessToken = settings.find((s) => s.key === "payment_mp_access_token")?.value;

      if (!accessToken) {
        throw new Error("Missing MP Access Token");
      }

      // Consultar el estado del pago
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payment = await res.json();

      if (payment.status === "approved" && payment.external_reference) {
        const orderId = payment.external_reference;

        const updatedOrder = await db.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            paymentId: paymentId.toString(),
            paymentStatus: payment.status,
            paidAt: new Date(),
          },
        });

        // Activar membresía si aplica
        const metadata = updatedOrder.metadata as any;
        if (metadata && metadata.isMembership && metadata.planId) {
          const { activateMembershipForUser } = await import("@/lib/membership");
          await activateMembershipForUser(metadata.planId, updatedOrder.userId!);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[MP_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
