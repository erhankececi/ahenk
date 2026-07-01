import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Stripe ödeme onayı buraya düşer. İmza doğrulanır, sonra jeton kredilendirilir.
// Anahtarlar yoksa (demo/geliştirme) pasiftir. Middleware'de /api/webhooks PUBLIC.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text(); // imza doğrulaması için HAM gövde şart
  let event: any;
  try {
    // @ts-ignore — stripe opsiyonel bağımlılık, production'da kurulur: npm i stripe
    const Stripe = (await import(/* webpackIgnore: true */ "stripe")).default;
    const stripe = new Stripe(key);
    event = stripe.webhooks.constructEvent(raw, sig, whSecret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const userId = s.metadata?.user_id || s.client_reference_id;
    const jeton = parseInt(s.metadata?.jeton || "0", 10);
    if (userId && jeton > 0) {
      const admin = createAdminClient();
      // idempotent: aynı ödeme (session.id) iki kez kredilenmez
      await admin.rpc("award_jeton", {
        p_user: userId,
        p_key: `stripe:${s.id}`,
        p_amount: jeton,
        p_reason: "Jeton satın alma",
      });
    }
  }

  return NextResponse.json({ received: true });
}
