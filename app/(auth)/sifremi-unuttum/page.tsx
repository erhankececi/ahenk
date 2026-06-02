"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function SifremiUnuttum() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/sifre-yenile`,
    });
    setLoading(false);
    if (error) setErr("Gönderilemedi, biraz sonra tekrar dene.");
    else setMsg("Şifre sıfırlama bağlantısını e-postana gönderdik. Gelen kutunu (ve spam'i) kontrol et.");
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6">
      <Link href="/login" className="absolute left-5 top-5 text-sm text-muted transition hover:text-text">
        ← Giriş
      </Link>
      <h1 className="mb-2 text-3xl font-bold">Şifreni mi unuttun?</h1>
      <p className="mb-8 text-muted">E-postanı yaz, sıfırlama bağlantısı gönderelim.</p>

      <form onSubmit={gonder} className="space-y-3">
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {err && <p className="text-sm text-error">{err}</p>}
        {msg && <p className="text-sm text-success">{msg}</p>}
        <Button full disabled={loading}>
          {loading ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Hatırladın mı?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
