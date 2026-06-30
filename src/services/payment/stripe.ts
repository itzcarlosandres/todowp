import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentStatus,
  RefundResult,
  WebhookEvent,
} from "./types";

/**
 * Stripe payment provider.
 * En F2+ se implementará usando el SDK real.
 * Por ahora devuelve stubs funcionales.
 */
export class StripeProvider implements PaymentProvider {
  name = "stripe";
  isActive = true;
  isTestMode = true;

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // TODO F2: Integrar Stripe SDK
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({...});
    return {
      success: true,
      paymentId: `stub_stripe_${Date.now()}`,
      clientSecret: "stub_client_secret",
      redirectUrl: input.successUrl,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    return {
      status: "pending",
      paymentId,
      amount: 0,
      currency: "USD",
    };
  }

  async refund(paymentId: string): Promise<RefundResult> {
    return { success: true, refundId: `stub_refund_${Date.now()}` };
  }

  verifyWebhook(payload: string, signature: string): WebhookEvent | null {
    // TODO F2: Verificar firma con stripe.webhooks.constructEvent
    return null;
  }
}

export const stripeProvider = new StripeProvider();
