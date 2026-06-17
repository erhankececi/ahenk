"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Repeat, Phone, Heart, Sparkles, Crown, TrendingUp } from "lucide-react";

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
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label="Geri"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text">
            <TrendingUp size={20} className="text-accent" /> Analiz
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
          <p className="mt-3 font-display text-lg font-semibold text-text">Profil etkini analiz et</p>
          <p className="mt-1.5 text-sm leading-6 text-muted">
            Seni kim aradı, kim tekrar profiline baktı, haftalık performansın — hepsi Premium Plus’ta.
          </p>
          <Link href="/premium?source=analysis_locked" className="lp-cta-gold mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
            Analizi aç
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stat(Eye, "Bu hafta görüntülenme", d.viewsWeek)}
            {stat(Repeat, "Tekrar bakanlar", d.repeatViewers)}
            {stat(Heart, "Bu hafta beğeni", d.likesWeek)}
            {stat(Sparkles, "Bu hafta eşleşme", d.matchesWeek)}
            {stat(Phone, "Seni arayanlar", d.calledYou)}
            {stat(Eye, "Toplam ziyaretçi", d.totalViewers)}
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-sm font-semibold text-text">Profil önerileri</p>
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
