"use client";

import { motion } from "framer-motion";

// Tamamen kodlanmış (SVG + Framer Motion) animasyonlu premium hediye örneği.
// Onyx zemin · pirinç fasetli elmas · ışık süzülmesi · parıltı. Neon/emoji yok.
export default function DiamondGift({ size = 260 }: { size?: number }) {
  // gem fasetleri
  const facets = [
    { p: "76,58 124,58 130,92 70,92", fill: "url(#g-light)" },   // tabla
    { p: "76,58 70,92 42,92", fill: "url(#g-dark)" },            // sol taç
    { p: "124,58 158,92 130,92", fill: "url(#g-mid)" },          // sağ taç
    { p: "42,92 70,92 100,162", fill: "url(#g-dark)" },          // sol pavyon
    { p: "70,92 100,92 100,162", fill: "url(#g-mid)" },          // orta-sol
    { p: "100,92 130,92 100,162", fill: "url(#g-light)" },       // orta-sağ
    { p: "130,92 158,92 100,162", fill: "url(#g-dark)" },        // sağ pavyon
  ];
  const sparks = [
    { x: 24, y: 40, d: 0 }, { x: 224, y: 56, d: 0.6 }, { x: 40, y: 180, d: 1.1 },
    { x: 210, y: 170, d: 0.3 }, { x: 130, y: 22, d: 0.9 }, { x: 80, y: 210, d: 1.4 },
  ];

  return (
    <div
      className="relative grid place-items-center overflow-hidden rounded-3xl"
      style={{ width: "100%", height: size, background: "radial-gradient(80% 70% at 50% 42%, #1a1722 0%, #0E0D10 70%)", border: "1px solid rgba(199,169,119,0.18)" }}
    >
      {/* arka parıltı */}
      <motion.div
        className="pointer-events-none absolute"
        style={{ width: size * 0.9, height: size * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,169,119,0.28), transparent 62%)" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* elmas */}
      <motion.svg
        viewBox="0 0 200 200"
        width={size * 0.62}
        height={size * 0.62}
        className="relative z-10"
        animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 16px 26px rgba(0,0,0,0.6))" }}
      >
        <defs>
          <linearGradient id="g-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4E8CC" /><stop offset="1" stopColor="#D9C190" />
          </linearGradient>
          <linearGradient id="g-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D2B377" /><stop offset="1" stopColor="#A9874A" />
          </linearGradient>
          <linearGradient id="g-dark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9C7C44" /><stop offset="1" stopColor="#5E4A28" />
          </linearGradient>
          <clipPath id="gem">
            <polygon points="76,58 124,58 158,92 100,162 42,92" />
          </clipPath>
        </defs>

        {facets.map((f, i) => (
          <polygon key={i} points={f.p} fill={f.fill} stroke="rgba(94,74,40,0.6)" strokeWidth="0.8" />
        ))}

        {/* ışık süzülmesi (faset içinde kayan parlama) */}
        <g clipPath="url(#gem)">
          <motion.rect
            x="-120" y="40" width="80" height="130" fill="rgba(255,248,228,0.5)"
            animate={{ x: [-120, 220] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
            transform="skewX(-18)"
          />
        </g>
        {/* tabla parlak kenar */}
        <polyline points="76,58 124,58" stroke="rgba(255,250,235,0.85)" strokeWidth="1.5" fill="none" />
      </motion.svg>

      {/* parıltılar */}
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: s.x, top: s.y }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: s.d, repeatDelay: 1.4, ease: "easeInOut" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z" fill="#E8D9B8" />
          </svg>
        </motion.div>
      ))}

      {/* etiket */}
      <div className="absolute bottom-3 left-0 right-0 text-center">
        <p className="font-display text-base font-bold" style={{ color: "#F5EFE4" }}>Elmas Yağmuru</p>
        <p className="flex items-center justify-center gap-1 text-sm font-semibold text-accent">◆ 40.000</p>
      </div>
    </div>
  );
}
