import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const ids = Array.from(new Set((stories || []).map((s) => s.user_id)));
  const { data: profiles } = await supabase
    .from("profiles_card")
    .select("id, name, tier")
    .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const pMap = new Map((profiles || []).map((p) => [p.id, p]));

  // kullanıcı başına grupla
  const groups: Record<string, any> = {};
  (stories || []).forEach((s) => {
    if (!groups[s.user_id])
      groups[s.user_id] = {
        user_id: s.user_id,
        name: (pMap.get(s.user_id) as any)?.name || "Biri",
        tier: (pMap.get(s.user_id) as any)?.tier || "free",
        mine: s.user_id === user.id,
        items: [],
      };
    groups[s.user_id].items.push({
      id: s.id,
      type: s.type,
      text: s.text,
      media: s.media_path ? MEDIA_URL(s.media_path) : null,
    });
  });

  return NextResponse.json({ stories: Object.values(groups), me: user.id });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { type, text, media_path } = await request.json();
  if (!["photo", "video", "text"].includes(type))
    return NextResponse.json({ error: "geçersiz tip" }, { status: 400 });

  const { error } = await supabase
    .from("stories")
    .insert({ user_id: user.id, type, text: text || null, media_path: media_path || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
