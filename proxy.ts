import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isManagerEmail } from "@/lib/supabase-auth";

/**
 * Next.js 16 "Proxy" (formerly Middleware). Refreshes the Supabase session
 * cookie and guards two areas:
 *   - `/account/**` — any signed-in user (guests' own bookings).
 *   - `/admin/**`   — managers only (`isManagerEmail`).
 * Anyone who fails the check is sent to `/login?redirect=…`. The `matcher` keeps
 * it off every other route.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");

  const toLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  };

  // Not configured → no session is possible; send to login.
  if (!url || !key) return toLogin();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return toLogin();
  // Admin routes additionally require a manager email.
  if (isAdmin && !isManagerEmail(user.email)) return toLogin();

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
