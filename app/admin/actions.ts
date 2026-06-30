"use server";

import { redirect } from "next/navigation";
import { createServerAuthClient } from "@/lib/supabase-auth-server";
import { isAuthConfigured } from "@/lib/supabase-auth";

/** Sign the current user out and return to the home page. */
export async function signOut() {
  if (isAuthConfigured) {
    const supabase = await createServerAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
