import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase access.
 *
 * Only the public URL + anon key are used (per project requirements), so the
 * same configuration works on the server and in the browser. Security is
 * enforced by Row Level Security policies in `supabase-schema.sql`:
 * anyone may READ availability and INSERT a pending website booking; nobody
 * may update/delete through this key.
 *
 * No secret is ever hardcoded. If the env vars are absent the helpers return
 * `null` and the app degrades gracefully (marketing pages still render).
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
