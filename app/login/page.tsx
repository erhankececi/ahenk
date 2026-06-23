"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, DB_TO_UI, authMessage } from "@/lib/roles";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) {
      setError(authMessage(signErr.message));
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("role, onboarded").eq("id", user!.id).single();
    if (!profile?.onboarded || !profile?.role) {
      router.push("/onboarding");
    } else {
      try { localStorage.setItem("ahenk_role", DB_TO_UI[profile.role] ?? "ogrenci"); } catch {}
      router.push(ROLE_HOME[profile.role] ?? "/ogrenci");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={28} /></Link>
      <div className="glass-card w-full max-w-sm rounded-2xl p-7">
        <h1 className="text-2xl font-bold">Tekrar hoş geldin</h1>
        <p className="mt-1 text-sm text-muted">Öğrenme yolculuğuna kaldığın yerden devam et.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Field icon={<Mail size={16} />} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresin" />
          <Field icon={<Lock size={16} />} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifren" />
          {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Giriş yapılıyor…" : "Giriş Yap"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Hesabın yok mu? <Link href="/register" className="font-semibold text-primary hover:underline">Üye ol</Link>
        </p>
      </div>
    </div>
  );
}
