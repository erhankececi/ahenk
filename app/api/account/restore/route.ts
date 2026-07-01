import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Kullanıcının KENDİ soft-delete edilmiş hesabını geri yüklemesi (yanlışlıkla
 * silme kurtarma). Oturum hâlâ geçerli olduğundan (auth.users silinmedi) kullanıcı
 * tekrar giriş yapıp bu uçla hesabını geri alır. deleted_at = null → her şey döner.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin.rpc("restore_account", { p_user: user.id });
  if (error) return NextResponse.json({ ok: false, error: "geri_yukleme_basarisiz" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
