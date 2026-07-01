"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Skeleton } from "@/components/ui";
import { Coins, Plus, Minus, ArrowLeft, Crown, Zap, Banknote, ArrowRight, Gift, History } from "lucide-react";
import DavetKart from "@/components/DavetKart";
import { trackEvent } from "@/lib/track";
import { useLang } from "@/components/LangProvider";

const PACKAGES = [
  { id: "p100", jeton: 100, price: 29, label: "100 Jeton" },
  { id: "p300", jeton: 300, price: 69, label: "300 Jeton", populer: true },
  { id: "p750", jeton: 750, price: 149, label: "750 Jeton" },
  { id: "p2000", jeton: 2000, price: 299, label: "2000 Jeton" },
];

// Harcama tarafı — buy_item maliyetleriyle birebir (boost 200 / 1 gün 300 / 1 hafta 1500).
const SPEND = [
  { item: "boost", jeton: 200, title: "Profil Boost", desc: "24 saat keşfette en üstte", Icon: Zap },
  { item: "premium_day", jeton: 300, title: "1 Gün Premium", desc: "Tüm Premium ayrıcalıkları", Icon: Crown },
  { item: "premium_week", jeton: 1500, title: "1 Hafta Premium", desc: "7 gün — en iyi değer", Icon: Crown, best: true },
];

type Row = { amount: number; reason: string | null; created_at: string };

export default function Cuzdan() {
  const supabase = createClient();
  const { t } = useLang();
  const tc = t.cuzdan;
  const spendText: Record<string, { title: string; desc: string }> = {
    boost: { title: tc.boostTitle, desc: tc.boostDesc },
    premium_day: { title: tc.dayTitle, desc: tc.dayDesc },
    premium_week: { title: tc.weekTitle, desc: tc.weekDesc },
  };
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<Row[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [using, setUsing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [tab, setTab] = useState<"jeton" | "davet" | "gecmis">("jeton");

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("jeton").eq("id", user.id).single(),
      supabase
        .from("jeton_ledger")
        .select("amount, reason, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setBalance(prof?.jeton ?? 0);
    setHistory((rows as Row[]) ?? []);
  }

  useEffect(() => {
    load();
    trackEvent("coin_wallet_opened");
    const satin = new URLSearchParams(window.location.search).get("satin");
    if (satin === "ok") {
      setNotice({ ok: true, msg: tc.paid });
      trackEvent("coin_purchase_success");
    } else if (satin === "iptal") {
      setNotice({ ok: false, msg: tc.canceled });
      trackEvent("checkout_canceled", { source: "coin" });
    }
  }, []);

  async function satinAl(pkg: string) {
    if (buying) return;
    trackEvent("coin_purchase_clicked", { pkg });
    setBuying(pkg);
    setNotice(null);
    try {
      const r = await fetch("/api/store/buy-jeton", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkg }),
      });
      const j = await r.json();
      if (j.url) {
        trackEvent("coin_checkout_started", { pkg });
        window.location.href = j.url; // Stripe Checkout'a yönlen
        return;
      }
      if (j?.error === "odeme_yapilandirilmamis") {
        trackEvent("coin_demo_checkout_clicked", { pkg });
        setNotice({ ok: false, msg: tc.buyClosed });
      } else if (!r.ok || !j.ok) {
        setNotice({ ok: false, msg: tc.buyFailed });
      } else {
        setNotice({ ok: true, msg: tc.loaded.replace("{n}", String(j.jeton)) });
        await load();
      }
    } catch {
      setNotice({ ok: false, msg: tc.connError });
    }
    setBuying(null);
  }

  async function kullan(item: string, title: string) {
    if (using) return;
    setUsing(item);
    setNotice(null);
    try {
      const r = await fetch("/api/store/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item }),
      });
      const j = await r.json();
      if (r.ok && j.ok) {
        setNotice({ ok: true, msg: tc.activated.replace("{title}", title) });
        await load();
      } else if (j?.error === "insufficient") {
        setNotice({ ok: false, msg: tc.insufficient.replace("{n}", String(j.cost)) });
      } else {
        setNotice({ ok: false, msg: tc.opFailed });
      }
    } catch {
      setNotice({ ok: false, msg: tc.connError });
    }
    setUsing(null);
  }

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-5 lg:px-8 lg:pb-16 lg:pt-8">
      <div className="mx-auto w-full max-w-3xl lg:max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3 lg:mb-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/profil"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#151318] text-text shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:border-[#C7A977]/45 hover:text-accent"
              aria-label={tc.back}
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{tc.eyebrow}</p>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">
                {tc.title}
              </h1>
            </div>
          </div>

          <div className="hidden rounded-full border border-[#C7A977]/25 bg-[#C7A977]/10 px-3 py-1.5 text-xs font-medium text-accent sm:block">
            {tc.rate}
          </div>
        </div>

        {/* Bakiye */}
        <Card className="lp-panel mb-4 overflow-hidden p-0 lg:mb-6">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-px bg-[#C7A977]/35" />
            <div className="absolute right-[-80px] top-[-80px] h-48 w-48 rounded-full bg-[#C7A977]/10 blur-3xl" />
            <div className="absolute bottom-[-90px] left-[-80px] h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

            <div className="relative p-5 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{tc.balanceLabel}</p>
                  {balance == null ? (
                    <Skeleton className="mt-3 h-12 w-36 rounded-2xl" />
                  ) : (
                    <p className="mt-2 flex items-center gap-3 text-5xl font-semibold tracking-[-0.06em] text-text lg:text-6xl">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C7A977]/35 bg-[#C7A977]/12 text-accent shadow-[0_12px_40px_rgba(199,169,119,0.12)] lg:h-14 lg:w-14">
                        <Coins size={25} />
                      </span>
                      {balance.toLocaleString("tr-TR")}
                    </p>
                  )}
                </div>

                <div className="lp-monogram flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-[#C7A977]/25 bg-[#0E0D10]/70 text-4xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] lg:h-20 lg:w-20 lg:text-5xl">
                  A
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-muted lg:text-sm">
                {tc.balanceHint}
              </p>
            </div>
          </div>
        </Card>

        {notice && (
          <div
            className={`mb-4 rounded-[1.4rem] border px-4 py-3 text-sm leading-6 shadow-[0_18px_70px_rgba(0,0,0,0.20)] ${
              notice.ok
                ? "border-[#C7A977]/30 bg-[#C7A977]/10 text-text"
                : "border-red-400/20 bg-red-500/10 text-red-200"
            }`}
          >
            {notice.msg}
          </div>
        )}

        {/* Sekmeler: Jetonlar · Davet · Geçmiş */}
        <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-[#151318]/70 p-1.5 lg:mb-8 lg:max-w-md">
          {([
            { id: "jeton", label: tc.tabJeton, Icon: Coins },
            { id: "davet", label: tc.tabDavet, Icon: Gift },
            { id: "gecmis", label: tc.tabGecmis, Icon: History },
          ] as const).map((tb) => {
            const active = tab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border border-[#C7A977]/40 bg-[#C7A977]/12 text-accent shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                    : "border border-transparent text-muted hover:text-text"
                }`}
              >
                <tb.Icon size={16} />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* ——— DAVET ——— */}
        <div className={tab === "davet" ? "block" : "hidden"}>
          <DavetKart />
        </div>

        {/* ——— JETONLAR ——— */}
        <div className={tab === "jeton" ? "block" : "hidden"}>
        <Link href="/para-cek" className="lp-panel-hover mb-5 flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
            <Banknote size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text">{tc.withdraw}</p>
            <p className="text-xs leading-5 text-muted">{tc.withdrawDesc}</p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-muted" />
        </Link>

        {/* Jetonla aç (harcama) */}
        <section className="lp-panel mb-5 p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-text">{tc.spendTitle}</p>
              <p className="mt-0.5 text-xs text-muted">{tc.spendDesc}</p>
            </div>
            <Zap size={17} className="text-accent" />
          </div>

          <div className="space-y-2 p-3 lg:space-y-3 lg:p-4">
            {SPEND.map((s) => {
              const afford = balance == null || balance >= s.jeton;
              return (
                <div
                  key={s.item}
                  className={`rounded-[1.35rem] border p-3.5 transition ${
                    s.best
                      ? "border-[#C7A977]/45 bg-[#C7A977]/10 shadow-[0_18px_70px_rgba(199,169,119,0.08)]"
                      : "border-white/10 bg-[#0E0D10]/55"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#C7A977]/25 bg-[#C7A977]/10 text-accent">
                      <s.Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-text">
                        {spendText[s.item]?.title ?? s.title}
                        {s.best && (
                          <span className="rounded-full border border-[#C7A977]/30 bg-[#C7A977]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                            {tc.bestValue}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-muted">{spendText[s.item]?.desc ?? s.desc}</p>
                    </div>

                    <button
                      onClick={() => kullan(s.item, spendText[s.item]?.title ?? s.title)}
                      disabled={using === s.item || !afford}
                      className="shrink-0 rounded-2xl border border-[#C7A977]/35 bg-[#C7A977]/12 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-[#C7A977]/18 active:scale-95 disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-muted disabled:opacity-60"
                      aria-label={`${spendText[s.item]?.title ?? s.title} — ${s.jeton}`}
                    >
                      {using === s.item ? (
                        "…"
                      ) : (
                        <span className="flex items-center gap-1">
                          <Coins size={12} /> {s.jeton}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Jeton satın al */}
        <section className="lp-panel mb-5 p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-text">{tc.buyTitle}</p>
              <p className="mt-0.5 text-xs text-muted">{tc.buyDesc}</p>
            </div>
            <Coins size={17} className="text-accent" />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 lg:grid-cols-4">
            {PACKAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => satinAl(p.id)}
                disabled={buying === p.id}
                className={`relative overflow-hidden rounded-[1.4rem] border p-4 text-left transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 ${
                  p.populer
                    ? "border-[#C7A977]/50 bg-[#C7A977]/10 shadow-[0_18px_70px_rgba(199,169,119,0.10)]"
                    : "border-white/10 bg-[#0E0D10]/60 hover:border-[#C7A977]/35"
                }`}
              >
                {p.populer && (
                  <span className="absolute right-2.5 top-2.5 rounded-full border border-[#C7A977]/30 bg-[#C7A977]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-accent">
                    {tc.popular}
                  </span>
                )}

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#C7A977]/25 bg-[#C7A977]/10 text-accent">
                  <Coins size={18} />
                </div>

                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-text">
                  {p.jeton.toLocaleString("tr-TR")}
                </p>
                <p className="mt-0.5 text-sm text-muted">₺{p.price}</p>

                <span className="mt-3 inline-flex rounded-xl border border-[#C7A977]/30 bg-[#C7A977]/12 px-3 py-1.5 text-xs font-semibold text-accent">
                  {buying === p.id ? "..." : tc.buy}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <p className="text-xs leading-5 text-muted">
              {tc.paymentNote}
            </p>
          </div>
        </section>
        </div>

        {/* ——— GEÇMİŞ ——— */}
        <div className={tab === "gecmis" ? "block" : "hidden"}>
        {/* Jeton geçmişi */}
        <section className="lp-panel p-0">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-text">{tc.historyTitle}</p>
              <p className="mt-0.5 text-xs text-muted">{tc.historyDesc}</p>
            </div>
            <Banknote size={17} className="text-accent" />
          </div>

          {history == null ? (
            <div className="p-4">
              <Skeleton className="h-40 w-full rounded-3xl" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-[#0E0D10] text-accent">
                <Coins size={22} />
              </div>
              <p className="mt-3 text-sm font-medium text-text">{tc.noHistory}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{tc.noHistoryDesc}</p>
            </div>
          ) : (
            <Card className="divide-y divide-white/10 border-0 bg-transparent p-0 shadow-none">
              {history.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3.5 lg:px-6 lg:py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text lg:text-base">{row.reason || tc.movement}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(row.created_at).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold ${
                      row.amount >= 0
                        ? "border-[#C7A977]/30 bg-[#C7A977]/10 text-accent"
                        : "border-red-400/20 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {row.amount >= 0 ? <Plus size={13} /> : <Minus size={13} />} {Math.abs(row.amount)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
