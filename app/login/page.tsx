"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button, Field } from "@/components/ui";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8"><Logo size={28} /></Link>
      <div className="glass-card w-full max-w-sm rounded-2xl p-7">
        <h1 className="text-2xl font-bold">Tekrar hoş geldin</h1>
        <p className="mt-1 text-sm text-muted">Öğrenme yolculuğuna kaldığın yerden devam et.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => { e.preventDefault(); router.push("/ogrenci"); }}
        >
          <Field icon={<Mail size={16} />} type="email" placeholder="E-posta adresin" />
          <Field icon={<Lock size={16} />} type="password" placeholder="Şifren" />
          <div className="flex justify-end">
            <Link href="#" className="text-xs text-primary hover:underline">Şifremi unuttum</Link>
          </div>
          <Button type="submit" size="lg" className="w-full">Giriş Yap</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Hesabın yok mu? <Link href="/register" className="font-semibold text-primary hover:underline">Üye ol</Link>
        </p>
      </div>
    </div>
  );
}
