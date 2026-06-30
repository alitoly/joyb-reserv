import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_AUTH_URL,
  isAuthConfigured,
} from "./supabase-auth";

/**
 * Cookie-bound Supabase Auth client for Server Components, Server Actions, and
 * Route Handlers. Reads/writes the session via Next's async cookie store.
 *
 * Writing cookies only works from a Server Action or Route Handler; when called
 * from a (read-only) Server Component the write throws and is ignored — the
 * proxy refreshes the session cookie on the next request instead.
 */
export async function createServerAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    SUPABASE_AUTH_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options as CookieOptions);
            }
          } catch {
            // Called from a Server Component — ignore (proxy handles refresh).
          }
        },
      },
    },
  );
}

/** The currently authenticated user, or null when signed out / unconfigured. */
export async function getSessionUser(): Promise<User | null> {
  if (!isAuthConfigured) return null;
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
