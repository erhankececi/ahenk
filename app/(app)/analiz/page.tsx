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
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Icon size={18} className={tone} />
      <p className="mt-2 text-2xl font-bold">{value ?? 0}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/profil" className="text-muted" aria-label="Geri"><ArrowLeft size={20} /></Link>
        <h1 className="t-h3 flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" /> Analiz
        </h1>
      </div>

      {!d ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-elevated" />)}
        </div>
      ) : d.locked ? (
        <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6 text-center">
          <Crown size={32} className="mx-auto text-accent" />
          <p className="mt-3 font-display text-lg font-bold">Premium Plus’a özel</p>
          <p className="mt-1 text-sm text-muted">
            Seni kim aradı, kim tekrar profiline baktı, haftalık performansın — hepsi Premium Plus’ta.
          </p>
          <Link href="/premium" className="mt-5 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-[#1c1407]">
            Premium Plus’a geç
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stat(Eye, "Bu hafta görüntülenme", d.viewsWeek)}
            {stat(Repeat, "Tekrar bakanlar", d.repeatViewers)}
            {stat(Heart, "Bu hafta beğeni", d.likesWeek, "text-brand")}
            {stat(Sparkles, "Bu hafta eşleşme", d.matchesWeek, "text-brand")}
            {stat(Phone, "Seni arayanlar", d.calledYou)}
            {stat(Eye, "Toplam ziyaretçi", d.totalViewers)}
          </div>

          <div className="mt-5">
            <p className="mb-2 t-h4">Profil önerileri</p>
            <div className="space-y-2">
              {(d.tips || []).map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface p-3 text-sm">
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
