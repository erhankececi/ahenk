// Google ile giriş — ortama göre dallanır.
//  • WEB: mevcut Supabase OAuth akışı (signInWithOAuth → /auth/callback). Sayfa
//    yönlenir; çağıran tarafın ekstra iş yapmasına gerek yok.
//  • NATIVE (Capacitor/Android): gömülü WebView'de accounts.google.com açılırsa
//    Google "disallowed_useragent" ile engeller. Bu yüzden native Google Sign-In
//    eklentisinden idToken alınır ve Supabase'e signInWithIdToken ile geçilir.
//    serverClientId = Supabase'te tanımlı WEB OAuth client ID (env'den; secret değil).
import { isNativeApp } from "@/lib/purchases";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GoogleResult = { native: boolean; ok: boolean; error?: string };

export async function googleSignIn(supabase: SupabaseClient): Promise<GoogleResult> {
  // ---- WEB ----
  if (!isNativeApp()) {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    return { native: false, ok: true }; // tarayıcı yönlenmesi başladı
  }

  // ---- NATIVE (Android/iOS) ----
  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
    // initialize idempotent; clientId = WEB client ID (serverClientId olarak kullanılır)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;
    try {
      await GoogleAuth.initialize({ clientId, scopes: ["profile", "email"], grantOfflineAccess: false });
    } catch {
      /* zaten initialize edilmiş olabilir */
    }
    const res: any = await GoogleAuth.signIn();
    const idToken: string | undefined = res?.authentication?.idToken;
    if (!idToken) return { native: true, ok: false, error: "no_idtoken" };

    const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error) return { native: true, ok: false, error: error.message };
    return { native: true, ok: true };
  } catch (e: any) {
    return { native: true, ok: false, error: e?.message || "google_failed" };
  }
}
