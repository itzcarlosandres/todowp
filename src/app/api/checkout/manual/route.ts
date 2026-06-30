import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { items, subtotal, type, planId } = await req.json();

    const isMembership = type === "membership";

    if (!isMembership && (!items || items.length === 0)) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const email = session?.user?.email || "guest@example.com";
    const userId = session?.user?.id;

    const orderData: any = {
      userId,
      email,
      subtotal,
      total: subtotal,
      status: "PENDING",
      paymentMethod: "BANK_TRANSFER",
    };

    if (isMembership) {
      orderData.metadata = { isMembership: true, planId };
    } else {
      orderData.items = {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.salePrice ?? item.price,
          totalPrice: (item.salePrice ?? item.price) * item.quantity,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          productImage: item.productImage,
          license: item.license,
        })),
      };
    }

    // Crear la orden en la BD
    const order = await db.order.create({
      data: orderData,
    });

    // Retornamos success: true para que el frontend muestre la página de confirmación 
    // y el usuario reciba las instrucciones de transferencia manual
    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("[MANUAL_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Error procesando el pago manual" }, { status: 500 });
  }
}
