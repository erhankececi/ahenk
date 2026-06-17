import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Growth Sağlık Paneli — aktivasyon/dönüşüm hunisi (mevcut tablolardan türetilir).
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const admin = createAdminClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const DAY = 86400_000;
  const dayAgo = new Date(now.getTime() - DAY).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * DAY).toISOString();

  const cnt = (q: any) => q.then((r: any) => r.count ?? 0);

  const base = () => admin.from("profiles").select("id", { count: "exact", head: true }).is("deleted_at", null);

  const [
    signups,
    onboarded,
    bioOk,
    referred,
    premiumActive,
    dau,
    wau,
    dailyAnswers,
    interactions,
    messages,
    kuruluk,
  ] = await Promise.all([
    cnt(base()),
    cnt(base().eq("onboarded", true)),
    cnt(base().not("bio", "is", null)),
    cnt(base().not("referred_by", "is", null)),
    cnt(base().gt("premium_until", nowIso)),
    cnt(base().gte("last_active", dayAgo)),
    cnt(base().gte("last_active", weekAgo)),
    cnt(admin.from("daily_answers").select("user_id", { count: "exact", head: true })),
    cnt(admin.from("interactions").select("to_user", { count: "exact", head: true })),
    cnt(admin.from("messages").select("id", { count: "exact", head: true })),
    cnt(base().lte("member_no", 1000).gt("member_no", 0)),
  ]);

  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  // Aktivasyon hunisi (per-user alanlardan; her adım kullanıcı sayısı).
  const huni = [
    { key: "kayit", label: "Kayıt oldu", value: signups, pct: 100 },
    { key: "onboard", label: "Onboarding tamamladı", value: onboarded, pct: pct(onboarded, signups) },
    { key: "bio", label: "Bio/profil doldurdu", value: bioOk, pct: pct(bioOk, signups) },
    { key: "wau", label: "Son 7 gün aktif", value: wau, pct: pct(wau, signups) },
    { key: "davet", label: "Davetle geldi", value: referred, pct: pct(referred, signups) },
    { key: "premium", label: "Aktif premium", value: premiumActive, pct: pct(premiumActive, signups) },
  ];

  // Hacim metrikleri (toplam etkileşim).
  const hacim = {
    dau,
    wau,
    dailyAnswers,
    interactions,
    messages,
    kurucuUye: kuruluk,
  };

  return NextResponse.json({ huni, hacim, signups });
}
