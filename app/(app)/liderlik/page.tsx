import { createAdminClient, createClient } from "@/lib/supabase/server";
import BackButton from "@/components/BackButton";
import { Trophy, Gift, Users } from "lucide-react";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Liderlik() {
  const supabase = createClient();
  await supabase.auth.getUser();
  const tl = getAppDict(normalizeLang(cookies().get("lang")?.value)).liderlik;
  const admin = createAdminClient();
  const [{ data: gifts }, { data: inviters }] = await Promise.all([
    admin.rpc("top_gift_earners", { p_limit: 10 }),
    admin.rpc("top_inviters", { p_limit: 10 }),
  ]);

  const rankCls = (i: number) =>
    i === 0
      ? "border-accent/55 bg-accent/15 text-accent"
      : i === 1
        ? "border-white/20 bg-white/[0.06] text-text"
        : i === 2
          ? "border-accent/25 bg-accent/[0.07] text-accent/80"
          : "border-white/10 text-muted";
  const Rank = ({ i }: { i: number }) => (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${rankCls(i)}`}>
      {i + 1}
    </span>
  );

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-5xl lg:px-0">
      <div className="mb-5 flex items-center gap-3 lg:mb-8">
        <BackButton fallback="/profil" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">
            <Trophy size={20} className="text-accent lg:hidden" />
            <Trophy size={26} className="hidden text-accent lg:block" /> {tl.title}
          </h1>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <section className="mb-6 lg:mb-0">
          <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-text lg:mb-4 lg:text-base">
            <Gift size={17} className="text-accent" /> {tl.topGifters}
          </p>
          {!gifts || (gifts as any[]).length === 0 ? (
            <p className="text-sm text-muted">{tl.noGifters}</p>
          ) : (
            <div className="space-y-1.5 lg:space-y-2">
              {(gifts as any[]).map((g, i) => (
                <div key={g.id} className="lp-panel flex items-center gap-3 rounded-2xl p-3 lg:p-4">
                  <Rank i={i} />
                  <p className="flex-1 truncate font-medium text-text">{g.name || tl.someone}</p>
                  <span className="text-sm font-semibold text-accent">{g.total} {tl.jetonSuffix}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-text lg:mb-4 lg:text-base">
            <Users size={17} className="text-accent" /> {tl.topInviters}
          </p>
          {!inviters || (inviters as any[]).length === 0 ? (
            <p className="text-sm text-muted">{tl.noInviters}</p>
          ) : (
            <div className="space-y-1.5 lg:space-y-2">
              {(inviters as any[]).map((u, i) => (
                <div key={u.id} className="lp-panel flex items-center gap-3 rounded-2xl p-3 lg:p-4">
                  <Rank i={i} />
                  <p className="flex-1 truncate font-medium text-text">{u.name || tl.someone}</p>
                  <span className="text-sm font-semibold text-accent">{u.davet} {tl.davetSuffix}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
