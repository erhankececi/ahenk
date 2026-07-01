"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Compass, Coins } from "lucide-react";
import { useLang } from "@/components/LangProvider";

type Step = { key: string; done: boolean };
type Data = { steps: Step[]; done: number; total: number };

const HREFS: Record<string, { href?: string; reward?: string }> = {
  profil: { href: "/onboarding" },
  gunluk: { href: "/kesfet", reward: "+20" },
  begeni: { href: "/kesfet" },
  mesaj: { href: "/eslesmeler" },
  moment: { href: "/moments" },
  davet: { href: "/cuzdan", reward: "+250" },
  kurucu: { reward: "Rozet" },
};

const ORDER = ["profil", "gunluk", "begeni", "mesaj", "moment", "davet", "kurucu"];

export default function IlkAdimlar() {
  const { t } = useLang();
  const tp = t.profil;
  const [d, setD] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/journey")
      .then((r) => r.json())
      .then((x) => x.steps && setD(x))
      .catch(() => {});
  }, []);

  if (!d) return null;
  // Yolculuk tamamlandıysa paneli gizle (sade kalsın).
  if (d.done >= d.total) return null;

  const doneMap = new Map(d.steps.map((s) => [s.key, s.done]));
  const pct = Math.round((d.done / d.total) * 100);

  return (
    <section className="lp-panel overflow-hidden rounded-[1.75rem] p-0">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-text">
            <Compass size={17} className="text-accent" /> {tp.journeyTitle}
          </p>
          <span className="text-xs font-semibold text-accent">{d.done}/{d.total}</span>
        </div>
        <p className="mt-1 text-xs text-muted">{tp.journeyDesc}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {ORDER.map((key) => {
          const meta = HREFS[key];
          const txt = tp.journeySteps[key];
          const m = { ...meta, label: txt?.label ?? key, desc: txt?.desc ?? "" };
          const done = !!doneMap.get(key);
          const inner = (
            <div className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                  done ? "border-accent/50 bg-accent/15 text-accent" : "border-white/15 text-muted"
                }`}
              >
                {done ? <Check size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-white/30" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${done ? "text-muted line-through" : "text-text"}`}>
                  {m.label}
                </p>
                <p className="truncate text-xs text-muted">{m.desc}</p>
              </div>
              {m.reward && !done && (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {m.reward !== "Rozet" && <Coins size={10} />} {m.reward === "Rozet" ? tp.journeyBadge : m.reward}
                </span>
              )}
              {!done && m.href && <ChevronRight size={16} className="shrink-0 text-muted" />}
            </div>
          );
          return !done && m.href ? (
            <Link key={key} href={m.href} className="block transition hover:bg-white/[0.025]">
              {inner}
            </Link>
          ) : (
            <div key={key}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
