import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const hash = (p: string) => createHash("sha256").update(`ahenk-game:${p}`).digest("hex");
const ZERO = "00000000-0000-0000-0000-000000000000";

// GET → açık masalar (şifre hash'i sızdırılmaz)
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });
  const admin = createAdminClient();

  const { data: tables } = await admin
    .from("game_tables")
    .select("id, name, host_id, capacity, kind, voice, video, status, created_at")
    .neq("status", "bitti")
    .order("created_at", { ascending: false })
    .limit(60);

  const ids = (tables || []).map((t) => t.id);
  const { data: seats } = await admin
    .from("game_seats").select("table_id, seat_no, user_id").in("table_id", ids.length ? ids : [ZERO]);
  const userIds = Array.from(new Set([...(tables || []).map((t) => t.host_id), ...(seats || []).map((s) => s.user_id)]));
  const { data: profs } = await admin
    .from("profiles_card").select("id, name, tier").in("id", userIds.length ? userIds : [ZERO]);
  const pMap = new Map((profs || []).map((p) => [p.id, p]));

  const seatMap = new Map<string, any[]>();
  (seats || []).forEach((s) => { const a = seatMap.get(s.table_id) || []; a.push(s); seatMap.set(s.table_id, a); });

  const list = (tables || []).map((t) => {
    const ts = (seatMap.get(t.id) || []).sort((a, b) => a.seat_no - b.seat_no);
    return {
      id: t.id, name: t.name, capacity: t.capacity, kind: t.kind, voice: t.voice, video: t.video,
      status: t.status, locked: t.kind === "sifreli",
      host: (pMap.get(t.host_id) as any)?.name || "Biri",
      players: ts.map((s) => ({ seat: s.seat_no, name: (pMap.get(s.user_id) as any)?.name || "?", tier: (pMap.get(s.user_id) as any)?.tier || "free", me: s.user_id === user.id })),
      seated: ts.length,
      mine: ts.some((s) => s.user_id === user.id),
    };
  });
  return NextResponse.json({ tables: list, me: user.id });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const admin = createAdminClient();

  if (body.action === "create") {
    const capacity = [2, 3, 4].includes(body.capacity) ? body.capacity : 4;
    const kind = ["acik", "sifreli", "vip"].includes(body.kind) ? body.kind : "acik";
    const pass_hash = kind === "sifreli" && body.password ? hash(String(body.password)) : null;
    const name = (body.name || "Masa").toString().slice(0, 40);
    const { data: t, error } = await admin
      .from("game_tables")
      .insert({ name, host_id: user.id, capacity, kind, pass_hash, voice: body.voice !== false, video: !!body.video })
      .select("id").single();
    if (error || !t) return NextResponse.json({ ok: false, error: error?.message }, { status: 400 });
    await admin.from("game_seats").insert({ table_id: t.id, seat_no: 0, user_id: user.id });
    return NextResponse.json({ ok: true, id: t.id });
  }

  if (body.action === "join") {
    const { data: t } = await admin.from("game_tables").select("id, capacity, kind, pass_hash, status").eq("id", body.tableId).single();
    if (!t) return NextResponse.json({ ok: false, error: "bulunamadi" }, { status: 404 });
    if (t.kind === "sifreli" && t.pass_hash !== hash(String(body.password || "")))
      return NextResponse.json({ ok: false, error: "sifre" }, { status: 403 });
    const { data: seats } = await admin.from("game_seats").select("seat_no, user_id").eq("table_id", t.id);
    if ((seats || []).some((s) => s.user_id === user.id)) return NextResponse.json({ ok: true, id: t.id });
    if ((seats || []).length >= t.capacity) return NextResponse.json({ ok: false, error: "dolu" }, { status: 409 });
    const taken = new Set((seats || []).map((s) => s.seat_no));
    let seat = 0; while (taken.has(seat)) seat++;
    const { error } = await admin.from("game_seats").insert({ table_id: t.id, seat_no: seat, user_id: user.id });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: t.id, seat });
  }

  if (body.action === "leave") {
    await admin.from("game_seats").delete().eq("table_id", body.tableId).eq("user_id", user.id);
    const { data: left } = await admin.from("game_seats").select("seat_no").eq("table_id", body.tableId);
    if (!left || left.length === 0) await admin.from("game_tables").delete().eq("id", body.tableId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "gecersiz" }, { status: 400 });
}
