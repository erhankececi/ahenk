import { cookies } from "next/headers";
import MarketingShell from "@/components/marketing/MarketingShell";
import { getDict, normalizeLang } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Hakkında — Ahenk",
  description: "Ahenk: önce ruh, sonra yüz. Karaktere, ilgi alanlarına ve değerlere göre tanışma.",
};

export default function Hakkinda() {
  const lang = normalizeLang(cookies().get("lang")?.value);
  const t = getDict(lang);
  return (
    <MarketingShell lang={lang}>
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="mb-3 text-sm text-muted">{t.hero.tagline}</p>
        <h1 className="text-4xl font-extrabold tracking-tight">{t.about.title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted">
          {t.about.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
