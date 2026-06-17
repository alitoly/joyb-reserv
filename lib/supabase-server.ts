import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase access for the live reservation database.
 *
 * Uses the project's `service_role` key, which **bypasses RLS** — so it must
 * NEVER reach the browser. The `server-only` import above turns any accidental
 * client-side import into a build error. All reads/writes happen in Server
 * Components, Route Handlers, and Server Actions, and select non-PII columns.
 *
 * Config is read from server-only env vars (no `NEXT_PUBLIC_` prefix):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * When they're absent, helpers return `null` and the app degrades gracefully.
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

let cached: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
