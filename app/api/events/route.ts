import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { distanceKm } from "@/lib/utils";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("lat, lon").eq("id", user.id).single();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const hostIds = Array.from(new Set((events || []).map((e) => e.host_id)));
  const { data: hosts } = await supabase
    .from("profiles_card")
    .select("id, name")
    .in("id", hostIds.length ? hostIds : ["00000000-0000-0000-0000-000000000000"]);
  const hMap = new Map((hosts || []).map((h) => [h.id, h.name]));

  // benim isteklerim
  const { data: myReqs } = await supabase
    .from("event_requests")
    .select("event_id, status")
    .eq("user_id", user.id);
  const reqMap = new Map((myReqs || []).map((r) => [r.event_id, r.status]));

  const list = (events || [])
    .map((e) => ({
      ...e,
      host_name: hMap.get(e.host_id) || "Biri",
      mesafe: distanceKm(me?.lat, me?.lon, e.lat, e.lon),
      my_status: reqMap.get(e.id) || null,
      mine: e.host_id === user.id,
    }))
    .sort((a, b) => (a.mesafe ?? 9999) - (b.mesafe ?? 9999));

  return NextResponse.json({ events: list });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  const { title, type, description, starts_at } = await request.json();
  if (!title) return NextResponse.json({ error: "başlık gerekli" }, { status: 400 });

  const { data: me } = await supabase
    .from("profiles")
    .select("city, lat, lon")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("events").insert({
    host_id: user.id,
    title,
    type: type || "diger",
    description: description || null,
    city: me?.city,
    lat: me?.lat,
    lon: me?.lon,
    starts_at: starts_at || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
