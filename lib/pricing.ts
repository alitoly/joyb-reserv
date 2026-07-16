/**
 * Booking price breakdown, shared by the booking form, the server action, and
 * the confirmation emails so the three never disagree.
 *
 * Matches the live `reservations` schema: `total_amount` is what the guest
 * pays — no separate VAT line.
 */

export interface PriceBreakdown {
  /** Nightly rate × nights. Written to `reservations.total_amount`. */
  total: number;
}

function money(n: number): number {
  return Number(n.toFixed(2));
}

export function calculatePrice(pricePerNight: number, nights: number): PriceBreakdown {
  return { total: money(pricePerNight * nights) };
}
