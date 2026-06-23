import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Herkese açık yollar (giriş gerektirmez)
const PUBLIC = ["/", "/login", "/register"];
const AUTH_PAGES = ["/login", "/register"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC.includes(path);
  const isAuth = AUTH_PAGES.includes(path);

  // Giriş yapmamış kullanıcı korumalı sayfaya giremez
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Giriş yapmış kullanıcı login/register'a giderse panele yönlendirilir
  if (user && isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/ogrenci";
    return NextResponse.redirect(url);
  }

  return response;
}
