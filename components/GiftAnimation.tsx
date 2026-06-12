"use client";

import { useEffect, useState } from "react";
import { RARITY, type Gift } from "@/lib/gifts";
import { playSound } from "@/lib/sound";

const DUR: Record<Gift["rarity"], number> = { common: 1600, rare: 2200, epic: 3600, legendary: 5000, mythic: 6400 };
const PARTS: Record<Gift["rarity"], number> = { common: 0, rare: 0, epic: 28, legendary: 46, mythic: 66 };
const MODE: Record<Gift["rarity"], "mini" | "epic" | "cine"> = {
  common: "mini", rare: "mini", epic: "epic", legendary: "cine", mythic: "cine",
};

// 3D hediye görseli (sahne içinde animasyonla). Yüklenemezse emoji'ye düşer.
function GiftSym({ k, emoji, cls, vmin, style }: { k: string; emoji: string; cls: string; vmin: number; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  if (err) return <span className={cls} style={{ ...style, fontSize: `${vmin}vmin`, lineHeight: 1 }}>{emoji}</span>;
  return (
    <img
      src={`/gifts/${k}.png`}
      alt=""
      onError={() => setErr(true)}
      className={cls}
      style={{ ...style, width: `${vmin}vmin`, height: `${vmin}vmin`, objectFit: "contain" }}
    />
  );
}

// Sahne arka planı (derinlik) — epic/cine
function Scene({ fx, ring }: { fx: Gift["fx"]; ring: string }) {
  switch (fx) {
    case "fly":
      return <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0a1430 0%, #05070f 72%)" }} />;
    case "sea":
    case "ocean":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0a1a2e, #05182a 60%)" }} />
          <div className="gift-wave absolute inset-x-0 bottom-0 h-2/5" style={{ background: "linear-gradient(to top, rgba(56,189,248,0.5), transparent)" }} />
        </>
      );
    case "spin":
      return <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 44%, #142446, #04060d 72%)" }} />;
    case "drive":
      return (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #1a1530 56%, #0a0810)" }} />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
        </>
      );
    case "royal":
      return (
        <div
          className="gift-rays absolute left-1/2 top-1/2 h-[150vmin] w-[150vmin]"
          style={{ background: `conic-gradient(from 0deg, transparent, ${ring}, transparent, ${ring}, transparent, ${ring}, transparent)` }}
        />
      );
    default:
      return null;
  }
}

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
  const mode = MODE[gift.rarity];
  const dur = DUR[gift.rarity];
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    playSound(mode === "cine" ? "match" : "purchase");
    const tl = setTimeout(() => setLeaving(true), dur - 400);
    const t = setTimeout(onDone, dur);
    return () => { clearTimeout(tl); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- COMMON / RARE: sohbet içi, küçük, backdrop yok ----
  if (mode === "mini") {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 top-1/3 z-[80] flex flex-col items-center justify-center">
        <span className="absolute h-40 w-40 rounded-full blur-3xl" style={{ background: r.ring, opacity: 0.5 }} />
        <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-float drop-shadow-[0_10px_30px_rgba(0,0,0,0.55)]" vmin={22} style={{ ["--d" as any]: `${dur}ms` }} />
        <span className="-mt-2 rounded-full bg-black/60 px-3.5 py-1 text-sm font-semibold text-white">{gift.name}</span>
      </div>
    );
  }

  // ---- EPIC / CINE: tam sahne ----
  const big = mode === "cine";
  const Hero = () => {
    switch (gift.fx) {
      case "fly":
        return <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-fly absolute z-10 drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)]" vmin={20} />;
      case "drive":
        return <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-drive absolute z-10 drop-shadow-[0_12px_36px_rgba(0,0,0,0.7)]" vmin={18} />;
      case "spin":
        return <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-spin relative z-10 block" vmin={26} />;
      case "sea":
      case "ocean":
        return <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-bob relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" vmin={24} />;
      case "burst":
        return (
          <div className="relative z-10 flex items-center justify-center">
            {[0, 1, 2].map((k) => (
              <span key={k} className="gift-burst absolute rounded-full border-2" style={{ width: "26vmin", height: "26vmin", borderColor: r.ring, animationDelay: `${k * 0.25}s` }} />
            ))}
            <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-pop gift-sparkle relative" vmin={24} />
          </div>
        );
      case "royal":
        return <GiftSym k={gift.key} emoji={gift.emoji} cls="gift-pop relative z-10 drop-shadow-[0_12px_44px_rgba(212,176,106,0.7)]" vmin={26} />;
      default:
        return <GiftSym k={gift.key} emoji={gift.emoji} cls={`gift-pop relative z-10 drop-shadow-[0_10px_36px_rgba(0,0,0,0.7)] ${gift.fx === "build" ? "gift-shake" : ""}`} vmin={24} />;
    }
  };

  return (
    <div
      className={`gift-fade fixed inset-0 z-[90] flex items-center justify-center overflow-hidden ${leaving ? "gift-exit" : ""}`}
      style={{ background: big ? "rgba(3,5,10,0.92)" : "rgba(0,0,0,0.62)", backdropFilter: "blur(5px)" }}
      onClick={onDone}
    >
      <Scene fx={gift.fx} ring={r.ring} />
      {big && <div className="gift-flash pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle, ${r.ring}, transparent 62%)` }} />}
      <div className="pointer-events-none absolute rounded-full" style={{ width: "72vmin", height: "72vmin", background: `radial-gradient(circle, ${r.ring}, transparent 68%)` }} />

      {Array.from({ length: PARTS[gift.rarity] }).map((_, i) => {
        const left = 4 + Math.random() * 92;
        const delay = Math.random() * (big ? 1.4 : 0.7);
        const d = 1.8 + Math.random() * (big ? 2.4 : 1.6);
        const size = 2 + Math.random() * 4; // 2-5px mat pirinç ışık parçacığı (emoji YOK)
        const blur = Math.random() > 0.6;
        const rose = gift.fx === "petals";
        return (
          <span
            key={i}
            className="gift-particle pointer-events-none absolute bottom-[-6%] z-20 rounded-full"
            style={{
              left: `${left}%`, width: size, height: size,
              animationDelay: `${delay}s`, animationDuration: `${d}s`,
              background: rose ? "rgba(176,107,124,0.8)" : "rgba(199,169,119,0.78)",
              filter: blur ? "blur(1.5px)" : undefined,
            }}
          />
        );
      })}

      <div className="gift-banner pointer-events-none absolute top-[12%] z-20 flex flex-col items-center">
        <span className="text-sm font-extrabold uppercase tracking-[0.35em]" style={{ color: r.text }}>✦ {r.label} ✦</span>
      </div>

      <Hero />

      <div className="pointer-events-none absolute bottom-[15%] z-20 flex flex-col items-center gap-1 px-6 text-center">
        <p className="font-display text-3xl font-extrabold text-white sm:text-5xl" style={{ textShadow: `0 4px 34px ${r.ring}` }}>{gift.name}</p>
        <p className="text-sm" style={{ color: r.text }}>
          {fromMe ? "Gönderdin" : senderName ? `${senderName} sana gönderdi` : "Sana geldi"}
        </p>
      </div>

      {/* TikTok tarzı "X gönderdi" pill'i (sol-alt, soldan kayar) */}
      <div className="gift-pill-in pointer-events-none absolute bottom-6 left-4 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 py-1.5 pl-1.5 pr-3.5 backdrop-blur-md">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold text-[#1c1407]">
          {(fromMe ? "S" : senderName?.[0] || "?").toUpperCase()}
        </span>
        <span className="text-sm text-white">
          <b>{fromMe ? "Sen" : senderName || "Biri"}</b>
          <span className="text-white/65"> · {gift.name} gönderdi</span>
        </span>
        <span className="ml-0.5 grid h-8 w-8 place-items-center">
          <PillThumb k={gift.key} emoji={gift.emoji} />
        </span>
      </div>
    </div>
  );
}

function PillThumb({ k, emoji }: { k: string; emoji: string }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-lg leading-none">{emoji}</span>;
  return <img src={`/gifts/${k}.png`} alt="" onError={() => setErr(true)} className="h-7 w-7 object-contain" />;
}
