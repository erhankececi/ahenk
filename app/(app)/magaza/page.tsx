"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GIFT_CATALOG, RARITY, type Gift } from "@/lib/gifts";
import { Coins, Plus, ArrowLeft, Gift as GiftIcon } from "lucide-react";
import Link from "next/link";

// Mockup'taki kategori çipleri
const TABS: { id: string; label: string; match: (g: Gift) => boolean }[] = [
  { id: "tumu", label: "Tümü", match: () => true },
  { id: "populer", label: "Popüler", match: (g) => g.rarity === "legendary" || g.rarity === "mythic" || g.rarity === "epic" },
  { id: "luks", label: "Lüks", match: (g) => g.category === "luks" || g.category === "vip" },
  { id: "kraliyet", label: "Kraliyet", match: (g) => g.category === "kraliyet" },
  { id: "efsane", label: "Efsane", match: (g) => g.category === "efsane" || g.category === "seyahat" },
  { id: "romantik", label: "Özel", match: (g) => g.category === "romantik" || g.category === "ozel" },
];

function Thumb({ g }: { g: Gift }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-[2.7rem] leading-none">{g.emoji}</span>;
  return (
    <img
      src={`/gifts/${g.key}.png`}
      alt={g.name}
      loading="lazy"
      onError={() => setErr(true)}
      className="relative h-16 w-16 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)] transition group-hover:scale-110"
    />
  );
}

export default function Magaza() {
  const supabase = createClient();
  const [balance, setBalance] = useState<number | null>(null);
  const [tab, setTab] = useState("tumu");

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
    <div className="min-h-dvh pb-28 lg:pb-10">
      {/* Üst başlık */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/85 px-4 py-3 backdrop-blur-md">
        <Link href="/cuzdan" className="text-muted" aria-label="Geri"><ArrowLeft size={22} /></Link>
        <h1 className="font-display text-lg font-bold">Hediye Mağazası</h1>
        <Link
          href="/cuzdan"
          className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-sm font-bold text-accent"
        >
          <Coins size={14} /> {(balance ?? 0).toLocaleString("tr-TR")}
          <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[#1c1407]"><Plus size={11} /></span>
        </Link>
      </header>

      {/* Kategori çipleri */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t.id ? "bg-accent text-[#1c1407]" : "bg-surface text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 3'lü 3D kart grid'i */}
      <div className="grid grid-cols-3 gap-2.5 px-4 pt-1">
        {items.map((g) => {
          const r = RARITY[g.rarity];
          return (
            <div
              key={g.key}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl border bg-[#161619] p-3 transition duration-200 hover:-translate-y-0.5"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-40" style={{ background: `radial-gradient(60% 80% at 50% 0%, ${r.ring}, transparent 70%)` }} />
              <span className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide" style={{ color: r.text, background: "rgba(0,0,0,0.45)" }}>
                {r.label}
              </span>
              <span className="relative my-1 flex h-16 items-center justify-center">
                <span className="absolute h-12 w-12 rounded-full opacity-45 blur-xl" style={{ background: r.ring }} />
                <Thumb g={g} />
              </span>
              <span className="w-full truncate text-center text-xs font-medium text-white/90">{g.name}</span>
              <span className="mt-1 flex items-center gap-1 text-sm font-bold text-accent">
                <Coins size={12} /> {g.cost.toLocaleString("tr-TR")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Jeton satın al */}
      <div className="px-4 pt-4">
        <Link
          href="/cuzdan"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-accent/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent"><Coins size={20} /></span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">Jeton satın al</span>
            <span className="block text-xs text-muted">Avantajlı paketleri keşfet</span>
          </span>
          <Plus size={20} className="text-accent" />
        </Link>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <GiftIcon size={13} /> Bir hediyeyi göndermek için sohbet veya profilde 🎁 simgesine dokun
        </p>
      </div>
    </div>
  );
}
