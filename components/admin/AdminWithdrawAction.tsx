"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export default function AdminWithdrawAction({ withdrawId }: { withdrawId: string }) {
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(status: "paid" | "rejected") {
    if (busy) return;
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "process_withdraw", withdrawId, status }),
    });
    setBusy(false);
    if (r.ok) setDone(status);
  }

  if (done)
    return (
      <span className={`shrink-0 text-xs ${done === "paid" ? "text-success" : "text-error"}`}>
        {done === "paid" ? "ödendi" : "reddedildi"}
      </span>
    );

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={() => act("paid")}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-success transition hover:border-success disabled:opacity-50"
      >
        <Check size={13} /> Ödendi
      </button>
      <button
        onClick={() => act("rejected")}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-error transition hover:border-error disabled:opacity-50"
      >
        <X size={13} /> Reddet
      </button>
    </div>
  );
}
