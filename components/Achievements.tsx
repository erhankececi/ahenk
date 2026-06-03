"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

type B = { id: string; label: string; emoji: string; desc: string; need: number; current: number; earned: boolean };

export default function Achievements() {
  const [badges, setBadges] = useState<B[] | null>(null);
  const [earned, setEarned] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        if (d.badges) {
          setBadges(d.badges);
          setEarned(d.earned);
          setTotal(d.total);
        }
      })
      .catch(() => {});
  }, []);

  if (!badges) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="t-h4 flex items-center gap-2">
          <Trophy size={18} className="text-accent" /> Başarılar
        </p>
        <span className="text-sm text-muted">
          {earned}/{total}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.id}
            title={`${b.label} — ${b.desc}${b.earned ? "" : ` (${b.current}/${b.need})`}`}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 text-center transition ${
              b.earned ? "border-accent/40 bg-accent/10" : "border-border bg-surface opacity-50"
            }`}
          >
            <span className={`text-2xl ${b.earned ? "" : "grayscale"}`}>{b.emoji}</span>
            <span className="line-clamp-2 text-[10px] font-medium leading-tight">{b.label}</span>
            {!b.earned && b.need > 1 && (
              <span className="text-[9px] text-muted">
                {b.current}/{b.need}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
