import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { zamanFarki } from "@/lib/utils";
import { getIncomingLikes } from "@/lib/likes";
import { isActivePremium } from "@/lib/plans";
import { PremiumBadge, tierFrame } from "@/components/PremiumBadge";
import { Heart, Lock, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const ONLINE_MS = 4 * 60 * 1000;
const ZERO = "00000000-0000-0000-0000-000000000000";

export default async function Eslesmeler() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: matches }, likes, { data: me }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${user!.id},user_b.eq.${user!.id}`)
      .order("created_at", { ascending: false }),
    getIncomingLikes(user!.id),
    supabase.from("profiles").select("premium_plan, premium_until").eq("id", user!.id).single(),
  ]);
  const premium = isActivePremium(me);

  // N+1 yerine 2 toplu sorgu: tüm profiller + ilgili tüm son mesajlar.
  const ms = matches || [];
  const otherIds = ms.map((m) => (m.user_a === user!.id ? m.user_b : m.user_a));
  const matchIds = ms.map((m) => m.id);

  const [{ data: profiles }, { data: msgs }] = await Promise.all([
    supabase
      .from("profiles_card")
      .select("id, name, tier, last_active")
      .in("id", otherIds.length ? otherIds : [ZERO]),
    supabase
      .from("messages")
      .select("match_id, body, type, created_at, sender_id, read_at")
      .in("match_id", matchIds.length ? matchIds : [ZERO])
      .order("created_at", { ascending: false })
      .limit(600),
  ]);

  const pMap = new Map((profiles || []).map((p) => [p.id, p]));
  const lastByMatch = new Map<string, any>();
  (msgs || []).forEach((m) => {
    if (!lastByMatch.has(m.match_id)) lastByMatch.set(m.match_id, m); // desc sıra → ilk = en son
  });

  const list = ms.map((m) => {
    const otherId = m.user_a === user!.id ? m.user_b : m.user_a;
    const p: any = pMap.get(otherId);
    const lastMsg = lastByMatch.get(m.id) || null;
    const unread = !!lastMsg && lastMsg.sender_id === otherId && !lastMsg.read_at;
    const online = !!p?.last_active && Date.now() - new Date(p.last_active).getTime() < ONLINE_MS;
    return { match: m, name: p?.name || "Biri", tier: (p?.tier as string) || "free", lastMsg, unread, online };
  });

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-5 text-2xl font-bold">Eşleşmeler</h1>

      {likes.count > 0 && (
        <Link
          href="/begenenler"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-3.5 transition hover:border-brand/50"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15">
            <Heart size={18} className="text-accent" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Seni beğenenler</p>
            <p className="text-xs text-muted">
              {premium
                ? `${likes.count} kişi seninle tanışmak istiyor`
                : `${likes.count} kişi seni beğendi — kim olduklarını gör`}
            </p>
          </div>
          {!premium && <Lock size={15} className="shrink-0 text-muted" />}
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Link>
      )}

      {list.length === 0 ? (
        <div className="mt-24 text-center">
          <p className="text-muted">Henüz eşleşme yok.</p>
          <p className="mt-1 text-sm text-muted">Keşfet'ten ahengini bulan biriyle karşılıklı ilgi kur.</p>
          <Link
            href="/kesfet"
            className="brand-gradient mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold text-white"
          >
            Keşfet'e git
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(({ match, name, tier, lastMsg, unread, online }) => (
            <Link
              key={match.id}
              href={`/sohbet/${match.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="relative">
                <div className={`rounded-full ${tierFrame(tier)}`}>
                  <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
                    {name[0]}
                  </div>
                </div>
                {online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-success" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  {name}
                  <PremiumBadge tier={tier} />
                </p>
                <p className={`truncate text-sm ${unread ? "font-medium text-text" : "text-muted"}`}>
                  {lastMsg
                    ? lastMsg.type === "text"
                      ? lastMsg.body
                      : lastMsg.type === "voice"
                        ? "Sesli mesaj"
                        : "Fotoğraf"
                    : "Eşleştiniz — ilk mesajı sen at!"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {lastMsg && (
                  <span className={`text-xs ${unread ? "text-brand" : "text-muted"}`}>
                    {zamanFarki(lastMsg.created_at)}
                  </span>
                )}
                {unread && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
