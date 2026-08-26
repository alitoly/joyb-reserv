import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { postLoginPath } from "@/lib/supabase-auth";
import { SignupForm } from "@/components/signup-form";
import { Reveal } from "@/components/reveal";
import { Kicker } from "@/components/ui";
import { AuthShell } from "@/components/auth-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  // Already signed in? Skip the form and route by role.
  const user = await getSessionUser();
  if (user) redirect(postLoginPath(user));

  return (
    <AuthShell>
        <Reveal>
          <Kicker>Guests</Kicker>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-charcoal">
            Create an account
          </h1>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <SignupForm />
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <p className="text-sm text-ink-soft">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-green hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Reveal>
    </AuthShell>
  );
}
