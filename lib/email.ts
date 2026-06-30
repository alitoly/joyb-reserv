import "server-only";
import { Resend } from "resend";
import { formatLong } from "./dates";

/**
 * Server-only reservation email. Notifies the resort manager so they can
 * manually confirm a website booking with the guest.
 *
 * Secrets stay server-side (no `NEXT_PUBLIC_`):
 *   - RESEND_API_KEY       — Resend API key (required to actually send)
 *   - RESERVATION_TO_EMAIL — manager inbox (defaults to reservation@joybresort.com)
 *   - RESERVATION_FROM_EMAIL — verified sender on a Resend-verified domain
 *
 * When RESEND_API_KEY is absent the function no-ops with a warning, so local /
 * unconfigured environments still complete bookings (the row is already saved).
 */

const TO = process.env.RESERVATION_TO_EMAIL || "reservation@joybresort.com";
const FROM = process.env.RESERVATION_FROM_EMAIL || "onboarding@resend.dev";
const apiKey = process.env.RESEND_API_KEY;

export interface ReservationEmailPayload {
  reference: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalUsd: number;
  notes: string | null;
}

let cached: Resend | null = null;
function getResend(): Resend | null {
  if (!apiKey) return null;
  if (!cached) cached = new Resend(apiKey);
  return cached;
}

function row(label: string, value: string): string {
  return `${label.padEnd(12)} ${value}`;
}

export async function sendReservationEmail(
  p: ReservationEmailPayload,
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      `RESEND_API_KEY not set — skipped manager email for booking ${p.reference}.`,
    );
    return;
  }

  const nightsLabel = `${p.nights} ${p.nights === 1 ? "night" : "nights"}`;
  const subject = `New booking ${p.reference} — ${p.roomName} (${formatLong(
    p.checkIn,
  )})`;

  // Plain-text body keeps it readable in any client and avoids markup surprises.
  const text = [
    "A new reservation request was submitted on the website.",
    "",
    row("Reference:", p.reference),
    row("Room:", p.roomName),
    row("Check-in:", formatLong(p.checkIn)),
    row("Check-out:", `${formatLong(p.checkOut)} (${nightsLabel})`),
    row("Guests:", String(p.guests)),
    row("Total:", `$${p.totalUsd}`),
    "",
    row("Name:", p.guestName),
    row("Email:", p.guestEmail),
    row("Phone:", p.guestPhone),
    ...(p.notes ? ["", "Notes:", p.notes] : []),
    "",
    "Please confirm the booking with the guest.",
  ].join("\n");

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const htmlRow = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#4a4f48">${label}</td><td style="padding:4px 0;color:#1d2020;font-weight:600">${esc(
      value,
    )}</td></tr>`;
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1d2020">
      <h2 style="margin:0 0 4px">New reservation request</h2>
      <p style="margin:0 0 16px;color:#4a4f48">Reference ${esc(p.reference)}</p>
      <table style="border-collapse:collapse;font-size:14px">
        ${htmlRow("Room", p.roomName)}
        ${htmlRow("Check-in", formatLong(p.checkIn))}
        ${htmlRow("Check-out", `${formatLong(p.checkOut)} (${nightsLabel})`)}
        ${htmlRow("Guests", String(p.guests))}
        ${htmlRow("Total", `$${p.totalUsd}`)}
        ${htmlRow("Name", p.guestName)}
        ${htmlRow("Email", p.guestEmail)}
        ${htmlRow("Phone", p.guestPhone)}
        ${p.notes ? htmlRow("Notes", p.notes) : ""}
      </table>
      <p style="margin:16px 0 0;color:#4a4f48">Please confirm the booking with the guest.</p>
    </div>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: p.guestEmail,
    subject,
    text,
    html,
  });

  if (error) {
    // Surface to the caller's try/catch so it's logged, but never blocks booking.
    throw new Error(`Resend error: ${error.message}`);
  }
}
