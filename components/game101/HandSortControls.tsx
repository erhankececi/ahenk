"use client";

import { useCallback, useState } from "react";
import { ArrowDownWideNarrow, Layers3, Palette, Rows3, type LucideIcon } from "lucide-react";

type SortId = "color" | "value" | "pairs" | "compact";

interface SortDef {
  id: SortId;
  label: string;
  icon: LucideIcon;
}

const SORTS: SortDef[] = [
  { id: "color", label: "RENK DİZ", icon: Palette },
  { id: "value", label: "SAYI DİZ", icon: ArrowDownWideNarrow },
  { id: "pairs", label: "ÇİFT DİZ", icon: Layers3 },
  { id: "compact", label: "ELİ TOPLA", icon: Rows3 },
];

export interface HandSortControlsProps {
  onSortColor: () => void;
  onSortValue: () => void;
  onSortPairs: () => void;
  onCompact: () => void;
}

/**
 * Istakanın hemen üstünde, sol-alt bölgede küçük premium bir kontrol grubu —
 * el sıralama kısayolları. ActionButtons'ın brass/kabartma buton diline
 * benzer ama AYRI ve daha küçük/ince bir satır olarak durur (sağ-alt
 * ActionButtons ile çakışmaz).
 *
 * Butona basınca ilgili hook aksiyonu çağrılır; aksiyon state.lastAction'ı
 * Türkçe bir açıklamayla günceller — GameScreen bu değişimi izleyip paylaşılan
 * tek GameToast'ı gösterir (burada ayrı bir toast tetiklenmez, iki toast
 * kaynağı çakışmaz).
 */
export default function HandSortControls({
  onSortColor,
  onSortValue,
  onSortPairs,
  onCompact,
}: HandSortControlsProps) {
  const [pulsingId, setPulsingId] = useState<SortId | null>(null);

  const pulse = useCallback((id: SortId) => {
    setPulsingId(id);
    window.setTimeout(() => {
      setPulsingId((current) => (current === id ? null : current));
    }, 260);
  }, []);

  const handleClick = useCallback(
    (id: SortId) => {
      pulse(id);
      switch (id) {
        case "color":
          onSortColor();
          break;
        case "value":
          onSortValue();
          break;
        case "pairs":
          onSortPairs();
          break;
        case "compact":
          onCompact();
          break;
      }
    },
    [onCompact, onSortColor, onSortPairs, onSortValue, pulse],
  );

  return (
    <div className="pointer-events-none absolute bottom-16 left-3 z-10 sm:bottom-20 sm:left-4">
      <div className="pointer-events-auto flex items-center gap-1.5">
        {SORTS.map((sort) => (
          <SortButton
            key={sort.id}
            sort={sort}
            isPulsing={pulsingId === sort.id}
            onClick={() => handleClick(sort.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SortButton({
  sort,
  isPulsing,
  onClick,
}: {
  sort: SortDef;
  isPulsing: boolean;
  onClick: () => void;
}) {
  const Icon = sort.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex items-center gap-1 overflow-hidden rounded-lg border px-2 py-1.5",
        "border-brand/20 bg-gradient-to-b from-[#1d1913] to-[#100d0a]",
        "transition-transform duration-150 ease-out active:scale-95",
        "shadow-[0_1px_0_rgb(255_255_255/0.06)_inset,0_4px_10px_-6px_rgb(0_0_0/0.6)]",
        isPulsing ? "scale-95 ring-1 ring-brand/60" : "",
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-brand/80">
        <Icon size={11} strokeWidth={2.2} />
      </span>

      <span className="text-[9px] font-bold tracking-wide text-text/70 sm:text-[10px]">
        {sort.label}
      </span>

      <span
        className={[
          "pointer-events-none absolute inset-0 rounded-lg bg-brand/20 transition-opacity duration-300",
          isPulsing ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}
