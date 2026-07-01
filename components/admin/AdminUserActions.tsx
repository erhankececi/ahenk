"use client";

import { useState } from "react";

export default function AdminUserActions({
  userId,
  verified,
  banned,
}: {
  userId: string;
  verified: boolean;
  banned: boolean;
}) {
  const [v, setV] = useState(verified);
  const [b, setB] = useState(banned);
  const [busy, setBusy] = useState("");
  const [gone, setGone] = useState(false);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, ...extra }),
    });
    setBusy("");
    return r.ok;
  }

  if (gone) return <span className="text-[11px] text-error">silindi</span>;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button
        onClick={async () => {
          if (await act("verify", { value: !v })) setV(!v);
        }}
        disabled={!!busy}
        className="rounded-full border border-border px-2 py-1 text-[11px] transition hover:border-brand disabled:opacity-50"
      >
        {v ? "Doğr. kaldır" : "Doğrula"}
      </button>
      <button
        onClick={async () => {
          if (await act("ban", { value: !b })) setB(!b);
        }}
        disabled={!!busy}
        className={`rounded-full border px-2 py-1 text-[11px] transition disabled:opacity-50 ${
          b ? "border-success/40 text-success" : "border-warning/40 text-warning"
        }`}
      >
        {b ? "Yasağı kaldır" : "Yasakla"}
      </button>
      <button
        onClick={async () => {
          if (confirm("Bu hesap KALICI silinsin mi? Geri alınamaz.") && (await act("delete_user"))) {
            setGone(true);
          }
        }}
        disabled={!!busy}
        className="rounded-full border border-error/40 px-2 py-1 text-[11px] text-error transition disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
}
