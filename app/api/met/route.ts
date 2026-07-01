import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** "Yüz yüze görüştük" onayı. İki taraf da onaylarsa görüşüldü rozeti + kimya. */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { matchId } = await req.json().catch(() => ({}));
  if (!matchId) return NextResponse.json({ ok: false, error: "eksik" }, { status: 400 });

  const { data, error } = await supabase.rpc("confirm_met", { p_match: matchId });
  if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 400 });
  return NextResponse.json(data ?? { ok: true });
}
