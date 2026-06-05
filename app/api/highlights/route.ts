import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

// GET /api/highlights?userId=...  → bir kullanıcının kalıcı koleksiyonları (herkese açık)
export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const userId = new URL(req.url).searchParams.get("userId") || user.id;

  const { data: hls } = await supabase
    .from("highlights")
    .select("id, title, cover_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const hlIds = (hls || []).map((h) => h.id);
  const ZERO = "00000000-0000-0000-0000-000000000000";
  const { data: items } = await supabase
    .from("highlight_items")
    .select("highlight_id, story_id, position, story:stories(id, type, text, media_path)")
    .in("highlight_id", hlIds.length ? hlIds : [ZERO])
    .order("position");

  const byHl = new Map<string, any[]>();
  (items || []).forEach((it: any) => {
    const arr = byHl.get(it.highlight_id) || [];
    const s = it.story;
    if (s) arr.push({ id: s.id, type: s.type, text: s.text, media: s.media_path ? MEDIA_URL(s.media_path) : null });
    byHl.set(it.highlight_id, arr);
  });

  const highlights = (hls || []).map((h) => ({
    id: h.id,
    title: h.title,
    cover: h.cover_path ? MEDIA_URL(h.cover_path) : (byHl.get(h.id)?.[0]?.media || null),
    items: byHl.get(h.id) || [],
  }));
  return NextResponse.json({ highlights });
}

// POST /api/highlights  body:{ title, storyIds[], coverStoryId? }
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  const { title, storyIds, coverStoryId } = await req.json().catch(() => ({}));
  if (!title?.trim() || !Array.isArray(storyIds) || storyIds.length === 0)
    return NextResponse.json({ ok: false, error: "eksik" }, { status: 400 });

  // kapak: seçilen story'nin media yolu
  let coverPath: string | null = null;
  const coverId = coverStoryId || storyIds[0];
  const { data: coverStory } = await supabase
    .from("stories").select("media_path, user_id").eq("id", coverId).single();
  if (coverStory && coverStory.user_id === user.id) coverPath = coverStory.media_path;

  const { data: hl, error } = await supabase
    .from("highlights")
    .insert({ user_id: user.id, title: title.trim().slice(0, 40), cover_path: coverPath })
    .select("id")
    .single();
  if (error || !hl) return NextResponse.json({ ok: false, error: error?.message }, { status: 400 });

  const rows = storyIds.slice(0, 50).map((sid: string, i: number) => ({
    highlight_id: hl.id, story_id: sid, position: i,
  }));
  await supabase.from("highlight_items").insert(rows);
  return NextResponse.json({ ok: true, id: hl.id });
}

// DELETE /api/highlights?id=...
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await supabase.from("highlights").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
