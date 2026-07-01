"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Skeleton } from "@/components/ui";
import { Coins, ArrowLeft, Banknote, Clock, CheckCircle2, XCircle } from "lucide-react";

const RATE = 0.1; // 1 jeton = 0.10 TL
const MIN_J = 500;

type W = { id: string; jeton: number; amount_try: number; status: string; created_at: string; note: string | null };

const STATUS: Record<string, { label: string; cls: string; Icon: any }> = {
  pending: { label: "İnceleniyor", cls: "text-accent", Icon: Clock },
  paid: { label: "Ödendi", cls: "text-success", Icon: CheckCircle2 },
  rejected: { label: "Reddedildi (iade edildi)", cls: "text-error", Icon: XCircle },
};

export default function ParaCek() {
  const supabase = createClient();
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<W[] | null>(null);
  const [jeton, setJeton] = useState(MIN_J);
  const [iban, setIban] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("jeton, name").eq("id", user.id).single(),
      supabase
        .from("withdrawals")
        .select("id, jeton, amount_try, status, created_at, note")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setBalance(prof?.jeton ?? 0);
    if (prof?.name && !name) setName(prof.name);
    setHistory((rows as W[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = (history || []).some((w) => w.status === "pending");
  const tl = (jeton * RATE).toFixed(2);

  async function cek() {
    if (sending) return;
    setNotice(null);
    if (jeton < MIN_J) return setNotice({ ok: false, msg: `En az ${MIN_J} jeton çekebilirsin.` });
    if (balance != null && jeton > balance) return setNotice({ ok: false, msg: "Yetersiz bakiye." });
    setSending(true);
    try {
      const r = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jeton, iban, name }),
      });
      const j = await r.json();
      if (r.ok && j.ok) {
        setNotice({ ok: true, msg: `Talebin alındı! ₺${j.amount_try} — onaylanınca IBAN'ına gönderilecek.` });
        await load();
      } else {
        const m: Record<string, string> = {
          min: `En az ${MIN_J} jeton çekebilirsin.`,
          iban: "Geçerli bir TR IBAN gir (TR + 24 rakam).",
          name: "IBAN sahibinin ad soyadını gir.",
          pending: "Zaten bekleyen bir talebin var. Sonuçlanmasını bekle.",
          balance: "Yetersiz bakiye.",
          db: "İşlem şu an yapılamadı — tutarı düşürüp tekrar dene.",
        };
        const base = m[j?.error] || "Talep başarısız, tekrar dene.";
        setNotice({ ok: false, msg: j?.detail ? `${base} (${j.detail})` : base });
      }
    } catch {
      setNotice({ ok: false, msg: "Bağlantı hatası." });
    }
    setSending(false);
  }

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/cuzdan" className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text transition hover:border-accent/40 hover:text-accent" aria-label="Geri">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk cüzdan</p>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text">Para Çek</h1>
        </div>
      </div>

      <Card className="lp-panel mb-4 p-5 text-center">
        <p className="t-caption text-muted">Jeton bakiyen</p>
        {balance == null ? (
          <Skeleton className="mx-auto mt-2 h-9 w-24" />
        ) : (
          <p className="mt-1 flex items-center justify-center gap-2 text-4xl font-bold text-text">
            <Coins className="text-accent" size={30} /> {balance}
          </p>
        )}
        <p className="mt-1 t-caption text-muted">1 jeton = ₺{RATE.toFixed(2)} · en az {MIN_J} jeton</p>
      </Card>

      {notice && (
        <p
          className={`mb-4 rounded-2xl px-3 py-2 text-sm ${
            notice.ok ? "bg-success/15 text-success" : "bg-error/10 text-error"
          }`}
        >
          {notice.msg}
        </p>
      )}

      {!pending && (
        <Card className="lp-panel mb-6 space-y-3 p-4">
          <div>
            <label className="t-caption text-muted">Çekilecek jeton</label>
            <input
              type="number"
              min={MIN_J}
              step={50}
              value={jeton}
              onChange={(e) => setJeton(Math.floor(Number(e.target.value) || 0))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#151318] px-3 py-2.5 text-base text-text outline-none transition focus:border-accent/50"
            />
            <p className="mt-1 text-sm font-semibold text-success">≈ ₺{tl} ödenecek</p>
          </div>
          <div>
            <label className="t-caption text-muted">IBAN (TR)</label>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#151318] px-3 py-2.5 text-base text-text outline-none transition focus:border-accent/50"
            />
          </div>
          <div>
            <label className="t-caption text-muted">IBAN sahibi ad soyad</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#151318] px-3 py-2.5 text-base text-text outline-none transition focus:border-accent/50"
            />
          </div>
          <button
            onClick={cek}
            disabled={sending}
            className="lp-cta-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition active:scale-95 disabled:opacity-50"
          >
            <Banknote size={18} /> {sending ? "Gönderiliyor…" : "Para çekme talebi gönder"}
          </button>
          <p className="t-caption text-muted">
            Talepler elle incelenir (KYC + IBAN kontrolü) ve onaylanınca ödenir. Reddedilirse jetonun
            iade edilir.
          </p>
        </Card>
      )}

      <p className="mb-2 t-h4">Taleplerin</p>
      {history == null ? (
        <Skeleton className="h-32 w-full" />
      ) : history.length === 0 ? (
        <p className="t-caption text-muted">Henüz para çekme talebin yok.</p>
      ) : (
        <Card className="lp-panel divide-y divide-white/[0.06] p-0">
          {history.map((w) => {
            const s = STATUS[w.status] || STATUS.pending;
            return (
              <div key={w.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    ₺{w.amount_try} · {w.jeton} jeton
                  </p>
                  <p className={`flex items-center gap-1 t-caption ${s.cls}`}>
                    <s.Icon size={12} /> {s.label}
                  </p>
                </div>
                <p className="t-caption text-muted">
                  {new Date(w.created_at).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                </p>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
