import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, type Lang } from "@/lib/i18n";

export function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/[0.075] bg-white/[0.025] p-5">
      <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-text">{h}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-text/62">{children}</div>
    </section>
  );
}

export default function LegalPage({
  lang,
  title,
  updated,
  children,
}: {
  lang: Lang;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  const t = getDict(lang);
  return (
    <MarketingShell lang={lang}>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <Link href="/" className="lp-cta-ghost mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition hover:text-text">
          <ArrowLeft size={15} /> {t.legal.back}
        </Link>
        <div className="lp-panel rounded-[2rem] p-6 sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-accent">Ahenk yasal</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          {updated && (
            <p className="mt-3 text-sm text-text/55">
              {t.legal.updated}: {updated}
            </p>
          )}
          <div className="mt-8 space-y-4 text-sm leading-relaxed text-text/64">{children}</div>
        </div>
      </div>
    </MarketingShell>
  );
}
