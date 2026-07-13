"use server";

import { revalidatePath } from "next/cache";
import { getServerSupabase } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { isManagerEmail } from "@/lib/supabase-auth";
import { CANCELLED_RESERVATION_STATUS } from "@/lib/types";

export type CancelState = { ok: boolean; message?: string };

/**
 * Cancel a reservation from the admin calendar. Re-verifies the manager
 * server-side (never trust the client), then flips the status to "Cancelled" —
 * which also frees the dates, since that status is non-blocking for availability.
 */
export async function cancelReservation(
  _prev: CancelState,
  formData: FormData,
): Promise<CancelState> {
  const user = await getSessionUser();
  if (!user || !isManagerEmail(user.email)) {
    return { ok: false, message: "Not authorised." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Invalid booking." };
  }

  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, message: "Database unavailable." };

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: CANCELLED_RESERVATION_STATUS })
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("cancelReservation failed:", error.message);
    // Admin-only page: surface the real reason (e.g. a missing UPDATE grant
    // on the shared reception DB) instead of a blind "try again".
    return { ok: false, message: `Couldn't cancel: ${error.message}` };
  }
  // PostgREST reports no error when the update matched zero rows — without
  // this check the UI would show "Cancelled" while the DB kept the booking.
  if (!data || data.length === 0) {
    return {
      ok: false,
      message: "Booking not found — refresh and try again.",
    };
  }

  revalidatePath("/admin/manage");
  revalidatePath("/admin/reservations");
  return { ok: true };
}
