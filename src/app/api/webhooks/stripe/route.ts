import { NextResponse, type NextRequest } from "next/server";

/**
 * Stripe webhook handler.
 * En F2+ se implementará completamente.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";

    // TODO F2: Verificar firma y procesar evento
    // const event = stripeProvider.verifyWebhook(body, signature);
    // switch (event.type) { ... }

    console.log("[stripe webhook]", { signature, bodyLength: body.length });
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook error]", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
