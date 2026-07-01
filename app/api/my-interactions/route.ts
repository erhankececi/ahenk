import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { previewUrl } from "@/lib/storage";

const ZERO = "00000000-0000-0000-0000-000000000000";

/** Kullanıcının eşleşmeleri / beğendikleri / süper beğendikleri. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const uid = user.id;
  const admin = createAdminClient();

  const [{ data: matchRows }, { data: likeRows }, { data: superRows }] = await Promise.all([
    admin.from("matches").select("id, user_a, user_b, created_at").or(`user_a.eq.${uid},user_b.eq.${uid}`).order("created_at", { ascending: false }),
    admin.from("interactions").select("to_user, created_at").eq("from_user", uid).neq("type", "gec").order("created_at", { ascending: false }),
    admin.from("super_likes").select("to_user, created_at").eq("from_user", uid).order("created_at", { ascending: false }),
  ]);

  const matchOther = (matchRows || []).map((m) => ({ matchId: m.id, id: m.user_a === uid ? m.user_b : m.user_a }));
  const superIds = (superRows || []).map((r) => r.to_user);
  const superSet = new Set(superIds);
  const likedIds = (likeRows || []).map((r) => r.to_user).filter((id) => !superSet.has(id));

  const allIds = Array.from(new Set([...matchOther.map((m) => m.id), ...likedIds, ...superIds]));
  const inIds = allIds.length ? allIds : [ZERO];
  const [{ data: profs }, { data: photos }] = await Promise.all([
    admin.from("profiles_card").select("id, name, city").in("id", inIds),
    admin.from("photos").select("user_id, preview_path, position").in("user_id", inIds).order("position"),
  ]);
  const nameMap = new Map((profs || []).map((p) => [p.id, p]));
  const photoMap = new Map<string, string>();
  (photos || []).forEach((ph) => {
    if (!photoMap.has(ph.user_id)) {
      const u = previewUrl(ph.preview_path);
      if (u) photoMap.set(ph.user_id, u);
    }
  });

  const card = (id: string) => ({
    id,
    name: (nameMap.get(id) as any)?.name || "Biri",
    city: (nameMap.get(id) as any)?.city || null,
    photo: photoMap.get(id) || null,
  });

  return NextResponse.json({
    matches: matchOther.map((m) => ({ ...card(m.id), matchId: m.matchId })),
    liked: likedIds.map(card),
    superLiked: superIds.map(card),
  });
}
