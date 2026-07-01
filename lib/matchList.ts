import { createClient } from "@/lib/supabase/server";
import type { Row } from "@/components/MatchList";

const ONLINE_MS = 4 * 60 * 1000;
const ZERO = "00000000-0000-0000-0000-000000000000";

type MesajlarDict = {
  someone: string;
  voiceMsg: string;
  photo: string;
};

// eslesmeler/page.tsx ve sohbet/[matchId]/page.tsx (masaüstü split-pane sol panel)
// aynı eşleşme+son mesaj listesini kullanır → tek yerden çekilir (N+1 yerine 2 toplu sorgu).
export async function getMatchListRows(userId: string, tm: MesajlarDict): Promise<Row[]> {
  const supabase = createClient();

  const [{ data: matches }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order("created_at", { ascending: false }),
  ]);

  const ms = matches || [];
  const otherIds = ms.map((m) => (m.user_a === userId ? m.user_b : m.user_a));
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
    .eq("user_id", userId);
  const stateMap = new Map((states || []).map((s) => [s.match_id, s.state]));

  return ms
    .map((m) => {
      const otherId = m.user_a === userId ? m.user_b : m.user_a;
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
}
