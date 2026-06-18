"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, type Gift } from "@/lib/gifts";
import { Coins, Plus, ArrowLeft, ChevronRight, Gift as GiftIcon } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

// Kategori sekmeleri — referanstaki 5 sekme (tüm katalog kapsanır)
const TABS: { id: string; match: (g: Gift) => boolean }[] = [
  { id: "tumu", match: () => true },
  { id: "populer", match: (g) => g.rarity === "epic" || g.rarity === "legendary" || g.rarity === "mythic" },
  { id: "luks", match: (g) => g.category === "luks" || g.category === "vip" },
  { id: "ozel", match: (g) => g.category === "ozel" || g.category === "romantik" },
  { id: "etkinlik", match: (g) => g.category === "seyahat" || g.category === "efsane" || g.category === "kraliyet" },
];

function Thumb({ g, delay, active }: { g: Gift; delay: number; active?: boolean }) {
  const [err, setErr] = useState(false);
  const [vidOk, setVidOk] = useState(true);
  const reduce = useReducedMotion();
  // Asset yoksa koyu sinematik placeholder (emoji/ikon YOK)
  if (err) return <span className="block h-[78%] w-[78%] rounded-xl" style={{ background: "radial-gradient(circle at 50% 40%, #1b1825, #0b0a0d)" }} />;
  // Seçili kartta + hareket açıkken WebM önizleme dene (varsa); yoksa PNG'ye düşer.
  // Performans: yalnız aktif kart video mount eder.
  const showPreview = !!active && !reduce && vidOk;
  return (
    <motion.div
      className="relative h-[80%] w-[80%]"
      animate={reduce ? undefined : { y: [0, -5, 0], scale: active ? [1, 1.06, 1] : [1, 1.025, 1] }}
      transition={{ duration: active ? 3.2 : 4.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {showPreview && (
        <video
          src={`/gifts/animations/${g.key}.webm`}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVidOk(false)}
          className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.7)]"
        />
      )}
      <Image
        src={`/gifts/${g.key}.png`}
        alt={g.name}
        fill
        sizes="120px"
        onError={() => setErr(true)}
        className={`object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.7)] transition-opacity ${showPreview ? "opacity-0" : "opacity-100"}`}
      />
    </motion.div>
  );
}

export default function Magaza() {
  const supabase = createClient();
  const tm = useLang().t.magaza;
  const tabLabel: Record<string, string> = {
    tumu: tm.tabAll, populer: tm.tabPopular, luks: tm.tabLux, ozel: tm.tabSpecial, etkinlik: tm.tabEvent,
  };
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
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-5" style={{ background: "rgba(14,13,16,0.85)", backdropFilter: "blur(12px)" }}>
        <Link href="/cuzdan" className="text-text/70 transition hover:text-text" aria-label={tm.back}><ArrowLeft size={22} strokeWidth={1.8} /></Link>
        <h1 className="font-display text-[17px] font-bold tracking-tight">{tm.title}</h1>
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
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-3">
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
              {tabLabel[t.id]}
            </button>
          );
        })}
      </div>

      {/* 3 kolon lüks grid */}
      <div className="grid grid-cols-3 gap-3 px-5 pt-1">
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
              className="group relative flex flex-col overflow-hidden rounded-[16px] text-left"
              style={{
                background: "linear-gradient(170deg,#18161B,#111014)",
                border: active ? "1px solid rgba(199,169,119,0.55)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: active ? "0 0 0 1px rgba(199,169,119,0.35), 0 0 22px -6px rgba(199,169,119,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" : "inset 0 1px 0 rgba(255,255,255,0.03), 0 6px 16px -10px rgba(0,0,0,0.8)",
              }}
            >
              {/* görsel vitrini */}
              <div className="relative flex aspect-[1/0.92] items-center justify-center">
                <span className="pointer-events-none absolute inset-0 transition-opacity" style={{ background: "radial-gradient(72% 62% at 50% 42%, rgba(199,169,119,0.10), transparent 72%)", opacity: active ? 1 : 0.55 }} />
                {(g.rarity === "legendary" || g.rarity === "mythic") && (
                  <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded-full border border-accent/40 bg-[#0E0D10]/80 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-accent">
                    {tm.specialBadge}
                  </span>
                )}
                <Thumb g={g} delay={(i % 6) * 0.5} active={active} />
              </div>
              {/* ad + fiyat */}
              <div className="px-2 pb-2.5 pt-0.5">
                <p className="line-clamp-1 text-center text-[12px] font-medium" style={{ color: "#F5EFE4" }}>{g.name}</p>
                <motion.p
                  className="mt-1 flex items-center justify-center gap-1 text-[13px] font-bold text-accent"
                  animate={active ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
                  transition={active ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                >
                  <Coins size={12} /> {g.cost.toLocaleString("tr-TR")}
                </motion.p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Jeton satın al kartı */}
      <div className="px-5 pt-5">
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
              <span className="block text-sm font-semibold text-text">{tm.buyTokens}</span>
              <span className="block text-xs text-text/55">{tm.buyTokensDesc}</span>
            </span>
            <ChevronRight size={20} className="text-accent" />
          </Link>
        </motion.div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-text/45">
          <GiftIcon size={13} /> {tm.sendHint}
        </p>
      </div>
    </motion.div>
  );
}
