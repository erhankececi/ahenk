import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { zamanFarki } from "@/lib/utils";
import { isActivePremium } from "@/lib/plans";
import { Lock, Crown, Eye } from "lucide-react";
import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";

export const dynamic = "force-dynamic";

const ZERO = "00000000-0000-0000-0000-000000000000";

export default async function Ziyaretciler() {
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

  const { data: visits } = await supabase
    .from("profile_visits")
    .select("visitor_id, visited_at")
    .eq("visited_id", user!.id)
    .order("visited_at", { ascending: false })
    .limit(50);

  const visitCount = (visits || []).length;

  // Free kullanıcı yalnız sayıyı görür → ziyaretçi profillerini hiç çekme.
  // Premium ise tek toplu sorgu (N+1 yok).
  let visitors: { id: string; name: string; tier: string; at: string }[] = [];
  if (premium && visits?.length) {
    const vids = visits.map((v) => v.visitor_id as string);
    const { data: profs } = await supabase
      .from("profiles_card")
      .select("id, name, tier")
      .in("id", vids.length ? vids : [ZERO]);
    const pMap = new Map((profs || []).map((p) => [p.id, p]));
    visitors = visits.map((v) => {
      const p: any = pMap.get(v.visitor_id);
      return {
        id: v.visitor_id as string,
        name: p?.name || "Biri",
        tier: (p?.tier as string) || "free",
        at: v.visited_at as string,
      };
    });
  }

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk profil</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-text">Seni ziyaret edenler</h1>
      </div>

      {!premium ? (
        <div className="lp-panel rounded-[1.75rem] p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Lock size={26} />
          </span>
          <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-text">{visitCount} kişi profiline baktı</p>
          <p className="mb-6 mt-1.5 text-sm leading-6 text-muted">Kimler olduğunu görmek Premium ayrıcalığıdır.</p>
          <Link
            href="/premium"
            className="lp-cta-gold inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
          >
            <Crown size={18} /> Premium ol
          </Link>
        </div>
      ) : visitors.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
            A
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-text">Henüz ziyaretçi yok</p>
          <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">Keşfette aktif oldukça profilin daha çok görüntülenir.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visitors.map((v, i) => (
            <Link
              key={i}
              href={`/u/${v.id}`}
              className="lp-panel-hover flex items-center gap-3 p-3"
            >
              <div className={`rounded-full ${tierFrame(v.tier)}`}>
                <div className="lp-monogram flex h-11 w-11 items-center justify-center rounded-full font-bold">
                  {v.name[0]}
                </div>
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <p className="font-medium text-text">{v.name}</p>
                <PremiumBadge tier={v.tier} />
              </div>
              <span className="text-xs text-muted">{zamanFarki(v.at)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
