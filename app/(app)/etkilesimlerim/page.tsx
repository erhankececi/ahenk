"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Heart, Star, MessageCircle } from "lucide-react";

type Card = { id: string; name: string; city: string | null; photo: string | null; matchId?: string };
type Data = { matches: Card[]; liked: Card[]; superLiked: Card[] };

const TABS = [
  { key: "matches", label: "Eşleşmeler", Icon: MessageCircle },
  { key: "liked", label: "Beğendiklerim", Icon: Heart },
  { key: "superLiked", label: "Süper Beğeni", Icon: Star },
] as const;

export default function Etkilesimlerim() {
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<keyof Data>("matches");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/my-interactions").then((r) => r.json()).then(setData).catch(() => setData({ matches: [], liked: [], superLiked: [] }));
  }, []);

  const list = useMemo(() => {
    const arr = data?.[tab] || [];
    const t = q.trim().toLocaleLowerCase("tr");
    return t ? arr.filter((c) => c.name.toLocaleLowerCase("tr").includes(t)) : arr;
  }, [data, tab, q]);

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/profil" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label="Geri"><ArrowLeft size={18} /></Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text">Bağlantılarım</h1>
        </div>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "ahenk-chip-active" : "ahenk-chip hover:text-text"
            }`}
          >
            <t.Icon size={14} /> {t.label}
            {data && <span className="opacity-70">{data[t.key].length}</span>}
          </button>
        ))}
      </div>

      <div className="ahenk-panel mb-4 flex items-center gap-2 rounded-2xl px-3">
        <Search size={16} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsme göre ara…" className="w-full bg-transparent py-2.5 text-sm text-text outline-none placeholder:text-muted" />
      </div>

      {!data ? (
        <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="shimmer h-40 rounded-2xl" />)}</div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="lp-monogram flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-extrabold">A</span>
          <p className="mt-3.5 text-sm text-muted">
            {q ? "Sonuç yok." : tab === "matches" ? "Henüz eşleşmen yok." : tab === "liked" ? "Henüz kimseyi beğenmedin." : "Henüz süper beğeni atmadın."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((c) => (
            <Link
              key={c.id}
              href={c.matchId ? `/sohbet/${c.matchId}` : `/u/${c.id}`}
              className="lp-panel-hover overflow-hidden rounded-2xl"
            >
              <div className="aspect-[4/5] bg-[#151318]">
                {c.photo ? (
                  <img src={c.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(199,169,119,0.18),#0E0D10_70%)]">
                    <span className="lp-monogram flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold">
                      {c.name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold text-text">{c.name}</p>
                {c.city && <p className="truncate text-xs text-muted">{c.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
