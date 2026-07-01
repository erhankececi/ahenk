"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/BackButton";
import { Ban } from "lucide-react";

export default function Engellenenler() {
  const supabase = createClient();
  const [rows, setRows] = useState<{ id: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    // RLS: blocks yalnız blocker_id = auth.uid() satırlarını döndürür.
    const { data: blocks } = await supabase.from("blocks").select("blocked_id");
    const ids = (blocks || []).map((b) => b.blocked_id as string);
    if (!ids.length) {
      setRows([]);
      return;
    }
    const { data: profs } = await supabase.from("profiles_card").select("id, name").in("id", ids);
    const map = new Map((profs || []).map((p) => [p.id, p.name]));
    setRows(ids.map((id) => ({ id, name: (map.get(id) as string) || "Biri" })));
  }

  useEffect(() => {
    load();
  }, []);

  async function kaldir(id: string) {
    setBusy(id);
    await supabase.from("blocks").delete().eq("blocked_id", id);
    setBusy(null);
    setRows((r) => (r || []).filter((x) => x.id !== id));
  }

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-3xl lg:px-0 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center gap-3 lg:mb-8">
        <BackButton fallback="/profil" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">Engellenenler</h1>
        </div>
      </div>

      {rows === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center lg:mt-24">
          <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">A</span>
          <p className="mt-4 font-display text-lg font-semibold text-text">Kimseyi engellemedin</p>
          <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">
            Engellediğin kişiler burada görünür; istediğinde engeli kaldırabilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-2 lg:space-y-2.5">
          {rows.map((u) => (
            <div key={u.id} className="lp-panel flex items-center gap-3 rounded-2xl p-3 lg:p-4 lg:transition lg:hover:border-accent/30">
              <div className="lp-monogram flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold lg:h-12 lg:w-12 lg:text-lg">
                {u.name[0]?.toUpperCase() || "?"}
              </div>
              <p className="flex-1 truncate font-medium text-text lg:text-base">{u.name}</p>
              <button
                onClick={() => kaldir(u.id)}
                disabled={busy === u.id}
                className="lp-cta-ghost shrink-0 rounded-full px-3 py-1.5 text-sm transition disabled:opacity-50 lg:px-4 lg:py-2 lg:hover:bg-elevated"
              >
                {busy === u.id ? "…" : "Engeli kaldır"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
