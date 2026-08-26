import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { postLoginPath } from "@/lib/supabase-auth";
import { LoginForm } from "@/components/login-form";
import { Reveal } from "@/components/reveal";
import { Kicker } from "@/components/ui";
import { AuthShell } from "@/components/auth-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectParam =
    typeof params.redirect === "string" ? params.redirect : "";
  const redirectTo =
    redirectParam.startsWith("/account") || redirectParam.startsWith("/admin")
      ? redirectParam
      : "";

  // Already signed in? Skip the form and route by role.
  const user = await getSessionUser();
  if (user) redirect(redirectTo || postLoginPath(user));

  return (
    <AuthShell>
        <Reveal>
          <Kicker>Welcome back</Kicker>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-charcoal">
            Sign in
          </h1>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <LoginForm redirectTo={redirectTo} />
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <p className="text-sm text-ink-soft">
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-green hover:underline"
            >
              Create an account
            </Link>
          </p>
        </Reveal>
    </AuthShell>
  );
}
