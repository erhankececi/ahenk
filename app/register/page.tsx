"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button, Field } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { authMessage } from "@/lib/roles";
import { Mail, Lock, User, MailCheck } from "lucide-react";

function RegisterInner() {
  const router = useRouter();
  const rol = useSearchParams().get("rol");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentEmail, setSentEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (signErr) {
      setError(authMessage(signErr.message));
      return;
    }
    if (data.session) {
      // Oturum açıldı → onboarding'e geç
      router.push(rol ? `/onboarding?rol=${rol}` : "/onboarding");
      router.refresh();
    } else {
      // E-posta doğrulaması gerekiyor
      setSentEmail(true);
    }
  }

  if (sentEmail) {
    return (
      <Center>
        <div className="glass-card w-full max-w-sm rounded-2xl p-7 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary"><MailCheck size={28} /></span>
          <h1 className="mt-4 text-xl font-bold">E-postanı doğrula</h1>
          <p className="mt-2 text-sm text-muted">{email} adresine doğrulama bağlantısı gönderdik. Onayladıktan sonra giriş yapıp profilini tamamlayabilirsin.</p>
          <Button href="/login" size="lg" className="mt-6 w-full">Giriş Yap</Button>
        </div>
      </Center>
    );
  }

  return (
    <Center>
      <div className="glass-card w-full max-w-sm rounded-2xl p-7">
        <h1 className="text-2xl font-bold">Ahenk Live'a katıl</h1>
        <p className="mt-1 text-sm text-muted">Ücretsiz hesabını oluştur, hemen başla.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <Field icon={<User size={16} />} type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" />
          <Field icon={<Mail size={16} />} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresin" />
          <Field icon={<Lock size={16} />} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre (en az 6 karakter)" />
          {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Oluşturuluyor…" : "Devam Et"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Zaten üye misin? <Link href="/login" className="font-semibold text-primary hover:underline">Giriş yap</Link>
        </p>
      </div>
    </Center>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={28} /></Link>
      {children}
    </div>
  );
}

export default function Register() {
  return <Suspense fallback={null}><RegisterInner /></Suspense>;
}
