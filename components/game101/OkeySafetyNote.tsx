"use client";

// Ahenk 101 lobi — güvenlik notu + "Nasıl oynanır?" linki.
// Saf React/Tailwind DOM component'i (PixiJS oyun component'leriyle karışmaz).

import { useState } from "react";
import { ShieldCheck, HelpCircle, X } from "lucide-react";

export default function OkeySafetyNote() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 pb-2 pt-1 text-center">
      <div className="flex items-center gap-1.5 text-[12px] text-muted">
        <ShieldCheck size={14} className="shrink-0 text-accent" />
        <span>Güvenli sosyal oyun: bahis yok, para çekme yok</span>
      </div>

      <button
        type="button"
        onClick={() => setShowHelp(true)}
        className="inline-flex items-center gap-1 text-[12px] font-medium text-accent underline-offset-4 hover:underline"
      >
        <HelpCircle size={13} />
        Nasıl oynanır?
      </button>

      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="ahenk-panel w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-text">Nasıl oynanır?</h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-elevated hover:text-text"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-muted">
              101, klasik okey kurallarına dayanan sosyal bir masa oyunudur. Bir masa seç, diğer
              oyuncularla ıstakanı doldur, taşları sırayla çek ve at, seriler ile grupları
              tamamlamaya çalış. Ahenk 101 tamamen sosyal amaçlıdır — gerçek para ile bahis veya
              çekim içermez, sadece oynamak ve sohbet etmek içindir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
