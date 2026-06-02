"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, PasswordInput } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const ref = useSearchParams().get("ref") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
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
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setMsg("E-postana doğrulama bağlantısı gönderdik. Onayla, sonra giriş yap.");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6">
      <Link href="/" className="absolute left-5 top-5 text-sm text-muted transition hover:text-text">
        ← Ahenk
      </Link>
      <h1 className="mb-2 text-3xl font-bold">Aramıza katıl</h1>
      <p className="mb-8 text-muted">Karakterinle tanış, yüzün sonra gelir.</p>

      <form onSubmit={kayitOl} className="space-y-3">
        <Input placeholder="Adın" value={name} onChange={(e) => setName(e.target.value)} required />
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

      <p className="mt-8 text-center text-sm text-muted">
        Zaten üye misin?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
