"use client";

import { MessageCircle, X } from "lucide-react";
import type { Player } from "@/lib/game101/types";

/**
 * Bir koltuğa (PlayerSeat) tıklanınca beliren mini profil kartı.
 * Ahenk'in koyu/brass/glass modal estetiğine uygun: yumuşak köşeli,
 * blur arka planlı, ince brass çerçeveli. Backend yok — CTA sadece
 * görsel geri bildirim / console.log verir.
 */
export default function MiniProfileOverlay({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const handleChatCta = () => {
    // Gerçek sohbet akışı yok — prototipte yalnız görsel geri bildirim.
    console.log(`[101 prototip] "${player.name}" ile oyun sonrası sohbet talebi (mock)`);
  };

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in relative w-[280px] overflow-hidden rounded-3xl border border-brand/30 bg-surface/90 shadow-float backdrop-blur-xl"
      >
        {/* Üst brass gradient şerit */}
        <div className="h-14 bg-gradient-to-br from-brand/25 via-brand/10 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/40 text-muted transition hover:text-text"
        >
          <X size={14} />
        </button>

        <div className="flex flex-col items-center px-5 pb-5 -mt-8">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#0e0d10] bg-gradient-to-br from-brand to-[#7d6640] font-display text-xl font-extrabold text-[#1c130d] shadow-card">
            {player.name.charAt(0).toUpperCase()}
          </div>

          <p className="mt-3 font-display text-base font-bold text-text">{player.name}</p>
          <p className="text-xs text-muted">{player.city}</p>

          {player.bio ? (
            <p className="mt-3 text-center text-[13px] leading-relaxed text-text/85">{player.bio}</p>
          ) : null}

          {player.interests && player.interests.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {player.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleChatCta}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 py-2.5 text-sm font-semibold text-[#1c130d] shadow-card transition active:scale-95"
          >
            <MessageCircle size={15} />
            Oyun sonrası sohbet et
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 rounded-full px-3 py-1.5 text-[11px] text-muted transition hover:text-text"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
