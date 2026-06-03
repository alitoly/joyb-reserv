"use server";

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { findFreeRoomId } from "@/lib/bookings";
import { isValidISODate, nightsBetween, todayISO } from "@/lib/dates";
import { getRoom } from "@/lib/rooms";
import type { RoomTypeSlug } from "@/lib/types";

export interface BookingSuccess {
  status: "success";
  reference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}

export interface BookingError {
  status: "error";
  message: string;
  fieldErrors?: Record<string, string>;
}

export type BookingState =
  | { status: "idle" }
  | BookingSuccess
  | BookingError;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Create a website booking.
 *
 * The whole flow is server-authoritative: we re-validate every field, re-run
 * the availability check against Supabase, pick a free physical room, and let
 * the database exclusion constraint be the final guard against a race. The
 * client's earlier "available" message is never trusted here.
 */
export async function createBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Bookings aren't connected yet. Add your Supabase keys to .env.local to enable live reservations.",
    };
  }

  const roomSlug = str(formData, "room") as RoomTypeSlug;
  const checkIn = str(formData, "checkIn");
  const checkOut = str(formData, "checkOut");
  const guestName = str(formData, "guestName");
  const guestEmail = str(formData, "guestEmail");
  const guestPhone = str(formData, "guestPhone");
  const message = str(formData, "message");

  const fieldErrors: Record<string, string> = {};
  const room = getRoom(roomSlug);

  if (!room) fieldErrors.room = "Please choose a room.";
  if (!guestName) fieldErrors.guestName = "Please tell us your name.";
  if (!guestEmail) fieldErrors.guestEmail = "Please add an email.";
  else if (!EMAIL_RE.test(guestEmail))
    fieldErrors.guestEmail = "That email doesn't look right.";
  if (!guestPhone) fieldErrors.guestPhone = "Please add a phone number.";

  if (!isValidISODate(checkIn)) fieldErrors.checkIn = "Pick a check-in date.";
  if (!isValidISODate(checkOut)) fieldErrors.checkOut = "Pick a check-out date.";

  if (!fieldErrors.checkIn && !fieldErrors.checkOut) {
    if (checkIn < todayISO())
      fieldErrors.checkIn = "Check-in can't be in the past.";
    if (nightsBetween(checkIn, checkOut) < 1)
      fieldErrors.checkOut = "Check-out must be after check-in.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  // Re-check availability and reserve a specific room.
  const free = await findFreeRoomId(roomSlug, checkIn, checkOut);
  if (!free) {
    return {
      status: "error",
      message:
        "Those dates were just taken for this room. Please try different dates.",
      fieldErrors: { checkOut: "No room of this type is free for these dates." },
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { status: "error", message: "Booking service is unavailable." };
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      room_id: free.roomId,
      room_type_id: free.roomTypeId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      status: "pending",
      source: "website",
      message: message || null,
    })
    .select("id")
    .single();

  if (error) {
    // 23P01 = exclusion_violation: the room was booked microseconds ago.
    if (error.code === "23P01") {
      return {
        status: "error",
        message:
          "Those dates were just taken for this room. Please try different dates.",
        fieldErrors: {
          checkOut: "No room of this type is free for these dates.",
        },
      };
    }
    return {
      status: "error",
      message: "Something went wrong saving your booking. Please try again.",
    };
  }

  const reference = String(data.id).slice(0, 8).toUpperCase();
  return {
    status: "success",
    reference,
    roomName: room?.name ?? "Your room",
    checkIn,
    checkOut,
    nights: nightsBetween(checkIn, checkOut),
  };
}
