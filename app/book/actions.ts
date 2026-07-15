"use server";

import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { isTypeAvailable, placeholderRoomId } from "@/lib/bookings";
import { getRoomType } from "@/lib/rooms-data";
import { isValidISODate, nightsBetween, todayISO } from "@/lib/dates";
import { calculatePrice } from "@/lib/pricing";
import { NEW_RESERVATION_STATUS, WEBSITE_NOTES_TAG } from "@/lib/types";
import { sendGuestConfirmationEmail, sendReservationEmail } from "@/lib/email";

/** Upper bound on guests when a room type's capacity isn't known from the DB. */
const MAX_GUESTS_FALLBACK = 6;

export interface BookingSuccess {
  status: "success";
  reference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  subtotalUsd: number;
  vatUsd: number;
  totalUsd: number;
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
 * Server-authoritative: re-validate every field, re-run the availability check
 * against the live DB (inventory = `room_types.number_of_rooms`), then insert into
 * `reservations` with `room_type_id` — the guest's actual choice. Reception assigns
 * the physical room at check-in.
 *
 * `room_id` is written only because the column is still NOT NULL; the value is a
 * meaningless placeholder (see `placeholderRoomId`). Delete both once the reception
 * developer makes `room_id` nullable.
 *
 * Website bookings are tagged with `WEBSITE_NOTES_TAG` inside `notes` — the live
 * table has no `source` column. Guest nationality / national ID are never collected
 * or written.
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

  // Validate guest count against the type's capacity (`room_types.max_pax`).
  // Falls back to a sane bound when the column is unset (0).
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

  // Re-check availability for this type right before writing.
  const avail = await isTypeAvailable(roomTypeId, checkIn, checkOut);
  if (!avail.available) {
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

  // `room_type_id` is the guest's real choice. `room_id` is only here because the
  // column is still NOT NULL — see `placeholderRoomId`. Drop it once that changes.
  const filler = await placeholderRoomId(roomTypeId);
  if (filler == null) {
    console.error(
      `no rooms row exists for room_type_id=${roomTypeId}; cannot satisfy reservations.room_id NOT NULL`,
    );
    return {
      status: "error",
      message: "We couldn't complete this booking. Please contact us and we'll set it up.",
    };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const { subtotal, vat, grandTotal } = calculatePrice(roomType.priceUsd, nights);

  // The shared reservations table has no guests or source column, so fold the
  // count (kept first so the front desk sees it at a glance) and the website
  // tag into `notes`.
  const notes = [`Guests: ${guests}`, message, WEBSITE_NOTES_TAG]
    .filter(Boolean)
    .join("\n");

  const { data: inserted, error } = await supabase
    .from("reservations")
    .insert({
      room_type_id: Number(roomTypeId),
      room_id: filler,
      tenant_name: guestName,
      tenant_email: guestEmail,
      tenant_phone: guestPhone,
      check_in_date: checkIn,
      check_out_date: checkOut,
      status: NEW_RESERVATION_STATUS,
      total_amount: subtotal,
      vat_amount: vat,
      grand_total: grandTotal,
      reference_number: generateReferenceNumber(),
      notes,
    })
    .select("id")
    .single();

  if (error) {
    // 23P01 = exclusion_violation: the placeholder room already holds an
    // overlapping booking. Only reachable while `room_id` stays NOT NULL.
    if (error.code === "23P01") return SOLD_OUT_ERROR;

    console.error("reservation insert failed:", error.message);
    return {
      status: "error",
      message: "Something went wrong saving your booking. Please try again.",
    };
  }

  const insertedId = inserted.id;

  const reference = `JB${String(insertedId).padStart(5, "0")}`;
  // The guest booked a TYPE. Which physical room the reservation is attached to
  // is an internal detail — reception assigns the actual room at check-in — so
  // it is deliberately not shown to the guest or put in the emails.
  const roomLabel = roomType.name;

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
    subtotalUsd: subtotal,
    vatUsd: vat,
    totalUsd: grandTotal,
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
    subtotalUsd: subtotal,
    vatUsd: vat,
    totalUsd: grandTotal,
  };
}
