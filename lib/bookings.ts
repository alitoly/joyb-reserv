import { getServerSupabase, isSupabaseConfigured } from "./supabase-server";
import {
  CONSIDER_TENANT_OCCUPANCY,
  isRoomLive,
  reservationBlocks,
  tenantBlocks,
  type AvailabilityResult,
} from "./types";

/**
 * Type-level availability against the live reservation database. Server-only
 * — imported by `/api/availability` and the `/book` Server Action. The site
 * books by room TYPE, not by physical room: a type with N physical rooms
 * only shows "sold out" once all N are booked for the requested dates.
 *
 * Overlap rule (inclusive check-in, exclusive check-out):
 *   existing.check_in_date < new.check_out  AND  existing.check_out_date > new.check_in
 *
 * A physical room is unavailable for a range if a blocking `reservations` row
 * overlaps it, or (when enabled) a long-term `tenants` occupancy overlaps it.
 * Reads all reservations regardless of `notes` tag, so front-desk bookings
 * block the website too.
 */

/** Result of a type-level availability check. `roomId`/`roomName` identify
 *  one specific free physical room to assign — server-side use only, not for
 *  the client response. */
export interface TypeAvailability extends AvailabilityResult {
  roomId: number | null;
  roomName: string | null;
}

async function liveRoomsForType(
  typeId: number,
): Promise<{ id: number; name: string | null }[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, status")
    .eq("room_type_id", typeId);
  if (error || !data) return [];
  return data.filter((r) => isRoomLive(r.status)).map((r) => ({ id: r.id, name: r.name }));
}

/** Check availability for a room type across a date range. Picks one free
 *  physical room to assign if available. */
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
      roomId: null,
      roomName: null,
    };
  }

  const supabase = getServerSupabase();
  const numTypeId = Number(typeId);
  const rooms = await liveRoomsForType(numTypeId);

  if (!supabase || rooms.length === 0) {
    return {
      configured: true,
      available: false,
      message: "No rooms of this type are available right now.",
      freeCount: 0,
      totalCount: rooms.length,
      roomId: null,
      roomName: null,
    };
  }

  const roomIds = rooms.map((r) => r.id);

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("room_id, status, check_in_date, check_out_date")
    .in("room_id", roomIds)
    .lt("check_in_date", checkOut)
    .gt("check_out_date", checkIn);

  if (error) {
    console.error("type availability read failed:", error.message);
    return {
      configured: true,
      available: false,
      message: "We couldn't check availability just now. You can still send a request.",
      totalCount: rooms.length,
      roomId: null,
      roomName: null,
    };
  }

  const blockedIds = new Set(
    (reservations ?? [])
      .filter((r) => reservationBlocks(r.status))
      .map((r) => r.room_id),
  );

  if (CONSIDER_TENANT_OCCUPANCY) {
    const { data: tenants, error: tenantError } = await supabase
      .from("tenants")
      .select("room_id, status, check_in, check_out")
      .in("room_id", roomIds)
      .lt("check_in", checkOut);

    if (tenantError) {
      console.error("tenant occupancy read failed:", tenantError.message);
    }
    for (const t of tenants ?? []) {
      if (tenantBlocks(t.status) && (!t.check_out || t.check_out > checkIn)) {
        blockedIds.add(t.room_id);
      }
    }
  }

  const free = rooms.filter((r) => !blockedIds.has(r.id));
  const totalCount = rooms.length;
  const freeCount = free.length;

  if (freeCount === 0) {
    return {
      configured: true,
      available: false,
      message: "This room type is fully booked for these dates. Try different dates.",
      freeCount,
      totalCount,
      roomId: null,
      roomName: null,
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
    roomId: free[0].id,
    roomName: free[0].name,
  };
}
