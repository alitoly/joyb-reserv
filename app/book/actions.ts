"use server";

import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { isTypeAvailable } from "@/lib/bookings";
import { getRoomType } from "@/lib/rooms-data";
import { isValidISODate, nightsBetween, todayISO } from "@/lib/dates";
import { NEW_RESERVATION_STATUS, WEBSITE_NOTES_TAG } from "@/lib/types";
import { sendGuestConfirmationEmail, sendReservationEmail } from "@/lib/email";

/** Upper bound on guests when a room type's capacity isn't known from the DB. */
const MAX_GUESTS_FALLBACK = 6;

/** How many times to retry assigning a different physical room after a race
 *  (another booking grabbed the room between our check and our insert). */
const MAX_ASSIGN_ATTEMPTS = 3;

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
const SOLD_OUT_ERROR: BookingState = {
  status: "error",
  message: "Those dates were just taken for this room type. Please try different dates.",
  fieldErrors: { checkOut: "This room type isn't free for these dates." },
};

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** `reservations.reference_number` is required (NOT NULL, no default) but the
 *  site never reads it back — the guest-facing reference is `JB<id>`,
 *  computed after insert. Generate a cheap unique value just to satisfy the
 *  column; regenerated per insert attempt in case it's uniquely constrained. */
function generateReferenceNumber(): string {
  return `WEB-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Create a website reservation for a room TYPE.
 *
 * Server-authoritative: re-validate every field, re-run the pool availability
 * check against the live DB, then insert into `reservations` against a
 * specific free physical room (tagged as a website booking via `notes` — the
 * live table has no `source` column). A Postgres `23P01` (exclusion_violation)
 * means another booking just took that physical room; retry with the next
 * free one up to `MAX_ASSIGN_ATTEMPTS` times.
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

  const roomTypeId = str(formData, "room");
  const checkIn = str(formData, "checkIn");
  const checkOut = str(formData, "checkOut");
  const guestName = str(formData, "guestName");
  const guestEmail = str(formData, "guestEmail");
  const guestPhone = str(formData, "guestPhone");
  const message = str(formData, "message");
  const guests = Number.parseInt(str(formData, "guests") || "1", 10);

  const fieldErrors: Record<string, string> = {};
  const roomType = await getRoomType(roomTypeId);

  // Validate guest count against the type's capacity (no DB column for it —
  // it is stored within `notes`). Falls back to a sane bound when unknown.
  const maxGuests =
    roomType?.capacity && roomType.capacity > 0
      ? roomType.capacity
      : MAX_GUESTS_FALLBACK;
  if (!Number.isInteger(guests) || guests < 1) {
    fieldErrors.guests = "Choose how many guests are staying.";
  } else if (guests > maxGuests) {
    fieldErrors.guests = `This room type sleeps up to ${maxGuests}.`;
  }

  if (!roomType) fieldErrors.room = "Please choose a room.";
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

  if (Object.keys(fieldErrors).length > 0 || !roomType) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  // Re-check pool availability for this type right before writing.
  let avail = await isTypeAvailable(roomTypeId, checkIn, checkOut);
  if (!avail.available || !avail.roomId) {
    return {
      status: "error",
      message: avail.message,
      fieldErrors: { checkOut: "This room type isn't free for these dates." },
    };
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return { status: "error", message: "Booking service is unavailable." };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const totalAmount = Number((roomType.priceUsd * nights).toFixed(2));

  // The shared reservations table has no guests or source column, so fold the
  // count (kept first so the front desk sees it at a glance) and the website
  // tag into `notes`.
  const notes = [`Guests: ${guests}`, message, WEBSITE_NOTES_TAG]
    .filter(Boolean)
    .join("\n");

  let assignedRoomId = avail.roomId;
  let assignedRoomName = avail.roomName;
  let insertedId: number | null = null;

  for (let attempt = 0; attempt < MAX_ASSIGN_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        room_id: assignedRoomId,
        tenant_name: guestName,
        tenant_email: guestEmail,
        tenant_phone: guestPhone,
        check_in_date: checkIn,
        check_out_date: checkOut,
        status: NEW_RESERVATION_STATUS,
        total_amount: totalAmount,
        reference_number: generateReferenceNumber(),
        notes,
      })
      .select("id")
      .single();

    if (!error) {
      insertedId = data.id;
      break;
    }

    // 23P01 = exclusion_violation: another booking just took this specific
    // physical room. Re-check the pool and try the next free one.
    if (error.code === "23P01" && attempt < MAX_ASSIGN_ATTEMPTS - 1) {
      avail = await isTypeAvailable(roomTypeId, checkIn, checkOut);
      if (!avail.available || !avail.roomId) return SOLD_OUT_ERROR;
      assignedRoomId = avail.roomId;
      assignedRoomName = avail.roomName;
      continue;
    }

    if (error.code === "23P01") return SOLD_OUT_ERROR;

    console.error("reservation insert failed:", error.message);
    return {
      status: "error",
      message: "Something went wrong saving your booking. Please try again.",
    };
  }

  if (insertedId == null) return SOLD_OUT_ERROR;

  const reference = `JB${String(insertedId).padStart(5, "0")}`;
  const roomLabel = assignedRoomName
    ? `${roomType.name} (${assignedRoomName})`
    : roomType.name;

  // Notify the manager and confirm with the guest. Best-effort: a mail
  // failure must never fail a booking that was already saved.
  const emailPayload = {
    reference,
    roomName: roomLabel,
    checkIn,
    checkOut,
    nights,
    guests,
    guestName,
    guestEmail,
    guestPhone,
    totalUsd: totalAmount,
    notes: message || null,
  };
  const mailResults = await Promise.allSettled([
    sendReservationEmail(emailPayload),
    sendGuestConfirmationEmail(emailPayload),
  ]);
  for (const result of mailResults) {
    if (result.status === "rejected") {
      console.error("reservation email failed:", result.reason);
    }
  }

  return {
    status: "success",
    reference,
    roomName: roomLabel,
    checkIn,
    checkOut,
    nights,
  };
}
