"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { Button, Field } from "@/components/ui";
import { Mail, Lock, User } from "lucide-react";

function RegisterInner() {
  const router = useRouter();
  const rol = useSearchParams().get("rol");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={28} /></Link>
      <div className="glass-card w-full max-w-sm rounded-2xl p-7">
        <h1 className="text-2xl font-bold">Ahenk Live'a katıl</h1>
        <p className="mt-1 text-sm text-muted">Ücretsiz hesabını oluştur, hemen başla.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => { e.preventDefault(); router.push(rol ? `/onboarding?rol=${rol}` : "/onboarding"); }}
        >
          <Field icon={<User size={16} />} type="text" placeholder="Ad Soyad" />
          <Field icon={<Mail size={16} />} type="email" placeholder="E-posta adresin" />
          <Field icon={<Lock size={16} />} type="password" placeholder="Şifre oluştur" />
          <Button type="submit" size="lg" className="w-full">Devam Et</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Zaten üye misin? <Link href="/login" className="font-semibold text-primary hover:underline">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}
