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

    // 1. Obtener credenciales de la BD
    const settings = await db.setting.findMany({
      where: { key: "payment_mp_access_token" },
    });
    const accessToken = settings.find((s) => s.key === "payment_mp_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 });
    }

    // 2. Crear orden local en estado PENDING
    const orderData: any = {
      userId,
      email,
      subtotal,
      total: subtotal,
      status: "PENDING",
      paymentMethod: "MERCADOPAGO",
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

    const order = await db.order.create({
      data: orderData,
    });

    // 3. Crear Preferencia en MercadoPago
    let mpItems = [];
    if (isMembership) {
      mpItems = [{
        id: planId,
        title: "Suscripción Membresía",
        quantity: 1,
        currency_id: "USD",
        unit_price: Number(subtotal),
      }];
    } else {
      mpItems = items.map((item: any) => ({
        id: item.productId,
        title: item.productTitle,
        quantity: item.quantity,
        currency_id: "USD",
        unit_price: Number(item.salePrice ?? item.price),
      }));
    }

    const preferenceData = {
      items: mpItems,
      payer: {
        email: email,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?pending=true`,
      },
      auto_return: "approved",
      external_reference: order.id, // Muy importante para el Webhook
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceData),
    });

    const preference = await mpRes.json();

    if (preference.init_point) {
      return NextResponse.json({ url: preference.init_point });
    } else {
      console.error("MP Error:", preference);
      throw new Error("No se pudo crear la preferencia en MercadoPago");
    }
  } catch (error) {
    console.error("[MP_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Error procesando el pago con MercadoPago" }, { status: 500 });
  }
}
