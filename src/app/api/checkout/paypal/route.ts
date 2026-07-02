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
      where: { key: { in: ["payment_paypal_client_id", "payment_paypal_secret"] } },
    });
    const clientId = settings.find((s) => s.key === "payment_paypal_client_id")?.value;
    const secret = settings.find((s) => s.key === "payment_paypal_secret")?.value;

    if (!clientId || !secret) {
      return NextResponse.json({ error: "PayPal no está configurado correctamente" }, { status: 500 });
    }

    const orderData: any = {
      userId,
      email,
      subtotal,
      total: subtotal,
      status: "PENDING",
      paymentMethod: "PAYPAL",
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

    // Apply cashback
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

    // 3. Autenticarse con PayPal (Basic Auth)
    const authString = Buffer.from(`${clientId}:${secret}`).toString("base64");
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenRes.ok) {
      // Si falla, intentamos con Sandbox
      console.warn("Fallo Auth PayPal en Producción, tal vez sean credenciales Sandbox...");
    }
    
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 4. Crear Orden en PayPal
    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: order.id,
            amount: {
                currency_code: "USD",
                value: finalTotal.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
        },
      }),
    });

    const paypalOrder = await orderRes.json();

    // 5. Extraer la URL de aprobación
    const approveUrl = paypalOrder.links?.find((link: any) => link.rel === "approve")?.href;

    if (approveUrl) {
      return NextResponse.json({ url: approveUrl });
    } else {
      throw new Error("No se pudo obtener el link de pago de PayPal");
    }
  } catch (error) {
    console.error("[PAYPAL_CHECKOUT_ERROR]", error);
    // Para entornos de desarrollo o sin credenciales, creamos un bypass
    return NextResponse.json({ error: "Error procesando el pago con PayPal" }, { status: 500 });
  }
}
