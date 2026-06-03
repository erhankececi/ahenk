import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** Hikayeye yanıt → eşleşme varsa DM gönderir ve sohbeti açar; yoksa profile yönlendirir. */
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  const { storyId, text } = await req.json().catch(() => ({}));
  if (!storyId || !text?.trim()) return NextResponse.json({ ok: false }, { status: 400 });

  const admin = createAdminClient();
  const { data: story } = await admin.from("stories").select("user_id").eq("id", storyId).single();
  if (!story) return NextResponse.json({ ok: false }, { status: 404 });
  const owner = story.user_id;
  if (owner === user.id) return NextResponse.json({ ok: false, error: "self" }, { status: 400 });

  const a = user.id < owner ? user.id : owner;
  const b = user.id < owner ? owner : user.id;
  const { data: match } = await admin.from("matches").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
  if (!match) return NextResponse.json({ ok: true, ownerId: owner, needMatch: true });

  await admin.from("messages").insert({
    match_id: match.id,
    sender_id: user.id,
    type: "text",
    body: `📷 Hikayene: ${text.trim().slice(0, 300)}`,
  });
  return NextResponse.json({ ok: true, matchId: match.id });
}
