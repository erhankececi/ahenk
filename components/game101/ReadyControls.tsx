"use client";

// Ahenk 101 oda bekleme ekranı — alt kontrol çubuğu: Otur/Kalk, Hazır Ol/Hazır Değilim, Oyunu Başlat, Masadan Çık.

import { AlertCircle, DoorOpen, Play } from "lucide-react";

export interface ReadyControlsProps {
  isSeated: boolean;
  isReady: boolean;
  /** Tüm koltuklar dolu mu (yalnız bilgi amaçlı — başlatma şartı değil, prototipte tek kişi de başlatabilir). */
  canStart: boolean;
  onSit: () => void;
  onStand: () => void;
  onToggleReady: () => void;
  onStart: () => void;
  onLeave: () => void;
}

export default function ReadyControls({
  isSeated,
  isReady,
  canStart,
  onSit,
  onStand,
  onToggleReady,
  onStart,
  onLeave,
}: ReadyControlsProps) {
  return (
    <div className="ahenk-panel rounded-3xl p-4">
      <div className="flex flex-wrap items-center gap-2">
        {!isSeated ? (
          <button
            type="button"
            onClick={onSit}
            className="brand-gradient flex-1 rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            Otur
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleReady}
              className={[
                "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                isReady ? "border border-border bg-elevated text-text" : "brand-gradient",
              ].join(" ")}
            >
              {isReady ? "Hazır Değilim" : "Hazır Ol"}
            </button>
            <button
              type="button"
              onClick={onStand}
              className="rounded-full border border-border bg-elevated px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text"
            >
              Kalk
            </button>
          </>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={!isReady}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-elevated px-4 py-2.5 text-sm font-semibold text-text ring-1 ring-inset ring-brand/40 transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={15} className="text-brand" />
          Oyunu Başlat
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:text-text"
        >
          <DoorOpen size={15} />
          Masadan Çık
        </button>
      </div>

      {isSeated && !isReady ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-warning">
          <AlertCircle size={13} className="shrink-0" />
          Başlamak için önce hazır olmalısın.
        </p>
      ) : null}
      {!canStart && isReady ? (
        <p className="mt-2.5 text-[11px] text-muted">
          Diğer oyuncular hazır olmasa da mock oyunu tek başına başlatabilirsin.
        </p>
      ) : null}
    </div>
  );
}
