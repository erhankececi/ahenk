"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check } from "lucide-react";

/**
 * "Seni beğenenler" kartında karşılık ver. Karşı taraf zaten pozitif sinyal
 * gönderdiği için "tanis" bir eşleşme tetikler → doğrudan sohbete götürür.
 */
export default function LikeBackButton({ targetId }: { targetId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function tanis() {
    if (busy || sent) return;
    setBusy(true);
    const res = await fetch("/api/interact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_user: targetId, type: "tanis" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data?.matched && data.matchId) {
      router.push(`/sohbet/${data.matchId}`);
      return;
    }
    setSent(true);
    router.refresh();
  }

  if (sent) {
    return (
      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-success/15 py-2 text-sm font-medium text-success">
        <Check size={15} /> Gönderildi
      </span>
    );
  }

  return (
    <button
      onClick={tanis}
      disabled={busy}
      className="brand-gradient inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold text-white transition disabled:opacity-50"
    >
      <Send size={14} /> {busy ? "Gönderiliyor…" : "Tanış"}
    </button>
  );
}
