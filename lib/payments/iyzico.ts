import type { PaymentProvider } from "./provider";

const keysPresent = () => !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY && process.env.IYZICO_BASE_URL);

// iyzico sağlayıcı. Gerçek anahtarlar yoksa mock checkout akışı kullanılır;
// yapı gerçek iyzico CheckoutForm entegrasyonuna hazır.
export const iyzicoProvider: PaymentProvider = {
  name: "iyzico",

  async startCheckout(order) {
    if (keysPresent()) {
      // TODO (gerçek entegrasyon): iyzipay CheckoutFormInitialize.create(...) çağır,
      // dönen paymentPageUrl'i checkoutUrl olarak döndür. callbackUrl =
      // `${SITE_URL}/api/payments/iyzico/callback`. conversationId = order.provider_conversation_id.
      // Anahtarlar gelene kadar mock akış aktif.
    }
    const checkoutUrl = `/api/payments/iyzico/callback?conversationId=${encodeURIComponent(order.provider_conversation_id)}&status=success&mock=1`;
    return { provider: "iyzico", conversationId: order.provider_conversation_id, checkoutUrl, mock: true };
  },

  parseCallback(params, body) {
    const conversationId = params.get("conversationId") || body?.conversationId || body?.conversation_id || null;
    const paymentId =
      params.get("paymentId") || body?.paymentId || body?.payment_id ||
      (conversationId ? `mock_${conversationId.slice(3, 15)}` : null);
    const raw = (params.get("status") || body?.status || body?.paymentStatus || "").toString().toLowerCase();
    const success = raw === "success" || raw === "paid" || raw === "1" || raw === "true";
    return { conversationId, paymentId, success };
  },
};
