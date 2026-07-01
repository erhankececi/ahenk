import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const MEDIA_URL = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${p}`;
const ZERO = "00000000-0000-0000-0000-000000000000";

/** Reels: video içeren moments — dikey akış. */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const admin = createAdminClient();

  const { data: vids } = await admin
    .from("moment_media")
    .select("moment_id, media_path, position")
    .eq("type", "video")
    .order("position");
  const firstVid = new Map<string, string>();
  (vids || []).forEach((v) => { if (!firstVid.has(v.moment_id)) firstVid.set(v.moment_id, MEDIA_URL(v.media_path)); });

  const momIds = Array.from(firstVid.keys());
  if (!momIds.length) return NextResponse.json({ reels: [] });

  const { data: moms } = await admin
    .from("moments")
    .select("id, user_id, text, created_at, gifts_off, comments_off")
    .in("id", momIds)
    .or("archived.is.null,archived.eq.false")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const uids = Array.from(new Set((moms || []).map((m) => m.user_id)));
  const ids = (moms || []).map((m) => m.id);
  const [{ data: profs }, { data: reacts }, { data: cmts }] = await Promise.all([
    admin.from("profiles_card").select("id, name").in("id", uids.length ? uids : [ZERO]),
    admin.from("moment_reactions").select("moment_id").in("moment_id", ids.length ? ids : [ZERO]),
    admin.from("moment_comments").select("moment_id").in("moment_id", ids.length ? ids : [ZERO]),
  ]);
  const nameMap = new Map((profs || []).map((p) => [p.id, p.name]));
  const rc = new Map<string, number>(); (reacts || []).forEach((r) => rc.set(r.moment_id, (rc.get(r.moment_id) || 0) + 1));
  const cc = new Map<string, number>(); (cmts || []).forEach((c) => cc.set(c.moment_id, (cc.get(c.moment_id) || 0) + 1));

  const reels = (moms || []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    name: nameMap.get(m.user_id) || "Biri",
    video: firstVid.get(m.id)!,
    text: m.text,
    reactions: rc.get(m.id) || 0,
    comments: cc.get(m.id) || 0,
    gifts_off: !!m.gifts_off,
    comments_off: !!m.comments_off,
    mine: m.user_id === user.id,
  }));
  return NextResponse.json({ reels });
}
