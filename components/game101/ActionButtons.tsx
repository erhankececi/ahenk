"use client";

import { useCallback, useState } from "react";
import { Copy, Flag, Layers, ListOrdered, type LucideIcon } from "lucide-react";

type ActionId = "draw" | "run" | "pair" | "finish";

interface ActionDef {
  id: ActionId;
  label: string;
  icon: LucideIcon;
}

const ACTIONS: ActionDef[] = [
  { id: "draw", label: "TAŞ ÇEK", icon: Layers },
  { id: "run", label: "SERİ AÇ", icon: ListOrdered },
  { id: "pair", label: "ÇİFT AÇ", icon: Copy },
  { id: "finish", label: "BİTİR", icon: Flag },
];

/**
 * Sağ-alt köşede sabit aksiyon butonları (2x2 grid). Brass/altın vurgulu,
 * hafif 3D/kabartma buton hissi — Pixi canvas'ın ÜSTÜNDE DOM overlay katmanı.
 * Backend yok: tıklama sadece kısa bir "pulse" geri bildirimi + console.log
 * tetikler.
 */
export default function ActionButtons() {
  const [pulsingId, setPulsingId] = useState<ActionId | null>(null);

  const handleClick = useCallback((id: ActionId, label: string) => {
    console.log(`[Ahenk 101] Aksiyon: ${label}`);
    setPulsingId(id);
    window.setTimeout(() => {
      setPulsingId((current) => (current === id ? null : current));
    }, 260);
  }, []);

  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4">
      <div className="pointer-events-auto grid grid-cols-2 gap-2">
        {ACTIONS.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            isPulsing={pulsingId === action.id}
            onClick={() => handleClick(action.id, action.label)}
          />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  action,
  isPulsing,
  onClick,
}: {
  action: ActionDef;
  isPulsing: boolean;
  onClick: () => void;
}) {
  const Icon = action.icon;
  const isFinish = action.id === "finish";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-2",
        "transition-transform duration-150 ease-out active:scale-95",
        "shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_-2px_4px_rgb(0_0_0/0.5)_inset,0_6px_14px_-6px_rgb(0_0_0/0.65)]",
        isFinish
          ? "border-brand/70 bg-gradient-to-b from-[#3a2c17] to-[#1c140a]"
          : "border-brand/25 bg-gradient-to-b from-[#221d17] to-[#141110]",
        isPulsing ? "scale-95 ring-2 ring-brand/70" : "",
      ].join(" ")}
    >
      {/* Üst parlaklık çizgisi — kabartma hissi */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />

      <span
        className={[
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          isFinish ? "text-[#0E0D10] bg-gradient-to-b from-brand-2 to-brand" : "text-brand",
        ].join(" ")}
      >
        <Icon size={13} strokeWidth={2.4} />
      </span>

      <span
        className={[
          "text-[10px] font-bold tracking-wide sm:text-[11px]",
          isFinish ? "text-brand-2" : "text-text/90",
        ].join(" ")}
      >
        {action.label}
      </span>

      {/* Pulse geri bildirimi */}
      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-xl bg-brand/25 transition-opacity duration-300",
          isPulsing ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}
