"use client";

import { useState } from "react";

export default function AdminReportResolve({
  reportId,
  status,
}: {
  reportId: string;
  status: string;
}) {
  const [done, setDone] = useState(status === "kapandi");
  const [busy, setBusy] = useState(false);

  async function coz() {
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_report", reportId }),
    });
    setBusy(false);
    if (r.ok) setDone(true);
  }

  if (done) return <span className="shrink-0 text-xs text-success">çözüldü</span>;
  return (
    <button
      onClick={coz}
      disabled={busy}
      className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs transition hover:border-brand disabled:opacity-50"
    >
      {busy ? "…" : "Çöz"}
    </button>
  );
}
