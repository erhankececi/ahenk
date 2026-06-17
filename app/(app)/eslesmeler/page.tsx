import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { zamanFarki } from "@/lib/utils";
import { getIncomingLikes } from "@/lib/likes";
import { isActivePremium } from "@/lib/plans";
import { Heart, Lock, ChevronRight } from "lucide-react";
import MatchList from "@/components/MatchList";
import { cookies } from "next/headers";
import { normalizeLang, getAppDict } from "@/lib/i18n";

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
  const tm = getAppDict(normalizeLang(cookies().get("lang")?.value)).mesajlar;

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

  const { data: states } = await supabase
    .from("chat_states")
    .select("match_id, state")
    .eq("user_id", user!.id);
  const stateMap = new Map((states || []).map((s) => [s.match_id, s.state]));

  const rows = ms
    .map((m) => {
      const otherId = m.user_a === user!.id ? m.user_b : m.user_a;
      const p: any = pMap.get(otherId);
      const lastMsg = lastByMatch.get(m.id) || null;
      const unread = !!lastMsg && lastMsg.sender_id === otherId && !lastMsg.read_at;
      const online = !!p?.last_active && Date.now() - new Date(p.last_active).getTime() < ONLINE_MS;
      return {
        matchId: m.id as string,
        name: (p?.name as string) || tm.someone,
        tier: (p?.tier as string) || "free",
        lastText: lastMsg
          ? lastMsg.type === "text" ? (lastMsg.body as string) : lastMsg.type === "voice" ? tm.voiceMsg : tm.photo
          : null,
        lastTime: (lastMsg?.created_at as string) ?? null,
        unread,
        online,
        state: (stateMap.get(m.id) as string) ?? "normal",
      };
    })
    .filter((r) => r.state !== "deleted");

  return (
    <div className="lp-page min-h-dvh px-4 pb-28 pt-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Ahenk</p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-text">{tm.title}</h1>
      </div>

      {likes.count > 0 && (
        <Link
          href="/begenenler"
          className="lp-panel-hover mb-4 flex items-center gap-3 p-3.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">
            <Heart size={18} className="text-accent" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text">{tm.likesTitle}</p>
            <p className="text-xs text-muted">
              {premium
                ? tm.likesPremium.replace("{n}", String(likes.count))
                : tm.likesFree.replace("{n}", String(likes.count))}
            </p>
          </div>
          {!premium && <Lock size={15} className="shrink-0 text-muted" />}
          <ChevronRight size={18} className="shrink-0 text-muted" />
        </Link>
      )}

      {rows.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <span className="lp-monogram flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-extrabold">
            A
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-text">{tm.noChats}</p>
          <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted">
            {tm.noChatsDesc}
          </p>
          <Link href="/kesfet" className="lp-cta-gold mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">
            {tm.goDiscover}
          </Link>
        </div>
      ) : (
        <MatchList meId={user!.id} rows={rows} />
      )}
    </div>
  );
}
