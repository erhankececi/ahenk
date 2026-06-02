"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export default function AdminVerifyReview({ userId }: { userId: string }) {
  const [done, setDone] = useState<"" | "approved" | "rejected">("");
  const [busy, setBusy] = useState(false);

  async function review(approve: boolean) {
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify_review", userId, approve }),
    });
    setBusy(false);
    if (r.ok) setDone(approve ? "approved" : "rejected");
  }

  if (done)
    return (
      <span className={`text-xs font-medium ${done === "approved" ? "text-success" : "text-error"}`}>
        {done === "approved" ? "onaylandı" : "reddedildi"}
      </span>
    );

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => review(true)}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-success/40 px-2.5 py-1 text-[11px] text-success transition disabled:opacity-50"
      >
        <Check size={13} /> Onayla
      </button>
      <button
        onClick={() => review(false)}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-error/40 px-2.5 py-1 text-[11px] text-error transition disabled:opacity-50"
      >
        <X size={13} /> Reddet
      </button>
    </div>
  );
}
