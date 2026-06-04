import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { yas, overlapPercent } from "@/lib/utils";
import { vibeAktif, vibeBilgisi } from "@/lib/vibes";
import { previewUrl } from "@/lib/storage";

const VOICE_URL = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
const ONLINE_MS = 5 * 60 * 1000; // 5 dk içinde aktif = online
const NEW_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün içinde katılan = yeni

const ZERO = "00000000-0000-0000-0000-000000000000";

export async function GET(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "yetkisiz" }, { status: 401 });

  // ---- filtre parametreleri (SQL-seviyesinde uygulanır) ----
  const url = new URL(req.url);
  const kmParam = url.searchParams.get("km"); // "5".."500" | "all" | null
  const maxKm = !kmParam || kmParam === "all" ? null : parseInt(kmParam, 10) || null;
  const citiesParam = url.searchParams.get("cities");
  const cities = citiesParam
    ? citiesParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  const limit = Math.min(60, parseInt(url.searchParams.get("limit") || "40", 10) || 40);
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);
  const sort = url.searchParams.get("sort") || "smart";
  // 'uyum' SQL'de hesaplanmaz → RPC 'smart', sıralama JS'te (ortak ilgi yüzdesi).
  const rpcSort = sort === "uyum" ? "smart" : sort;
  const minAge = url.searchParams.get("minAge") ? parseInt(url.searchParams.get("minAge")!, 10) : null;
  const maxAge = url.searchParams.get("maxAge") ? parseInt(url.searchParams.get("maxAge")!, 10) : null;
  const verified = url.searchParams.get("verified") === "1";

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("profiles")
    .select("interests, hobbies, city, music, movies")
    .eq("id", user.id)
    .single();

  // Aday seçimi + toplam sayı: tamamen SQL'de (mesafe/şehir/eşleşme/blok/cinsiyet).
  const [{ data: rows }, { data: count }] = await Promise.all([
    admin.rpc("discover_candidates", {
      p_user: user.id,
      p_max_km: maxKm,
      p_cities: cities,
      p_limit: limit,
      p_offset: offset,
      p_sort: rpcSort,
      p_min_age: minAge,
      p_max_age: maxAge,
      p_verified: verified,
    }),
    admin.rpc("discover_count", { p_user: user.id, p_max_km: maxKm, p_cities: cities }),
  ]);

  const list = (rows || []) as any[];
  const ids = list.map((r) => r.id);
  const inIds = ids.length ? ids : [ZERO];

  const [{ data: photos }, { data: affRows }, { data: createdRows }] = await Promise.all([
    admin.from("photos").select("user_id, preview_path, position").in("user_id", inIds).order("position"),
    admin.from("affinities").select("user_a, user_b, score").or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    admin.from("profiles").select("id, created_at").in("id", inIds),
  ]);

  const photoMap = new Map<string, string[]>();
  (photos || []).forEach((ph) => {
    const u = previewUrl(ph.preview_path);
    if (!u) return;
    const a = photoMap.get(ph.user_id) || [];
    a.push(u);
    photoMap.set(ph.user_id, a);
  });
  const affMap = new Map<string, number>();
  (affRows || []).forEach((r) => {
    const o = r.user_a === user.id ? r.user_b : r.user_a;
    affMap.set(o, (affMap.get(o) || 0) + (r.score || 0));
  });
  const createdMap = new Map<string, string>();
  (createdRows || []).forEach((r) => createdMap.set(r.id, r.created_at));

  const now = Date.now();
  const meInt = [...(me?.interests || []), ...(me?.hobbies || [])];
  const meMusic: string[] = me?.music || [];
  const meMovies: string[] = me?.movies || [];

  const candidates = list.map((p) => {
    const candInt = [...(p.interests || []), ...(p.hobbies || [])];
    const overlap = overlapPercent(meInt, candInt);
    // "Neden uyumlu?" — somut nedenler (en fazla 3)
    const reasons: string[] = [];
    const sharedI = meInt.filter((x: string) => candInt.includes(x));
    if (sharedI.length) reasons.push(sharedI.length > 1 ? `${sharedI.length} ortak ilgi` : `Ortak ilgi: ${sharedI[0]}`);
    if (meMusic.some((x) => (p.music || []).includes(x))) reasons.push("Benzer müzik zevki");
    if (meMovies.some((x) => (p.movies || []).includes(x))) reasons.push("Ortak film/dizi");
    if (p.same_city && p.city) reasons.push(`Aynı şehir`);
    if (overlap >= 60) reasons.unshift("Yüksek karakter uyumu");
    const aktifVibe = vibeAktif(p.vibe, p.vibe_at) ? vibeBilgisi(p.vibe) : null;
    const lastMs = p.last_active ? new Date(p.last_active).getTime() : 0;
    const createdAt = createdMap.get(p.id);
    const createdMs = createdAt ? new Date(createdAt).getTime() : 0;
    const tier =
      p.premium_plan === "platinum"
        ? "platinum"
        : p.premium_plan === "plus"
          ? "plus"
          : p.premium_plan === "gold"
            ? "gold"
            : "free";
    return {
      id: p.id,
      name: p.name,
      age: yas(p.birthdate),
      city: p.city,
      profession: p.profession,
      bio: p.bio,
      interests: p.interests || [],
      hobbies: p.hobbies || [],
      music: p.music || [],
      movies: p.movies || [],
      zodiac: p.zodiac,
      is_verified: p.is_verified,
      photos: photoMap.get(p.id) || [],
      vibe: aktifVibe,
      voice_card: p.voice_card_path ? VOICE_URL(p.voice_card_path) : null,
      ortakYuzde: Math.min(100, overlap + Math.min(15, affMap.get(p.id) || 0)),
      reasons: reasons.slice(0, 3),
      mesafe: p.distance_km,
      sameCity: p.same_city,
      tier,
      boosted: !!p.boost_until && new Date(p.boost_until).getTime() > now,
      online: lastMs > now - ONLINE_MS,
      isNew: createdMs > now - NEW_MS,
      lastActive: p.last_active,
    };
  });

  // 'En uyumlu' sıralaması: boost'lular önde, sonra ortak ilgi yüzdesi.
  if (sort === "uyum") {
    candidates.sort((a, b) => Number(b.boosted) - Number(a.boosted) || b.ortakYuzde - a.ortakYuzde);
  }

  const online = candidates.filter((c) => c.online).length;
  const vibeCounts = candidates.reduce((acc, c) => {
    if (c.vibe) acc[c.vibe.label] = (acc[c.vibe.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const trendVibes = Object.entries(vibeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, n]) => ({ label, n }));

  return NextResponse.json({
    candidates,
    meta: {
      count: count ?? candidates.length,
      online,
      sehir: me?.city || null,
      filters: { km: maxKm, cities: cities || [] },
      trendVibes,
      hasMore: candidates.length === limit,
    },
  });
}
