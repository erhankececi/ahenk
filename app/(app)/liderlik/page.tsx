import { createAdminClient, createClient } from "@/lib/supabase/server";
import BackButton from "@/components/BackButton";
import { Trophy, Gift, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Liderlik() {
  const supabase = createClient();
  await supabase.auth.getUser();
  const admin = createAdminClient();
  const [{ data: gifts }, { data: inviters }] = await Promise.all([
    admin.rpc("top_gift_earners", { p_limit: 10 }),
    admin.rpc("top_inviters", { p_limit: 10 }),
  ]);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`);

  return (
    <div className="min-h-dvh px-4 pb-24 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <BackButton fallback="/profil" />
        <h1 className="t-h3 flex items-center gap-2">
          <Trophy size={20} className="text-accent" /> Liderlik
        </h1>
      </div>

      <section className="mb-6">
        <p className="mb-2 flex items-center gap-2 font-semibold">
          <Gift size={17} className="text-accent" /> En çok hediye kazananlar
        </p>
        {!gifts || (gifts as any[]).length === 0 ? (
          <p className="text-sm text-muted">Henüz hediye kazanan yok — ilk sen ol!</p>
        ) : (
          <div className="space-y-1.5">
            {(gifts as any[]).map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <span className="w-7 text-center text-sm font-bold">{medal(i)}</span>
                <p className="flex-1 truncate font-medium">{g.name || "Biri"}</p>
                <span className="text-sm font-semibold text-accent">{g.total} jeton</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <p className="mb-2 flex items-center gap-2 font-semibold">
          <Users size={17} className="text-brand" /> En çok davet edenler
        </p>
        {!inviters || (inviters as any[]).length === 0 ? (
          <p className="text-sm text-muted">Henüz davet yok — arkadaşlarını çağır!</p>
        ) : (
          <div className="space-y-1.5">
            {(inviters as any[]).map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <span className="w-7 text-center text-sm font-bold">{medal(i)}</span>
                <p className="flex-1 truncate font-medium">{u.name || "Biri"}</p>
                <span className="text-sm font-semibold text-brand">{u.davet} davet</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
