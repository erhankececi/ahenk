"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, GIFT_CATEGORIES, RARITY, type GiftCategory, type Gift } from "@/lib/gifts";
import { Coins, Gift as GiftIcon, X, Plus } from "lucide-react";

// 3D görsel; yüklenemezse emoji'ye düşer.
function GiftThumb({ g }: { g: Gift }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-[2.5rem] leading-none">{g.emoji}</span>;
  return (
    <img
      src={`/gifts/${g.key}.png`}
      alt={g.name}
      loading="lazy"
      onError={() => setErr(true)}
      className="relative h-14 w-14 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)] transition group-hover:scale-110"
    />
  );
}

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
        className="animate-slide-up flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-gradient-to-b from-[#17171b] to-[#0b0b0d]"
      >
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <GiftIcon size={18} className="text-accent" /> Hediye Mağazası
          </p>
          <div className="flex items-center gap-3">
            {balance != null && (
              <a
                href="/cuzdan"
                className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent transition hover:bg-accent/20"
              >
                <Coins size={14} /> {balance.toLocaleString("tr-TR")}
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[#1c1407]"><Plus size={11} /></span>
              </a>
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
                cat === c.id ? "bg-accent text-[#1c1407]" : "bg-white/5 text-muted hover:text-text"
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Kartlar — grafit tile + altın fiyat + ince nadirlik halkası */}
        <div className="grid flex-1 grid-cols-3 gap-2.5 overflow-y-auto p-5 pb-3">
          {items.map((g) => {
            const r = RARITY[g.rarity];
            const afford = balance == null || balance >= g.cost;
            const active = sel === g.key;
            return (
              <button
                key={g.key}
                onClick={() => setSel(g.key)}
                className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-[#161619] p-3 transition duration-200 ${
                  active ? "-translate-y-1" : "hover:-translate-y-0.5"
                } ${afford ? "" : "opacity-45"}`}
                style={{
                  borderColor: active ? r.ring : "rgba(255,255,255,0.06)",
                  boxShadow: active ? `0 0 0 1.5px ${r.ring}, 0 14px 30px -10px ${r.ring}` : undefined,
                }}
              >
                {/* üstte ince nadirlik parıltısı */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-40" style={{ background: `radial-gradient(60% 80% at 50% 0%, ${r.ring}, transparent 70%)` }} />
                {/* nadirlik rozeti */}
                <span className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide" style={{ color: r.text, background: "rgba(0,0,0,0.45)" }}>
                  {r.label}
                </span>
                {/* 3D görsel */}
                <span className="relative my-1 flex h-14 items-center justify-center">
                  <span className="absolute h-12 w-12 rounded-full opacity-45 blur-xl" style={{ background: r.ring }} />
                  <GiftThumb g={g} />
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium text-white/90">{g.name}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-bold text-accent">
                  <Coins size={11} /> {g.cost.toLocaleString("tr-TR")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Jeton satın al + Gönder çubuğu */}
        <div className="space-y-2.5 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <a
            href="/cuzdan"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 transition hover:border-accent/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent"><Coins size={18} /></span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">Jeton satın al</span>
              <span className="block text-xs text-muted">Avantajlı paketleri keşfet</span>
            </span>
            <Plus size={18} className="text-accent" />
          </a>
          <button
            onClick={() => sel && onSend(sel)}
            disabled={!sel}
            className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition active:scale-[0.98] disabled:opacity-40"
          >
            <GiftIcon size={18} />
            {sel ? `${otherName}'a gönder` : "Bir hediye seç"}
          </button>
        </div>
      </div>
    </div>
  );
}
