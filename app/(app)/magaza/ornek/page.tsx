"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DiamondGift from "@/components/gift/DiamondGift";

export default function GiftOrnek() {
  return (
    <div className="min-h-dvh px-5 pb-24 pt-4" style={{ background: "#0E0D10" }}>
      <header className="mb-5 flex items-center gap-3">
        <Link href="/magaza" className="text-text/70 transition hover:text-text"><ArrowLeft size={22} strokeWidth={1.8} /></Link>
        <h1 className="font-display text-lg font-bold">Animasyonlu hediye — örnek</h1>
      </header>

      <DiamondGift size={300} />

      <div className="lp-panel mt-5 rounded-2xl p-4">
        <p className="mb-1 font-display font-semibold text-text">Bu tamamen kod (SVG + Framer Motion)</p>
        <p className="text-sm text-muted">
          Asset dosyası değil — fasetli elmas, içinden kayan ışık ve etrafındaki parıltılar kodla animasyonlu.
          Aynı yöntemle her hediyeyi (yat süzülür, dünya döner, roket kalkar) PNG yerine canlı animasyon yapabiliriz.
          Neon/emoji yok; onyx zemin + mat pirinç — VISION V1.
        </p>
      </div>
    </div>
  );
}
