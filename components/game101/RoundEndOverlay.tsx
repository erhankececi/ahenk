"use client";

import { Flag, RotateCcw, DoorOpen } from "lucide-react";
import type { OkeyGameTile, OkeyTileColor } from "@/lib/game101/gameTypes";
import type { OkeyMeld } from "@/lib/game101/meldValidation";
import type { RoundScoreResult } from "@/lib/game101/scoring";

export interface RoundEndOverlayProps {
  /** "Kazanan: Sen" gibi bir etiket üretmek için kullanılan kazanan adı. */
  winnerLabel: string;
  /** BİTİR ile atılan son taş (yoksa rozet gösterilmez). */
  finalDiscardTile: OkeyGameTile | null;
  /** Benim (bottom) açtığım seri/çift meld'leri — özet listesi için. */
  openedMelds: OkeyMeld[];
  /** Benim açtığım tip ("none" ise özet bölümü hiç render edilmez). */
  myOpenType: "none" | "run" | "pair";
  /**
   * Görev 12 (Faz 2): bu elin puanlama sonucu (lib/game101/scoring.ts).
   * null ise "El Sonu Puanları" bölümü hiç render edilmez (savunma —
   * phase "roundEnded" iken normalde her zaman dolu gelir).
   */
  roundScore: RoundScoreResult | null;
  /** "Yeni El Başlat" birincil aksiyonu. */
  onNewRound: () => void;
  /** "Odaya Dön" ikincil aksiyonu. */
  onBackToRoom: () => void;
}

/** Rozet arkaplanı için renk -> Tailwind sınıfı eşlemesi (OpenPreviewOverlay/OpenedMeldsArea ile tutarlı). */
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
 * Ahenk 101 — Görev 10 (Faz 2): el bittiğinde beliren TAM EKRAN, karartmalı,
 * bloklayıcı overlay. MiniProfileOverlay ile AYNI görsel dili kullanır
 * (bg-black/50 + backdrop-blur, tam ekran) — OpenPreviewOverlay/OpenedMeldsArea'nın
 * HAFİF (karartmasız) dilinden BİLEREK farklı, çünkü el bittiğinde altındaki
 * oyunla etkileşim tamamen engellenmeli.
 *
 * Yalnızca phase === "roundEnded" iken GameScreen tarafından mount edilir.
 */
export default function RoundEndOverlay({
  winnerLabel,
  finalDiscardTile,
  openedMelds,
  myOpenType,
  roundScore,
  onNewRound,
  onBackToRoom,
}: RoundEndOverlayProps) {
  const meldsTitle = myOpenType === "pair" ? "Çiftlerim" : "Serilerim";

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="animate-scale-in relative w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-brand/30 bg-surface/90 shadow-float backdrop-blur-xl">
        {/* Üst brass gradient şerit + BİTİR ikonu */}
        <div className="relative flex h-16 items-center justify-center bg-gradient-to-br from-brand/25 via-brand/10 to-transparent">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0e0d10] bg-gradient-to-b from-brand-2 to-brand text-[#1c130d] shadow-card">
            <Flag size={18} strokeWidth={2.4} />
          </span>
        </div>

        <div className="flex flex-col items-center px-5 pb-5 pt-1">
          <p className="font-display text-xl font-extrabold tracking-wide text-brand-2">EL BİTTİ</p>
          <p className="mt-1 text-sm font-semibold text-text/90">Kazanan: {winnerLabel}</p>

          {finalDiscardTile ? (
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <p className="text-[11px] font-medium text-muted">Son Atılan Taş</p>
              <span
                className={[
                  "rounded-lg border px-2.5 py-1.5 text-sm font-bold tabular-nums",
                  tileBadgeClass(finalDiscardTile.color),
                ].join(" ")}
              >
                {finalDiscardTile.isFakeOkey ? "OKEY" : finalDiscardTile.value}
              </span>
            </div>
          ) : null}

          {myOpenType !== "none" && openedMelds.length > 0 ? (
            <div className="mt-4 w-full">
              <p className="text-[11px] font-semibold text-brand-2">{meldsTitle}</p>
              <div className="mt-2 flex max-h-[180px] flex-col gap-1.5 overflow-y-auto pr-0.5">
                {openedMelds.map((meld) => (
                  <div key={meld.id} className="rounded-lg border border-brand/15 bg-black/20 px-2.5 py-2">
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
                ))}
              </div>
            </div>
          ) : null}

          {roundScore ? (
            <div className="mt-4 w-full">
              <p className="text-[11px] font-semibold text-brand-2">El Sonu Puanları</p>
              <div className="mt-2 flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-0.5">
                {roundScore.scores.map((score) => (
                  <div
                    key={score.playerId}
                    className={[
                      "rounded-lg border px-2.5 py-2",
                      score.isWinner
                        ? "border-brand/50 bg-brand/10 shadow-[0_0_0_1px_rgb(199_169_119/0.15)]"
                        : "border-brand/15 bg-black/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-semibold text-text/85">{score.name}</p>
                      <span
                        className={[
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide",
                          score.isWinner
                            ? "bg-brand/25 text-brand-2"
                            : score.hasOpened
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-white/10 text-muted",
                        ].join(" ")}
                      >
                        {score.isWinner ? "Kazanan" : score.hasOpened ? "Açtı" : "Açmadı"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                      <span className="tabular-nums">{score.remainingTileCount} taş</span>
                      <span className="font-bold tabular-nums text-brand/80">
                        {score.totalRoundScore} puan
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-tight text-text/60">{score.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={onNewRound}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-brand/60 bg-gradient-to-b from-brand-2 to-brand px-4 py-2.5 text-xs font-extrabold tracking-wide text-[#0E0D10] shadow-[0_1px_0_rgb(255_255_255/0.35)_inset,0_6px_16px_-6px_rgb(0_0_0/0.65)] transition active:scale-95"
            >
              <RotateCcw size={14} strokeWidth={2.4} />
              Yeni El Başlat
            </button>

            <button
              type="button"
              onClick={onBackToRoom}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-brand/25 bg-gradient-to-b from-[#221d17] to-[#141110] px-4 py-2 text-xs font-semibold text-text/90 transition active:scale-95"
            >
              <DoorOpen size={14} strokeWidth={2.4} />
              Odaya Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
