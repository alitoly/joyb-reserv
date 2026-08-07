"use client";

import { useActionState } from "react";
import { sendResetEmail, type ForgotState } from "@/app/forgot-password/actions";
import { Button } from "./ui";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";

const fieldBase =
  "mt-1.5 w-full  border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green border-charcoal/15 focus:border-green";

const initialState: ForgotState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(sendResetEmail, initialState);

  if (state.status === "sent") {
    return (
      <div
        className="bg-surface p-8 ring-1 ring-charcoal/5"
        role="status"
        aria-live="polite"
      >
        <span className="flex h-12 w-12 items-center justify-center bg-green text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl text-charcoal">Check your inbox</h2>
        <p className="mt-2 text-ink-soft">
          If <span className="font-medium text-charcoal">{state.email}</span> has an
          account, a password reset link is on its way. Check your spam folder if you
          don&apos;t see it within a few minutes.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-surface p-6 ring-1 ring-charcoal/5 sm:p-9"
      noValidate
    >
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
        <legend className="sr-only">Reset password</legend>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-charcoal">
            Email address
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
      </fieldset>

      <Button type="submit" variant="primary" className="mt-7 w-full" disabled={pending}>
        {pending ? (
          <>
            <SpinnerIcon className="h-5 w-5" /> Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
