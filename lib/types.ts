/** Shared domain types for JoyB Resort, aligned to the live reservation DB. */

/**
 * A room as the website displays and books it (view-model — no PII).
 * Built in `lib/rooms-data.ts` by joining `rooms` → `room_types`, `pax`,
 * `room_images`.
 */
export interface RoomListing {
  id: string; // rooms.id (stringified)
  name: string; // rooms.room_name
  typeName: string; // room_types.name
  capacity: number | null; // pax.value
  priceUsd: number; // rooms.day_payment (per night)
  description: string | null; // rooms.description
  imageUrl: string; // resolved Storage/public URL (or fallback)
  imageAlt: string;
}

/** Blocked date range surfaced to the booking form for hints (no PII). */
export interface BookedRange {
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD (exclusive)
}

/** Result of an availability lookup for one room + date range. */
export interface AvailabilityResult {
  configured: boolean; // false when the DB env vars are missing
  available: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Domain status configuration
//
// The live system's status strings were not documented when this was wired, so
// the rules below are intentionally lenient (for display) and conservative (for
// availability), and centralised here. Confirm the real values with the
// reception-system developer and adjust in ONE place.
// ---------------------------------------------------------------------------

/** Room statuses that HIDE a room from the website (case-insensitive). Any
 *  other value — including null — is treated as live/bookable. */
export const HIDDEN_ROOM_STATUSES = new Set([
  "inactive",
  "disabled",
  "hidden",
  "archived",
  "maintenance",
  "out_of_service",
  "unavailable",
]);

/** Reservation statuses that do NOT block a room. Any other value (pending,
 *  confirmed, checked_in, …) blocks the overlapping dates, so the website never
 *  oversells against a front-desk reservation. */
export const NON_BLOCKING_RESERVATION_STATUSES = new Set([
  "cancelled",
  "canceled",
  "declined",
  "rejected",
  "no_show",
  "no-show",
  "void",
  "voided",
]);

/** Tenant (long-term occupant) statuses that do NOT block a room. */
export const NON_BLOCKING_TENANT_STATUSES = new Set([
  "moved_out",
  "moved-out",
  "former",
  "past",
  "inactive",
  "ended",
  "terminated",
]);

/** Whether long-term `tenants` occupancy also makes a room unbookable. */
export const CONSIDER_TENANT_OCCUPANCY = true;

/** Status + source stamped on a reservation the website creates. Capitalised to
 *  match the live system's convention (existing rows use "Pending" / "System").
 *  If an INSERT is rejected by a CHECK constraint, confirm the allowed values. */
export const NEW_RESERVATION_STATUS = "Pending";
export const NEW_RESERVATION_SOURCE = "Website";

export function isRoomLive(status: string | null | undefined): boolean {
  if (!status) return true;
  return !HIDDEN_ROOM_STATUSES.has(status.trim().toLowerCase());
}

export function reservationBlocks(status: string | null | undefined): boolean {
  if (!status) return true;
  return !NON_BLOCKING_RESERVATION_STATUSES.has(status.trim().toLowerCase());
}

export function tenantBlocks(status: string | null | undefined): boolean {
  if (!status) return true;
  return !NON_BLOCKING_TENANT_STATUSES.has(status.trim().toLowerCase());
}
