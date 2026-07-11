"use server";

import { createServerAuthClient } from "@/lib/supabase-auth-server";
import { isAuthConfigured } from "@/lib/supabase-auth";

export type ForgotState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendResetEmail(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  if (!isAuthConfigured) {
    return { status: "error", message: "Auth isn't configured yet." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // Always return "sent" — don't reveal whether the email exists.
  return { status: "sent", email };
}
