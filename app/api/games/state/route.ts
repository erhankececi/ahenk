import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { viewFor, type OkeyState } from "@/lib/okey";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const tableId = new URL(req.url).searchParams.get("tableId");
  if (!tableId) return NextResponse.json({ error: "eksik" }, { status: 400 });

  const admin = createAdminClient();
  const { data: seat } = await admin.from("game_seats").select("seat_no").eq("table_id", tableId).eq("user_id", user.id).maybeSingle();
  if (!seat) return NextResponse.json({ error: "masada_degil" }, { status: 403 });

  const { data: gs } = await admin.from("game_state").select("state").eq("table_id", tableId).maybeSingle();
  if (!gs) return NextResponse.json({ started: false });
  return NextResponse.json(viewFor(gs.state as OkeyState, seat.seat_no));
}
