import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { purgeUserStorage } from "@/lib/storage";

/**
 * Hesabı KALICI siler — App Store 5.1.1(v) / Google Play / KVKK.
 * GÜVENLİK: id istemciden ALINMAZ; yalnız oturum sahibi (auth.getUser) KENDİ
 * hesabını siler. profiles.id → auth.users(id) ON DELETE CASCADE olduğundan
 * auth.users silinince profil + tüm child satırlar (eşleşme, mesaj, etkileşim,
 * bildirim, jeton defteri, ziyaret, blok, rapor, abonelik…) otomatik gider.
 * Storage cascade ile silinmez → ayrıca temizlenir. GERİ DÖNÜŞÜ YOKTUR.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const admin = createAdminClient();
  const uid = user.id;

  // 1) Storage yollarını DB satırları SİLİNMEDEN ÖNCE topla (cascade sonrası kaybolur).
  const extra: { bucket: string; path: string }[] = [];

  const { data: photoRows } = await admin
    .from("photos")
    .select("path, preview_path")
    .eq("user_id", uid);
  for (const r of photoRows || []) {
    if (r.path) extra.push({ bucket: "photos", path: r.path });
    if (r.preview_path) extra.push({ bucket: "previews", path: r.preview_path });
  }

  const { data: prof } = await admin
    .from("profiles")
    .select("voice_card_path")
    .eq("id", uid)
    .single();
  if (prof?.voice_card_path) extra.push({ bucket: "media", path: prof.voice_card_path });

  // Sohbet medyası (kullanıcının gönderdiği) + story/moment medyası → 'media' kovası
  const mediaTables: { table: string; col: string }[] = [
    { table: "messages", col: "sender_id" },
    { table: "stories", col: "user_id" },
    { table: "moments", col: "user_id" },
  ];
  for (const { table, col } of mediaTables) {
    const { data } = await admin
      .from(table)
      .select("media_path")
      .eq(col, uid)
      .not("media_path", "is", null);
    for (const row of data || []) {
      if (row.media_path) extra.push({ bucket: "media", path: row.media_path });
    }
  }

  // 2) DB + auth kaydını sil. Tercihen atomik RPC (schema_v13); yoksa Admin API'ye düş.
  const { error: rpcError } = await admin.rpc("delete_account", { p_user: uid });
  if (rpcError) {
    // Fallback: göç çalıştırılmadıysa eşdeğeri Admin API + elle PII temizliği ile yap.
    await admin.from("subscription_events").delete().eq("user_id", uid);
    const { error: delError } = await admin.auth.admin.deleteUser(uid);
    if (delError) {
      return NextResponse.json({ ok: false, error: "silme_basarisiz" }, { status: 500 });
    }
  }

  // 3) Depolama temizliği (best-effort; hesap zaten silindi, blob'lar engellemesin).
  let storageWarnings: string[] = [];
  try {
    storageWarnings = await purgeUserStorage(admin, uid, extra);
  } catch {
    storageWarnings = ["storage_purge_exception"];
  }

  return NextResponse.json({ ok: true, storageWarnings });
}
