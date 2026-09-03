import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Staging is intentionally locked down: visitors may only see the public
// introduction, authentication, test instructions and legal/contact pages.
// Every actual JOUKKO feature requires an authenticated user.
const privateRoutes = [
  "/admin",
  "/joukot",
  "/minun",
  "/perusta",
  "/tarjoukset",
  "/tekoaly",
  "/yritys"
];

export async function middleware(request: NextRequest) {
  const previewToken = process.env.PREVIEW_ACCESS_TOKEN;

  if (previewToken && request.cookies.get("joukko_preview_access")?.value !== previewToken) {
    if (request.nextUrl.searchParams.get("preview_access") === previewToken) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete("preview_access");
      const accessResponse = NextResponse.redirect(cleanUrl);
      accessResponse.cookies.set("joukko_preview_access", previewToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 14,
        path: "/"
      });
      accessResponse.headers.set("Cache-Control", "no-store");
      accessResponse.headers.set("Referrer-Policy", "no-referrer");
      accessResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
      return accessResponse;
    }

    return new NextResponse("Sivua ei löytynyt.", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Robots-Tag": "noindex, nofollow"
      }
    });
  }

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = privateRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!url || !anonKey) {
    return isPrivateRoute ? redirectToLogin(request, pathname) : response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data } = await supabase.auth.getUser();

  if (isPrivateRoute && !data.user) {
    return redirectToLogin(request, pathname);
  }

  return response;
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/kirjaudu";
  redirectUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
