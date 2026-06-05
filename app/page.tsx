import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, normalizeLang } from "@/lib/i18n";
import {
  Heart, MessageCircle, Phone, ShieldCheck, ArrowRight, Crown, Sparkles,
  CalendarHeart, Mic, Users, Lock, Quote,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TIERS = [
  { name: "Plus", desc: "Sınırsız beğeni, seni beğenenleri gör, geri al.", cls: "border-border" },
  { name: "Premium", desc: "Öne çık, profil ziyaretçileri, gelişmiş filtreler.", cls: "border-accent/40", hot: true },
  { name: "Premium Plus", desc: "Lüks profil çerçevesi, özel rozetler, ayrıcalıklı görünüm.", cls: "border-border" },
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
  const t = getDict(lang);
  const featIcons = [Heart, MessageCircle, Phone, ShieldCheck];

  return (
    <MarketingShell lang={lang}>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[380px] w-[620px] max-w-[92vw] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" />
          <div className="absolute left-[20%] top-[20%] h-[260px] w-[360px] rounded-full bg-brand/10 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:py-32">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 text-sm text-accent">
            <Sparkles size={14} /> {t.hero.tagline}
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {t.hero.title.split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{t.hero.subtitle}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              {t.hero.ctaPrimary} <ArrowRight size={18} />
            </Link>
            <Link
              href="/#nasil"
              className="rounded-full border border-border px-7 py-3.5 font-semibold transition hover:border-text/40"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          {/* Sosyal kanıt / güven şeridi */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-success" /> 18+ doğrulamalı topluluk</span>
            <span className="flex items-center gap-2"><Lock size={16} className="text-accent" /> Fotoğraf gizliliği sende</span>
            <span className="flex items-center gap-2"><Mic size={16} className="text-brand" /> Sesle tanışma</span>
          </div>
        </div>
      </section>

      {/* ---------- Neden Ahenk (özellikler) ---------- */}
      <section id="ozellikler" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight">{t.features.title}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((f, i) => {
              const Icon = featIcons[i] || Heart;
              return (
                <div
                  key={f.t}
                  className="group rounded-2xl border border-border bg-bg p-6 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-soft"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 transition group-hover:bg-accent/15">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="mt-1.5 text-sm text-muted">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Nasıl çalışır ---------- */}
      <section id="nasil" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight">{t.how.title}</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {t.how.steps.map((s, i) => (
              <div key={s.t} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 font-display text-lg font-bold text-accent">
                  {i + 1}
                </div>
                <p className="font-semibold">{s.t}</p>
                <p className="mt-1.5 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Premium avantajlar ---------- */}
      <section id="premium" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-3 flex items-center justify-center gap-2 text-accent">
            <Crown size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">Premium</span>
          </div>
          <h2 className="mb-3 text-center font-display text-3xl font-bold tracking-tight">Daha fazlasını isteyenlere</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted">
            Görünürlüğünü artır, seni beğenenleri gör, ayrıcalıklı bir profil deneyimi yaşa.
          </p>
          <div className="grid gap-5 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border bg-bg p-6 ${tier.cls} ${tier.hot ? "shadow-soft" : ""}`}
              >
                {tier.hot && (
                  <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-[#1c1407]">
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

      {/* ---------- Etkinlikler ---------- */}
      <section className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <CalendarHeart size={26} className="text-brand" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Ekranı bırak, gerçek hayatta tanış</h2>
          <p className="max-w-2xl text-muted">
            Ahenk etkinlikleriyle ortak ilgi alanların etrafında bir araya gel. Buz çoktan erimiş,
            tanışmak çok daha doğal.
          </p>
        </div>
      </section>

      {/* ---------- Kullanıcı hikayeleri ---------- */}
      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight">Ahenk nasıl bir his?</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {STORIES.map((s) => (
              <figure key={s.n} className="rounded-2xl border border-border bg-bg p-6">
                <Quote size={22} className="mb-3 text-accent/60" />
                <blockquote className="text-[15px] leading-relaxed">{s.q}</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-brand/30 text-xs font-bold">
                    {s.n[0]}
                  </span>
                  <span className="text-sm text-muted">{s.n} · {s.c}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Güvenlik ---------- */}
      <section className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
            <ShieldCheck size={26} className="text-success" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">{t.safetyBlock.title}</h2>
          <p className="max-w-2xl text-muted">{t.safetyBlock.desc}</p>
          <Link
            href="/guvenlik"
            className="rounded-full border border-border px-6 py-3 font-semibold transition hover:border-text/40"
          >
            {t.safetyBlock.cta}
          </Link>
        </div>
      </section>

      {/* ---------- SSS ---------- */}
      <section id="sss" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="mb-10 text-center font-display text-3xl font-bold tracking-tight">Sıkça sorulan sorular</h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-border bg-bg p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span className="ml-3 text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Son CTA ---------- */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.hero.title.replace("\n", " ")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">Bugün başla — gerçek bir bağ bir sohbet uzağında.</p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-white shadow-soft transition hover:opacity-90"
          >
            {t.hero.ctaPrimary} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
