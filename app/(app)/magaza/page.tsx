"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, type Gift } from "@/lib/gifts";
import { Coins, Plus, ArrowLeft, ChevronRight, Gift as GiftIcon } from "lucide-react";
import Link from "next/link";

// Kategori sekmeleri (referans + Ahenk kataloğu eşlemesi)
const TABS: { id: string; label: string; match: (g: Gift) => boolean }[] = [
  { id: "tumu", label: "Tümü", match: () => true },
  { id: "populer", label: "Popüler", match: (g) => g.rarity === "legendary" || g.rarity === "mythic" || g.rarity === "epic" },
  { id: "luks", label: "Lüks", match: (g) => g.category === "luks" },
  { id: "ozel", label: "Özel", match: (g) => g.category === "ozel" },
  { id: "etkinlik", label: "Etkinlik", match: (g) => g.category === "seyahat" || g.category === "efsane" || g.category === "kraliyet" },
  { id: "romantik", label: "Romantik", match: (g) => g.category === "romantik" },
  { id: "vip", label: "VIP", match: (g) => g.category === "vip" },
];

function Thumb({ g }: { g: Gift }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-[2.6rem] leading-none">{g.emoji}</span>;
  return (
    <img
      src={`/gifts/${g.key}.png`}
      alt={g.name}
      loading="lazy"
      onError={() => setErr(true)}
      className="h-[64%] w-[64%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
    />
  );
}

export default function Magaza() {
  const supabase = createClient();
  const [balance, setBalance] = useState<number | null>(null);
  const [tab, setTab] = useState("tumu");
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("jeton").eq("id", data.user.id).single();
      setBalance(p?.jeton ?? 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => {
    const t = TABS.find((x) => x.id === tab)!;
    return GIFT_CATALOG.filter(t.match).sort((a, b) => b.cost - a.cost);
  }, [tab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-dvh pb-28 lg:pb-10"
      style={{ background: "#0E0D10" }}
    >
      {/* Üst bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3.5" style={{ background: "rgba(14,13,16,0.85)", backdropFilter: "blur(12px)" }}>
        <Link href="/cuzdan" className="text-text/70 transition hover:text-text" aria-label="Geri"><ArrowLeft size={22} strokeWidth={1.8} /></Link>
        <h1 className="font-display text-[17px] font-bold tracking-tight">Hediye Mağazası</h1>
        <Link
          href="/cuzdan"
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold text-accent"
          style={{ background: "#151318", border: "1px solid rgba(199,169,119,0.30)" }}
        >
          <Coins size={14} /> {(balance ?? 0).toLocaleString("tr-TR")}
          <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[#1c1407]"><Plus size={11} /></span>
        </Link>
      </header>

      {/* Kategori sekmeleri */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSel(null); }}
              className="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition"
              style={
                on
                  ? { background: "linear-gradient(160deg,#2a2418,#1a160e)", border: "1px solid rgba(199,169,119,0.55)", color: "#E8D9B8" }
                  : { background: "#151318", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(243,238,228,0.55)" }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 3 kolon lüks grid */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-1">
        {items.map((g, i) => {
          const active = sel === g.key;
          return (
            <motion.button
              key={g.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSel(active ? null : g.key)}
              className="group relative flex flex-col overflow-hidden rounded-2xl text-left"
              style={{
                background: "linear-gradient(170deg,#18161B,#121013)",
                border: active ? "1px solid rgba(199,169,119,0.7)" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: active ? "0 0 0 1px rgba(199,169,119,0.4), 0 0 22px -6px rgba(199,169,119,0.45), inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03), 0 6px 16px -10px rgba(0,0,0,0.8)",
              }}
            >
              {/* görsel vitrini */}
              <div className="relative flex aspect-square items-center justify-center">
                <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 42%, rgba(199,169,119,0.10), transparent 72%)" }} />
                <Thumb g={g} />
              </div>
              {/* ad + fiyat */}
              <div className="px-2 pb-2.5 pt-0.5">
                <p className="truncate text-center text-[12px] font-medium text-text/90">{g.name}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[13px] font-bold text-accent">
                  <Coins size={12} /> {g.cost.toLocaleString("tr-TR")}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Jeton satın al kartı */}
      <div className="px-4 pt-5">
        <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
          <Link
            href="/cuzdan"
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ background: "#151318", border: "1px solid rgba(199,169,119,0.25)" }}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full text-accent" style={{ background: "rgba(199,169,119,0.12)" }}>
              <Coins size={20} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-text">Jeton satın al</span>
              <span className="block text-xs text-text/55">Avantajlı paketleri keşfet</span>
            </span>
            <ChevronRight size={20} className="text-accent" />
          </Link>
        </motion.div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-text/45">
          <GiftIcon size={13} /> Göndermek için bir sohbette veya profilde hediye simgesine dokun
        </p>
      </div>
    </motion.div>
  );
}
