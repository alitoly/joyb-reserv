"use client";

import type { AvailabilityResult } from "@/lib/types";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";

/** Live availability state for the selected room type + dates. `unconfigured`
 *  means the DB env vars are missing on the server. */
export type AvailState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "result"; data: AvailabilityResult }
  | { kind: "unconfigured" }
  | { kind: "error" };

/** Inline availability feedback (checking / available (free of pool) / sold
 *  out) for the booking form. */
export function AvailabilityBanner({ avail }: { avail: AvailState }) {
  return (
    <div aria-live="polite" className="min-h-[1.5rem]">
      {avail.kind === "checking" && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <SpinnerIcon className="h-4 w-4" /> Checking availability…
        </p>
      )}

      {avail.kind === "unconfigured" && (
        <p className="bg-sand-deep px-4 py-3 text-sm text-charcoal/80">
          Live availability isn&apos;t connected yet, but you can still send a
          request and we&apos;ll confirm by email.
        </p>
      )}

      {avail.kind === "error" && (
        <p className="text-sm text-rust-strong">
          Couldn&apos;t check availability just now. You can still submit your
          request.
        </p>
      )}

      {avail.kind === "result" &&
        (avail.data.available ? (
          <p className="flex items-center gap-2 bg-green/10 px-4 py-3 text-sm font-medium text-green-strong">
            <CheckIcon className="h-5 w-5 shrink-0" />
            {avail.data.message}
          </p>
        ) : (
          <div className="bg-rust/10 px-4 py-3 text-rust-strong">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertIcon className="h-5 w-5 shrink-0" />
              {avail.data.message}
            </p>
          </div>
        ))}
    </div>
  );
}
