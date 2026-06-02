import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Sunucu-otoritesi paketler (istemciye güvenilmez). Fiyat TL, jeton miktarı sabit.
const PACKAGES: Record<string, { jeton: number; price: number; label: string }> = {
  p100: { jeton: 100, price: 29, label: "100 Jeton" },
  p300: { jeton: 300, price: 69, label: "300 Jeton" },
  p750: { jeton: 750, price: 149, label: "750 Jeton" },
  p2000: { jeton: 2000, price: 299, label: "2000 Jeton" },
};

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const pack = PACKAGES[body?.pkg as string];
  if (!pack) return NextResponse.json({ ok: false, error: "bad_pkg" }, { status: 400 });

  // ----- PRODUCTION: gerçek ödeme (Stripe). Anahtar varsa Checkout oturumu aç. -----
  // Kredilendirme ödeme onayında webhook'ta yapılır (/api/webhooks/stripe), burada değil.
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      // @ts-ignore — stripe opsiyonel bağımlılık, production'da kurulur: npm i stripe
      const Stripe = (await import(/* webpackIgnore: true */ "stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "try",
              unit_amount: pack.price * 100,
              product_data: { name: `Ahenk — ${pack.label}` },
            },
          },
        ],
        success_url: `${origin}/cuzdan?satin=ok`,
        cancel_url: `${origin}/cuzdan?satin=iptal`,
        client_reference_id: user.id,
        metadata: { user_id: user.id, jeton: String(pack.jeton), pkg: body.pkg },
      });
      return NextResponse.json({ ok: true, url: session.url });
    } catch {
      return NextResponse.json({ ok: false, error: "stripe_unavailable" }, { status: 500 });
    }
  }

  // ----- DEMO: ödeme sağlayıcı bağlı değil -> jetonu anında yükle (açıkça demo). -----
  // GÜVENLİK: demo yalnız production DIŞINDA (veya açık ALLOW_DEMO_PURCHASE izniyle).
  // Aksi halde canlıda Stripe'sız bedava jeton basılmasını engelle (ekonomi istismarı).
  const demoIzin =
    process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_PURCHASE === "true";
  if (!demoIzin) {
    return NextResponse.json(
      { ok: false, error: "odeme_yapilandirilmamis" },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const key = `jetonbuy:demo:${crypto.randomUUID()}`;
  const { data: balance, error } = await admin.rpc("award_jeton", {
    p_user: user.id,
    p_key: key,
    p_amount: pack.jeton,
    p_reason: `${pack.label} (demo satın alma)`,
  });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true, demo: true, jeton: pack.jeton, balance });
}
