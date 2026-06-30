"use client";

import { useActionState } from "react";
import {
  cancelReservation,
  type CancelState,
} from "@/app/admin/manage/actions";
import { Button } from "./ui";
import { AlertIcon, SpinnerIcon } from "./icons";

/** Inline "cancel this reservation" form, reused by the admin calendar and the
 *  reservations table. Uses the server action with optimistic pending state. */
export function CancelBookingForm({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState<CancelState, FormData>(
    cancelReservation,
    { ok: false },
  );

  if (state.ok) {
    return <span className="text-xs font-medium text-green">Cancelled</span>;
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="outline"
        className="px-4 py-2 text-xs"
        disabled={pending}
      >
        {pending ? (
          <>
            <SpinnerIcon className="h-4 w-4" /> Cancelling…
          </>
        ) : (
          "Cancel"
        )}
      </Button>
      {state.message && (
        <span className="inline-flex items-center gap-1 text-xs text-rust-strong">
          <AlertIcon className="h-4 w-4" /> {state.message}
        </span>
      )}
    </form>
  );
}
