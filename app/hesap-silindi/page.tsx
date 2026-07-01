"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RotateCcw, Trash2 } from "lucide-react";

export default function HesapSilindi() {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function geriYukle() {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/account/restore", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) {
      router.push("/kesfet");
      router.refresh();
    } else {
      setErr("Geri yükleme başarısız. Lütfen tekrar dene.");
      setBusy(false);
    }
  }

  async function cikis() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-warning/10">
        <Trash2 size={28} className="text-warning" />
      </div>
      <h1 className="font-display text-2xl font-bold">Hesabın silindi</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Bu hesabı sildin. İyi haber: hiçbir veri kaybolmadı. İstersen hesabını tüm
        profilin, mesajların ve eşleşmelerinle birlikte tek tuşla geri yükleyebilirsin.
      </p>

      {err && <p className="mt-4 text-sm text-error">{err}</p>}

      <button
        onClick={geriYukle}
        disabled={busy}
        className="mt-6 flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-50"
      >
        <RotateCcw size={18} /> {busy ? "Geri yükleniyor…" : "Hesabımı geri yükle"}
      </button>

      <button onClick={cikis} className="mt-4 text-sm text-muted transition hover:text-text">
        Şimdilik çıkış yap
      </button>
    </div>
  );
}
