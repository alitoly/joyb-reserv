import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isManagerEmail } from "@/lib/supabase-auth";

/**
 * Next.js 16 "Proxy" (formerly Middleware). Runs on every page route so the
 * Supabase session cookie is refreshed wherever a signed-in user browses
 * (Server Components can't write cookies), and guards two areas:
 *   - `/account/**` — any signed-in user (guests' own bookings).
 *   - `/admin/**`   — managers only (`isManagerEmail`).
 * Anyone who fails a guard is sent to `/login?redirect=…`.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isProtected = isAdmin || pathname.startsWith("/account");

  const toLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  };

  // Not configured → no session is possible; only protected areas care.
  if (!url || !key) {
    return isProtected ? toLogin() : NextResponse.next({ request });
  }

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

  if (isProtected) {
    if (!user) return toLogin();
    // Admin routes additionally require a manager email.
    if (isAdmin && !isManagerEmail(user.email)) return toLogin();
  }

  return response;
}

export const config = {
  // Everything except Next.js internals and static assets, so the session
  // refresh above runs on public pages too.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
