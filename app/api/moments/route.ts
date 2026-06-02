import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { momentEtiketleri } from "@/lib/aiTags";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

// getMomentsFeed
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: moments } = await supabase
    .from("moments")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("highlighted", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  const userIds = Array.from(new Set((moments || []).map((m) => m.user_id)));
  const { data: profiles } = await supabase
    .from("profiles_card")
    .select("id, name, city")
    .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const pMap = new Map((profiles || []).map((p) => [p.id, p]));

  const ids = (moments || []).map((m) => m.id);
  const { data: tags } = await supabase
    .from("moment_ai_tags")
    .select("moment_id, tag")
    .in("moment_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const tagMap = new Map<string, string[]>();
  (tags || []).forEach((t) => {
    const a = tagMap.get(t.moment_id) || [];
    a.push(t.tag);
    tagMap.set(t.moment_id, a);
  });

  const { data: reacts } = await supabase
    .from("moment_reactions")
    .select("moment_id")
    .in("moment_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const reactMap = new Map<string, number>();
  (reacts || []).forEach((r) => reactMap.set(r.moment_id, (reactMap.get(r.moment_id) || 0) + 1));

  const feed = (moments || []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    name: pMap.get(m.user_id)?.name || "Biri",
    city: pMap.get(m.user_id)?.city,
    type: m.type,
    text: m.text,
    media: m.media_path ? MEDIA_URL(m.media_path) : null,
    highlighted: m.highlighted,
    tags: tagMap.get(m.id) || [],
    reactions: reactMap.get(m.id) || 0,
    created_at: m.created_at,
    mine: m.user_id === user.id,
  }));

  return NextResponse.json({ moments: feed });
}

// createMoment
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { type, text, media_path } = await request.json();
  if (!["photo", "video", "text", "photo_text"].includes(type))
    return NextResponse.json({ error: "geçersiz tip" }, { status: 400 });

  const { data: moment, error } = await supabase
    .from("moments")
    .insert({ user_id: user.id, type, text: text || null, media_path: media_path || null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // AI etiketleri üret
  const etiketler = momentEtiketleri(text || "");
  if (etiketler.length) {
    await supabase
      .from("moment_ai_tags")
      .insert(etiketler.map((tag) => ({ moment_id: moment.id, tag })));
  }

  return NextResponse.json({ moment, tags: etiketler });
}
