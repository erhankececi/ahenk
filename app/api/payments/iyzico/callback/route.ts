import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

async function handle(conversationId: string | null, paymentId: string | null, success: boolean, payload: any, origin: string, status = 307) {
  const successUrl = new URL("/wallet/success", origin);
  const cancelUrl = new URL("/wallet/cancel", origin);
  if (!success || !conversationId) return NextResponse.redirect(cancelUrl, status);
  try {
    const admin = createAdminClient();
    const { error } = await admin.rpc("credit_coin_order", {
      p_provider_conversation_id: conversationId,
      p_provider_payment_id: paymentId,
      p_payload: payload,
    });
    return NextResponse.redirect(error ? cancelUrl : successUrl, status);
  } catch {
    return NextResponse.redirect(cancelUrl, status);
  }
}

// iyzico GET ile döndüğünde (veya mock checkout linki)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = getPaymentProvider();
  const p = provider.parseCallback(url.searchParams, {});
  return handle(p.conversationId, p.paymentId, p.success, { source: "callback-get", query: Object.fromEntries(url.searchParams) }, url.origin, 307);
}

// iyzico gerçek callback genelde POST (form-encoded) gönderir
export async function POST(req: Request) {
  const url = new URL(req.url);
  let body: any = {};
  try { body = Object.fromEntries((await req.formData()).entries()); } catch { try { body = await req.json(); } catch {} }
  const provider = getPaymentProvider();
  const p = provider.parseCallback(url.searchParams, body);
  // POST → GET sayfaya yönlendirme için 303
  return handle(p.conversationId, p.paymentId, p.success, { source: "callback-post", body }, url.origin, 303);
}
