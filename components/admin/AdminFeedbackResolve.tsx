"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function AdminFeedbackResolve({ feedbackId }: { feedbackId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function resolve() {
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_feedback", feedbackId }),
    });
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) return <span className="shrink-0 text-xs text-success">işlendi</span>;
  return (
    <button
      onClick={resolve}
      disabled={busy}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs transition hover:border-brand disabled:opacity-50"
    >
      <Check size={13} /> {busy ? "…" : "İşlendi"}
    </button>
  );
}
