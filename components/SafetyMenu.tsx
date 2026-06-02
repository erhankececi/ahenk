"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { MoreVertical, Flag, Ban, ShieldAlert } from "lucide-react";

const REASONS = [
  "Uygunsuz içerik veya fotoğraf",
  "Taciz, hakaret veya zorbalık",
  "Sahte profil / dolandırıcılık",
  "Spam veya reklam",
  "Reşit değil görünüyor",
  "Diğer",
];

/**
 * Ortak güvenlik menüsü: şikayet (nedenli) + engelle (onaylı).
 * Hem sohbet hem profil sayfasında kullanılır. extra ile sayfaya özel
 * eylemler eklenebilir (örn. sohbette "Arama geçmişi").
 */
export default function SafetyMenu({
  meId,
  targetId,
  onBlocked,
  extra = [],
}: {
  meId: string;
  targetId: string;
  onBlocked?: () => void;
  extra?: { label: string; onClick: () => void }[];
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<null | "block" | "report">(null);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  if (meId === targetId) return null;

  function close() {
    setView(null);
    setOpen(false);
    setReason("");
    setDetails("");
  }

  async function block() {
    if (busy) return;
    setBusy(true);
    const { error } = await supabase
      .from("blocks")
      .upsert(
        { blocker_id: meId, blocked_id: targetId },
        { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true }
      );
    setBusy(false);
    if (error) {
      setToast("Bir şeyler ters gitti, tekrar dene.");
      return;
    }
    close();
    onBlocked?.();
  }

  async function report() {
    if (busy || !reason) return;
    setBusy(true);
    const { error } = await supabase
      .from("reports")
      .insert({ reporter_id: meId, reported_id: targetId, reason, details: details.trim() || null });
    setBusy(false);
    if (error) {
      setToast("Bir şeyler ters gitti, tekrar dene.");
      return;
    }
    close();
    setToast("Bildirimin alındı. Ekibimiz en kısa sürede inceleyecek.");
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-muted transition hover:text-text"
          aria-label="Seçenekler"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <MoreVertical size={20} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div
              role="menu"
              className="animate-scale-in absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-2xl border border-border bg-surface shadow-float"
            >
              {extra.map((e) => (
                <button
                  key={e.label}
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    e.onClick();
                  }}
                  className="block w-full px-4 py-3 text-left text-sm transition hover:bg-elevated"
                >
                  {e.label}
                </button>
              ))}
              <button
                role="menuitem"
                onClick={() => setView("report")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-elevated"
              >
                <Flag size={15} /> Şikayet et
              </button>
              <button
                role="menuitem"
                onClick={() => setView("block")}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-error transition hover:bg-elevated"
              >
                <Ban size={15} /> Engelle
              </button>
            </div>
          </>
        )}
      </div>

      {view === "block" && (
        <Modal onClose={close}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
            <Ban size={22} className="text-error" />
          </div>
          <h3 className="t-h4 text-center">Engellensin mi?</h3>
          <p className="mt-1.5 text-center text-sm text-muted">
            Bu kişi seni göremeyecek, sana yazamayacak ve arayamayacak. Varsa eşleşmeniz kaldırılır.
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={close} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium">
              Vazgeç
            </button>
            <button
              onClick={block}
              disabled={busy}
              className="flex-1 rounded-full bg-error py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {busy ? "Engelleniyor…" : "Engelle"}
            </button>
          </div>
        </Modal>
      )}

      {view === "report" && (
        <Modal onClose={close}>
          <h3 className="t-h4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-brand" /> Şikayet nedeni
          </h3>
          <div className="mt-3 space-y-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`block w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  reason === r ? "border-brand bg-brand/5 font-medium" : "border-border hover:border-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detay ekle (isteğe bağlı)"
            rows={2}
            className="mt-3 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <div className="mt-4 flex gap-2">
            <button onClick={close} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium">
              Vazgeç
            </button>
            <button
              onClick={report}
              disabled={busy || !reason}
              className="brand-gradient flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {busy ? "Gönderiliyor…" : "Gönder"}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="animate-fade-in fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-float"
      >
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="animate-slide-up fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="rounded-full bg-text px-4 py-2.5 text-center text-sm font-medium text-bg shadow-float">{msg}</div>
    </div>
  );
}
