import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  BLOCKING_STATUSES,
  type AvailabilityResult,
  type BookedRange,
  type RoomTypeSlug,
} from "./types";

/**
 * Core booking logic. These functions run on the server (imported by the
 * `/book` Server Action and the `/api/availability` route). The website never
 * trusts the client for availability — every check re-runs here.
 *
 * Overlap rule (inclusive of the date range, exclusive of the check-out day):
 *   existing_check_in < new_check_out  AND  existing_check_out > new_check_in
 *
 * Availability is resolved against PHYSICAL rooms: a room type is available
 * for a range only while at least one active room of that type has no blocking
 * (pending/confirmed) booking overlapping the range — regardless of the
 * booking's `source`, so reception / local-system bookings block the website.
 */

interface RoomTypeLookup {
  id: string;
  roomIds: string[]; // active physical rooms of this type
}

async function loadRoomType(
  slug: RoomTypeSlug,
): Promise<RoomTypeLookup | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: roomType, error: rtErr } = await supabase
    .from("room_types")
    .select("id")
    .eq("slug", slug)
    .single();

  if (rtErr || !roomType) return null;

  const { data: rooms, error: roomsErr } = await supabase
    .from("rooms")
    .select("id")
    .eq("room_type_id", roomType.id)
    .eq("is_active", true);

  if (roomsErr) return null;

  return {
    id: roomType.id as string,
    roomIds: (rooms ?? []).map((r) => r.id as string),
  };
}

/** Distinct room ids with a blocking booking overlapping [checkIn, checkOut). */
async function bookedRoomIds(
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
): Promise<Set<string>> {
  const supabase = getSupabase();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("bookings")
    .select("room_id")
    .eq("room_type_id", roomTypeId)
    .in("status", BLOCKING_STATUSES)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (error || !data) return new Set();

  return new Set(
    data
      .map((b) => b.room_id as string | null)
      .filter((id): id is string => Boolean(id)),
  );
}

/** Check availability for a room type across a date range. */
export async function checkAvailability(
  slug: RoomTypeSlug,
  checkIn: string,
  checkOut: string,
): Promise<AvailabilityResult> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      available: false,
      totalRooms: 0,
      remaining: 0,
      message: "Live availability is not connected yet.",
    };
  }

  const rt = await loadRoomType(slug);
  if (!rt) {
    return {
      configured: true,
      available: false,
      totalRooms: 0,
      remaining: 0,
      message: "We couldn't find that room type.",
    };
  }

  const total = rt.roomIds.length;
  if (total === 0) {
    return {
      configured: true,
      available: false,
      totalRooms: 0,
      remaining: 0,
      message: "No rooms of this type are set up yet.",
    };
  }

  const booked = await bookedRoomIds(rt.id, checkIn, checkOut);
  const remaining = rt.roomIds.filter((id) => !booked.has(id)).length;

  return {
    configured: true,
    available: remaining > 0,
    totalRooms: total,
    remaining,
    message:
      remaining > 0
        ? `${remaining} of ${total} ${
            remaining === 1 ? "room" : "rooms"
          } available for these dates.`
        : "Fully booked for these dates. Try different dates.",
  };
}

/**
 * Find one free room id of the given type for the range, or null if none.
 * Used by the booking action immediately before insert.
 */
export async function findFreeRoomId(
  slug: RoomTypeSlug,
  checkIn: string,
  checkOut: string,
): Promise<{ roomTypeId: string; roomId: string } | null> {
  const rt = await loadRoomType(slug);
  if (!rt || rt.roomIds.length === 0) return null;

  const booked = await bookedRoomIds(rt.id, checkIn, checkOut);
  const free = rt.roomIds.find((id) => !booked.has(id));
  if (!free) return null;

  return { roomTypeId: rt.id, roomId: free };
}

/**
 * All blocking date ranges for a room type, used to hint unavailable dates in
 * the form. (Coarse hint only — exact availability comes from checkAvailability
 * because a single overlapping range may still leave another room free.)
 */
export async function getBlockingRanges(
  slug: RoomTypeSlug,
): Promise<BookedRange[]> {
  const supabase = getSupabase();
  const rt = await loadRoomType(slug);
  if (!supabase || !rt) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("bookings")
    .select("check_in, check_out")
    .eq("room_type_id", rt.id)
    .in("status", BLOCKING_STATUSES)
    .gte("check_out", today)
    .order("check_in", { ascending: true });

  if (error || !data) return [];
  return data as BookedRange[];
}
