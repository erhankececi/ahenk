"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { zamanFarki } from "@/lib/utils";
import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";
import { MoreVertical, Archive, Lock, Trash2, RotateCcw, Inbox } from "lucide-react";

export type Row = {
  matchId: string;
  name: string;
  tier: string;
  lastText: string | null;
  lastTime: string | null;
  unread: boolean;
  online: boolean;
  state: string;
};

type Tab = "normal" | "archived" | "hidden";

export default function MatchList({ meId, rows }: { meId: string; rows: Row[] }) {
  const supabase = createClient();
  const [override, setOverride] = useState<Record<string, string>>({});
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("normal");
  const [unlocked, setUnlocked] = useState(false);

  const stateOf = (r: Row) => override[r.matchId] ?? r.state ?? "normal";
  async function setState(matchId: string, state: string) {
    setOverride((o) => ({ ...o, [matchId]: state }));
    setMenuFor(null);
    await supabase.from("chat_states").upsert({ user_id: meId, match_id: matchId, state });
  }

  const normal = rows.filter((r) => stateOf(r) === "normal");
  const archived = rows.filter((r) => stateOf(r) === "archived");
  const hidden = rows.filter((r) => stateOf(r) === "hidden");

  async function gizliAc() {
    const st = await fetch("/api/chat-folder/pin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status" }),
    }).then((r) => r.json());
    const pin = prompt(st.hasPin ? "Gizli klasör PIN'i:" : "Gizli klasör için 4 haneli PIN belirle:");
    if (!pin) return;
    const action = st.hasPin ? "verify" : "set";
    const r = await fetch("/api/chat-folder/pin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, pin }),
    }).then((r) => r.json());
    if (r.ok) { setUnlocked(true); setTab("hidden"); }
    else alert(st.hasPin ? "Yanlış PIN." : "PIN 4-8 haneli rakam olmalı.");
  }

  function onTab(t: Tab) {
    if (t === "hidden" && !unlocked) { gizliAc(); return; }
    setTab(t);
  }

  function ChatRow({ r, mode }: { r: Row; mode: Tab }) {
    return (
      <div className="relative flex items-center gap-1 rounded-2xl border border-border bg-surface transition hover:border-brand/40">
        <Link href={`/sohbet/${r.matchId}`} className="flex min-w-0 flex-1 items-center gap-3 p-3">
          <div className="relative">
            <div className={`rounded-full ${tierFrame(r.tier)}`}>
              <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                {r.name[0]}
              </div>
            </div>
            {r.online && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-semibold">{r.name} <PremiumBadge tier={r.tier} /></p>
            <p className={`truncate text-sm ${r.unread ? "font-medium text-text" : "text-muted"}`}>
              {r.lastText || "Eşleştiniz — ilk mesajı sen at!"}
            </p>
          </div>
          {r.lastTime && <span className={`shrink-0 text-xs ${r.unread ? "text-brand" : "text-muted"}`}>{zamanFarki(r.lastTime)}</span>}
        </Link>
        {mode === "normal" ? (
          <button onClick={() => setMenuFor(menuFor === r.matchId ? null : r.matchId)} className="shrink-0 px-2 text-muted" aria-label="Seçenekler">
            <MoreVertical size={18} />
          </button>
        ) : (
          <button onClick={() => setState(r.matchId, "normal")} className="shrink-0 px-3 text-xs text-brand" aria-label="Geri al" title="Aktif sohbetlere geri al">
            <RotateCcw size={16} />
          </button>
        )}
        {menuFor === r.matchId && (
          <div className="absolute right-2 top-12 z-10 w-52 overflow-hidden rounded-2xl border border-border bg-elevated shadow-float">
            <button onClick={() => setState(r.matchId, "archived")} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface">
              <Archive size={15} /> Arşivle
            </button>
            <button onClick={() => setState(r.matchId, "hidden")} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface">
              <Lock size={15} /> Gizli klasöre taşı
            </button>
            <button onClick={() => setState(r.matchId, "deleted")} className="flex w-full flex-col items-start gap-0.5 px-4 py-3 text-sm text-error hover:bg-surface">
              <span className="flex items-center gap-2"><Trash2 size={15} /> Benim için sil</span>
              <span className="pl-6 text-[11px] font-normal text-muted">Mesajlar silinmez — tekrar yazışınca geri gelir</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const TABS: { key: Tab; label: string; n: number }[] = [
    { key: "normal", label: "Aktif", n: normal.length },
    { key: "archived", label: "Arşiv", n: archived.length },
    { key: "hidden", label: "Gizli", n: unlocked ? hidden.length : 0 },
  ];

  const list = tab === "normal" ? normal : tab === "archived" ? archived : hidden;
  const empty =
    tab === "normal" ? "Henüz aktif sohbetin yok." :
    tab === "archived" ? "Arşivde sohbet yok." :
    "Gizli klasör boş.";

  return (
    <div onClick={(e) => { if (menuFor && !(e.target as HTMLElement).closest("[aria-label='Seçenekler']")) setMenuFor(null); }}>
      {/* Sekmeler: Aktif / Arşiv / Gizli */}
      <div className="mb-3 flex gap-1 rounded-2xl bg-elevated p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium transition ${
              tab === t.key ? "brand-gradient text-white" : "text-muted"
            }`}
          >
            {t.key === "hidden" && <Lock size={13} />}
            {t.label}
            {t.n > 0 && (
              <span className={`rounded-full px-1.5 text-[11px] ${tab === t.key ? "bg-white/25" : "bg-surface"}`}>{t.n}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "hidden" && !unlocked ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Lock size={28} className="text-accent" />
          <p className="text-sm text-muted">Gizli klasör PIN ile korunuyor.</p>
          <button onClick={gizliAc} className="brand-gradient rounded-full px-5 py-2 text-sm font-semibold text-white">
            Kilidi aç
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
          <Inbox size={28} />
          <p className="text-sm">{empty}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => <ChatRow key={r.matchId} r={r} mode={tab} />)}
        </div>
      )}
    </div>
  );
}
