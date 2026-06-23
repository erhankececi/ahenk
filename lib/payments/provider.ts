// Ödeme sağlayıcı soyutlaması — aktif sağlayıcı iyzico; ileride Stripe vb. eklenebilir.

export type PaymentOrder = {
  id: string;
  user_id: string;
  provider_conversation_id: string;
  amount_try: number;
  total_coins: number;
};

export type CheckoutResult = {
  provider: string;
  conversationId: string;
  checkoutUrl: string;
  mock: boolean;
};

export type CallbackParse = {
  conversationId: string | null;
  paymentId: string | null;
  success: boolean;
};

export interface PaymentProvider {
  name: string;
  /** Ödeme oturumu başlat → kullanıcının yönlendirileceği checkoutUrl. */
  startCheckout(order: PaymentOrder, opts: { siteUrl?: string }): Promise<CheckoutResult>;
  /** callback/webhook verisini doğrula/ayrıştır. */
  parseCallback(params: URLSearchParams, body: any): CallbackParse;
}
