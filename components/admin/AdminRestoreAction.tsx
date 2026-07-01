"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

export default function AdminRestoreAction({ userId }: { userId: string }) {
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(action: "restore_account" | "delete_user") {
    if (busy) return;
    if (action === "delete_user" && !confirm("Bu hesabı KALICI sileceksin. Geri alınamaz. Emin misin?")) return;
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    });
    setBusy(false);
    if (r.ok) setDone(action === "restore_account" ? "geri yüklendi" : "kalıcı silindi");
  }

  if (done) return <span className="shrink-0 text-xs text-success">{done}</span>;

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={() => act("restore_account")}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-success transition hover:border-success disabled:opacity-50"
      >
        <RotateCcw size={13} /> Geri yükle
      </button>
      <button
        onClick={() => act("delete_user")}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-error transition hover:border-error disabled:opacity-50"
      >
        <Trash2 size={13} /> Kalıcı sil
      </button>
    </div>
  );
}
