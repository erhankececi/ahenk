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
    <div className="min-h-dvh px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <BackButton fallback="/profil" />
        <h1 className="t-h3">Engellenenler</h1>
      </div>

      {rows === null ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
            <Ban size={26} className="text-muted" />
          </div>
          <p className="font-medium">Kimseyi engellemedin</p>
          <p className="mt-1 text-sm text-muted">
            Engellediğin kişiler burada görünür; istediğinde engeli kaldırabilirsin.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
              <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white">
                {u.name[0]?.toUpperCase() || "?"}
              </div>
              <p className="flex-1 truncate font-medium">{u.name}</p>
              <button
                onClick={() => kaldir(u.id)}
                disabled={busy === u.id}
                className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-brand disabled:opacity-50"
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
