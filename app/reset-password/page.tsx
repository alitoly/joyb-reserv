"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase, isAuthConfigured } from "@/lib/supabase-auth";
import { Button } from "@/components/ui";
import { AlertIcon, CheckIcon, SpinnerIcon } from "@/components/icons";
import { Kicker, Section } from "@/components/ui";
import { Reveal } from "@/components/reveal";

const fieldBase =
  "mt-1.5 w-full  border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green border-charcoal/15 focus:border-green";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Supabase puts the recovery token in the URL hash or as a `code` param.
  // Listening for PASSWORD_RECOVERY confirms the session is ready to update.
  useEffect(() => {
    if (!isAuthConfigured) return;
    const supabase = createBrowserSupabase();

    // Handle the code-based PKCE flow (query param)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => setReady(true));
      return;
    }

    // Handle the hash-based flow (older Supabase versions)
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setPending(true);
    const supabase = createBrowserSupabase();
    const { error: err } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (err) {
      setError(err.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  return (
    <Section className="py-16 sm:py-24" width="narrow">
      <div className="mx-auto max-w-md">
        <Reveal>
          <Kicker>Account</Kicker>
          <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-charcoal">
            Set a new password
          </h1>
        </Reveal>

        <Reveal delay={100} className="mt-8">
          {done ? (
            <div
              className="bg-surface p-8 ring-1 ring-charcoal/5"
              role="status"
              aria-live="polite"
            >
              <span className="flex h-12 w-12 items-center justify-center bg-green text-white">
                <CheckIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-2xl text-charcoal">
                Password updated
              </h2>
              <p className="mt-2 text-ink-soft">
                Your password has been changed. Redirecting you to sign in…
              </p>
            </div>
          ) : !ready ? (
            <div className="bg-surface p-8 ring-1 ring-charcoal/5 text-ink-soft">
              <SpinnerIcon className="h-6 w-6 text-green" />
              <p className="mt-3">Verifying your reset link…</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-surface p-6 ring-1 ring-charcoal/5 sm:p-9"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 bg-rust/10 p-4 text-rust-strong"
                >
                  <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <fieldset className="grid gap-5" disabled={pending}>
                <legend className="sr-only">New password</legend>
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-charcoal">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldBase}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="text-sm font-medium text-charcoal">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={fieldBase}
                    placeholder="Same password again"
                  />
                </div>
              </fieldset>

              <Button
                type="submit"
                variant="primary"
                className="mt-7 w-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <SpinnerIcon className="h-5 w-5" /> Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
