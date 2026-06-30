"use server";

import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase-auth-server";
import { isAuthConfigured, postLoginPath } from "@/lib/supabase-auth";

export type LoginState =
  | { status: "idle" }
  | { status: "error"; message: string };

/** Only allow internal /account or /admin destinations (no open redirects).
 *  An empty/unknown target means "use the role-based default" (null). */
function safeRedirect(target: string): string | null {
  return target.startsWith("/account") || target.startsWith("/admin")
    ? target
    : null;
}

/** Sign a user in with email + password and route them by role. */
export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured) {
    return {
      status: "error",
      message:
        "Sign-in isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requested = safeRedirect(String(formData.get("redirect") ?? ""));

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  const supabase = await createServerAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: "error", message: "Invalid email or password." };
  }

  // Honour an explicit (safe) destination, else send by role. Guard against a
  // non-manager deep-linking to /admin by falling back to the role default.
  const roleDefault = postLoginPath(data.user);
  const target =
    requested && (!requested.startsWith("/admin") || roleDefault === "/admin/manage")
      ? requested
      : roleDefault;

  // Throws internally to navigate — must be outside any try/catch.
  redirect(target);
}
