"use client";

import { useState } from "react";
import { Button } from "./ui";
import { CheckIcon } from "./icons";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-charcoal/15 bg-surface px-4 py-3 text-charcoal placeholder:text-ink-soft/60 transition-colors focus:border-green focus:outline-none focus-visible:outline-2 focus-visible:outline-green";

/**
 * Contact form — UI only for now. On submit it shows a confirmation state
 * locally; wiring it to email/Supabase later is a drop-in change.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl bg-green/10 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-display text-2xl text-charcoal">
          Thank you, message received
        </h3>
        <p className="mt-2 text-ink-soft">
          This is a demo form, so nothing was sent yet. We’ll reply within a day
          once it’s connected.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSent(false)}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="text-sm font-medium text-charcoal">
            Your name
          </label>
          <input
            id="c-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Amani Juma"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="text-sm font-medium text-charcoal">
            Email
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-subject" className="text-sm font-medium text-charcoal">
          Subject
        </label>
        <input
          id="c-subject"
          name="subject"
          type="text"
          className={fieldClass}
          placeholder="A question about our rooms"
        />
      </div>

      <div>
        <label htmlFor="c-message" className="text-sm font-medium text-charcoal">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={5}
          className={`${fieldClass} resize-y`}
          placeholder="Tell us how we can help…"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" className="px-8">
          Send message
        </Button>
        <p className="text-sm text-ink-soft">We usually reply within a day.</p>
      </div>
    </form>
  );
}
