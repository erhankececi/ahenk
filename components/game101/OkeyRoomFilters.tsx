"use client";

export type RoomFilterKey = "tumu" | "sesli" | "premium" | "sehrimden" | "yeni";

export const ROOM_FILTERS: { key: RoomFilterKey; label: string }[] = [
  { key: "tumu", label: "Tümü" },
  { key: "sesli", label: "Sesli" },
  { key: "premium", label: "Premium" },
  { key: "sehrimden", label: "Şehrimden" },
  { key: "yeni", label: "Yeni başlayan" },
];

export interface OkeyRoomFiltersProps {
  active: RoomFilterKey;
  onChange: (key: RoomFilterKey) => void;
}

/** Masa listesi üstündeki yatay kaydırılabilir filtre chip satırı. */
export default function OkeyRoomFilters({ active, onChange }: OkeyRoomFiltersProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ROOM_FILTERS.map((f) => {
        const isActive = f.key === active;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onChange(f.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-brand/50 bg-brand/15 text-brand"
                : "border-border text-muted hover:border-brand/30 hover:text-text"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
