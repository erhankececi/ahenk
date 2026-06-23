"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, X, CheckCircle2 } from "lucide-react";

const REASONS = ["Uygunsuz içerik", "Spam", "Yanlış bilgi", "Hakaret / taciz", "Teknik sorun", "Diğer"];

export function ReportButton({ targetType, targetId, compact }: { targetType: string; targetId: string; compact?: boolean }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason || busy) return;
    setBusy(true);
    setError("");
    const { error: e } = await supabase.rpc("create_report", { p_target_type: targetType, p_target_id: targetId, p_reason: reason, p_description: desc || null });
    setBusy(false);
    if (e) { setError("Bildirim gönderilemedi, tekrar dene."); return; }
    setDone(true);
  }

  function close() {
    setOpen(false);
    setTimeout(() => { setReason(""); setDesc(""); setDone(false); setError(""); }, 200);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={compact ? "text-muted transition hover:text-danger" : "inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-danger/40 hover:text-danger"}>
        <Flag size={compact ? 13 : 14} /> {!compact && "Bildir"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl">
            {done ? (
              <div className="py-4 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/12 text-success"><CheckCircle2 size={28} /></span>
                <p className="mt-4 font-bold">Bildirimin alındı</p>
                <p className="mt-1 text-sm text-muted">Ekibimiz en kısa sürede inceleyecek.</p>
                <button onClick={close} className="btn-primary mt-5 w-full rounded-xl py-3 font-semibold">Kapat</button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold">İçeriği Bildir</h2>
                  <button onClick={close} className="text-muted"><X size={18} /></button>
                </div>
                <p className="mb-2 text-sm text-muted">Sebep seç</p>
                <div className="flex flex-wrap gap-2">
                  {REASONS.map((r) => (
                    <button key={r} onClick={() => setReason(r)} className={`rounded-full border px-3 py-1.5 text-sm transition ${reason === r ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-muted hover:text-text"}`}>{r}</button>
                  ))}
                </div>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Açıklama (isteğe bağlı)" className="mt-4 w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-primary/50" />
                {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                <button onClick={submit} disabled={!reason || busy} className="btn-primary mt-4 w-full rounded-xl py-3 font-semibold disabled:opacity-50">{busy ? "Gönderiliyor…" : "Gönder"}</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
