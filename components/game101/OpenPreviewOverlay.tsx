"use client";

import { X } from "lucide-react";
import type { OkeyMeld, OpenValidationResult } from "@/lib/game101/meldValidation";
import type { OkeyTileColor } from "@/lib/game101/gameTypes";

export interface OpenPreviewOverlayProps {
  /** "run" → seri/set açma önizlemesi, "pair" → çift açma önizlemesi. */
  type: "run" | "pair";
  result: OpenValidationResult;
  onClose: () => void;
  /**
   * "ONAYLA VE AÇ" butonuna basınca çağrılır (yalnızca result.canOpen true
   * iken buton görünür). Overlay'i kapatma/toast gösterme kararı BURADA
   * verilmez — çağıran taraf (GameScreen) sorumludur; bu component sadece
   * tetikleyicidir.
   */
  onConfirm: () => void;
}

/** Rozet arkaplanı için renk -> Tailwind sınıfı eşlemesi (Tile.tsx paletiyle uyumlu, kaba). */
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
 * Küçük, oyunu bloklamayan "sonuç paneli" — SERİ AÇ / ÇİFT AÇ önizlemesini
 * gösterir. MiniProfileOverlay'in premium cam/brass diline benzer ama daha
 * hafif: tam ekran karartma YOK (yalnızca panelin kendisi), oyun sahnesi
 * arkada görünmeye devam eder.
 *
 * Görev 8 (Faz 2): "ONAYLA VE AÇ" birincil aksiyon butonu eklendi (yalnızca
 * result.canOpen true iken görünür) — basınca yalnızca onConfirm() çağrılır,
 * taşları elden silme/overlay kapatma kararı GameScreen'de verilir.
 */
export default function OpenPreviewOverlay({ type, result, onClose, onConfirm }: OpenPreviewOverlayProps) {
  const title = type === "run" ? "Seri Açma Önizleme" : "Çift Açma Önizleme";
  const metricLabel = type === "run" ? "Toplam Puan" : "Çift Sayısı";
  const metricValue = result.totalScore;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center sm:top-4">
      <div
        className="animate-scale-in pointer-events-auto w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-brand/30 bg-surface/90 shadow-float backdrop-blur-xl sm:rounded-3xl"
      >
        {/* Üst brass gradient şerit */}
        <div className="relative h-10 bg-gradient-to-br from-brand/25 via-brand/10 to-transparent">
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/40 text-muted transition hover:text-text"
          >
            <X size={12} />
          </button>
        </div>

        <div className="px-4 pb-4 -mt-2">
          <p className="font-display text-sm font-bold text-text">{title}</p>

          <div className="mt-2 flex items-center justify-between rounded-xl border border-brand/20 bg-black/30 px-3 py-2">
            <span className="text-[11px] font-medium text-muted">{metricLabel}</span>
            <span className="text-base font-extrabold tabular-nums text-brand-2">{metricValue}</span>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-text/70">{result.reason}</p>

          {result.melds.length > 0 ? (
            <div className="mt-3 flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-0.5">
              {result.melds.map((meld) => (
                <MeldRow key={meld.id} meld={meld} />
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2">
            {result.canOpen ? (
              <button
                type="button"
                onClick={onConfirm}
                className="w-full rounded-full border border-brand/60 bg-gradient-to-b from-brand-2 to-brand px-4 py-2.5 text-xs font-extrabold tracking-wide text-[#0E0D10] shadow-[0_1px_0_rgb(255_255_255/0.35)_inset,0_6px_16px_-6px_rgb(0_0_0/0.65)] transition active:scale-95"
              >
                ONAYLA VE AÇ
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-brand/25 bg-gradient-to-b from-[#221d17] to-[#141110] px-4 py-2 text-xs font-semibold text-text/90 transition active:scale-95"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeldRow({ meld }: { meld: OkeyMeld }) {
  return (
    <div className="rounded-lg border border-brand/15 bg-black/20 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-text/85">{meld.label}</p>
        <span className="text-[10px] font-bold tabular-nums text-brand/80">{meld.score}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {meld.tiles.map((tile) => (
          <span
            key={tile.id}
            className={[
              "rounded-md border px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
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
