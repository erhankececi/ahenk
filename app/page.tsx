import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, normalizeLang } from "@/lib/i18n";
import { Heart, MessageCircle, Phone, ShieldCheck, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-12%] h-[420px] w-[680px] max-w-[90vw] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:py-32">
          <p className="mb-5 inline-block rounded-full border border-border px-4 py-1.5 text-sm text-muted">
            {t.hero.tagline}
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {t.hero.title.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{t.hero.subtitle}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white transition hover:opacity-90"
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
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">{t.features.title}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((f, i) => {
              const Icon = featIcons[i] || Heart;
              return (
                <div key={f.t} className="rounded-2xl border border-border bg-bg p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
                    <Icon size={20} className="text-brand" />
                  </div>
                  <p className="font-semibold">{f.t}</p>
                  <p className="mt-1.5 text-sm text-muted">{f.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section id="nasil" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center text-3xl font-bold">{t.how.title}</h2>
          <div className="grid gap-10 sm:grid-cols-3">
            {t.how.steps.map((s, i) => (
              <div key={s.t} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border text-lg font-bold text-brand">
                  {i + 1}
                </div>
                <p className="font-semibold">{s.t}</p>
                <p className="mt-1.5 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Güvenlik */}
      <section className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <ShieldCheck size={26} className="text-brand" />
          </div>
          <h2 className="text-3xl font-bold">{t.safetyBlock.title}</h2>
          <p className="max-w-2xl text-muted">{t.safetyBlock.desc}</p>
          <Link
            href="/guvenlik"
            className="rounded-full border border-border px-6 py-3 font-semibold transition hover:border-text/40"
          >
            {t.safetyBlock.cta}
          </Link>
        </div>
      </section>

      {/* Son CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
            {t.hero.title.replace("\n", " ")}
          </h2>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-white transition hover:opacity-90"
          >
            {t.hero.ctaPrimary} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
