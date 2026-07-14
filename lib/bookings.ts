import { getServerSupabase, isSupabaseConfigured } from "./supabase-server";
import { reservationBlocks, type AvailabilityResult } from "./types";

/**
 * Type-level availability against the live reservation database. Server-only
 * — imported by `/api/availability` and the `/book` Server Action.
 *
 * The site sells room TYPES. Inventory is `room_types.number_of_rooms`; a type is
 * sold out once that many reservations overlap the requested dates. Bookings are
 * counted by `reservations.room_type_id` — the `rooms` table is not consulted,
 * its rows being mock data from the reception system's testing.
 *
 * Overlap rule (inclusive check-in, exclusive check-out):
 *   existing.check_in_date < new.check_out  AND  existing.check_out_date > new.check_in
 *
 * ⚠️ Reservations with a NULL `room_type_id` are invisible to this count. Any
 * front-desk booking that doesn't set the column cannot block the website, so the
 * reception app must always populate it (and old rows want backfilling).
 */

/** Result of a type-level availability check. */
export type TypeAvailability = AvailabilityResult;

/** Declared inventory for a type — `room_types.number_of_rooms`. */
async function declaredRoomCount(typeId: number): Promise<number> {
  const supabase = getServerSupabase();
  if (!supabase) return 0;
  const { data, error } = await supabase
    .from("room_types")
    .select("number_of_rooms")
    .eq("id", typeId)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("inventory read failed:", error.message);
    return 0;
  }
  return Number(data.number_of_rooms ?? 0);
}

/** How many rooms of this type are already taken across the date range. */
async function occupiedCount(
  typeId: number,
  checkIn: string,
  checkOut: string,
): Promise<number | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("reservations")
    .select("status")
    .eq("room_type_id", typeId)
    .lt("check_in_date", checkOut)
    .gt("check_out_date", checkIn);

  if (error) {
    console.error("type availability read failed:", error.message);
    return null;
  }

  return (data ?? []).filter((r) => reservationBlocks(r.status)).length;
}

/** Check availability for a room type across a date range. */
export async function isTypeAvailable(
  typeId: string,
  checkIn: string,
  checkOut: string,
): Promise<TypeAvailability> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      available: false,
      message: "Live availability is not connected yet.",
    };
  }

  const numTypeId = Number(typeId);
  const [totalCount, occupied] = await Promise.all([
    declaredRoomCount(numTypeId),
    occupiedCount(numTypeId, checkIn, checkOut),
  ]);

  if (occupied === null) {
    return {
      configured: true,
      available: false,
      message: "We couldn't check availability just now. You can still send a request.",
      totalCount,
    };
  }

  if (totalCount === 0) {
    return {
      configured: true,
      available: false,
      message: "No rooms of this type are available right now.",
      freeCount: 0,
      totalCount,
    };
  }

  const freeCount = Math.max(0, totalCount - occupied);

  if (freeCount === 0) {
    return {
      configured: true,
      available: false,
      message: "This room type is fully booked for these dates. Try different dates.",
      freeCount,
      totalCount,
    };
  }

  return {
    configured: true,
    available: true,
    message:
      totalCount > 1
        ? `${freeCount} of ${totalCount} rooms available for your dates.`
        : "Available for your dates.",
    freeCount,
    totalCount,
  };
}

/**
 * TEMPORARY SHIM — delete once `reservations.room_id` is nullable.
 *
 * `reservations.room_id` is still NOT NULL and an FK to `rooms.id`, so a booking
 * cannot be saved without naming a physical room, even though the guest only
 * chose a TYPE and reception assigns the real room at check-in. Until the
 * reception developer drops that NOT NULL, we attach any room belonging to the
 * type just to satisfy the constraint. The value is meaningless — reception
 * should read `room_type_id`, not `room_id`, on website bookings.
 *
 * Returns null when the type has no `rooms` row at all, in which case the booking
 * genuinely cannot be written.
 */
export async function placeholderRoomId(typeId: string): Promise<number | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select("id")
    .eq("room_type_id", Number(typeId))
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("placeholder room lookup failed:", error.message);
    return null;
  }
  return data.id;
}
