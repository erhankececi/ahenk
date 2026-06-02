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
    <div className="px-4 pt-6">
      <h1 className="mb-5 text-2xl font-bold">Seni ziyaret edenler</h1>

      {!premium ? (
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <Lock className="mx-auto mb-3 text-brand" size={32} />
          <p className="mb-1 font-semibold">{visitCount} kişi profiline baktı</p>
          <p className="mb-5 text-sm text-muted">Kimler olduğunu görmek Premium ayrıcalığıdır.</p>
          <Link
            href="/premium"
            className="brand-gradient inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold text-white"
          >
            <Crown size={18} /> Premium ol
          </Link>
        </div>
      ) : visitors.length === 0 ? (
        <div className="mt-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
            <Eye size={26} className="text-muted" />
          </div>
          <p className="font-medium">Henüz ziyaretçi yok</p>
          <p className="mt-1 text-sm text-muted">Keşfette aktif oldukça profilin daha çok görüntülenir.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visitors.map((v, i) => (
            <Link
              key={i}
              href={`/u/${v.id}`}
              className={`flex items-center gap-3 rounded-2xl border bg-surface p-3 transition hover:border-brand/40 ${
                v.tier === "platinum" || v.tier === "legend" ? "border-brand/40" : "border-border"
              }`}
            >
              <div className={`rounded-full ${tierFrame(v.tier)}`}>
                <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-full font-bold text-white">
                  {v.name[0]}
                </div>
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <p className="font-medium">{v.name}</p>
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
