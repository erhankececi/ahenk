"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, PasswordInput } from "@/components/ui";
import { adSoyadGecerli } from "@/lib/utils";
import { ArrowLeft, Gift } from "lucide-react";
import { useLang } from "@/components/LangProvider";
import { googleSignIn } from "@/lib/googleAuth";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLang();
  const ta = t.auth;
  const ref = useSearchParams().get("ref") || "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [kabul, setKabul] = useState(false);

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    if (!adSoyadGecerli(name)) {
      setErr(ta.errNameInvalid);
      return;
    }
    if (password.length < 6) {
      setErr(ta.errPwShort);
      return;
    }
    if (password !== password2) {
      setErr(ta.errPwMismatch);
      return;
    }
    if (!kabul) {
      setErr(ta.errConsent);
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
    // Yasal erişim logu + açık rıza kaydı (zaman + IP)
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "auth:register" }) }).catch(() => {});
    fetch("/api/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setMsg(ta.regCheckEmail);
    }
  }

  async function google() {
    setErr("");
    const r = await googleSignIn(supabase);
    if (r.native) {
      if (r.ok) {
        fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "auth:register" }) }).catch(() => {});
        fetch("/api/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
        router.push("/");
        router.refresh();
      } else {
        setErr(ta.googleFailed);
      }
    }
    // web: signInWithOAuth zaten tarayıcıyı yönlendiriyor
  }

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <Link href="/" className="absolute left-5 top-5 flex items-center gap-1.5 text-sm text-muted transition hover:text-text">
        <ArrowLeft size={16} /> Ahenk
      </Link>
      <div className="mb-8 text-center">
        <div className="lp-monogram mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
          A
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{ta.registerTitle}</h1>
        <p className="mt-1.5 text-muted">{ta.registerSubtitle}</p>
      </div>

      <form onSubmit={kayitOl} className="lp-panel space-y-3 rounded-3xl p-6">
        <Input placeholder={ta.name} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          type="email"
          placeholder={ta.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordInput
          placeholder={ta.passwordMin}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <PasswordInput
          placeholder={ta.passwordRepeat}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          minLength={6}
          required
        />
        {password2.length > 0 && password !== password2 && (
          <p className="text-sm text-warning">{ta.pwNotMatchYet}</p>
        )}
        {ref && (
          <p className="flex items-center gap-2 rounded-2xl border border-accent/25 bg-accent/[0.07] px-3 py-2 text-sm text-accent">
            <Gift size={15} className="shrink-0" /> {ta.refInvite.replace("{ref}", ref)}
          </p>
        )}
        <label className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface px-3 py-2.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={kabul}
            onChange={(e) => setKabul(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[color:rgb(var(--accent))]"
          />
          <span>
            <b className="text-text">{ta.consentAge}</b> {ta.consentAnd}{" "}
            <Link href="/kosullar" className="text-accent underline">{ta.consentTerms}</Link>,{" "}
            <Link href="/gizlilik" className="text-accent underline">{ta.consentPrivacy}</Link> {ta.consentAnd}{" "}
            <Link href="/kvkk" className="text-accent underline">{ta.consentKvkk}</Link> {ta.consentPost}
          </span>
        </label>
        {err && <p className="text-sm text-error">{err}</p>}
        {msg && <p className="text-sm text-brand">{msg}</p>}
        <Button full disabled={loading || !kabul}>
          {loading ? ta.creating : ta.signup}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> {ta.or} <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" full onClick={google} type="button">
        {ta.googleContinue}
      </Button>

      <p className="mt-8 text-center text-sm text-muted">
        {ta.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-brand">
          {ta.loginLink}
        </Link>
      </p>
    </div>
  );
}
