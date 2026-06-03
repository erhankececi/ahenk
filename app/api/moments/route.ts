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
    .or("archived.is.null,archived.eq.false")
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

  const safeIds = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];
  const [{ data: reacts }, { data: mediaRows }, { data: cmts }] = await Promise.all([
    supabase.from("moment_reactions").select("moment_id").in("moment_id", safeIds),
    supabase.from("moment_media").select("moment_id, type, media_path, position").in("moment_id", safeIds).order("position"),
    supabase.from("moment_comments").select("moment_id").in("moment_id", safeIds),
  ]);
  const reactMap = new Map<string, number>();
  (reacts || []).forEach((r) => reactMap.set(r.moment_id, (reactMap.get(r.moment_id) || 0) + 1));
  const commentMap = new Map<string, number>();
  (cmts || []).forEach((c) => commentMap.set(c.moment_id, (commentMap.get(c.moment_id) || 0) + 1));
  const mediaMap = new Map<string, { type: string; url: string }[]>();
  (mediaRows || []).forEach((m) => {
    const a = mediaMap.get(m.moment_id) || [];
    a.push({ type: m.type, url: MEDIA_URL(m.media_path) });
    mediaMap.set(m.moment_id, a);
  });

  const feed = (moments || []).map((m) => {
    // Albüm medyaları varsa onları, yoksa tek media_path'i kullan (geriye dönük)
    const album = mediaMap.get(m.id) || (m.media_path ? [{ type: m.type === "video" ? "video" : "photo", url: MEDIA_URL(m.media_path) }] : []);
    return {
      id: m.id,
      user_id: m.user_id,
      name: pMap.get(m.user_id)?.name || "Biri",
      city: pMap.get(m.user_id)?.city,
      type: m.type,
      text: m.text,
      media: album[0]?.url || null,
      album,
      highlighted: m.highlighted,
      tags: tagMap.get(m.id) || [],
      reactions: reactMap.get(m.id) || 0,
      comments: commentMap.get(m.id) || 0,
      comments_off: !!m.comments_off,
      gifts_off: !!m.gifts_off,
      created_at: m.created_at,
      mine: m.user_id === user.id,
    };
  });

  return NextResponse.json({ moments: feed });
}

// createMoment
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const body = await request.json();
  const { type, text, comments_off, gifts_off } = body;
  // media: [{type:'photo'|'video', media_path}] (albüm). Geriye dönük: tek media_path.
  const media: { type: string; media_path: string }[] = Array.isArray(body.media)
    ? body.media.filter((m: any) => m?.media_path)
    : body.media_path
      ? [{ type: type === "video" ? "video" : "photo", media_path: body.media_path }]
      : [];

  if (!["photo", "video", "text", "photo_text"].includes(type) && media.length === 0 && !text)
    return NextResponse.json({ error: "geçersiz" }, { status: 400 });

  const baseType = media.length ? media[0].type : "text";
  // Albüm/foto/video paylaşımları KALICI (Instagram post); yalnız yazı 24s kalır.
  const expires = media.length ? new Date(Date.now() + 3650 * 864e5).toISOString() : undefined;

  const { data: moment, error } = await supabase
    .from("moments")
    .insert({
      user_id: user.id,
      type: baseType,
      text: text || null,
      media_path: media[0]?.media_path || null,
      comments_off: !!comments_off,
      gifts_off: !!gifts_off,
      ...(expires ? { expires_at: expires } : {}),
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Albüm medyaları
  if (media.length) {
    await supabase.from("moment_media").insert(
      media.map((m, i) => ({ moment_id: moment.id, type: m.type, media_path: m.media_path, position: i }))
    );
  }

  const etiketler = momentEtiketleri(text || "");
  if (etiketler.length) {
    await supabase.from("moment_ai_tags").insert(etiketler.map((tag) => ({ moment_id: moment.id, tag })));
  }

  return NextResponse.json({ moment, tags: etiketler });
}

// Paylaşımı sil (yalnız sahibi)
export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "eksik" }, { status: 400 });
  const { error } = await supabase.from("moments").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "db" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Arşivle / yorum-hediye kapat (yalnız sahibi)
export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const { id, archived, comments_off, gifts_off } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "eksik" }, { status: 400 });
  const patch: any = {};
  if (typeof archived === "boolean") patch.archived = archived;
  if (typeof comments_off === "boolean") patch.comments_off = comments_off;
  if (typeof gifts_off === "boolean") patch.gifts_off = gifts_off;
  const { error } = await supabase.from("moments").update(patch).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "db" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
