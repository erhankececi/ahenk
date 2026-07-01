import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google) ve e-posta doğrulama dönüş ucu.
 * - PKCE 'code' akışı (OAuth + aynı tarayıcıda e-posta) → exchangeCodeForSession
 * - 'token_hash' akışı (e-posta, cihazdan bağımsız) → verifyOtp
 * Başarısızsa sessizce '/'ye atmaz; girişe bilgilendirmeyle yönlendirir.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/login?dogrulama=hata`);
    return NextResponse.redirect(`${origin}${dest}`);
  }
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) return NextResponse.redirect(`${origin}/login?dogrulama=hata`);
    return NextResponse.redirect(`${origin}${dest === "/" ? "/onboarding" : dest}`);
  }
  return NextResponse.redirect(`${origin}/login?dogrulama=hata`);
}
