"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Check, Circle, Gift, Copy, Share2, Coins, Crown, ChevronRight } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";

type Task = { id: string; label: string; reward: number; done: boolean };
type Home = { streak: number; completion: number; referralCode: string; jeton: number; tasks: Task[] };

export default function ProfilRetention() {
  const [data, setData] = useState<Home | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return <Skeleton className="mb-6 h-40 w-full" />;

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${data.referralCode}`;

  async function paylas() {
    const metin = `Ahenk'te tanışalım — önce ruh, sonra yüz. Davet kodum: ${data!.referralCode}\n${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ahenk", text: metin, url: link });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(metin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Jeton cüzdanı */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="t-caption text-muted">Jeton cüzdanın</p>
            <p className="mt-0.5 flex items-center gap-2 text-3xl font-bold">
              <Coins size={26} className="text-accent" /> {data.jeton}
            </p>
          </div>
          <Link
            href="/cuzdan"
            className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent transition hover:bg-accent/25"
          >
            Cüzdan & geçmiş →
          </Link>
        </div>
      </Card>

      {/* Profil tamamlama + streak */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="t-h4">Profil gücü</p>
            <p className="t-caption text-muted">Tamamlanmış profiller 3 kat daha çok eşleşir</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent">
            <Flame size={16} /> {data.streak} gün
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="brand-gradient h-full rounded-full transition-all duration-500"
            style={{ width: `${data.completion}%` }}
          />
        </div>
        <p className="mt-1.5 text-right t-caption text-muted">%{data.completion} tamamlandı</p>
      </Card>

      {/* Görevler + jeton ödülleri */}
      <Card className="p-4">
        <p className="mb-3 t-h4">Görevler & ödüller</p>
        <div className="space-y-2.5">
          {data.tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                {t.done ? (
                  <Check size={18} className="text-success" />
                ) : (
                  <Circle size={18} className="text-muted" />
                )}
                <span className={t.done ? "text-muted line-through" : ""}>{t.label}</span>
              </span>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  t.done ? "bg-success/15 text-success" : "bg-accent/15 text-accent"
                }`}
              >
                <Coins size={13} /> {t.done ? `+${t.reward}` : t.reward}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Jetonu harca → kanonik mağaza cüzdanda */}
      <Link href="/cuzdan" className="block">
        <Card className="flex items-center gap-3 p-4 transition hover:border-brand/40">
          <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white">
            <Crown size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Jetonunu harca</p>
            <p className="t-caption text-muted">Boost veya Premium gün/hafta aç</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Card>
      </Link>

      {/* Davet et — jeton ödülü */}
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Gift size={18} className="text-brand" />
          <p className="t-h4">Arkadaşını davet et</p>
        </div>
        <p className="mb-3 t-body-sm text-muted">
          Her katılan arkadaşın için <span className="font-semibold text-accent">250 jeton</span> kazan.
          Arkadaşın da 25 jetonla başlar.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-2xl border border-dashed border-border bg-elevated px-3 py-2.5 font-mono text-sm">
            {data.referralCode}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(data.referralCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-muted transition duration-200 hover:text-text"
            aria-label="Kopyala"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={paylas}
            className="brand-gradient flex h-11 items-center gap-1.5 rounded-2xl px-4 text-sm font-semibold text-white"
          >
            <Share2 size={16} /> Paylaş
          </button>
        </div>
        {copied && <p className="mt-2 t-caption text-success">Kopyalandı!</p>}
      </Card>
    </div>
  );
}
