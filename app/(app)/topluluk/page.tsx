import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Users, CalendarHeart, MapPin, BadgeCheck, Crown } from "lucide-react";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Topluluk() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("city").eq("id", user!.id).single();
  const city = me?.city as string | null;
  const tt = getAppDict(normalizeLang(cookies().get("lang")?.value)).topluluk;

  if (!city) {
    return (
      <div className="lp-page flex min-h-dvh flex-col items-center px-4 pb-24 pt-24 text-center">
        <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">A</span>
        <h1 className="mt-4 font-display text-xl font-semibold text-text">{tt.noCityTitle}</h1>
        <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">{tt.noCityDesc}</p>
        <Link href="/onboarding" className="lp-cta-gold mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
          {tt.addCity}
        </Link>
      </div>
    );
  }

  const admin = createAdminClient();
  const [{ data: members, count }, { data: events }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, name, is_verified, premium_plan, activity_score", { count: "exact" })
      .eq("city", city)
      .eq("onboarded", true)
      .neq("id", user!.id)
      .is("deleted_at", null)
      .or("banned.is.null,banned.eq.false")
      .order("activity_score", { ascending: false })
      .limit(18),
    admin
      .from("events")
      .select("id, title, starts_at")
      .eq("city", city)
      .order("starts_at", { ascending: true })
      .limit(6),
  ]);

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6 lg:mx-auto lg:max-w-6xl lg:px-0">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{tt.eyebrow}</p>
      <div className="mt-1 flex items-center gap-2">
        <MapPin size={20} className="text-accent" />
        <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text lg:text-3xl">{tt.cityTitle.replace("{city}", city)}</h1>
      </div>
      <p className="mb-5 mt-1 flex items-center gap-1.5 text-sm text-muted">
        <Users size={14} /> {tt.memberCount.replace("{n}", String(count ?? 0))}
      </p>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:items-start lg:gap-8">
        {/* Etkinlikler */}
        <div className="mb-6 lg:mb-0">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-text">
              <CalendarHeart size={17} className="text-accent" /> {tt.cityEvents}
            </p>
            <Link href="/etkinlikler" className="text-xs text-accent">{tt.all}</Link>
          </div>
          {(events || []).length === 0 ? (
            <p className="text-sm text-muted">{tt.noEvents}</p>
          ) : (
            <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2.5 lg:space-y-0">
              {(events || []).map((e) => (
                <Link key={e.id} href="/etkinlikler" className="lp-panel-hover block p-3">
                  <p className="font-medium text-text">{e.title}</p>
                  {e.starts_at && (
                    <p className="text-xs text-muted">
                      {new Date(e.starts_at).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popüler üyeler */}
        <div>
          <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-text">
            <Crown size={17} className="text-accent" /> {tt.popularMembers}
          </p>
          {(members || []).length === 0 ? (
            <p className="text-sm text-muted">{tt.noMembers}</p>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4 lg:gap-3">
              {(members || []).map((m: any) => (
                <Link key={m.id} href={`/u/${m.id}`} className="lp-panel-hover flex flex-col items-center gap-1.5 p-3 text-center">
                  <span className="lp-monogram flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold">
                    {m.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  <span className="flex items-center gap-1 truncate text-sm font-medium text-text">
                    {m.name}
                    {m.is_verified && <BadgeCheck size={13} className="text-accent" />}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
