"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createBooking, type BookingState } from "@/app/book/actions";
import type { RoomContent } from "@/lib/rooms";
import type { AvailabilityResult, BookedRange } from "@/lib/types";
import { addDays, formatLong, nightsBetween, todayISO } from "@/lib/dates";
import { Button } from "./ui";
import { AlertIcon, CheckIcon, SpinnerIcon } from "./icons";

type AvailState =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "result"; data: AvailabilityResult }
  | { kind: "unconfigured" }
  | { kind: "error" };

const fieldBase =
  "mt-1.5 w-full rounded-xl border bg-surface px-4 py-3 text-charcoal transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-green";

function fieldClass(invalid?: boolean) {
  return `${fieldBase} ${
    invalid ? "border-rust focus:border-rust" : "border-charcoal/15 focus:border-green"
  }`;
}

const initialState: BookingState = { status: "idle" };

export function BookingForm({
  rooms,
  initialRoom,
}: {
  rooms: RoomContent[];
  initialRoom: string;
}) {
  const today = todayISO();
  const [state, formAction, pending] = useActionState(
    createBooking,
    initialState,
  );

  const [room, setRoom] = useState(
    rooms.some((r) => r.slug === initialRoom) ? initialRoom : rooms[0].slug,
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [avail, setAvail] = useState<AvailState>({ kind: "idle" });
  const [ranges, setRanges] = useState<BookedRange[]>([]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.slug === room) ?? rooms[0],
    [room, rooms],
  );

  const datesValid =
    checkIn >= today && checkOut > checkIn && Boolean(checkIn && checkOut);
  const nights = datesValid ? nightsBetween(checkIn, checkOut) : 0;

  // Keep check-out ahead of check-in (handled on change, not in an effect).
  function handleCheckIn(value: string) {
    setCheckIn(value);
    if (checkOut && checkOut <= value) setCheckOut(addDays(value, 1));
  }

  // Fetch availability + booked ranges (debounced) when inputs change.
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ room });
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
        setRanges(json.ranges ?? []);
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
  }, [room, checkIn, checkOut, datesValid]);

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
          We’ve received your request and the dates are now held. Our team will
          confirm by email shortly.
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

      <fieldset className="grid gap-5" disabled={pending}>
        <legend className="sr-only">Booking details</legend>

        {/* Room type */}
        <div>
          <label htmlFor="room" className="text-sm font-medium text-charcoal">
            Room type
          </label>
          <select
            id="room"
            name="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className={fieldClass(Boolean(fe.room))}
            aria-invalid={Boolean(fe.room)}
          >
            {rooms.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} · from ${r.priceFrom}/night · sleeps {r.capacity}
              </option>
            ))}
          </select>
        </div>

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

        {/* Availability feedback */}
        <AvailabilityBanner avail={avail} ranges={ranges} />

        {/* Guest details */}
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
      </fieldset>

      {/* Summary + submit */}
      <div className="mt-7 flex flex-col gap-4 border-t border-charcoal/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ink-soft" aria-live="polite">
          {datesValid ? (
            <>
              <span className="font-medium text-charcoal">
                {nights} {nights === 1 ? "night" : "nights"}
              </span>{" "}
              · from{" "}
              <span className="font-display text-xl text-charcoal">
                ${selectedRoom.priceFrom * nights}
              </span>{" "}
              <span className="text-sm">est.</span>
            </>
          ) : (
            <span className="text-sm">Pick your dates to see availability.</span>
          )}
        </p>
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
    </form>
  );
}

function AvailabilityBanner({
  avail,
  ranges,
}: {
  avail: AvailState;
  ranges: BookedRange[];
}) {
  return (
    <div aria-live="polite" className="min-h-[1.5rem]">
      {avail.kind === "checking" && (
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <SpinnerIcon className="h-4 w-4" /> Checking availability…
        </p>
      )}

      {avail.kind === "unconfigured" && (
        <p className="rounded-xl bg-sand-deep px-4 py-3 text-sm text-charcoal/80">
          Live availability isn’t connected yet, but you can still send a
          request and we’ll confirm by email.
        </p>
      )}

      {avail.kind === "error" && (
        <p className="text-sm text-rust-strong">
          Couldn’t check availability just now. You can still submit your
          request.
        </p>
      )}

      {avail.kind === "result" &&
        (avail.data.available ? (
          <p className="flex items-center gap-2 rounded-xl bg-green/10 px-4 py-3 text-sm font-medium text-green-strong">
            <CheckIcon className="h-5 w-5 shrink-0" />
            {avail.data.message}
          </p>
        ) : (
          <div className="rounded-xl bg-rust/10 px-4 py-3 text-rust-strong">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertIcon className="h-5 w-5 shrink-0" />
              {avail.data.message}
            </p>
            {ranges.length > 0 && (
              <p className="mt-2 text-xs text-rust-strong/80">
                Already booked:{" "}
                {ranges
                  .slice(0, 4)
                  .map((r) => `${formatLong(r.check_in)} – ${formatLong(r.check_out)}`)
                  .join(" · ")}
              </p>
            )}
          </div>
        ))}
    </div>
  );
}
