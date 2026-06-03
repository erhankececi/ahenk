"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, GIFT_CATEGORIES, RARITY, type GiftCategory } from "@/lib/gifts";
import { Coins, Gift as GiftIcon, X } from "lucide-react";

/** TikTok/Bigo seviyesi kategorili premium hediye mağazası. */
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
  const [cat, setCat] = useState<GiftCategory>("romantik");
  const [balance, setBalance] = useState<number | null>(null);
  const [sel, setSel] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-40 flex items-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-gradient-to-b from-[#131a2b] to-[#0b1220]"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <GiftIcon size={18} className="text-accent" /> Hediye Mağazası
          </p>
          <div className="flex items-center gap-3">
            {balance != null && (
              <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-sm font-semibold text-accent">
                <Coins size={14} /> {balance.toLocaleString("tr-TR")}
              </span>
            )}
            <button onClick={onClose} aria-label="Kapat" className="text-muted"><X size={20} /></button>
          </div>
        </div>

        {/* Kategori barı */}
        <div className="no-scrollbar mt-3 flex shrink-0 gap-2 overflow-x-auto px-5 pb-1">
          {GIFT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCat(c.id); setSel(null); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                cat === c.id ? "bg-accent text-[#0B1220]" : "bg-white/5 text-muted hover:text-text"
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Kartlar */}
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-5 pb-3">
          {items.map((g) => {
            const r = RARITY[g.rarity];
            const afford = balance == null || balance >= g.cost;
            const active = sel === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setSel(g.key)}
                className={`group relative flex flex-col items-center overflow-hidden rounded-2xl p-3 transition duration-200 ${
                  active ? "-translate-y-1 scale-[1.03]" : "hover:-translate-y-0.5"
                } ${afford ? "" : "opacity-45"}`}
                style={{
                  background: `linear-gradient(160deg, ${r.from}, ${r.to})`,
                  boxShadow: active
                    ? `0 0 0 2px ${r.ring}, 0 12px 30px -8px ${r.ring}`
                    : `0 0 0 1px ${r.ring}, 0 6px 18px -10px rgba(0,0,0,0.6)`,
                }}
              >
                {/* cam efekti */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                {/* nadirlik rozeti */}
                <span className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide" style={{ color: r.text, background: "rgba(0,0,0,0.35)" }}>
                  {r.label}
                </span>
                {/* glow + emoji */}
                <span className="relative my-1 flex h-12 items-center justify-center">
                  <span className="absolute h-10 w-10 rounded-full blur-xl" style={{ background: r.ring }} />
                  <span className="relative text-[2.4rem] leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition group-hover:scale-110">
                    {g.emoji}
                  </span>
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium text-white/90">{g.name}</span>
                <span className="mt-0.5 flex items-center gap-0.5 text-xs font-bold" style={{ color: r.text }}>
                  <Coins size={11} /> {g.cost.toLocaleString("tr-TR")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gönder çubuğu */}
        <div className="border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => sel && onSend(sel)}
            disabled={!sel}
            className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
          >
            <GiftIcon size={18} />
            {sel ? `${otherName}'a gönder` : "Bir hediye seç"}
          </button>
        </div>
      </div>
    </div>
  );
}
