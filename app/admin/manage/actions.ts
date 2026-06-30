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

  const { error } = await supabase
    .from("reservations")
    .update({ status: CANCELLED_RESERVATION_STATUS })
    .eq("id", id);

  if (error) {
    console.error("cancelReservation failed:", error.message);
    return { ok: false, message: "Couldn't cancel — please try again." };
  }

  revalidatePath("/admin/manage");
  revalidatePath("/admin/reservations");
  return { ok: true };
}
