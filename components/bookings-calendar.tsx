"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatLong } from "@/lib/dates";
import { CancelBookingForm } from "./cancel-booking-form";

export interface CalendarBooking {
  id: number;
  roomName: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  checkIn: string; // YYYY-MM-DD (inclusive)
  checkOut: string; // YYYY-MM-DD (exclusive)
  status: string | null;
  source: string | null;
  blocking: boolean; // false once cancelled
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Shift a "YYYY-MM" string by ±1 month. */
function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** A booking covers a date when checkIn <= date < checkOut (string compare is
 *  safe for zero-padded ISO dates). */
function coversDay(b: CalendarBooking, dayISO: string): boolean {
  return b.checkIn <= dayISO && dayISO < b.checkOut;
}

export function BookingsCalendar({
  month,
  bookings,
}: {
  month: string; // "YYYY-MM"
  bookings: CalendarBooking[];
}) {
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  // Leading blanks so the 1st lands under the right weekday (Monday-first).
  const firstWeekday = new Date(year, monthNum - 1, 1).getDay(); // 0=Sun
  const leading = (firstWeekday + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const [selected, setSelected] = useState<number | null>(null);
  const selectedISO =
    selected != null ? `${month}-${pad(selected)}` : null;

  const selectedBookings = useMemo(
    () =>
      selectedISO
        ? bookings.filter((b) => coversDay(b, selectedISO))
        : [],
    [bookings, selectedISO],
  );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      {/* Calendar */}
      <div className="bg-surface p-4 ring-1 ring-charcoal/5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-charcoal">
            {MONTH_NAMES[monthNum - 1]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/manage?month=${shiftMonth(month, -1)}`}
              aria-label="Previous month"
              className="flex h-9 w-9 items-center justify-center ring-1 ring-charcoal/15 text-charcoal transition-colors hover:bg-sand-deep"
            >
              ←
            </Link>
            <Link
              href={`/admin/manage?month=${shiftMonth(month, 1)}`}
              aria-label="Next month"
              className="flex h-9 w-9 items-center justify-center ring-1 ring-charcoal/15 text-charcoal transition-colors hover:bg-sand-deep"
            >
              →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-soft">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day == null)
              return <div key={`b-${i}`} className="min-h-20" />;
            const dayISO = `${month}-${pad(day)}`;
            const dayBookings = bookings.filter((b) => coversDay(b, dayISO));
            const isSelected = selected === day;
            return (
              <button
                key={dayISO}
                type="button"
                onClick={() => setSelected(day)}
                className={`min-h-20 p-1.5 text-left align-top ring-1 transition-colors ${
 isSelected
 ? "bg-green/10 ring-green"
 : "bg-sand ring-transparent hover:ring-charcoal/15"
 }`}
              >
                <span className="text-xs font-medium text-charcoal">{day}</span>
                <span className="mt-1 flex flex-col gap-1">
                  {dayBookings.slice(0, 3).map((b) => (
                    <span
                      key={b.id}
                      className={`truncate px-1.5 py-0.5 text-[11px] leading-tight ${
 b.blocking
 ? "bg-green/15 text-green"
 : "bg-charcoal/5 text-ink-soft line-through"
 }`}
                    >
                      {b.roomName}
                    </span>
                  ))}
                  {dayBookings.length > 3 && (
                    <span className="px-1.5 text-[11px] text-ink-soft">
                      +{dayBookings.length - 3} more
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-green/15 ring-1 ring-green/40" />
            Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-charcoal/5 ring-1 ring-charcoal/15" />
            Cancelled
          </span>
        </div>
      </div>

      {/* Day detail + cancel */}
      <div className="bg-surface p-6 ring-1 ring-charcoal/5">
        {selectedISO == null ? (
          <p className="text-ink-soft">
            Select a day to see its bookings and cancel any of them.
          </p>
        ) : (
          <>
            <h3 className="font-display text-xl text-charcoal">
              {formatLong(selectedISO)}
            </h3>
            {selectedBookings.length === 0 ? (
              <p className="mt-3 text-ink-soft">No bookings on this day.</p>
            ) : (
              <ul className="mt-5 grid gap-4">
                {selectedBookings.map((b) => (
                  <li
                    key={b.id}
                    className="bg-sand p-4 ring-1 ring-charcoal/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-charcoal">
                          {b.roomName}
                        </p>
                        <p className="font-mono text-xs text-ink-soft">
                          JB{String(b.id).padStart(5, "0")}
                          {b.source ? ` · via ${b.source}` : ""}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 px-2.5 py-1 text-xs font-medium ${
 b.blocking
 ? "bg-green/10 text-green"
 : "bg-sand-deep text-ink-soft line-through"
 }`}
                      >
                        {b.status ?? "—"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-charcoal">{b.guestName}</p>
                    {b.guestEmail && (
                      <a
                        href={`mailto:${b.guestEmail}`}
                        className="block text-xs text-ink-soft hover:text-green"
                      >
                        {b.guestEmail}
                      </a>
                    )}
                    {b.guestPhone && (
                      <a
                        href={`tel:${b.guestPhone}`}
                        className="block text-xs text-ink-soft hover:text-green"
                      >
                        {b.guestPhone}
                      </a>
                    )}
                    <p className="mt-1 text-xs text-ink-soft">
                      {formatLong(b.checkIn)} → {formatLong(b.checkOut)}
                    </p>
                    {b.blocking && (
                      <div className="mt-3">
                        <CancelBookingForm id={b.id} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
