"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, GIFT_CATEGORIES, type GiftTier } from "@/lib/gifts";
import { Coins, Gift as GiftIcon, X } from "lucide-react";

/** Kategorili premium hediye mağazası (TikTok/Bigo seviyesi katalog). */
export default function GiftStore({
  otherName,
  onSend,
  onClose,
}: {
  otherName: string;
  onSend: (key: string) => void;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [cat, setCat] = useState<GiftTier>("daily");
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("jeton").eq("id", data.user.id).single();
      setBalance(p?.jeton ?? 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = GIFT_CATALOG.filter((g) => g.category === cat);

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-border bg-surface"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="t-h4 flex items-center gap-2">
            <GiftIcon size={18} className="text-accent" /> Hediye gönder
          </p>
          <div className="flex items-center gap-3">
            {balance != null && (
              <span className="flex items-center gap-1 text-sm font-semibold text-accent">
                <Coins size={14} /> {balance}
              </span>
            )}
            <button onClick={onClose} aria-label="Kapat" className="text-muted">
              <X size={20} />
            </button>
          </div>
        </div>
        <p className="px-5 pt-0.5 text-xs text-muted">{otherName} hediyenin %70&apos;ini jeton kazanır.</p>

        <div className="no-scrollbar mt-3 flex shrink-0 gap-2 overflow-x-auto px-5">
          {GIFT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                cat === c.id ? "bg-brand text-white" : "border border-border text-muted hover:text-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-3 gap-2.5 overflow-y-auto p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {items.map((g) => {
            const afford = balance == null || balance >= g.cost;
            return (
              <button
                key={g.key}
                onClick={() => onSend(g.key)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3 transition active:scale-95 ${
                  afford ? "border-border bg-elevated hover:border-accent" : "border-border/40 bg-elevated/40 opacity-50"
                }`}
              >
                <span className="text-[2rem] leading-none">{g.emoji}</span>
                <span className="w-full truncate text-center text-[11px] text-muted">{g.name}</span>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-accent">
                  <Coins size={11} /> {g.cost.toLocaleString("tr-TR")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
