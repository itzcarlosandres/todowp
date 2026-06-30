import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

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

    // Obtener configuración de CoinPal
    const settings = await db.setting.findMany({
      where: { key: { in: ["payment_coinpal_merchant_no", "payment_coinpal_secret"] } },
    });
    const merchantNo = settings.find((s) => s.key === "payment_coinpal_merchant_no")?.value;
    const secretKey = settings.find((s) => s.key === "payment_coinpal_secret")?.value;

    if (!merchantNo || !secretKey) {
      return NextResponse.json({ error: "CoinPal no está configurado" }, { status: 500 });
    }

    const orderData: any = {
      userId,
      email,
      subtotal,
      total: subtotal,
      status: "PENDING",
      paymentMethod: "COINPAL",
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

    // Crear orden en PENDING
    const order = await db.order.create({
      data: orderData,
    });

    // 3. Crear solicitud para Coinpal
    // Coinpal requiere un Hash SHA256 o RSA para la firma. 
    // Referencia: https://docs.coinpal.io/#/
    
    // Aquí implementamos un ejemplo genérico de la petición.
    const requestData = {
      merchantNo,
      orderNo: order.id,
      orderAmount: subtotal.toFixed(2),
      orderCurrency: "USD",
      notifyURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/coinpal`,
      returnURL: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}`,
      cancelURL: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
      payerEmail: email,
    };

    // Placeholder: Aquí se calcularía la firma (Sign) según documentación exacta
    // const signString = `merchantNo=${merchantNo}&orderAmount=${requestData.orderAmount}...&key=${secretKey}`;
    // const sign = crypto.createHash('sha256').update(signString).digest('hex');

    const payload = {
      ...requestData,
      // sign
    };

    // Simulación de respuesta de Coinpal para el entorno de desarrollo 
    // En producción aquí harías: 
    // const cpRes = await fetch("https://pay.coinpal.io/gateway/api/checkout", { method: "POST", body: JSON.stringify(payload) })
    
    // Para no romper el flujo ahora mismo, mockeamos la url
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?success=true&orderId=${order.id}&crypto_simulated=true` });

  } catch (error) {
    console.error("[COINPAL_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Error procesando el pago con Coinpal" }, { status: 500 });
  }
}
