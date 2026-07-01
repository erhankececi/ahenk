"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, PasswordInput } from "@/components/ui";

export default function SifreYenile() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Recovery oturumu /auth/callback (code exchange) ile kurulmuş olmalı.
    supabase.auth.getUser().then(({ data }) => setReady(!!data.user));
  }, []);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setErr("Güncellenemedi, tekrar dene.");
      return;
    }
    setMsg("Şifren güncellendi. Yönlendiriliyorsun…");
    setTimeout(() => {
      router.push("/kesfet");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6">
      <h1 className="mb-2 text-3xl font-bold">Yeni şifre belirle</h1>

      {ready === false ? (
        <>
          <p className="mb-6 text-muted">
            Bağlantı geçersiz veya süresi dolmuş. Şifre sıfırlamayı tekrar iste.
          </p>
          <Link
            href="/sifremi-unuttum"
            className="brand-gradient inline-flex justify-center rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Tekrar iste
          </Link>
        </>
      ) : (
        <>
          <p className="mb-8 text-muted">Hesabın için güçlü, yeni bir şifre gir.</p>
          <form onSubmit={kaydet} className="space-y-3">
            <PasswordInput
              placeholder="Yeni şifre (en az 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {err && <p className="text-sm text-error">{err}</p>}
            {msg && <p className="text-sm text-success">{msg}</p>}
            <Button full disabled={loading || ready === null}>
              {loading ? "Kaydediliyor..." : "Şifreyi güncelle"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
