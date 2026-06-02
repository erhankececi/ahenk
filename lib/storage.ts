import type { SupabaseClient } from "@supabase/supabase-js";

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Public (bulanık) önizleme URL'i — keşif/sohbet bulanık görseli için. */
export function previewUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${BASE}/storage/v1/object/public/previews/${path}`;
}

/**
 * Private 'photos' kovasındaki orijinal fotoğraf için imzalı URL üretir.
 * Sadece sunucuda kullanılır. Eşleşme + reveal kontrolünden SONRA çağrılmalı.
 */
export async function signPhoto(
  client: SupabaseClient,
  path: string | null | undefined,
  ttl = 3600
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await client.storage
    .from("photos")
    .createSignedUrl(path, ttl);
  if (error || !data) return null;
  return data.signedUrl;
}

/** Kullanıcının yüklediği dosyaların kovaya göre yerleşimi (yükleme kodundan). */
const USER_BUCKETS = ["photos", "previews", "media", "voice"] as const;

/**
 * Hesap silmede kullanıcının TÜM depolama nesnelerini temizler (service-role).
 * Hem DB'den toplanan açık yolları (extra) hem de her kovadaki '{userId}/' klasörünü
 * süpürür; ayrıca 'media' kovasındaki legacy ses kartı yolunu ('voice/{userId}-...')
 * yakalar. Best-effort: hata listesini döndürür, fırlatmaz (silme engellenmesin).
 */
export async function purgeUserStorage(
  admin: SupabaseClient,
  userId: string,
  extra: { bucket: string; path: string }[] = []
): Promise<string[]> {
  const byBucket: Record<string, Set<string>> = {};
  const add = (bucket: string, path?: string | null) => {
    if (!path) return;
    (byBucket[bucket] ||= new Set()).add(path);
  };

  // 1) DB'den gelen açık yollar (photos.path/preview_path, voice_card_path, media_path)
  for (const e of extra) add(e.bucket, e.path);

  // 2) Klasör taraması: her kovada '{userId}/' altındaki dosyalar
  for (const bucket of USER_BUCKETS) {
    const { data } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
    for (const f of data || []) add(bucket, `${userId}/${f.name}`);
  }

  // 3) Legacy: 'media' kovasında ses kartları 'voice/{userId}-...' adıyla yazılıyor
  const { data: voiceList } = await admin.storage.from("media").list("voice", { limit: 1000 });
  for (const f of voiceList || []) {
    if (f.name.startsWith(`${userId}-`)) add("media", `voice/${f.name}`);
  }

  // 4) Kovaya göre topluca sil
  const errors: string[] = [];
  for (const [bucket, paths] of Object.entries(byBucket)) {
    if (paths.size === 0) continue;
    const { error } = await admin.storage.from(bucket).remove(Array.from(paths));
    if (error) errors.push(`${bucket}: ${error.message}`);
  }
  return errors;
}
