import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";

export const dynamic = "force-dynamic";

// iyzico webhook — payload'ı kaydeder, başarılı ödemeyi idempotent kredile eder.
export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { try { body = Object.fromEntries((await req.formData()).entries()); } catch {} }

  const provider = getPaymentProvider();
  const p = provider.parseCallback(new URL(req.url).searchParams, body);

  const admin = createAdminClient();

  // her webhook'u kaydet (idempotent kredileme RPC tarafında garanti)
  let eventId: string | null = null;
  try {
    const { data } = await admin
      .from("payment_webhook_events")
      .insert({
        provider: provider.name,
        event_id: body?.eventId || body?.event_id || null,
        conversation_id: p.conversationId,
        payment_id: p.paymentId,
        status: (body?.status || body?.paymentStatus || null)?.toString() ?? null,
        payload: body,
      })
      .select("id")
      .single();
    eventId = data?.id ?? null;
  } catch {
    // event kaydı başarısızsa bile kredilemeyi dene
  }

  if (p.success && p.conversationId) {
    const { error } = await admin.rpc("credit_coin_order", {
      p_provider_conversation_id: p.conversationId,
      p_provider_payment_id: p.paymentId,
      p_payload: body,
    });
    if (eventId) {
      await admin.from("payment_webhook_events").update({ processed: !error, processing_error: error?.message || null }).eq("id", eventId);
    }
  }

  // webhook her zaman 200 döner (sağlayıcı retry etmesin)
  return NextResponse.json({ received: true });
}
