/**
 * Browser-safe Supabase Auth config + helpers (no `next/headers`, edge-safe).
 *
 * Auth uses the **anon / publishable** key (NOT the service-role key), exposed
 * to the browser via `NEXT_PUBLIC_` so the SSR auth flow can run in the browser,
 * Server Components, Server Actions, and the proxy. Data reads still go through
 * the server-only service-role client in `lib/supabase-server.ts`.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

export const SUPABASE_AUTH_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the public auth env vars are present. */
export const isAuthConfigured = Boolean(SUPABASE_AUTH_URL && SUPABASE_ANON_KEY);

/** Supabase client for use in the browser (Client Components). */
export function createBrowserSupabase() {
  return createBrowserClient(
    SUPABASE_AUTH_URL as string,
    SUPABASE_ANON_KEY as string,
  );
}

/**
 * Whether an authenticated email may access the manager area. The
 * `MANAGER_EMAILS` allowlist is **required**: now that normal guests can sign
 * up, an empty/unset allowlist grants admin to **no one** (otherwise every
 * public signup would become a manager). Pure + edge-safe so the proxy can call
 * it. Manager accounts are still provisioned in the Supabase dashboard.
 */
export function isManagerEmail(email: string | null | undefined): boolean {
  const list = (process.env.MANAGER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false;
  return list.includes((email ?? "").toLowerCase());
}

/** Where to send a user after signing in, by role: managers to the admin area,
 *  everyone else to their personal bookings. */
export function postLoginPath(user: User | null | undefined): string {
  return user && isManagerEmail(user.email) ? "/admin/manage" : "/account";
}
