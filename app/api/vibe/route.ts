import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VIBES } from "@/lib/vibes";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { vibe } = await request.json();
  if (vibe && !VIBES.some((v) => v.id === vibe))
    return NextResponse.json({ error: "geçersiz vibe" }, { status: 400 });

  await supabase
    .from("profiles")
    .update({ vibe: vibe || null, vibe_at: vibe ? new Date().toISOString() : null })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
