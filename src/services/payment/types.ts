/**
 * Payment provider interface.
 * Implementaciones: stripe, paypal, mercadopago, binance, crypto, bank.
 */
export interface PaymentProvider {
  name: string;
  isActive: boolean;
  isTestMode: boolean;

  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  refund(paymentId: string, amount?: number): Promise<RefundResult>;
  verifyWebhook(payload: string, signature: string): WebhookEvent | null;
}

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePaymentResult {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  clientSecret?: string;
  error?: string;
}

export interface PaymentStatus {
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  paymentId: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface WebhookEvent {
  type: string;
  paymentId: string;
  status: PaymentStatus["status"];
  metadata?: Record<string, string>;
}
