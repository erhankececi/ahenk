"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/track";
import { Users, Copy, Check, Share2, Trophy, Coins } from "lucide-react";
import { useLang } from "@/components/LangProvider";

// Davet/referral kartı — cüzdanda gösterilir. Davet eden 250, gelen 25 jeton kazanır.
export default function DavetKart() {
  const supabase = createClient();
  const { t } = useLang();
  const td = t.davet;
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Ödül cümlesi — sayılar kalın; placeholder'lar dil sırasından bağımsız çalışır.
  const rewardParts = td.reward.split(/(\{a\}|\{b\})/).map((part, i) =>
    part === "{a}" ? <b key={i} className="text-accent">250</b>
      : part === "{b}" ? <b key={i} className="text-accent">25</b>
        : <span key={i}>{part}</span>
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", data.user.id)
        .single();
      setCode((p?.referral_code as string) || null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const link = code ? `https://ahenk.live/register?ref=${code}` : "";

  async function kopyala() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      trackEvent("referral_link_copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function paylas() {
    if (!link) return;
    const data = {
      title: "Ahenk",
      text: td.shareText,
      url: link,
    };
    if (navigator.share) {
      try { await navigator.share(data); trackEvent("referral_link_shared"); } catch {}
    } else {
      kopyala();
    }
  }

  return (
    <section className="lp-panel mb-5 overflow-hidden rounded-[1.75rem] p-0">
      <div className="relative p-5">
        <div className="absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-[#C7A977]/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#C7A977]/30 bg-[#C7A977]/10 text-accent">
              <Users size={20} />
            </span>
            <div>
              <p className="font-semibold text-text">{td.title}</p>
              <p className="text-xs leading-5 text-muted">
                {rewardParts}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0E0D10]/70 px-3 py-2.5">
            <Coins size={15} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate text-sm text-text/90">
              {code ? `ahenk.live/register?ref=${code}` : td.preparing}
            </span>
            <button
              onClick={kopyala}
              disabled={!code}
              className="shrink-0 rounded-xl border border-[#C7A977]/35 bg-[#C7A977]/12 px-2.5 py-1.5 text-xs font-semibold text-accent transition hover:bg-[#C7A977]/20 active:scale-95 disabled:opacity-50"
              aria-label={td.copyAria}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={paylas}
              disabled={!code}
              className="lp-cta-gold flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <Share2 size={16} /> {td.share}
            </button>
            <Link
              href="/liderlik"
              className="lp-cta-ghost flex flex-1 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-semibold"
            >
              <Trophy size={16} /> {td.leaderboard}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
