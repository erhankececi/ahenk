import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { distanceKm } from "@/lib/utils";

const MEDIA_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;

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

  // benim RSVP'lerim (niyet + onay durumu)
  const { data: myReqs } = await supabase
    .from("event_requests")
    .select("event_id, status, rsvp")
    .eq("user_id", user.id);
  const reqMap = new Map((myReqs || []).map((r) => [r.event_id, r]));

  // Sahibi olduğum etkinliklerin katılımcı dökümü (RLS: host okuyabilir).
  const ownedIds = (events || []).filter((e) => e.host_id === user.id).map((e) => e.id);
  const attendeesByEvent = new Map<string, any[]>();
  if (ownedIds.length) {
    const { data: reqs } = await supabase
      .from("event_requests")
      .select("event_id, user_id, status, rsvp")
      .in("event_id", ownedIds);
    const uids = Array.from(new Set((reqs || []).map((r) => r.user_id)));
    const { data: profs } = await supabase
      .from("profiles_card")
      .select("id, name")
      .in("id", uids.length ? uids : ["00000000-0000-0000-0000-000000000000"]);
    const nameMap = new Map((profs || []).map((p) => [p.id, p.name]));
    for (const r of reqs || []) {
      const arr = attendeesByEvent.get(r.event_id) || [];
      arr.push({ user_id: r.user_id, name: nameMap.get(r.user_id) || "Biri", status: r.status, rsvp: r.rsvp });
      attendeesByEvent.set(r.event_id, arr);
    }
  }

  const list = (events || [])
    .map((e) => ({
      ...e,
      cover: e.cover_path ? MEDIA_URL(e.cover_path) : null,
      host_name: hMap.get(e.host_id) || "Biri",
      mesafe: distanceKm(me?.lat, me?.lon, e.lat, e.lon),
      my_status: reqMap.get(e.id)?.status || null,
      my_rsvp: reqMap.get(e.id)?.rsvp || null,
      mine: e.host_id === user.id,
      attendees: e.host_id === user.id ? attendeesByEvent.get(e.id) || [] : undefined,
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

  const { title, type, description, starts_at, cover_path } = await request.json();
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
    cover_path: cover_path || null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
