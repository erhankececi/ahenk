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
    <div className="lp-panel rounded-2xl p-4">
      <Icon size={18} className={tone} />
      <p className="mt-2 text-2xl font-bold text-text">{value ?? 0}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label={ta.back}><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text">
            <TrendingUp size={20} className="text-accent" /> {ta.title}
          </h1>
        </div>
      </div>

      {!d ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
        </div>
      ) : d.locked ? (
        <div className="lp-panel rounded-3xl p-6 text-center">
          <Crown size={32} className="mx-auto text-accent" />
          <p className="mt-3 font-display text-lg font-semibold text-text">{ta.lockedTitle}</p>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            {ta.lockedDesc}
          </p>
          <Link href="/premium?source=analysis_locked" className="lp-cta-gold mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
            {ta.unlock}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stat(Eye, ta.sViews, d.viewsWeek)}
            {stat(Repeat, ta.sRepeat, d.repeatViewers)}
            {stat(Heart, ta.sLikes, d.likesWeek)}
            {stat(Sparkles, ta.sMatches, d.matchesWeek)}
            {stat(Phone, ta.sCalled, d.calledYou)}
            {stat(Eye, ta.sTotal, d.totalViewers)}
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-sm font-semibold text-text">{ta.tipsTitle}</p>
            <div className="space-y-2">
              {(d.tips || []).map((t, i) => (
                <div key={i} className="lp-panel flex items-start gap-2.5 rounded-2xl p-3 text-sm text-text">
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
