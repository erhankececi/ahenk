import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIncomingLikes, likeLabel } from "@/lib/likes";
import { isActivePremium } from "@/lib/plans";
import { PremiumBadge, tierFrame, tierName } from "@/components/PremiumBadge";
import LikeBackButton from "@/components/LikeBackButton";
import BackButton from "@/components/BackButton";
import { Heart, BadgeCheck, Lock, Crown, Sparkles } from "lucide-react";

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

  const { count, people } = await getIncomingLikes(user!.id);

  return (
    <div className="min-h-dvh px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <BackButton fallback="/eslesmeler" />
        <div>
          <h1 className="t-h3 flex items-center gap-2">
            <Heart size={20} className="text-accent" fill="currentColor" /> Seni beğenenler
          </h1>
          <p className="text-sm text-muted">
            {count > 0 ? `${count} kişi seninle tanışmak istiyor` : "Henüz beğenen yok"}
          </p>
        </div>
      </div>

      {count === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
            <Heart size={26} className="text-muted" />
          </div>
          <p className="font-medium">Henüz kimse seni beğenmedi</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Profilini zenginleştir ve keşfette aktif ol — ilgi çoğaldıkça burada görünecek.
          </p>
          <Link
            href="/kesfet"
            className="brand-gradient mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white"
          >
            Keşfete git
          </Link>
        </div>
      ) : premium ? (
        <div className="grid grid-cols-2 gap-3">
          {people.map((p) => (
            <div key={p.id} className="rounded-3xl border border-border bg-surface p-4 text-center">
              <Link href={`/u/${p.id}`} className="block">
                <div className={`mx-auto w-fit rounded-full ${tierFrame(p.tier)}`}>
                  <div className="brand-gradient flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white">
                    {p.name?.[0]?.toUpperCase() || "?"}
                  </div>
                </div>
                <p className={`mt-2.5 flex items-center justify-center gap-1 font-semibold ${tierName(p.tier)}`}>
                  <span className="truncate">{p.name}{p.age ? `, ${p.age}` : ""}</span>
                  {p.is_verified && <BadgeCheck size={14} className="shrink-0 text-brand" />}
                </p>
                <p className="truncate text-xs text-muted">{p.city || "—"}</p>
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                  <Heart size={10} fill="currentColor" /> {likeLabel(p.type)}
                </p>
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
        <FreeGate count={count} />
      )}
    </div>
  );
}

function FreeGate({ count }: { count: number }) {
  const tiles = Math.min(count, 6);
  return (
    <div>
      <div className="relative">
        <div className="grid grid-cols-2 gap-3" aria-hidden>
          {Array.from({ length: tiles }).map((_, idx) => (
            <div key={idx} className="rounded-3xl border border-border bg-surface p-4 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-elevated blur-[2px]" />
              <div className="mx-auto mt-3 h-3.5 w-20 rounded-full bg-elevated blur-[2px]" />
              <div className="mx-auto mt-2 h-3 w-14 rounded-full bg-elevated blur-[2px]" />
              <div className="mt-3 h-8 w-full rounded-full bg-elevated blur-[2px]" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
      </div>

      <div className="mt-5 rounded-3xl border border-brand/30 bg-brand/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15">
          <Lock size={20} className="text-brand" />
        </div>
        <h2 className="t-h4">{count} kişi seni beğendi</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">
          Kim olduklarını gör ve tek dokunuşla eşleş. Beğenenleri görmek Premium ayrıcalığıdır.
        </p>
        <Link
          href="/premium"
          className="brand-gradient mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          <Crown size={16} /> Premium ile gör
        </Link>
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted">
          <Sparkles size={12} /> Sınırsız keşif, görüşme ve dahası
        </p>
      </div>
    </div>
  );
}
