import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buzKirici } from "@/lib/icebreakers";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const matchId = new URL(request.url).searchParams.get("matchId");
  if (!matchId) return NextResponse.json({ error: "matchId gerekli" }, { status: 400 });

  // önbellek: daha önce üretildiyse onu döndür
  const { data: cached } = await supabase
    .from("match_icebreakers")
    .select("questions")
    .eq("match_id", matchId)
    .maybeSingle();
  if (cached) return NextResponse.json({ questions: cached.questions });

  const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (!match || (match.user_a !== user.id && match.user_b !== user.id))
    return NextResponse.json({ error: "yetkisiz" }, { status: 403 });

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: me } = await supabase.from("profiles").select("interests").eq("id", user.id).single();
  const { data: other } = await supabase.from("profiles_card").select("interests").eq("id", otherId).single();

  const questions = buzKirici(me?.interests || [], other?.interests || []);
  await supabase.from("match_icebreakers").insert({ match_id: matchId, questions });

  return NextResponse.json({ questions });
}
