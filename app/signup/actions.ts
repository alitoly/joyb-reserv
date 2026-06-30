"use server";

import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase-auth-server";
import { isAuthConfigured } from "@/lib/supabase-auth";

export type SignupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "check-email"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create a guest account with email + password. When Supabase has email
 * confirmation enabled, no session comes back — we show a "check your email"
 * state. When confirmation is off, the session cookie is set here (this runs in
 * a Server Action, so cookie writes succeed) and we go straight to /account.
 */
export async function signUp(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  if (!isAuthConfigured) {
    return {
      status: "error",
      message:
        "Sign-up isn't configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { status: "error", message: "Please tell us your name." };
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "That email doesn't look right." };
  }
  if (password.length < 8) {
    return {
      status: "error",
      message: "Use a password of at least 8 characters.",
    };
  }

  const supabase = await createServerAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // Email-confirmation flow: a user exists but there's no active session yet.
  if (!data.session) {
    return { status: "check-email", email };
  }

  // Confirmation disabled — the session cookie is set; head to the account area.
  redirect("/account");
}
