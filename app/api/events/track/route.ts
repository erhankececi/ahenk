import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Granüler event kaydı. Yalnız oturumlu kullanıcı. KVKK: allowlist + sade metadata.
const VALID = new Set([
  "referral_link_copied",
  "referral_link_shared",
  "premium_paywall_viewed",
  "premium_cta_clicked",
  "journey_step_clicked",
  // Jeton ekonomisi
  "coin_wallet_opened",
  "coin_package_clicked",
  "coin_purchase_clicked",
  "coin_checkout_started",
  "coin_demo_checkout_clicked",
  // Hediye ekonomisi
  "gift_store_opened",
  "gift_selected",
  "gift_send_clicked",
  "gift_sent",
]);

// Yalnız güvenli, hassas olmayan anahtarlar; değerler kısa string/number.
const SAFE_KEYS = new Set(["plan", "source", "key", "pkg", "value", "amount", "price"]);

function sanitize(meta: any): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (meta && typeof meta === "object") {
    for (const k of Object.keys(meta)) {
      if (!SAFE_KEYS.has(k)) continue;
      const v = meta[k];
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
      else if (typeof v === "string") out[k] = v.slice(0, 60);
    }
  }
  return out;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { event, metadata } = await req.json().catch(() => ({}));
  if (typeof event !== "string" || !VALID.has(event)) {
    return NextResponse.json({ ok: false, error: "gecersiz" }, { status: 400 });
  }

  // RLS: user_id = auth.uid() şartı politika tarafından zorlanır.
  await supabase.from("analytics_events").insert({ user_id: user.id, event_name: event, metadata: sanitize(metadata) });
  return NextResponse.json({ ok: true });
}
