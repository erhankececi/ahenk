"use client";

import { RotateCcw } from "lucide-react";

export interface RotateDeviceNoticeProps {
  isPortrait: boolean;
}

/**
 * Portrait modda tam ekranı kaplayan döndürme uyarısı. Sadece görsel — gerçek
 * bir işlevi yok, orientation tespiti GameScreen'de yapılıyor. isPortrait
 * false olduğunda tamamen kaldırılır (render edilmez).
 */
export default function RotateDeviceNotice({ isPortrait }: RotateDeviceNoticeProps) {
  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in flex-col items-center justify-center gap-6 bg-[#0E0D10] px-8 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#C7A977]/30 bg-black/40">
        <div className="absolute inset-0 rounded-full border border-[#C7A977]/15" />
        <RotateCcw
          size={44}
          strokeWidth={1.75}
          className="text-[#C7A977] motion-safe:animate-[spin_2.4s_ease-in-out_infinite]"
        />
      </div>

      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-tight text-white">
          Lütfen telefonunu yatay çevir
        </p>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/50">
          101 oyunu en iyi deneyim için yatay (landscape) modda oynanır.
        </p>
      </div>
    </div>
  );
}
