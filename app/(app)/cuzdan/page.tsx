"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Skeleton } from "@/components/ui";
import { Coins, Plus, Minus, ArrowLeft, Crown, Zap } from "lucide-react";

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
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<Row[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [using, setUsing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; msg: string } | null>(null);

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
    const satin = new URLSearchParams(window.location.search).get("satin");
    if (satin === "ok") setNotice({ ok: true, msg: "Ödeme alındı! Jetonların birazdan yüklenecek." });
    else if (satin === "iptal") setNotice({ ok: false, msg: "Ödeme iptal edildi." });
  }, []);

  async function satinAl(pkg: string) {
    if (buying) return;
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
        window.location.href = j.url; // Stripe Checkout'a yönlen
        return;
      }
      if (j?.error === "odeme_yapilandirilmamis") {
        setNotice({ ok: false, msg: "Jeton satın alma şu an kapalı — yakında. Jetonu görev ve davetle kazanabilirsin." });
      } else if (!r.ok || !j.ok) {
        setNotice({ ok: false, msg: "Satın alma başarısız, tekrar dene." });
      } else {
        setNotice({ ok: true, msg: `+${j.jeton} jeton yüklendi! 🎉` });
        await load();
      }
    } catch {
      setNotice({ ok: false, msg: "Bağlantı hatası." });
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
        setNotice({ ok: true, msg: `${title} aktifleştirildi! 🎉` });
        await load();
      } else if (j?.error === "insufficient") {
        setNotice({ ok: false, msg: `Yetersiz bakiye — ${j.cost} jeton gerekli. Görev yap veya jeton al.` });
      } else {
        setNotice({ ok: false, msg: "İşlem başarısız, tekrar dene." });
      }
    } catch {
      setNotice({ ok: false, msg: "Bağlantı hatası." });
    }
    setUsing(null);
  }

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/profil" className="text-muted" aria-label="Geri">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold brand-text">Cüzdan</h1>
      </div>

      {/* Bakiye */}
      <Card className="mb-4 p-5 text-center">
        <p className="t-caption text-muted">Jeton bakiyen</p>
        {balance == null ? (
          <Skeleton className="mx-auto mt-2 h-9 w-24" />
        ) : (
          <p className="mt-1 flex items-center justify-center gap-2 text-4xl font-bold">
            <Coins className="text-accent" size={30} /> {balance}
          </p>
        )}
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

      {/* Jetonla aç (harcama) */}
      <p className="mb-2 t-h4">Jetonla aç</p>
      <div className="mb-6 space-y-2.5">
        {SPEND.map((s) => {
          const afford = balance == null || balance >= s.jeton;
          return (
            <div
              key={s.item}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                s.best ? "border-brand bg-brand/5" : "border-border bg-surface"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
                <s.Icon size={20} className="text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {s.title}
                  {s.best && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                      En iyi değer
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">{s.desc}</p>
              </div>
              <button
                onClick={() => kullan(s.item, s.title)}
                disabled={using === s.item || !afford}
                className="brand-gradient shrink-0 rounded-xl px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-40"
                aria-label={`${s.title} — ${s.jeton} jeton`}
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
          );
        })}
      </div>

      {/* Jeton satın al */}
      <p className="mb-2 t-h4">Jeton satın al</p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {PACKAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => satinAl(p.id)}
            disabled={buying === p.id}
            className={`relative rounded-2xl border p-4 text-left transition active:scale-95 ${
              p.populer ? "border-brand bg-brand/5" : "border-border bg-surface"
            }`}
          >
            {p.populer && (
              <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                Popüler
              </span>
            )}
            <p className="flex items-center gap-1 text-lg font-bold">
              <Coins size={16} className="text-accent" /> {p.jeton}
            </p>
            <p className="mt-1 text-sm text-muted">₺{p.price}</p>
            <span className="brand-gradient mt-2 inline-block rounded-xl px-3 py-1.5 text-xs font-semibold text-white">
              {buying === p.id ? "..." : "Satın al"}
            </span>
          </button>
        ))}
      </div>
      <p className="mb-6 t-caption text-muted">
        Ödeme sağlayıcı (Stripe) bağlanınca jeton satın alma açılır. Bağlanana kadar canlıda kapalıdır
        (geliştirmede <b>demo</b> anında yükler). Jetonu her zaman görev ve davetle kazanabilirsin.
      </p>

      {/* Jeton geçmişi */}
      <p className="mb-2 t-h4">Jeton geçmişi</p>
      {history == null ? (
        <Skeleton className="h-40 w-full" />
      ) : history.length === 0 ? (
        <p className="t-caption text-muted">Henüz hareket yok. Görevleri tamamla, jeton kazan.</p>
      ) : (
        <Card className="divide-y divide-border p-0">
          {history.map((row, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{row.reason || "Hareket"}</p>
                <p className="t-caption text-muted">
                  {new Date(row.created_at).toLocaleString("tr-TR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-0.5 text-sm font-semibold ${
                  row.amount >= 0 ? "text-success" : "text-error"
                }`}
              >
                {row.amount >= 0 ? <Plus size={13} /> : <Minus size={13} />} {Math.abs(row.amount)}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
