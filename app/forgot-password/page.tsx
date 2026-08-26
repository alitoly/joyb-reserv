import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Reveal } from "@/components/reveal";
import { Kicker } from "@/components/ui";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
        <Reveal>
          <Kicker>Account</Kicker>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-charcoal">
            Forgot your password?
          </h1>
          <p className="mt-4 text-ink-soft">
            Enter your email and we&apos;ll send you a link to set a new one.
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-8">
          <ForgotPasswordForm />
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <p className="text-sm text-ink-soft">
            Remembered it?{" "}
            <Link href="/login" className="font-medium text-green hover:underline">
              Back to sign in
            </Link>
          </p>
        </Reveal>
    </AuthShell>
  );
}
