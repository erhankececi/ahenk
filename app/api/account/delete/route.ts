import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Hesabı SOFT-DELETE eder (kalıcı silmez). profiles.deleted_at işaretlenir;
 * tüm veriler (profil, mesaj, eşleşme, foto, jeton…) KORUNUR. Kullanıcı erişimi
 * kapanır, keşfette görünmez. Yanlışlıkla silerse tekrar giriş yapıp geri yükler;
 * admin de panelden geri yükleyebilir. Kalıcı silme yalnız admin'in açık talebiyle.
 * GÜVENLİK: id istemciden alınmaz; yalnız oturum sahibi kendi hesabını siler.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.rpc("soft_delete_account", { p_user: user.id });
  if (error) return NextResponse.json({ ok: false, error: "silme_basarisiz" }, { status: 500 });

  // Oturumu kapat (kullanıcı çıkış yapmış olur; tekrar girerse geri yükleme ekranı).
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true, soft: true });
}
