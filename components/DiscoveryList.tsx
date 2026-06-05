"use client";

import { Fragment } from "react";
import { ChevronRight, Send, MapPin } from "lucide-react";
import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";

export default function DiscoveryList({
  cands,
  onOpen,
  onAction,
  priorityKm = null,
}: {
  cands: any[];
  onOpen: (i: number) => void;
  onAction: (id: string) => void;
  priorityKm?: number | null;
}) {
  if (!cands.length) return null;
  return (
    <div className="space-y-2">
      {cands.map((c, i) => {
        const prev = cands[i - 1];
        const showPri = priorityKm != null && c.priority && (i === 0 || !prev?.priority);
        const showFar = priorityKm != null && !c.priority && (i === 0 || prev?.priority);
        return (
        <Fragment key={c.id}>
          {showPri && (
            <p className="flex items-center gap-1.5 px-1 pt-1 text-xs font-semibold uppercase tracking-wider text-brand">
              <MapPin size={13} /> Öncelikli Alan · 0–{priorityKm} km
            </p>
          )}
          {showFar && (
            <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Daha uzaktakiler
            </p>
          )}
        <div
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition duration-200 hover:border-brand/40"
        >
          <button onClick={() => onOpen(i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
            <div className="relative shrink-0">
              <div className={`rounded-2xl ${tierFrame(c.tier)}`}>
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-elevated">
                  {c.photos?.[0] ? (
                    <img src={c.photos[0]} loading="lazy" className="h-full w-full scale-110 object-cover blur-lg" alt="" />
                  ) : (
                    <div className="brand-gradient h-full w-full opacity-30" />
                  )}
                </div>
              </div>
              {c.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-semibold">
                {c.name}
                {c.age ? `, ${c.age}` : ""}
                <PremiumBadge tier={c.tier} />
                {c.isNew && !c.online && (
                  <span className="rounded-full bg-brand/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Yeni
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted">
                {c.city}
                {c.mesafe != null
                  ? ` · ${c.sameCity || c.mesafe === 0 ? "yakınında" : `${c.mesafe} km`}`
                  : ""}{" "}
                · Ahenk %{c.ortakYuzde}
              </p>
            </div>
          </button>
          <button
            onClick={() => onAction(c.id)}
            className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white transition active:scale-95"
          >
            <Send size={13} /> Tanış
          </button>
          <ChevronRight size={16} className="hidden shrink-0 text-muted sm:block" />
        </div>
        </Fragment>
        );
      })}
    </div>
  );
}
