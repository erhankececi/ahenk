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
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-3xl lg:px-0 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center gap-3 lg:mb-8">
        <BackButton fallback="/profil" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">Öneri / Geri bildirim</h1>
        </div>
      </div>

      {sent ? (
        <div className="mt-12 flex flex-col items-center text-center lg:mt-16 lg:rounded-3xl lg:border lg:border-border lg:bg-surface lg:px-10 lg:py-16 lg:shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
            <MessageSquarePlus size={26} className="text-accent" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-text lg:text-xl">Teşekkürler</p>
          <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">Önerin bize ulaştı. Ahenk'i birlikte büyütüyoruz.</p>
          <button onClick={() => setSent(false)} className="mt-5 text-sm font-medium text-accent">
            Bir tane daha yaz
          </button>
        </div>
      ) : (
        <div className="lg:rounded-3xl lg:border lg:border-border lg:bg-surface lg:p-8 lg:shadow-card">
          <p className="mb-3 text-sm leading-6 text-muted">
            Eksik bulduğun, hoşuna giden ya da eklenmesini istediğin her şeyi yaz — okuyoruz.
          </p>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={6}
            placeholder="Önerini buraya yaz…"
            className="w-full resize-none rounded-2xl border border-white/10 bg-[#151318] px-4 py-3 text-sm text-text outline-none transition placeholder:text-muted focus:border-accent/50 lg:py-4"
          />
          {err && <p className="mt-2 text-xs text-error">{err}</p>}
          <button
            onClick={gonder}
            disabled={busy}
            className="lp-cta-gold mt-4 w-full rounded-2xl py-3 text-sm font-semibold transition disabled:opacity-50 lg:w-auto lg:px-10"
          >
            {busy ? "Gönderiliyor…" : "Gönder"}
          </button>
        </div>
      )}
    </div>
  );
}
