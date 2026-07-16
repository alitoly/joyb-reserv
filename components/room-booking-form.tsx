"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createBooking, type BookingState } from "@/app/book/actions";
import type { RoomListing } from "@/lib/types";
import { addDays, formatLong, nightsBetween, todayISO } from "@/lib/dates";
import { calculatePrice } from "@/lib/pricing";
import { Button } from "./ui";
import { AvailabilityBanner, type AvailState } from "./availability-banner";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";

const fieldBase =
  "mt-1.5 w-full rounded-xl border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green";

function fieldClass(invalid?: boolean) {
  return `${fieldBase} ${
    invalid
      ? "border-rust focus:border-rust"
      : "border-charcoal/15 focus:border-green"
  }`;
}

/** When a room's capacity is unknown, allow a reasonable upper bound. */
const MAX_GUESTS_FALLBACK = 6;

const initialState: BookingState = { status: "idle" };

/**
 * Booking form embedded on the room-type details page. The type is fixed (no
 * picker), so the flow is just: dates → guests → your details. The server
 * assigns any free physical room from the type's pool. Live pool availability
 * is checked against `/api/availability`; the server action re-validates
 * everything (and re-assigns a room) before writing.
 */
/** Pre-fill values for a signed-in guest (no field is required). */
export interface GuestDefaults {
  name?: string;
  email?: string;
  phone?: string;
}

export function RoomBookingForm({
  room,
  defaultGuest,
}: {
  room: RoomListing;
  defaultGuest?: GuestDefaults;
}) {
  const today = todayISO();
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialState,
  );

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [avail, setAvail] = useState<AvailState>({ kind: "idle" });

  const maxGuests = room.capacity && room.capacity > 0
    ? room.capacity
    : MAX_GUESTS_FALLBACK;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const adultOptions = useMemo(
    () => Array.from({ length: maxGuests }, (_, i) => i + 1),
    [maxGuests],
  );
  const maxChildren = Math.max(0, maxGuests - adults);
  const childOptions = useMemo(
    () => Array.from({ length: maxChildren + 1 }, (_, i) => i),
    [maxChildren],
  );

  // Keep children within capacity when adults changes.
  function handleAdults(value: number) {
    setAdults(value);
    if (children > maxGuests - value) setChildren(Math.max(0, maxGuests - value));
  }

  const datesValid =
    checkIn >= today && checkOut > checkIn && Boolean(checkIn && checkOut);
  const nights = datesValid ? nightsBetween(checkIn, checkOut) : 0;
  const price = datesValid ? calculatePrice(room.priceUsd, nights) : null;

  // Keep check-out ahead of check-in (handled on change, not in an effect).
  function handleCheckIn(value: string) {
    setCheckIn(value);
    if (checkOut && checkOut <= value) setCheckOut(addDays(value, 1));
  }

  // Fetch pool availability (debounced) when dates change.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ room: room.id });
    if (datesValid) {
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
    }

    const t = setTimeout(async () => {
      if (datesValid) setAvail({ kind: "checking" });
      try {
        const res = await fetch(`/api/availability?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (!json.configured) {
          setAvail({ kind: "unconfigured" });
        } else if (json.availability) {
          setAvail({ kind: "result", data: json.availability });
        } else {
          setAvail({ kind: "idle" });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setAvail({ kind: "error" });
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [room.id, checkIn, checkOut, datesValid]);

  const fe = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const soldOut = avail.kind === "result" && !avail.data.available;
  const canSubmit = !pending && datesValid && !soldOut;

  if (state.status === "success") {
    return (
      <div
        className="rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green text-white">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-3xl text-charcoal">
          Your stay is reserved
        </h2>
        <p className="mt-2 text-ink-soft">
          We&apos;ve received your request and the dates are now held. Our team
          will confirm by email shortly.
        </p>

        <dl className="mt-7 grid gap-4 rounded-2xl bg-sand p-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-ink-soft">Booking reference</dt>
            <dd className="font-display text-xl text-charcoal">
              {state.reference}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Room</dt>
            <dd className="font-medium text-charcoal">{state.roomName}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Check-in</dt>
            <dd className="font-medium text-charcoal">
              {formatLong(state.checkIn)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">
              Check-out · {state.nights}{" "}
              {state.nights === 1 ? "night" : "nights"}
            </dt>
            <dd className="font-medium text-charcoal">
              {formatLong(state.checkOut)}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-charcoal">
          Total due <span className="font-display text-2xl">${state.totalUsd}</span>
        </p>

        <Button
          variant="outline"
          className="mt-7"
          onClick={() => window.location.reload()}
        >
          Make another booking
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[2rem] bg-surface p-6 ring-1 ring-charcoal/5 sm:p-9"
      noValidate
    >
      {/* room.id is a room-TYPE id — the server assigns a specific physical room. */}
      <input type="hidden" name="room" value={room.id} />

      {/* Form-level error */}
      {state.status === "error" && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl bg-rust/10 p-4 text-rust-strong"
        >
          <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{state.message}</p>
        </div>
      )}

      <fieldset className="grid gap-7" disabled={pending}>
        <legend className="sr-only">Booking details for {room.name}</legend>

        {/* Dates */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="checkIn"
              className="text-sm font-medium text-charcoal"
            >
              Check-in
            </label>
            <input
              id="checkIn"
              name="checkIn"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => handleCheckIn(e.target.value)}
              className={fieldClass(Boolean(fe.checkIn))}
              aria-invalid={Boolean(fe.checkIn)}
              aria-describedby={fe.checkIn ? "checkIn-err" : undefined}
            />
            {fe.checkIn && (
              <p id="checkIn-err" className="mt-1 text-sm text-rust-strong">
                {fe.checkIn}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="checkOut"
              className="text-sm font-medium text-charcoal"
            >
              Check-out
            </label>
            <input
              id="checkOut"
              name="checkOut"
              type="date"
              min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className={fieldClass(Boolean(fe.checkOut))}
              aria-invalid={Boolean(fe.checkOut)}
              aria-describedby={fe.checkOut ? "checkOut-err" : undefined}
            />
            {fe.checkOut && (
              <p id="checkOut-err" className="mt-1 text-sm text-rust-strong">
                {fe.checkOut}
              </p>
            )}
          </div>
        </div>

        {/* Availability feedback for this room type */}
        <AvailabilityBanner avail={avail} />

        {/* Guests */}
        <div className="grid gap-5 sm:grid-cols-2 sm:max-w-[24rem]">
          <div>
            <label htmlFor="adults" className="text-sm font-medium text-charcoal">
              Adults
            </label>
            <select
              id="adults"
              name="adults"
              value={adults}
              onChange={(e) => handleAdults(Number(e.target.value))}
              className={fieldClass(Boolean(fe.adults))}
              aria-invalid={Boolean(fe.adults)}
              aria-describedby={fe.adults ? "adults-err" : undefined}
            >
              {adultOptions.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "adult" : "adults"}
                </option>
              ))}
            </select>
            {fe.adults && (
              <p id="adults-err" className="mt-1 text-sm text-rust-strong">
                {fe.adults}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="children" className="text-sm font-medium text-charcoal">
              Children
            </label>
            <select
              id="children"
              name="children"
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className={fieldClass(Boolean(fe.children))}
              aria-invalid={Boolean(fe.children)}
              aria-describedby={fe.children ? "children-err" : undefined}
            >
              {childOptions.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "child" : "children"}
                </option>
              ))}
            </select>
            {fe.children && (
              <p id="children-err" className="mt-1 text-sm text-rust-strong">
                {fe.children}
              </p>
            )}
          </div>
        </div>

        {/* Guest details */}
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="guestName"
                className="text-sm font-medium text-charcoal"
              >
                Full name
              </label>
              <input
                id="guestName"
                name="guestName"
                type="text"
                autoComplete="name"
                defaultValue={defaultGuest?.name}
                className={fieldClass(Boolean(fe.guestName))}
                aria-invalid={Boolean(fe.guestName)}
                aria-describedby={fe.guestName ? "guestName-err" : undefined}
                placeholder="Amani Juma"
              />
              {fe.guestName && (
                <p id="guestName-err" className="mt-1 text-sm text-rust-strong">
                  {fe.guestName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="guestPhone"
                className="text-sm font-medium text-charcoal"
              >
                Phone number
              </label>
              <input
                id="guestPhone"
                name="guestPhone"
                type="tel"
                autoComplete="tel"
                defaultValue={defaultGuest?.phone}
                className={fieldClass(Boolean(fe.guestPhone))}
                aria-invalid={Boolean(fe.guestPhone)}
                aria-describedby={fe.guestPhone ? "guestPhone-err" : undefined}
                placeholder="+255 …"
              />
              {fe.guestPhone && (
                <p id="guestPhone-err" className="mt-1 text-sm text-rust-strong">
                  {fe.guestPhone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="guestEmail"
              className="text-sm font-medium text-charcoal"
            >
              Email
            </label>
            <input
              id="guestEmail"
              name="guestEmail"
              type="email"
              autoComplete="email"
              defaultValue={defaultGuest?.email}
              className={fieldClass(Boolean(fe.guestEmail))}
              aria-invalid={Boolean(fe.guestEmail)}
              aria-describedby={fe.guestEmail ? "guestEmail-err" : undefined}
              placeholder="you@example.com"
            />
            {fe.guestEmail && (
              <p id="guestEmail-err" className="mt-1 text-sm text-rust-strong">
                {fe.guestEmail}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="message"
              className="text-sm font-medium text-charcoal"
            >
              Anything we should know?{" "}
              <span className="text-ink-soft">(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className={`${fieldClass()} resize-y`}
              placeholder="Arrival time, dietary notes, a special occasion…"
            />
          </div>
        </div>
      </fieldset>

      {/* Summary + submit */}
      <div className="mt-8 rounded-2xl bg-sand p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite" className="text-ink-soft">
            <p className="font-medium text-charcoal">{room.name}</p>
            {datesValid && price ? (
              <p className="mt-0.5 text-sm">
                {nights} {nights === 1 ? "night" : "nights"} ·{" "}
                <span className="text-ink-soft">
                  ${room.priceUsd} × {nights}
                </span>{" "}
                ={" "}
                <span className="font-display text-xl text-charcoal">
                  ${price.total}
                </span>{" "}
                <span className="text-xs">est.</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm">
                Pick your dates to see availability and the total.
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            className="px-8"
            disabled={!canSubmit}
          >
            {pending ? (
              <>
                <SpinnerIcon className="h-5 w-5" /> Reserving…
              </>
            ) : (
              "Request booking"
            )}
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          No payment needed now — we&apos;ll confirm your booking by email.
        </p>
      </div>
    </form>
  );
}
