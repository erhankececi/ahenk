import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login", "/register", "/auth", "/_next", "/favicon", "/api/webhooks",
  // Şifre sıfırlama akışı (oturumsuz erişilebilir olmalı)
  "/sifremi-unuttum", "/sifre-yenile",
  // Herkese açık pazarlama + yasal + güvenlik sayfaları
  "/hakkinda", "/indir", "/guvenlik", "/gizlilik", "/kvkk", "/kosullar", "/hesap-sil",
  // Askıya alınan hesap bilgilendirme sayfası
  "/askida",
  // Soft-delete edilmiş hesap geri yükleme (kurtarma) sayfası
  "/hesap-silindi",
  // Sosyal paylaşım görseli + SEO + PWA + service worker (bot/crawler oturumsuz erişir)
  "/opengraph-image", "/twitter-image", "/robots.txt", "/sitemap.xml", "/manifest", "/sw.js", "/icon",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { path: "/", sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 400 },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p)) || path === "/";

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Yenilenen oturum çerezlerini redirect yanıtına KOPYALA (kaybolmasın).
    const redirectRes = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectRes.cookies.set(c));
    return redirectRes;
  }

  return response;
}
