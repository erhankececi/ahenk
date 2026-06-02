import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, type Lang } from "@/lib/i18n";

export function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-text">{h}</h2>
      <div className="space-y-2">{children}</div>
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
      <div className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-text">
          <ArrowLeft size={15} /> {t.legal.back}
        </Link>
        <h1 className="text-3xl font-bold">{title}</h1>
        {updated && (
          <p className="mt-2 text-sm text-muted">
            {t.legal.updated}: {updated}
          </p>
        )}
        <div className="mt-8 space-y-7 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </MarketingShell>
  );
}
