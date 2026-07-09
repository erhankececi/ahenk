"use client";

import type { OkeyMeld } from "@/lib/game101/meldValidation";
import type { OkeyTileColor } from "@/lib/game101/gameTypes";

export interface OpenedMeldsAreaProps {
  /** Benim (bottom) açtığım seri/çift meld'leri. */
  melds: OkeyMeld[];
  /** Açtığım tip ("none" = henüz açmadım). */
  openType: "none" | "run" | "pair";
}

/** Rozet arkaplanı için renk -> Tailwind sınıfı eşlemesi (OpenPreviewOverlay ile görsel olarak tutarlı). */
const COLOR_BADGE_CLASSES: Record<Exclude<OkeyTileColor, "joker">, string> = {
  red: "border-red-400/40 bg-red-500/15 text-red-200",
  blue: "border-blue-400/40 bg-blue-500/15 text-blue-200",
  black: "border-zinc-400/40 bg-zinc-500/15 text-zinc-200",
  yellow: "border-yellow-400/40 bg-yellow-500/15 text-yellow-200",
};

function tileBadgeClass(color: OkeyTileColor): string {
  if (color === "joker") return "border-brand/50 bg-brand/15 text-brand-2";
  return COLOR_BADGE_CLASSES[color];
}

/**
 * Görev 8 (Faz 2): masaya açılmış seri/çift meld'lerini gösteren küçük,
 * kalıcı premium cam/brass mini panel. OpenPreviewOverlay ile AYNI üst-orta
 * bölgeyi kullanır — bu iki UI zamansal olarak asla çakışmaz (bir kez
 * hasOpened=true olduktan sonra SERİ AÇ/ÇİFT AÇ artık önizlemeyi tekrar
 * açmaz), bu yüzden aynı bölgeye yerleştirmek güvenlidir.
 *
 * melds boşsa (veya openType "none") hiçbir şey render edilmez.
 */
export default function OpenedMeldsArea({ melds, openType }: OpenedMeldsAreaProps) {
  if (melds.length === 0 || openType === "none") return null;

  const title = openType === "run" ? "Serilerim" : "Çiftlerim";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center sm:top-4">
      <div className="pointer-events-auto w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-brand/30 bg-surface/85 shadow-float backdrop-blur-xl sm:rounded-3xl">
        <div className="px-3 py-2.5">
          <p className="font-display text-xs font-bold text-brand-2">{title}</p>

          <div className="mt-2 flex max-h-[160px] flex-col gap-1.5 overflow-y-auto pr-0.5">
            {melds.map((meld) => (
              <OpenedMeldRow key={meld.id} meld={meld} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpenedMeldRow({ meld }: { meld: OkeyMeld }) {
  return (
    <div className="rounded-lg border border-brand/15 bg-black/20 px-2 py-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-text/80">{meld.label}</p>
        <span className="text-[9px] font-bold tabular-nums text-brand/80">{meld.score}</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {meld.tiles.map((tile) => (
          <span
            key={tile.id}
            className={[
              "rounded-md border px-1.5 py-0.5 text-[9px] font-bold tabular-nums",
              tileBadgeClass(tile.color),
            ].join(" ")}
          >
            {tile.isFakeOkey ? "OKEY" : tile.value}
          </span>
        ))}
      </div>
    </div>
  );
}
