import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MarketingShell from "@/components/marketing/MarketingShell";
import { normalizeLang } from "@/lib/i18n";
import {
  ArrowRight, ShieldCheck, Sparkles, Crown, Gem, Eye, Radio, Gift,
  Heart, MessageCircle, Image as ImageIcon, Coins, MapPin, Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

// 5 premium özellik kartı
const FEATURES = [
  { icon: Gem, t: "Premium Tasarım Dili", d: "Onyx zemin, mat pirinç vurgu ve zarif tipografi. Her ekran sakin bir lüks hissi verir." },
  { icon: Eye, t: "Güçlü İlk İzlenim", d: "Fotoğraf değil karakter önce gelir. Bulanık başlar, sohbet derinleştikçe açılır." },
  { icon: Radio, t: "Canlı ve Etkileşimli", d: "Moments, sesli tanışma, canlı sosyal deneyim ve 101 masaları tek platformda." },
  { icon: Gift, t: "Lüks Hediye Deneyimi", d: "Sinematik 3D hediyeler ve premium jeton ekonomisiyle anlamlı jestler." },
  { icon: ShieldCheck, t: "Güven ve Kalite", d: "KVKK uyumu, 18+ doğrulama, profil onayı ve denetimli, güvenli bir topluluk." },
];

// Ürün bölümleri
const PRODUCTS = [
  { id: "kesfet", icon: Heart, label: "Keşfet", title: "Karakterle eşleş, yüzeyle değil", desc: "Karakter uyumu, bulanık fotoğraf mantığı ve mesafe önceliği ile gerçek bağ kurmaya odaklı keşif. Önce kim olduğun konuşur." },
  { id: "moments", icon: ImageIcon, label: "Moments & Reels", title: "Yaşadığın anları paylaş", desc: "Instagram tadında içerik akışı, hikayeler ve reels. Topluluğunla zarif, koyu bir arayüzde etkileşim kur." },
  { id: "magaza", icon: Coins, label: "Hediye Mağazası", title: "Premium hediye ekonomisi", desc: "Süper yat, elmas, aşk kulesi… 35 sinematik 3D hediye. TikTok/Bigo kalitesinde gönderim animasyonları." },
  { id: "guvenlik", icon: Lock, label: "Güvenlik", title: "Güvenli ve denetimli", desc: "KVKK & 5651 uyumu, doğrulanmış profiller, denetimli içerik ve fotoğraf gizliliği tamamen sende." },
];

const TIERS = [
  { name: "Plus", desc: "Sınırsız beğeni, seni beğenenleri gör, geri al." },
  { name: "Premium", desc: "Öne çık, profil ziyaretçileri, gelişmiş filtreler.", hot: true },
  { name: "Premium Plus", desc: "Lüks profil çerçevesi, özel rozetler, ayrıcalıklı görünüm." },
];

const STORIES = [
  { q: "Fotoğrafa değil, sohbete bakarak tanıştık. İlk kez biri beni gerçekten dinledi gibi hissettim.", n: "Elif", c: "İstanbul" },
  { q: "Sesli tanıtım kartı her şeyi değiştirdi — yazıdan değil, tonundan anladım uyumu.", n: "Mert", c: "İzmir" },
  { q: "Etkinlik üzerinden tanışınca buz çoktan erimiş oluyor. Çok daha doğal.", n: "Zeynep", c: "Ankara" },
];

const FAQ = [
  { q: "Ahenk nasıl çalışıyor?", a: "Önce karakterin, ilgi alanların ve yaşam tarzın eşleşir; fotoğraf sohbet ilerledikçe açılır. Yüzeysel değil, gerçek uyuma odaklanırız." },
  { q: "Ücretsiz mi?", a: "Evet, temel kullanım tamamen ücretsiz. Daha fazla görünürlük ve ayrıcalık isteyenler için Premium planlar var." },
  { q: "Güvenli mi?", a: "18+ doğrulama, profil onayı, şikayet/engelleme ve aktif moderasyon ile güvenli bir topluluk sağlıyoruz. Fotoğrafların gizliliği sende." },
  { q: "Kimler kullanıyor?", a: "Yüzeysel değil gerçek bir bağ arayan yetişkinler. Ciddi tanışma ve nitelikli sohbet önceliğimiz." },
];

const MOCK_GIFTS = ["superyat", "elmas", "kraliyet", "dunya", "askkulesi", "uzay"];

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", user.id)
      .single();
    redirect(profile?.onboarded ? "/kesfet" : "/onboarding");
  }

  const lang = normalizeLang(cookies().get("lang")?.value);

  return (
    <MarketingShell lang={lang}>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12%] h-[420px] w-[680px] max-w-[94vw] -translate-x-1/2 rounded-full bg-accent/10 blur-[150px]" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-28">
          {/* Sol — metin */}
          <div className="lp-rise text-center lg:text-left">
            <span className="lp-chip mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles size={14} /> Premium sosyal keşif platformu
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              Karakter önce,
              <span className="block text-accent">yüz sonra.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
              Ahenk; keşif, moments, canlı sosyal deneyim ve premium hediye ekonomisini
              tek bir zarif platformda birleştirir.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="lp-cta-gold flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition"
              >
                Hemen Başla <ArrowRight size={18} />
              </Link>
              <Link
                href="/#nasil"
                className="lp-cta-ghost rounded-full px-7 py-3.5 font-semibold transition"
              >
                Nasıl Çalışır?
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted lg:justify-start">
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent" /> 18+ doğrulamalı</span>
              <span className="flex items-center gap-2"><Lock size={16} className="text-accent" /> Fotoğraf gizliliği sende</span>
              <span className="flex items-center gap-2"><Crown size={16} className="text-accent" /> Premium deneyim</span>
            </div>
          </div>

          {/* Sağ — 3 telefon mockup */}
          <div className="relative flex items-center justify-center gap-3 sm:gap-5">
            {/* Keşfet */}
            <div className="lp-float-1 hidden sm:block" style={{ marginTop: "2.5rem" }}>
              <PhoneFrame>
                <div className="flex h-full flex-col p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold text-accent">Keşfet</span>
                    <MapPin size={11} className="text-muted" />
                  </div>
                  <div className="ahenk-photo-card relative flex-1 overflow-hidden rounded-2xl">
                    <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#241f17,#121013)", filter: "blur(2px)" }} />
                    <div className="absolute inset-x-0 bottom-0 p-2.5">
                      <div className="h-2 w-16 rounded-full bg-white/80" />
                      <div className="mt-1.5 h-1.5 w-10 rounded-full bg-white/35" />
                      <div className="mt-2 flex gap-1">
                        <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[7px] text-accent">Sanat</span>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[7px] text-white/60">Seyahat</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-muted">✕</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full lp-cta-gold"><Heart size={15} /></span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-accent"><MessageCircle size={13} /></span>
                  </div>
                </div>
              </PhoneFrame>
            </div>

            {/* Moments (orta, öne çıkan) */}
            <div className="lp-float-2 z-10">
              <PhoneFrame featured>
                <div className="flex h-full flex-col p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold text-accent">Moments</span>
                    <Heart size={11} className="text-muted" />
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    {[0, 1].map((k) => (
                      <div key={k} className="lp-panel rounded-xl p-2">
                        <div className="flex items-center gap-1.5">
                          <span className="h-5 w-5 rounded-full bg-gradient-to-br from-accent/50 to-brand/40" />
                          <div className="h-1.5 w-12 rounded-full bg-white/40" />
                        </div>
                        <div className="mt-1.5 h-14 rounded-lg" style={{ background: "linear-gradient(160deg,#201c15,#111014)" }} />
                        <div className="mt-1.5 flex gap-2 text-muted">
                          <Heart size={9} /><MessageCircle size={9} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PhoneFrame>
            </div>

            {/* Hediye Mağazası */}
            <div className="lp-float-3 hidden sm:block" style={{ marginTop: "2.5rem" }}>
              <PhoneFrame>
                <div className="flex h-full flex-col p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold text-accent">Hediye</span>
                    <span className="flex items-center gap-1 text-[8px] text-accent"><Coins size={9} /> 12.4K</span>
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-1.5">
                    {MOCK_GIFTS.map((g) => (
                      <div key={g} className="lp-panel flex items-center justify-center rounded-xl p-1">
                        <Image src={`/gifts/${g}.png`} alt="" width={48} height={48} className="h-auto w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" />
                      </div>
                    ))}
                  </div>
                </div>
              </PhoneFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ÖZELLİK KARTLARI ===================== */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-3 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Neden Ahenk?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            Premium bir sosyal keşif deneyimini ayakta tutan beş temel.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.t} className="lp-panel lp-panel-hover rounded-2xl p-5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "rgba(199,169,119,0.10)" }}>
                    <Icon size={20} className="text-accent" strokeWidth={1.8} />
                  </div>
                  <p className="font-display font-bold">{f.t}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== ÜRÜN BÖLÜMLERİ ===================== */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl space-y-5 px-5 py-20">
          {PRODUCTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                id={p.id}
                className={`lp-panel grid items-center gap-8 rounded-3xl p-8 sm:p-10 lg:grid-cols-2 ${i % 2 ? "lg:[direction:rtl]" : ""}`}
              >
                <div className="[direction:ltr]">
                  <span className="lp-chip mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
                    <Icon size={13} /> {p.label}
                  </span>
                  <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">{p.desc}</p>
                </div>
                <div className="[direction:ltr]">
                  <div
                    className="relative h-44 overflow-hidden rounded-2xl border border-white/8 sm:h-52"
                    style={{ background: "radial-gradient(circle at 30% 20%, rgba(199,169,119,0.12), transparent 60%), linear-gradient(160deg,#1a1812,#0e0d10)" }}
                  >
                    <Icon size={88} className="absolute right-6 top-1/2 -translate-y-1/2 text-accent/15" strokeWidth={1} />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-2">
                      <div className="h-2.5 w-28 rounded-full bg-white/25" />
                      <div className="h-2 w-20 rounded-full bg-white/12" />
                      <div className="h-2 w-24 rounded-full bg-accent/30" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== PREMIUM ===================== */}
      <section id="premium" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-3 flex items-center justify-center gap-2 text-accent">
            <Crown size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Premium</span>
          </div>
          <h2 className="mb-3 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Daha fazlasını isteyenlere
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            Görünürlüğünü artır, seni beğenenleri gör, ayrıcalıklı bir profil deneyimi yaşa.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`lp-panel relative rounded-2xl p-6 ${tier.hot ? "border-accent/40" : ""}`}
                style={tier.hot ? { borderColor: "rgba(199,169,119,0.45)" } : undefined}
              >
                {tier.hot && (
                  <span className="lp-cta-gold absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                    Popüler
                  </span>
                )}
                <p className="font-display text-lg font-bold">{tier.name}</p>
                <p className="mt-2 text-sm text-muted">{tier.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-6 py-3 font-semibold text-accent transition hover:bg-accent/10">
              Planları gör <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== HİKAYELER ===================== */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ahenk nasıl bir his?
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {STORIES.map((s) => (
              <figure key={s.n} className="lp-panel rounded-2xl p-6">
                <Gem size={20} className="mb-3 text-accent/60" />
                <blockquote className="text-[15px] leading-relaxed">{s.q}</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <span className="lp-monogram flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold">
                    {s.n[0]}
                  </span>
                  <span className="text-sm text-muted">{s.n} · {s.c}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SSS ===================== */}
      <section id="nasil" className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="mb-10 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Sıkça sorulan sorular
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="lp-panel group rounded-2xl p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span className="ml-3 text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SON CTA ===================== */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Gerçek bir bağ, bir sohbet uzağında.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Bugün Ahenk’e katıl — karakter önce, yüz sonra.
          </p>
          <Link
            href="/register"
            className="lp-cta-gold mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold transition"
          >
            Ahenk’e Katıl <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}

// Telefon çerçevesi — sunucu tarafında render edilir
function PhoneFrame({ children, featured }: { children: React.ReactNode; featured?: boolean }) {
  return (
    <div className="lp-phone" style={featured ? { width: 234, borderColor: "rgba(199,169,119,0.4)" } : undefined}>
      <div className="lp-phone-notch" />
      <div className="lp-phone-screen">{children}</div>
    </div>
  );
}
