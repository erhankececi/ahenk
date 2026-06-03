import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * E-posta doğrulama (cihazdan bağımsız). Supabase maili token_hash ile gelir;
 * verifyOtp PKCE code_verifier çerezi GEREKTİRMEZ → kullanıcı maili farklı
 * tarayıcı/cihazda açsa bile doğrulama çalışır. (PKCE 'code' akışının aksine.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/onboarding";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
  }
  // Süresi geçmiş/geçersiz link → giriş ekranına bilgilendirmeyle yönlendir.
  return NextResponse.redirect(`${origin}/login?dogrulama=hata`);
}
