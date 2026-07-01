import { createBrowserClient } from "@supabase/ssr";

// Oturum çerezleri için AÇIK kalıcı seçenekler. Bazı tarayıcılarda (özellikle iOS
// Safari) varsayılan "session" çerezleri sayfa yenilemede güvenilmez olabiliyor →
// açık maxAge + secure + sameSite=lax ile çerez KALICI olur ve yenilemede oturum korunur.
export const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: true,
  maxAge: 60 * 60 * 24 * 400, // 400 gün (tarayıcı üst sınırı)
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookieOptions: COOKIE_OPTIONS }
  );
}
