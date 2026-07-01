import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIncomingLikes, likeLabel } from "@/lib/likes";
import { isActivePremium } from "@/lib/plans";
import { PremiumBadge, tierFrame, tierName } from "@/components/PremiumBadge";
import LikeBackButton from "@/components/LikeBackButton";
import BackButton from "@/components/BackButton";
import { Heart, BadgeCheck, Lock, Crown, Sparkles, Star } from "lucide-react";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict, type AppDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Begenenler() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("profiles")
    .select("premium_plan, premium_until")
    .eq("id", user!.id)
    .single();
  const premium = isActivePremium(me);
  const tb = getAppDict(normalizeLang(cookies().get("lang")?.value)).begenenler;

  const { count, people } = await getIncomingLikes(user!.id);

  return (
    <div className="min-h-dvh px-4 pb-24 pt-6 lg:mx-auto lg:max-w-7xl lg:px-0 lg:pb-10">
      <div className="mb-5 flex items-center gap-3">
        <BackButton fallback="/eslesmeler" />
        <div>
          <h1 className="t-h3 flex items-center gap-2">
            <Heart size={20} className="text-accent" fill="currentColor" /> {tb.title}
          </h1>
          <p className="text-sm text-muted">
            {count > 0 ? tb.countWant.replace("{n}", String(count)) : tb.noLikesYet}
          </p>
        </div>
      </div>

      {count === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
            A
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-text">{tb.emptyTitle}</p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-muted">
            {tb.emptyDesc}
          </p>
          <Link
            href="/kesfet"
            className="lp-cta-gold mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            {tb.goDiscover}
          </Link>
        </div>
      ) : premium ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          {people.map((p) => (
            <div key={p.id} className="lp-panel rounded-3xl p-4 text-center lg:p-5">
              <Link href={`/u/${p.id}`} className="block">
                <div className={`mx-auto w-fit rounded-full ${tierFrame(p.tier)}`}>
                  <div className="lp-monogram flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold lg:h-20 lg:w-20 lg:text-3xl">
                    {p.name?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
                <p className={`mt-2.5 flex items-center justify-center gap-1 font-semibold ${tierName(p.tier)} lg:text-[15px]`}>
                  <span className="truncate">{p.name}{p.age ? `, ${p.age}` : ""}</span>
                  {p.is_verified && <BadgeCheck size={14} className="shrink-0 text-brand" />}
                </p>
                <p className="truncate text-xs text-muted">{p.city || "—"}</p>
                {p.super ? (
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    <Star size={10} fill="currentColor" /> {tb.superLike}
                  </p>
                ) : (
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                    <Heart size={10} fill="currentColor" /> {likeLabel(p.type)}
                  </p>
                )}
              </Link>
              {p.tier && p.tier !== "free" && (
                <div className="mt-1.5 flex justify-center">
                  <PremiumBadge tier={p.tier} />
                </div>
              )}
              <div className="mt-3">
                <LikeBackButton targetId={p.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <FreeGate count={count} t={tb} />
      )}
    </div>
  );
}

function FreeGate({ count, t }: { count: number; t: AppDict["begenenler"] }) {
  const tiles = Math.min(count, 6);
  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4" aria-hidden>
          {Array.from({ length: tiles }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-border bg-surface p-4 text-center lg:p-5">
              <div className="mx-auto h-16 w-16 rounded-full bg-elevated blur-[2px] lg:h-20 lg:w-20" />
              <div className="mx-auto mt-3 h-3.5 w-20 rounded-full bg-elevated blur-[2px]" />
              <div className="mx-auto mt-2 h-3 w-14 rounded-full bg-elevated blur-[2px]" />
              <div className="mt-3 h-8 w-full rounded-full bg-elevated blur-[2px]" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
      </div>

      <div className="lp-panel mt-5 rounded-3xl p-6 text-center lg:mx-auto lg:max-w-md lg:p-8">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
          <Lock size={20} className="text-accent" />
        </div>
        <h2 className="font-display text-lg font-semibold text-text">{t.gateTitle}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-6 text-muted">
          {t.gateDesc.replace("{n}", String(count))}
        </p>
        <Link
          href="/premium?source=likes_locked"
          className="lp-cta-gold mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          <Crown size={16} /> {t.unlockPremium}
        </Link>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted">
          <Sparkles size={12} /> {t.gatePerks}
        </p>
      </div>
    </div>
  );
}
