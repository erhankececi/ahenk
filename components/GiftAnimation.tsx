"use client";

import { useEffect } from "react";
import { RARITY, type Gift } from "@/lib/gifts";
import { playSound } from "@/lib/sound";

const DUR: Record<Gift["rarity"], number> = { common: 2200, rare: 2700, epic: 3600, legendary: 5000, mythic: 6200 };
const PARTS: Record<Gift["rarity"], number> = { common: 12, rare: 18, epic: 30, legendary: 46, mythic: 64 };

export default function GiftAnimation({
  gift,
  fromMe,
  senderName,
  onDone,
}: {
  gift: Gift;
  fromMe?: boolean;
  senderName?: string;
  onDone: () => void;
}) {
  const r = RARITY[gift.rarity];
  const dur = DUR[gift.rarity];
  const big = gift.rarity === "legendary" || gift.rarity === "mythic";
  const showBanner = gift.rarity !== "common" && gift.rarity !== "rare";

  useEffect(() => {
    playSound(big ? "match" : "purchase");
    const t = setTimeout(onDone, dur);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const psym = gift.fx === "petals" ? "🌸" : gift.fx === "royal" ? "✨" : gift.fx === "burst" ? "✨" : big ? "✨" : gift.emoji;

  const Hero = () => {
    switch (gift.fx) {
      case "fly":
        return <div className="gift-fly absolute text-[20vmin] leading-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)]">{gift.emoji}</div>;
      case "drive":
        return <div className="gift-drive absolute text-[18vmin] leading-none drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)]">{gift.emoji}</div>;
      case "spin":
        return <span className="gift-spin block text-[26vmin] leading-none">{gift.emoji}</span>;
      case "sea":
      case "ocean":
        return (
          <>
            <div className="gift-wave pointer-events-none absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(to top, rgba(56,189,248,0.5), rgba(14,42,58,0.05))" }} />
            <span className="gift-bob relative z-10 text-[24vmin] leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">{gift.emoji}</span>
          </>
        );
      case "burst":
        return (
          <div className="relative flex items-center justify-center">
            {[0, 1, 2].map((k) => (
              <span key={k} className="gift-burst absolute rounded-full border-2" style={{ width: "26vmin", height: "26vmin", borderColor: r.ring, animationDelay: `${k * 0.25}s` }} />
            ))}
            <span className="gift-pop gift-sparkle relative text-[24vmin] leading-none">{gift.emoji}</span>
          </div>
        );
      case "royal":
        return <span className="gift-pop text-[26vmin] leading-none drop-shadow-[0_12px_44px_rgba(212,176,106,0.7)]">{gift.emoji}</span>;
      default:
        return <span className={`gift-pop text-[24vmin] leading-none drop-shadow-[0_10px_36px_rgba(0,0,0,0.7)] ${gift.fx === "build" ? "gift-shake" : ""}`}>{gift.emoji}</span>;
    }
  };

  return (
    <div
      className="gift-fade fixed inset-0 z-[90] flex items-center justify-center overflow-hidden"
      style={{ background: big ? "rgba(3,5,10,0.88)" : "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      onClick={onDone}
    >
      {big && <div className="gift-flash pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle, ${r.ring}, transparent 62%)` }} />}

      <div className="pointer-events-none absolute rounded-full" style={{ width: "72vmin", height: "72vmin", background: `radial-gradient(circle, ${r.ring}, transparent 68%)` }} />

      {/* yükselen parçacıklar */}
      {Array.from({ length: PARTS[gift.rarity] }).map((_, i) => {
        const left = 4 + Math.random() * 92;
        const delay = Math.random() * (big ? 1.4 : 0.7);
        const d = 1.8 + Math.random() * (big ? 2.4 : 1.6);
        const size = 12 + Math.random() * (big ? 30 : 20);
        return (
          <span key={i} className="gift-particle pointer-events-none absolute bottom-[-8%] select-none" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${d}s`, fontSize: `${size}px` }}>
            {Math.random() > 0.5 ? psym : "✨"}
          </span>
        );
      })}

      {/* nadirlik banner */}
      {showBanner && (
        <div className="gift-banner pointer-events-none absolute top-[13%] flex flex-col items-center">
          <span className="text-sm font-extrabold uppercase tracking-[0.35em]" style={{ color: r.text }}>✦ {r.label} ✦</span>
        </div>
      )}

      <Hero />

      {/* başlık */}
      <div className="pointer-events-none absolute bottom-[15%] flex flex-col items-center gap-1 px-6 text-center">
        <p className="font-display text-3xl font-extrabold text-white sm:text-4xl" style={{ textShadow: `0 4px 34px ${r.ring}` }}>{gift.name}</p>
        <p className="text-sm" style={{ color: r.text }}>
          {fromMe ? "Gönderdin 🎁" : senderName ? `${senderName} sana gönderdi 🎁` : "Sana geldi 🎁"}
        </p>
      </div>
    </div>
  );
}
