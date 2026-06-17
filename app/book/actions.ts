"use server";

import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { isRoomAvailable } from "@/lib/bookings";
import { getRoom } from "@/lib/rooms-data";
import { isValidISODate, nightsBetween, todayISO } from "@/lib/dates";
import { NEW_RESERVATION_SOURCE, NEW_RESERVATION_STATUS } from "@/lib/types";

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

export type BookingState = { status: "idle" } | BookingSuccess | BookingError;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Create a website reservation for a specific room.
 *
 * Server-authoritative: re-validate every field, re-run the per-room
 * availability check against the live DB, then insert into `reservations`
 * stamped `source = website`. A Postgres `23P01` (exclusion_violation) — if the
 * DB has a double-booking guard — is treated as "just taken".
 */
export async function createBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  if (!isSupabaseConfigured) {
    return {
      status: "error",
      message:
        "Bookings aren't connected yet. Add the Supabase server keys to .env.local to enable live reservations.",
    };
  }

  const roomId = str(formData, "room");
  const checkIn = str(formData, "checkIn");
  const checkOut = str(formData, "checkOut");
  const guestName = str(formData, "guestName");
  const guestEmail = str(formData, "guestEmail");
  const guestPhone = str(formData, "guestPhone");
  const message = str(formData, "message");

  const fieldErrors: Record<string, string> = {};
  const room = await getRoom(roomId);

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

  if (Object.keys(fieldErrors).length > 0 || !room) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  // Re-check availability for this exact room right before writing.
  const avail = await isRoomAvailable(roomId, checkIn, checkOut);
  if (!avail.available) {
    return {
      status: "error",
      message:
        "Those dates were just taken for this room. Please try different dates.",
      fieldErrors: { checkOut: "This room isn't free for these dates." },
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return { status: "error", message: "Booking service is unavailable." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const totalAmount = Number((room.priceUsd * nights).toFixed(2));

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      room_id: Number(roomId),
      tenant_name: guestName,
      tenant_email: guestEmail,
      tenant_phone: guestPhone,
      check_in_date: checkIn,
      check_out_date: checkOut,
      status: NEW_RESERVATION_STATUS,
      source: NEW_RESERVATION_SOURCE,
      total_amount: totalAmount,
      notes: message || null,
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
        fieldErrors: { checkOut: "This room isn't free for these dates." },
      };
    }
    console.error("reservation insert failed:", error.message);
    return {
      status: "error",
      message: "Something went wrong saving your booking. Please try again.",
    };
  }

  const reference = `JB${String(data.id).padStart(5, "0")}`;
  return {
    status: "success",
    reference,
    roomName: room.name,
    checkIn,
    checkOut,
    nights,
  };
}
