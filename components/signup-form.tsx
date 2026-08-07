"use client";

import { useActionState } from "react";
import { signUp, type SignupState } from "@/app/signup/actions";
import { Button } from "./ui";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";

const fieldBase =
  "mt-1.5 w-full  border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green border-charcoal/15 focus:border-green";

const initialState: SignupState = { status: "idle" };

/** Guest sign-up form. Name + email + password, with error / loading / success
 *  ("check your email") states mirroring the booking + login forms. */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state.status === "check-email") {
    return (
      <div
        className="bg-surface p-8 ring-1 ring-charcoal/5"
        role="status"
        aria-live="polite"
      >
        <span className="flex h-12 w-12 items-center justify-center bg-green text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl text-charcoal">
          Confirm your email
        </h2>
        <p className="mt-2 text-ink-soft">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-charcoal">{state.email}</span>. Open
          it to finish setting up your account, then sign in.
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
        <legend className="sr-only">Create an account</legend>

        <div>
          <label htmlFor="name" className="text-sm font-medium text-charcoal">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={fieldBase}
            placeholder="Amani Juma"
          />
        </div>

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
          <label
            htmlFor="password"
            className="text-sm font-medium text-charcoal"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={fieldBase}
            placeholder="At least 8 characters"
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
            <SpinnerIcon className="h-5 w-5" /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
