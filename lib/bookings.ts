import { getServerSupabase, isSupabaseConfigured } from "./supabase-server";
import {
  CONSIDER_TENANT_OCCUPANCY,
  reservationBlocks,
  tenantBlocks,
  type AvailabilityResult,
  type BookedRange,
} from "./types";

/**
 * Per-room availability against the live reservation database. Server-only —
 * imported by `/api/availability` and the `/book` Server Action. The website
 * never trusts the client; every check re-runs here.
 *
 * Overlap rule (inclusive check-in, exclusive check-out):
 *   existing.check_in_date < new.check_out  AND  existing.check_out_date > new.check_in
 *
 * A room is unavailable for a range if a blocking `reservations` row overlaps
 * it, or (when enabled) a long-term `tenants` occupancy overlaps it. Reads all
 * reservations regardless of `source`, so front-desk bookings block the website.
 */

/** True if any blocking reservation or tenancy overlaps the range; null on a
 *  read error so callers can fail safe. */
async function hasBlockingOverlap(
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const numId = Number(roomId);

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("status, check_in_date, check_out_date")
    .eq("room_id", numId)
    .lt("check_in_date", checkOut)
    .gt("check_out_date", checkIn);

  if (error) {
    console.error("availability read failed:", error.message);
    return null;
  }
  if ((reservations ?? []).some((r) => reservationBlocks(r.status))) return true;

  if (CONSIDER_TENANT_OCCUPANCY) {
    const { data: tenants } = await supabase
      .from("tenants")
      .select("status, move_in_date, move_out_date")
      .eq("room_id", numId)
      .lt("move_in_date", checkOut);

    const tenantOverlap = (tenants ?? []).some((t) => {
      if (!tenantBlocks(t.status)) return false;
      // Open-ended tenancy (no move-out) blocks everything from move-in on.
      return !t.move_out_date || t.move_out_date > checkIn;
    });
    if (tenantOverlap) return true;
  }

  return false;
}

/** Check availability for one room across a date range. */
export async function isRoomAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
): Promise<AvailabilityResult> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      available: false,
      message: "Live availability is not connected yet.",
    };
  }

  const blocked = await hasBlockingOverlap(roomId, checkIn, checkOut);
  if (blocked === null) {
    return {
      configured: true,
      available: false,
      message: "We couldn't check availability just now. You can still send a request.",
    };
  }

  return blocked
    ? {
        configured: true,
        available: false,
        message: "This room is booked for these dates. Try different dates.",
      }
    : {
        configured: true,
        available: true,
        message: "Available for your dates.",
      };
}

/**
 * Upcoming blocking date ranges for a room, used to hint unavailable dates in
 * the form. Selects dates only — never tenant PII.
 */
export async function getRoomBlockingRanges(
  roomId: string,
): Promise<BookedRange[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);
  const numId = Number(roomId);

  const { data, error } = await supabase
    .from("reservations")
    .select("status, check_in_date, check_out_date")
    .eq("room_id", numId)
    .gte("check_out_date", today)
    .order("check_in_date", { ascending: true });

  if (error || !data) return [];

  return data
    .filter((r) => reservationBlocks(r.status))
    .map((r) => ({ check_in: r.check_in_date, check_out: r.check_out_date }));
}
