"use client";

// Ahenk 101 oda bekleme ekranı — tek koltuk kartı (boş / dolu / ben).
// Saf React/Tailwind DOM component'i (PixiJS oyun component'leriyle karışmaz).

import { UserPlus, Crown } from "lucide-react";

export interface WaitingSeatProps {
  /** Koltuk etiketi: "Ben", "Üst Koltuk", "Sol Koltuk", "Sağ Koltuk". */
  label: string;
  /** Koltukta oturan oyuncu; null ise boş koltuk. */
  player: { name: string; city: string; isReady: boolean } | null;
  /** Bu koltuk kullanıcının kendi koltuğu mu? */
  isMe?: boolean;
  /** Boş koltuk + henüz oturmamış kullanıcı için "Otur" butonu göster. */
  canSit?: boolean;
  onSit?: () => void;
}

function initials(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function WaitingSeat({ label, player, isMe = false, canSit = false, onSit }: WaitingSeatProps) {
  const isEmpty = !player;

  return (
    <div
      className={[
        "flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition",
        isEmpty
          ? "border-dashed border-border/70 bg-elevated/40"
          : player?.isReady
          ? "border-brand/60 bg-brand/[0.07] shadow-glow"
          : "border-border bg-surface",
      ].join(" ")}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</span>

      {isEmpty ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-border/70 text-muted">
            <UserPlus size={20} strokeWidth={1.6} />
          </div>
          <span className="text-xs text-muted">Boş koltuk</span>
          {canSit ? (
            <button
              type="button"
              onClick={onSit}
              className="brand-gradient mt-1 rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              Otur
            </button>
          ) : null}
        </>
      ) : (
        <>
          <div
            className={[
              "relative flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-[#1c130d]",
              "bg-gradient-to-br from-brand to-[#7d6640]",
              player!.isReady ? "ring-2 ring-brand/70 ring-offset-2 ring-offset-bg" : "",
            ].join(" ")}
          >
            {initials(player!.name)}
            {isMe ? (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-bg bg-elevated text-brand">
                <Crown size={11} />
              </span>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">
              {isMe ? "Sen" : player!.name}
            </p>
            <p className="truncate text-[11px] text-muted">{player!.city}</p>
          </div>
          <span
            className={[
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
              player!.isReady ? "bg-brand/15 text-brand" : "bg-elevated text-muted",
            ].join(" ")}
          >
            {player!.isReady ? "Hazır" : "Hazır değil"}
          </span>
        </>
      )}
    </div>
  );
}
