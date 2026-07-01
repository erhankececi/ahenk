import { createAdminClient } from "@/lib/supabase/server";

// Pozitif niyet sinyalleri ("gec" hariç). Bunlar "seni beğenenler" kutusunu besler.
const POSITIVE = ["ilginc", "tanis", "ortak"];

export type IncomingLike = {
  id: string;
  name: string | null;
  age: number | null;
  city: string | null;
  tier: string | null;
  is_verified: boolean | null;
  vibe: string | null;
  type: string;
  super?: boolean;
};

const TYPE_LABEL: Record<string, string> = {
  tanis: "Tanışmak istedi",
  ilginc: "İlginç buldu",
  ortak: "Ortak yönler buldu",
};

export function likeLabel(t: string): string {
  return TYPE_LABEL[t] || "Seni beğendi";
}

/**
 * Bana gelen, henüz eşleşmeye dönüşmemiş pozitif etkileşimler.
 * interactions RLS'i yalnız from_user'a okuma izni verir; "gelen"leri görmek
 * için service-role ile, KESİNLİKLE oturum sahibinin kendi to_user'ı için okunur.
 * Yalnız sunucu (server component / route handler) tarafından çağrılmalıdır.
 */
export async function getIncomingLikes(
  meId: string
): Promise<{ count: number; people: IncomingLike[] }> {
  const admin = createAdminClient();

  const { data: ints } = await admin
    .from("interactions")
    .select("from_user, type, created_at")
    .eq("to_user", meId)
    .in("type", POSITIVE)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!ints?.length) return { count: 0, people: [] };

  const order = ints.map((x) => x.from_user as string);
  const typeBy = new Map<string, string>(ints.map((x) => [x.from_user as string, x.type as string]));

  // Zaten eşleştiklerim + engel ilişkisi olanlar listeden düşer.
  const [{ data: myMatches }, { data: blk }] = await Promise.all([
    admin.from("matches").select("user_a, user_b").or(`user_a.eq.${meId},user_b.eq.${meId}`),
    admin.from("blocks").select("blocker_id, blocked_id").or(`blocker_id.eq.${meId},blocked_id.eq.${meId}`),
  ]);

  const matched = new Set<string>(
    (myMatches || []).map((m: any) => (m.user_a === meId ? m.user_b : m.user_a))
  );
  const blocked = new Set<string>();
  (blk || []).forEach((b: any) =>
    blocked.add(b.blocker_id === meId ? b.blocked_id : b.blocker_id)
  );

  const pending = order.filter((id) => !matched.has(id) && !blocked.has(id));
  if (!pending.length) return { count: 0, people: [] };

  const { data: profs } = await admin
    .from("profiles_card")
    .select("id, name, age, city, tier, is_verified, vibe, onboarded")
    .in("id", pending);

  const byId = new Map<string, any>(
    (profs || []).filter((p: any) => p.onboarded).map((p: any) => [p.id as string, p])
  );

  // Süper beğeni gönderenleri işaretle.
  const { data: supers } = await admin
    .from("super_likes")
    .select("from_user")
    .eq("to_user", meId)
    .in("from_user", pending);
  const superSet = new Set<string>((supers || []).map((s: any) => s.from_user as string));

  const people: IncomingLike[] = pending
    .filter((id) => byId.has(id))
    .map((id) => {
      const p = byId.get(id);
      return {
        id: p.id,
        name: p.name,
        age: p.age,
        city: p.city,
        tier: p.tier,
        is_verified: p.is_verified,
        vibe: p.vibe,
        type: typeBy.get(id) || "ilginc",
        super: superSet.has(id),
      };
    });

  return { count: people.length, people };
}
