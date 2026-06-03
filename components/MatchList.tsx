"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { zamanFarki } from "@/lib/utils";
import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";
import { MoreVertical, Archive, Lock, Trash2, RotateCcw, ChevronDown } from "lucide-react";

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

export default function MatchList({ meId, rows }: { meId: string; rows: Row[] }) {
  const supabase = createClient();
  const [override, setOverride] = useState<Record<string, string>>({});
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
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
    if (r.ok) setUnlocked(true);
    else alert(st.hasPin ? "Yanlış PIN." : "PIN 4-8 haneli rakam olmalı.");
  }

  function ChatRow({ r, mode }: { r: Row; mode: "normal" | "archived" | "hidden" }) {
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
          <button onClick={() => setState(r.matchId, "normal")} className="shrink-0 px-3 text-xs text-brand" aria-label="Geri al">
            <RotateCcw size={16} />
          </button>
        )}
        {menuFor === r.matchId && (
          <div className="absolute right-2 top-12 z-10 w-44 overflow-hidden rounded-2xl border border-border bg-elevated shadow-float">
            <button onClick={() => setState(r.matchId, "archived")} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface">
              <Archive size={15} /> Arşivle
            </button>
            <button onClick={() => setState(r.matchId, "hidden")} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-surface">
              <Lock size={15} /> Gizli klasöre taşı
            </button>
            <button onClick={() => setState(r.matchId, "deleted")} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-error hover:bg-surface">
              <Trash2 size={15} /> Sil
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" onClick={(e) => { if (menuFor && !(e.target as HTMLElement).closest("[aria-label='Seçenekler']")) setMenuFor(null); }}>
      {normal.map((r) => <ChatRow key={r.matchId} r={r} mode="normal" />)}

      {/* Arşiv */}
      {archived.length > 0 && (
        <div className="pt-2">
          <button onClick={() => setShowArchive((v) => !v)} className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium">
            <Archive size={16} className="text-muted" /> Arşiv ({archived.length})
            <ChevronDown size={15} className={`ml-auto transition ${showArchive ? "rotate-180" : ""}`} />
          </button>
          {showArchive && <div className="mt-2 space-y-2">{archived.map((r) => <ChatRow key={r.matchId} r={r} mode="archived" />)}</div>}
        </div>
      )}

      {/* Gizli Klasör */}
      <div className="pt-2">
        <button onClick={gizliAc} className="flex w-full items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium">
          <Lock size={16} className="text-accent" /> Gizli Klasör{hidden.length > 0 ? ` (${hidden.length})` : ""}
          {unlocked && <span className="ml-auto text-xs text-success">açık</span>}
        </button>
        {unlocked && (
          <div className="mt-2 space-y-2">
            {hidden.length === 0 ? (
              <p className="px-1 text-xs text-muted">Gizli klasör boş.</p>
            ) : (
              hidden.map((r) => <ChatRow key={r.matchId} r={r} mode="hidden" />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
