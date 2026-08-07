/** Shared domain types for JoyB Resort, aligned to the live reservation DB. */

/**
 * A room TYPE as the website displays and books it (view-model — no PII).
 * The site books by type, never by physical room: guests pick a type + dates,
 * and reception hands over an actual room at check-in. Built in
 * `lib/rooms-data.ts` straight from a `room_types` row — that table is the
 * source of truth for description, capacity, price and inventory. Imagery is
 * not in the database at all: it comes from `photosForType` in `lib/rooms.ts`.
 */
export interface RoomListing {
  id: string; // room_types.id (stringified)
  name: string; // room_types.name
  typeName: string; // same as `name` — kept as a separate field since callers
  // (Kicker, facilitiesForType, meta titles) key off "type"
  capacity: number | null; // room_types.max_pax (null when 0/unset)
  priceUsd: number; // room_types.price — the nightly rate the site charges
  description: string | null; // room_types.description
  imageUrl: string; // lead photo for the type — the room grid's card image
  imageAlt: string; // description of that photo, not a generic label
  totalRooms: number; // room_types.number_of_rooms — the inventory for this type
}

/** Result of an availability lookup for a room TYPE + date range. `freeCount`/
 *  `totalCount` are omitted when unknown (e.g. dates not yet chosen). */
export interface AvailabilityResult {
  configured: boolean; // false when the DB env vars are missing
  available: boolean;
  message: string;
  freeCount?: number;
  totalCount?: number;
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

/** Status stamped on a reservation the website creates. Capitalised to match
 *  the live system's convention (live rows use "Confirmed" / "Checked In"). */
export const NEW_RESERVATION_STATUS = "Pending";

/** The live `reservations` table has no `source` column, so website bookings
 *  are tagged inside `notes` instead — both for the front desk and for the
 *  admin pages' "via Website" badge. */
export const WEBSITE_NOTES_TAG = "Source: Website";

export function isWebsiteReservation(
  notes: string | null | undefined,
): boolean {
  return !!notes?.includes(WEBSITE_NOTES_TAG);
}

/** Status written when a manager cancels a reservation from the admin area.
 *  Capitalised to match the live system's convention; lowercased it already
 *  hits `NON_BLOCKING_RESERVATION_STATUSES`, so cancelling frees the dates. */
export const CANCELLED_RESERVATION_STATUS = "Cancelled";

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
