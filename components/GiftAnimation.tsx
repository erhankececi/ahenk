"use client";

import { useEffect } from "react";
import type { Gift } from "@/lib/gifts";

const CFG: Record<Gift["category"], { dur: number; parts: number; glow: string }> = {
  daily: { dur: 2200, parts: 10, glow: "rgba(212,176,106,0.22)" },
  premium: { dur: 2800, parts: 16, glow: "rgba(212,176,106,0.34)" },
  luxury: { dur: 3400, parts: 26, glow: "rgba(212,176,106,0.5)" },
  legend: { dur: 4400, parts: 42, glow: "rgba(212,176,106,0.66)" },
};

/** Tam ekran sinematik hediye teslim animasyonu — yükselen parçacıklar + kutu açılış. */
export default function GiftAnimation({
  gift,
  fromMe,
  onDone,
}: {
  gift: Gift;
  fromMe?: boolean;
  onDone: () => void;
}) {
  const cfg = CFG[gift.category];
  useEffect(() => {
    const t = setTimeout(onDone, cfg.dur);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="gift-fade fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-black/70 backdrop-blur-sm"
      onClick={onDone}
    >
      <div
        className="pointer-events-none absolute h-[62vmin] w-[62vmin] rounded-full"
        style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent 70%)` }}
      />
      {Array.from({ length: cfg.parts }).map((_, i) => {
        const left = 6 + Math.random() * 88;
        const delay = Math.random() * 0.7;
        const dur = 1.8 + Math.random() * 1.8;
        const size = 12 + Math.random() * 22;
        const sym = Math.random() > 0.5 ? gift.emoji : "✨";
        return (
          <span
            key={i}
            className="gift-particle pointer-events-none absolute bottom-[-8%] select-none"
            style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, fontSize: `${size}px` }}
          >
            {sym}
          </span>
        );
      })}

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <div className="gift-pop text-[24vmin] leading-none drop-shadow-[0_10px_36px_rgba(0,0,0,0.7)]">
          {gift.emoji}
        </div>
        <p className="font-display text-2xl font-bold text-white">{gift.name}</p>
        {(gift.category === "luxury" || gift.category === "legend") && (
          <span className="rounded-full border border-accent/50 bg-black/40 px-3 py-1 text-sm font-semibold text-accent">
            {gift.category === "legend" ? "Efsane Hediye" : "Lüks Hediye"}
          </span>
        )}
        <p className="text-sm text-white/60">{fromMe ? "Gönderdin 🎁" : "Sana geldi 🎁"}</p>
      </div>
    </div>
  );
}
