import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// reactToMoment — begen | ilginc | kaydet  (trigger affinity'yi günceller)
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { moment_id, type } = await request.json();
  if (!["begen", "ilginc", "kaydet"].includes(type))
    return NextResponse.json({ error: "geçersiz tepki" }, { status: 400 });

  await supabase
    .from("moment_reactions")
    .upsert({ moment_id, user_id: user.id, type }, { onConflict: "moment_id,user_id,type" });

  return NextResponse.json({ ok: true });
}
