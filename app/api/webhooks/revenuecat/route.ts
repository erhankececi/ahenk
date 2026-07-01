import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { planFromEntitlements } from "@/lib/plans";

// RevenueCat -> Supabase abonelik webhook'u.
// Receipt doğrulaması RevenueCat'te yapılır; biz yalnız AUTH header'lı, imzalı olayı işleriz.
// Middleware'de /api/webhooks PUBLIC. Anahtar yoksa pasiftir (503).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function storeName(s?: string) {
  const v = (s || "").toUpperCase();
  if (v === "APP_STORE" || v === "MAC_APP_STORE") return "app_store";
  if (v === "PLAY_STORE") return "play_store";
  if (v === "STRIPE") return "stripe";
  return (s || "unknown").toLowerCase();
}

export async function POST(req: Request) {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  if (req.headers.get("authorization") !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ev = body?.event;
  if (!ev) return NextResponse.json({ error: "no_event" }, { status: 400 });

  // app_user_id = Supabase user.id (Purchases.logIn ile bağlanır). Anonim/yanlışsa atla.
  const userId = ev.app_user_id as string | undefined;
  if (!userId || !UUID.test(userId)) {
    return NextResponse.json({ received: true, skipped: "no_valid_app_user_id" });
  }

  const { entitlement, plan } = planFromEntitlements(ev.entitlement_ids);
  const type = String(ev.type || "");
  const status =
    type === "EXPIRATION"
      ? "expired"
      : type === "BILLING_ISSUE"
        ? "billing_issue"
        : type === "SUBSCRIPTION_PAUSED"
          ? "paused"
          : "active"; // INITIAL_PURCHASE / RENEWAL / CANCELLATION (süre sonuna kadar aktif) / PRODUCT_CHANGE ...

  const periodEnd = ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null;
  const env = String(ev.environment || "").toUpperCase() === "SANDBOX" ? "sandbox" : "production";
  const eventId = String(ev.id || `${userId}:${ev.event_timestamp_ms || ev.product_id || type}`);

  const admin = createAdminClient();
  const { error } = await admin.rpc("apply_subscription_event", {
    p_user: userId,
    p_store: storeName(ev.store),
    p_product: ev.product_id || "unknown",
    p_entitlement: entitlement,
    p_plan: plan,
    p_status: status,
    p_period_end: periodEnd,
    p_event_id: eventId,
    p_event_type: type,
    p_env: env,
    p_raw: ev,
  });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ received: true });
}
