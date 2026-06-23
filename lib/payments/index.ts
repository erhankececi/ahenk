import { iyzicoProvider } from "./iyzico";
import type { PaymentProvider } from "./provider";

// Aktif ödeme sağlayıcısı (Türkiye → iyzico). İleride env ile değiştirilebilir.
export function getPaymentProvider(): PaymentProvider {
  return iyzicoProvider;
}

export type { PaymentProvider, PaymentOrder, CheckoutResult } from "./provider";
