"use client";

import { useCallback, useRef, useState } from "react";
import { Copy, Flag, Layers, ListOrdered, Send, type LucideIcon } from "lucide-react";
import GameToast from "./GameToast";

type ActionId = "draw" | "discard" | "run" | "pair" | "finish";

interface ActionDef {
  id: ActionId;
  label: string;
  icon: LucideIcon;
}

const ACTIONS: ActionDef[] = [
  { id: "draw", label: "TAŞ ÇEK", icon: Layers },
  { id: "discard", label: "TAŞ AT", icon: Send },
  { id: "run", label: "SERİ AÇ", icon: ListOrdered },
  { id: "pair", label: "ÇİFT AÇ", icon: Copy },
  { id: "finish", label: "BİTİR", icon: Flag },
];

const LOCKED_TOAST_MESSAGE = "Bu hamle sonraki fazda aktif olacak.";
const TOAST_DURATION_MS = 2200;

export interface ActionButtonsProps {
  /** Desteden taş çeker (sıra bendeyse). */
  onDraw: () => void;
  /** Seçili taşı atar (bir taş seçiliyse). */
  onDiscard: () => void;
  /** "TAŞ AT" butonunun aktif olup olmadığı (bir taş seçili mi). */
  canDiscard: boolean;
}

/**
 * Sağ-alt köşede sabit aksiyon butonları. Brass/altın vurgulu, hafif 3D/
 * kabartma buton hissi — Pixi canvas'ın ÜSTÜNDE DOM overlay katmanı.
 *
 * TAŞ ÇEK / TAŞ AT gerçek hook aksiyonlarını tetikler. SERİ AÇ / ÇİFT AÇ /
 * BİTİR bu fazda henüz aktif değil — tıklanınca kısa bir "kilitli" toast'ı
 * gösterilir.
 */
export default function ActionButtons({ onDraw, onDiscard, canDiscard }: ActionButtonsProps) {
  const [pulsingId, setPulsingId] = useState<ActionId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulse = useCallback((id: ActionId) => {
    setPulsingId(id);
    window.setTimeout(() => {
      setPulsingId((current) => (current === id ? null : current));
    }, 260);
  }, []);

  const showLockedToast = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(LOCKED_TOAST_MESSAGE);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  const handleClick = useCallback(
    (id: ActionId) => {
      pulse(id);
      switch (id) {
        case "draw":
          onDraw();
          break;
        case "discard":
          if (canDiscard) onDiscard();
          break;
        case "run":
        case "pair":
        case "finish":
          showLockedToast();
          break;
      }
    },
    [canDiscard, onDiscard, onDraw, pulse, showLockedToast],
  );

  return (
    <>
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 sm:bottom-4 sm:right-4">
        <div className="pointer-events-auto grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACTIONS.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              isPulsing={pulsingId === action.id}
              disabled={action.id === "discard" && !canDiscard}
              onClick={() => handleClick(action.id)}
            />
          ))}
        </div>
      </div>

      <GameToast message={toastMessage} />
    </>
  );
}

function ActionButton({
  action,
  isPulsing,
  disabled,
  onClick,
}: {
  action: ActionDef;
  isPulsing: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = action.icon;
  const isFinish = action.id === "finish";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "group relative flex items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-2",
        "transition-transform duration-150 ease-out active:scale-95",
        "shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_-2px_4px_rgb(0_0_0/0.5)_inset,0_6px_14px_-6px_rgb(0_0_0/0.65)]",
        isFinish
          ? "border-brand/70 bg-gradient-to-b from-[#3a2c17] to-[#1c140a]"
          : "border-brand/25 bg-gradient-to-b from-[#221d17] to-[#141110]",
        isPulsing ? "scale-95 ring-2 ring-brand/70" : "",
        disabled ? "cursor-not-allowed opacity-40" : "",
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
