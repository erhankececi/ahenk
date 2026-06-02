import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Admin moderasyon aksiyonları. YALNIZ is_admin kullanıcı çağırabilir
 * (oturumdan doğrulanır). Eylemler service-role ile uygulanır.
 *   resolve_report { reportId }      → şikayeti kapat
 *   verify        { userId, value }  → doğrulanmış rozeti aç/kapat
 *   ban           { userId, value }  → yasakla / yasağı kaldır
 *   delete_user   { userId }         → hesabı kalıcı sil (delete_account RPC)
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "yetkisiz" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ ok: false, error: "yasak" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string;
  const admin = createAdminClient();

  if (action === "resolve_report" && body.reportId) {
    await admin.from("reports").update({ status: "kapandi" }).eq("id", body.reportId);
    return NextResponse.json({ ok: true });
  }
  if (action === "verify" && body.userId) {
    await admin.from("profiles").update({ is_verified: !!body.value }).eq("id", body.userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "verify_review" && body.userId) {
    const approve = !!body.approve;
    await admin
      .from("profiles")
      .update(
        approve
          ? { is_verified: true, verification_status: "approved" }
          : { verification_status: "rejected" }
      )
      .eq("id", body.userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "ban" && body.userId) {
    await admin
      .from("profiles")
      .update({ banned: !!body.value, banned_at: body.value ? new Date().toISOString() : null })
      .eq("id", body.userId);
    return NextResponse.json({ ok: true });
  }
  if (action === "delete_user" && body.userId) {
    if (body.userId === user.id) {
      return NextResponse.json({ ok: false, error: "kendini_silemezsin" }, { status: 400 });
    }
    const { error } = await admin.rpc("delete_account", { p_user: body.userId });
    if (error) return NextResponse.json({ ok: false, error: "db" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "bad_action" }, { status: 400 });
}
