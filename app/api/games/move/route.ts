import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { deal, draw, discard, finish, scores, viewFor, type OkeyState } from "@/lib/okey";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  const { tableId, action, source, tileId } = await req.json().catch(() => ({}));
  if (!tableId || !action) return NextResponse.json({ ok: false, error: "eksik" }, { status: 400 });

  const admin = createAdminClient();
  const { data: seatRow } = await admin.from("game_seats").select("seat_no").eq("table_id", tableId).eq("user_id", user.id).maybeSingle();
  if (!seatRow) return NextResponse.json({ ok: false, error: "masada_degil" }, { status: 403 });
  const mySeat = seatRow.seat_no;

  // BAŞLAT — yalnız masa sahibi
  if (action === "start") {
    const { data: table } = await admin.from("game_tables").select("host_id").eq("id", tableId).single();
    if (!table || table.host_id !== user.id) return NextResponse.json({ ok: false, error: "yalniz_sahibi" }, { status: 403 });
    const { data: seats } = await admin.from("game_seats").select("seat_no").eq("table_id", tableId).order("seat_no");
    const order = (seats || []).map((s) => s.seat_no);
    if (order.length < 2) return NextResponse.json({ ok: false, error: "az_oyuncu" }, { status: 400 });
    const state = deal(order);
    await admin.from("game_state").upsert({ table_id: tableId, state, updated_at: new Date().toISOString() });
    await admin.from("game_tables").update({ status: "oynuyor" }).eq("id", tableId);
    return NextResponse.json({ ok: true, view: viewFor(state, mySeat) });
  }

  const { data: gs } = await admin.from("game_state").select("state").eq("table_id", tableId).maybeSingle();
  if (!gs) return NextResponse.json({ ok: false, error: "oyun_yok" }, { status: 400 });
  const state = gs.state as OkeyState;

  // YENİ EL — yalnız sahibi, oyun bitince
  if (action === "newhand") {
    const { data: table } = await admin.from("game_tables").select("host_id").eq("id", tableId).single();
    if (!table || table.host_id !== user.id) return NextResponse.json({ ok: false, error: "yalniz_sahibi" }, { status: 403 });
    const { data: seats } = await admin.from("game_seats").select("seat_no").eq("table_id", tableId).order("seat_no");
    const fresh = deal((seats || []).map((s) => s.seat_no));
    await admin.from("game_state").upsert({ table_id: tableId, state: fresh, updated_at: new Date().toISOString() });
    await admin.from("game_tables").update({ status: "oynuyor" }).eq("id", tableId);
    return NextResponse.json({ ok: true, view: viewFor(fresh, mySeat) });
  }

  let res: { ok: boolean; error?: string } = { ok: false, error: "gecersiz" };
  if (action === "draw") res = draw(state, mySeat, source === "discard" ? "discard" : "deck");
  else if (action === "discard") res = discard(state, mySeat, tileId);
  else if (action === "finish") res = finish(state, mySeat, tileId);

  if (!res.ok) return NextResponse.json({ ok: false, error: res.error });

  // Bitiş → puanları game_stats'e işle + masayı 'bitti'
  if (action === "finish" && state.finishedBy != null) {
    const sc = scores(state);
    // koltuk → user_id eşle
    const { data: seatUsers } = await admin.from("game_seats").select("seat_no, user_id").eq("table_id", tableId);
    const uidOf = new Map((seatUsers || []).map((r) => [r.seat_no, r.user_id]));
    for (const seatNo of Object.keys(sc)) {
      const uid = uidOf.get(Number(seatNo));
      if (!uid) continue;
      const r = sc[Number(seatNo)];
      const { data: cur } = await admin.from("game_stats").select("games, wins, points").eq("user_id", uid).maybeSingle();
      await admin.from("game_stats").upsert({
        user_id: uid,
        games: (cur?.games || 0) + 1,
        wins: (cur?.wins || 0) + (r.win ? 1 : 0),
        points: (cur?.points || 0) + (r.win ? 10 : -Math.min(20, Math.round(r.penalty / 5))),
      });
    }
    await admin.from("game_tables").update({ status: "bitti" }).eq("id", tableId);
  }

  await admin.from("game_state").upsert({ table_id: tableId, state, updated_at: new Date().toISOString() });
  return NextResponse.json({ ok: true, view: viewFor(state, mySeat) });
}
