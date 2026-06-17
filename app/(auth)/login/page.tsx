"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { ArrowLeft } from "lucide-react";
import { useLang } from "@/components/LangProvider";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLang();
  const ta = t.auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [needConfirm, setNeedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Doğrulama linki süresi geçmiş/geçersizse (auth/confirm hata yönlendirmesi)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("dogrulama") === "hata") {
      setNeedConfirm(true);
      setErr(ta.errVerifyExpired);
    }
  }, []);

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setInfo("");
    setNeedConfirm(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      // E-posta doğrulaması açıkken doğrulanmamış kullanıcıyı net yönlendir.
      if (/confirm/i.test(error.message)) {
        setNeedConfirm(true);
        setErr(ta.errNotConfirmed);
      } else {
        setErr(ta.errBadCreds);
      }
      return;
    }
    // Yasal erişim logu (giriş anı + IP — 5651/KVKK)
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "auth:login" }) }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  async function tekrarGonder() {
    if (!email) {
      setErr(ta.errEmailFirst);
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setErr(ta.errResendFail);
    else {
      setErr("");
      setInfo(ta.resendInfo);
    }
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <Link href="/" className="absolute left-5 top-5 flex items-center gap-1.5 text-sm text-muted transition hover:text-text">
        <ArrowLeft size={16} /> Ahenk
      </Link>
      <div className="mb-9 text-center">
        <div className="lp-monogram mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
          A
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{ta.loginTitle}</h1>
        <p className="mt-1.5 text-muted">{ta.loginSubtitle}</p>
      </div>

      <form onSubmit={girisYap} className="lp-panel space-y-3 rounded-3xl p-6">
        <Input
          type="email"
          placeholder={ta.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={ta.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-sm text-error">{err}</p>}
        {info && <p className="text-sm text-success">{info}</p>}
        {needConfirm && (
          <button
            type="button"
            onClick={tekrarGonder}
            className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            {ta.resendConfirm}
          </button>
        )}
        <Button full disabled={loading}>
          {loading ? ta.loggingIn : ta.login}
        </Button>
      </form>

      <Link
        href="/sifremi-unuttum"
        className="mt-3 block text-center text-sm text-muted transition hover:text-text"
      >
        {ta.forgot}
      </Link>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> {ta.or} <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" full onClick={google} type="button">
        {ta.googleContinue}
      </Button>

      <p className="mt-8 text-center text-sm text-muted">
        {ta.noAccount}{" "}
        <Link href="/register" className="font-semibold text-brand">
          {ta.signupLink}
        </Link>
      </p>
    </div>
  );
}
