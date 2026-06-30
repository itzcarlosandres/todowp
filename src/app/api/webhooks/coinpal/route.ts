import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Coinpal envía un status y orderNo
    if (body.status === "Success" && body.orderNo) {
      const orderId = body.orderNo;
      
      // Aquí normalmente verificaríamos el 'sign' con el App Secret de Coinpal para seguridad
      
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentId: body.tradeNo,
          paymentStatus: body.status,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COINPAL_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
