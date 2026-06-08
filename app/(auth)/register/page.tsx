"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, PasswordInput } from "@/components/ui";
import { adSoyadGecerli } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const ref = useSearchParams().get("ref") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    if (!adSoyadGecerli(name)) {
      setErr("Lütfen ad ve soyadını gir (örn. Ahmet Yılmaz).");
      return;
    }
    if (password.length < 6) {
      setErr("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== password2) {
      setErr("Şifreler eşleşmiyor. Lütfen aynı şifreyi iki kez gir.");
      return;
    }
    setLoading(true);
    setErr("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, ref: ref || undefined },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    // Yasal erişim logu (kayıt anı + IP — 5651/KVKK)
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "auth:register" }) }).catch(() => {});
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setMsg("E-postana doğrulama bağlantısı gönderdik. Onayla, sonra giriş yap.");
    }
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6">
      <Link href="/" className="absolute left-5 top-5 text-sm text-muted transition hover:text-text">
        ← Ahenk
      </Link>
      <h1 className="mb-2 text-3xl font-bold">Aramıza katıl</h1>
      <p className="mb-8 text-muted">Karakterinle tanış, yüzün sonra gelir.</p>

      <form onSubmit={kayitOl} className="space-y-3">
        <Input placeholder="Ad Soyad" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <PasswordInput
          placeholder="Şifre (tekrar)"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          minLength={6}
          required
        />
        {password2.length > 0 && password !== password2 && (
          <p className="text-sm text-warning">Şifreler henüz eşleşmiyor.</p>
        )}
        {ref && (
          <p className="rounded-2xl bg-brand/10 px-3 py-2 text-sm text-brand">
            🎁 Bir davetle geldin ({ref}) — hesabın 25 jeton hediyeyle başlayacak.
          </p>
        )}
        {err && <p className="text-sm text-error">{err}</p>}
        {msg && <p className="text-sm text-brand">{msg}</p>}
        <Button full disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Hesap oluştur"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> veya <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" full onClick={google} type="button">
        Google ile devam et
      </Button>

      <p className="mt-8 text-center text-sm text-muted">
        Zaten üye misin?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
