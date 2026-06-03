import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Users, CalendarHeart, MapPin, BadgeCheck, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Topluluk() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = await supabase.from("profiles").select("city").eq("id", user!.id).single();
  const city = me?.city as string | null;

  if (!city) {
    return (
      <div className="px-4 pb-24 pt-6 text-center">
        <h1 className="t-h3 mb-2">Şehir Topluluğu</h1>
        <p className="text-sm text-muted">Topluluğunu görmek için profilinde şehrini seç.</p>
        <Link href="/onboarding" className="mt-4 inline-block rounded-full border border-border px-5 py-2.5 text-sm font-medium">
          Şehrimi ekle
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
    <div className="px-4 pb-24 pt-6">
      <div className="mb-1 flex items-center gap-2">
        <MapPin size={20} className="text-brand" />
        <h1 className="font-display text-2xl font-bold">{city} Topluluğu</h1>
      </div>
      <p className="mb-5 flex items-center gap-1.5 text-sm text-muted">
        <Users size={14} /> {count ?? 0} üye
      </p>

      {/* Etkinlikler */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="t-h4 flex items-center gap-2">
            <CalendarHeart size={17} className="text-brand" /> Şehrindeki etkinlikler
          </p>
          <Link href="/etkinlikler" className="text-xs text-muted">Tümü</Link>
        </div>
        {(events || []).length === 0 ? (
          <p className="text-sm text-muted">Yakında etkinlik yok — ilkini sen başlat.</p>
        ) : (
          <div className="space-y-2">
            {(events || []).map((e) => (
              <Link key={e.id} href="/etkinlikler" className="block rounded-2xl border border-border bg-surface p-3">
                <p className="font-medium">{e.title}</p>
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
      <p className="mb-2 t-h4 flex items-center gap-2">
        <Crown size={17} className="text-accent" /> Şehrin popüler üyeleri
      </p>
      {(members || []).length === 0 ? (
        <p className="text-sm text-muted">Henüz üye yok.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {(members || []).map((m: any) => (
            <Link key={m.id} href={`/u/${m.id}`} className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface p-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-accent/40 text-lg font-bold">
                {m.name?.[0]?.toUpperCase() || "?"}
              </span>
              <span className="flex items-center gap-1 truncate text-sm font-medium">
                {m.name}
                {m.is_verified && <BadgeCheck size={13} className="text-brand" />}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
