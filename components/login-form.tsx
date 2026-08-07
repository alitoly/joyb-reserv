"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type LoginState } from "@/app/login/actions";
import { Button } from "./ui";
import { AlertIcon, SpinnerIcon } from "./icons";

const fieldBase =
  "mt-1.5 w-full  border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green border-charcoal/15 focus:border-green";

const initialState: LoginState = { status: "idle" };

/** Sign-in form. Email + password, with error and loading states. */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form
      action={formAction}
      className="bg-surface p-6 ring-1 ring-charcoal/5 sm:p-9"
      noValidate
    >
      <input type="hidden" name="redirect" value={redirectTo} />

      {state.status === "error" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 bg-rust/10 p-4 text-rust-strong"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      )}

      <fieldset className="grid gap-5" disabled={pending}>
        <legend className="sr-only">Sign in</legend>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-charcoal">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={fieldBase}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-charcoal">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-ink-soft hover:text-green"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={fieldBase}
            placeholder="••••••••"
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
            <SpinnerIcon className="h-5 w-5" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
