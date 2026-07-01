import Link from "next/link";
import { cookies } from "next/headers";
import { Apple, Play, ArrowRight } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "İndir — Ahenk",
  description: "Ahenk'i iOS, Android ve web üzerinden keşfet.",
};

export default function Indir() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  const t = getDict(lang);

  return (
    <MarketingShell lang={lang}>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t.download.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.download.subtitle}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="flex items-center gap-3 rounded-2xl border border-border px-6 py-3.5 text-left opacity-70">
            <Apple size={26} />
            <div>
              <p className="text-[11px] text-muted">{t.download.soon}</p>
              <p className="font-semibold">App Store</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border px-6 py-3.5 text-left opacity-70">
            <Play size={24} />
            <div>
              <p className="text-[11px] text-muted">{t.download.soon}</p>
              <p className="font-semibold">Google Play</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-white transition hover:opacity-90"
          >
            {t.download.web} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
