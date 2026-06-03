/** Shared domain types for JoyB Resort. */

export type RoomTypeSlug = "garden-single" | "ocean-twin" | "master-suite";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

/** Where a booking originated. The website only ever creates `website`. */
export type BookingSource = "website" | "reception" | "local_system";

/** Statuses that occupy a room and therefore block availability. */
export const BLOCKING_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export interface RoomTypeRow {
  id: string;
  name: string;
  slug: RoomTypeSlug;
  description: string;
  capacity: number;
  base_price: number | null;
  image_url: string | null;
  created_at: string;
}

export interface RoomRow {
  id: string;
  room_type_id: string;
  room_number: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingRow {
  id: string;
  room_id: string | null;
  room_type_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD (exclusive — guest leaves this morning)
  status: BookingStatus;
  source: BookingSource;
  message: string | null;
  created_at: string;
  updated_at: string;
}

/** Result of an availability lookup for a date range + room type. */
export interface AvailabilityResult {
  configured: boolean; // false when Supabase env vars are missing
  available: boolean;
  totalRooms: number;
  remaining: number;
  message: string;
}

export interface BookedRange {
  check_in: string;
  check_out: string;
}
