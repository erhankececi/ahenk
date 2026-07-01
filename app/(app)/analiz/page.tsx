"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Repeat, Phone, Heart, Sparkles, Crown, TrendingUp } from "lucide-react";
import { useLang } from "@/components/LangProvider";

type Data = {
  locked: boolean;
  viewsWeek?: number;
  repeatViewers?: number;
  totalViewers?: number;
  calledYou?: number;
  likesWeek?: number;
  matchesWeek?: number;
  tips?: string[];
};

export default function Analiz() {
  const { t } = useLang();
  const ta = t.analiz;
  const [d, setD] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/insights").then((r) => r.json()).then(setD).catch(() => setD({ locked: true }));
  }, []);

  const stat = (Icon: any, label: string, value: number | undefined, tone = "text-accent") => (
    <div className="lp-panel rounded-2xl p-4 lg:rounded-3xl lg:p-6 lg:transition lg:hover:border-accent/30">
      <Icon size={18} className={`${tone} lg:hidden`} />
      <Icon size={22} className={`${tone} hidden lg:block`} />
      <p className="mt-2 text-2xl font-bold text-text lg:mt-4 lg:text-3xl">{value ?? 0}</p>
      <p className="text-xs text-muted lg:text-sm">{label}</p>
    </div>
  );

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-6xl lg:px-0">
      <div className="mb-5 flex items-center gap-3 lg:mb-8">
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label={ta.back}><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">
            <TrendingUp size={20} className="text-accent lg:hidden" />
            <TrendingUp size={26} className="hidden text-accent lg:block" /> {ta.title}
          </h1>
        </div>
      </div>

      {!d ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-24 rounded-2xl lg:h-32 lg:rounded-3xl" />)}
        </div>
      ) : d.locked ? (
        <div className="lp-panel rounded-3xl p-6 text-center lg:mx-auto lg:max-w-xl lg:p-10">
          <Crown size={32} className="mx-auto text-accent lg:hidden" />
          <Crown size={40} className="mx-auto hidden text-accent lg:block" />
          <p className="mt-3 font-display text-lg font-semibold text-text lg:mt-4 lg:text-xl">{ta.lockedTitle}</p>
          <p className="mt-1.5 text-sm leading-6 text-muted lg:mt-2 lg:text-base">
            {ta.lockedDesc}
          </p>
          <Link href="/premium?source=analysis_locked" className="lp-cta-gold mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold lg:mt-6 lg:px-8 lg:py-3 lg:text-base">
            {ta.unlock}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {stat(Eye, ta.sViews, d.viewsWeek)}
            {stat(Repeat, ta.sRepeat, d.repeatViewers)}
            {stat(Heart, ta.sLikes, d.likesWeek)}
            {stat(Sparkles, ta.sMatches, d.matchesWeek)}
            {stat(Phone, ta.sCalled, d.calledYou)}
            {stat(Eye, ta.sTotal, d.totalViewers)}
          </div>

          <div className="mt-5 lg:mt-8">
            <p className="mb-2.5 text-sm font-semibold text-text lg:mb-4 lg:text-base">{ta.tipsTitle}</p>
            <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {(d.tips || []).map((t, i) => (
                <div key={i} className="lp-panel flex items-start gap-2.5 rounded-2xl p-3 text-sm text-text lg:rounded-2xl lg:p-4">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" /> {t}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
