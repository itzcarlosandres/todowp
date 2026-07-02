import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { applyCashbackToOrder } from "@/modules/cashback/checkout-helper";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { items, subtotal, type, planId, useCashback } = await req.json();

    const isMembership = type === "membership";

    if (!isMembership && (!items || items.length === 0)) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const email = session?.user?.email || "guest@example.com";
    const userId = session?.user?.id;

    const settings = await db.setting.findMany({
      where: { key: "payment_mp_access_token" },
    });
    const accessToken = settings.find((s) => s.key === "payment_mp_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "MercadoPago no está configurado" }, { status: 500 });
    }

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

    const order = await db.order.create({ data: orderData });

    let finalTotal = subtotal;
    if (useCashback && userId && !isMembership) {
      const result = await applyCashbackToOrder(userId, order.id, subtotal);
      if (result.discount > 0) {
        finalTotal = result.finalTotal;
        await db.order.update({
          where: { id: order.id },
          data: { discount: result.discount, total: result.finalTotal },
        });
      }
    }

    let mpItems = [];
    if (isMembership) {
      mpItems = [{
        id: planId,
        title: "Suscripción Membresía",
        quantity: 1,
        currency_id: "USD",
        unit_price: Number(finalTotal),
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

    const preferenceRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: mpItems,
        external_reference: order.id,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}`,
        },
        auto_return: "approved",
      }),
    });

    const preference = await preferenceRes.json();

    if (preference.init_point) {
      return NextResponse.json({ url: preference.init_point });
    } else {
      throw new Error("No se pudo obtener el link de pago de MercadoPago");
    }
  } catch (error) {
    console.error("[MP_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Error procesando el pago con MercadoPago" }, { status: 500 });
  }
}
