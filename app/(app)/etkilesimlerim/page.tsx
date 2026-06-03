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
    <div className="px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/profil" className="text-muted" aria-label="Geri"><ArrowLeft size={20} /></Link>
        <h1 className="font-display text-2xl font-bold">Bağlantılarım</h1>
      </div>

      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-brand text-white" : "border border-border text-muted"
            }`}
          >
            <t.Icon size={14} /> {t.label}
            {data && <span className="opacity-70">{data[t.key].length}</span>}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface px-3">
        <Search size={16} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsme göre ara…" className="w-full bg-transparent py-2.5 text-sm outline-none" />
      </div>

      {!data ? (
        <div className="grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-elevated" />)}</div>
      ) : list.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          {q ? "Sonuç yok." : tab === "matches" ? "Henüz eşleşmen yok." : tab === "liked" ? "Henüz kimseyi beğenmedin." : "Henüz süper beğeni atmadın."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((c) => (
            <Link
              key={c.id}
              href={c.matchId ? `/sohbet/${c.matchId}` : `/u/${c.id}`}
              className="overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="aspect-[4/5] bg-elevated">
                {c.photo ? (
                  <img src={c.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/30 to-accent/30 text-3xl font-bold">
                    {c.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                {c.city && <p className="truncate text-xs text-muted">{c.city}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
