"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, Coins, Heart, MessageCircle, Crown, Sparkles } from "lucide-react";

type Huni = { key: string; label: string; value: number; pct: number };
type Data = {
  huni: Huni[];
  hacim: { dau: number; wau: number; dailyAnswers: number; interactions: number; messages: number; kurucuUye: number };
  signups: number;
};

export default function AdminGrowth() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    fetch("/api/admin/growth")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setD)
      .catch(() => setErr(true));
  }, []);

  if (err) return null;

  const tr = (n: number) => n.toLocaleString("tr-TR");
  const stats = d
    ? [
        { Icon: Users, label: "DAU", value: d.hacim.dau },
        { Icon: Users, label: "WAU", value: d.hacim.wau },
        { Icon: Sparkles, label: "Günlük yanıt", value: d.hacim.dailyAnswers },
        { Icon: Heart, label: "Beğeni", value: d.hacim.interactions },
        { Icon: MessageCircle, label: "Mesaj", value: d.hacim.messages },
        { Icon: Crown, label: "Kurucu üye", value: d.hacim.kurucuUye },
      ]
    : [];

  return (
    <section className="lp-panel mb-5 rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={18} className="text-accent" />
        <h2 className="font-display text-sm font-semibold text-text">Growth Sağlık Paneli</h2>
      </div>

      {!d ? (
        <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-7 rounded-lg" />)}</div>
      ) : (
        <>
          {/* Aktivasyon hunisi */}
          <div className="space-y-2">
            {d.huni.map((h) => (
              <div key={h.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text/85">{h.label}</span>
                  <span className="font-semibold text-accent">
                    {tr(h.value)} <span className="text-muted">· %{h.pct}</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.max(2, h.pct)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Hacim metrikleri */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-[#0E0D10]/60 p-2.5">
                <s.Icon size={14} className="mb-1 text-accent" />
                <p className="text-[10px] text-muted">{s.label}</p>
                <p className="text-sm font-semibold text-text">{tr(s.value)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
