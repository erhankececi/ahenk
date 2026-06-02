"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/BackButton";
import { MessageSquarePlus } from "lucide-react";

export default function Oneri() {
  const supabase = createClient();
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function gonder() {
    const t = msg.trim();
    if (t.length < 5) {
      setErr("Biraz daha açıklar mısın? (en az 5 karakter)");
      return;
    }
    setBusy(true);
    setErr("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("feedback").insert({ user_id: user?.id, message: t });
    setBusy(false);
    if (error) {
      setErr("Gönderilemedi — çok sık denediysen biraz bekleyip tekrar dene.");
      return;
    }
    setSent(true);
    setMsg("");
  }

  return (
    <div className="min-h-dvh px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <BackButton fallback="/profil" />
        <h1 className="t-h3">Öneri / Geri bildirim</h1>
      </div>

      {sent ? (
        <div className="mt-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <MessageSquarePlus size={26} className="text-success" />
          </div>
          <p className="font-medium">Teşekkürler! 🙏</p>
          <p className="mt-1 text-sm text-muted">Önerin bize ulaştı. Ahenk'i birlikte büyütüyoruz.</p>
          <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium text-brand">
            Bir tane daha yaz
          </button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            Eksik bulduğun, hoşuna giden ya da eklenmesini istediğin her şeyi yaz — okuyoruz.
          </p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={6}
            placeholder="Önerini buraya yaz…"
            className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
          />
          {err && <p className="mt-2 text-xs text-error">{err}</p>}
          <button
            onClick={gonder}
            disabled={busy}
            className="brand-gradient mt-4 w-full rounded-2xl py-3 text-sm font-semibold text-white transition disabled:opacity-50"
          >
            {busy ? "Gönderiliyor…" : "Gönder"}
          </button>
        </>
      )}
    </div>
  );
}
