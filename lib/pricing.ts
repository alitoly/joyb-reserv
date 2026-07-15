/**
 * Booking price breakdown, shared by the booking form, the server action, and
 * the confirmation emails so the three never disagree.
 *
 * Matches the live `reservations` schema's own convention (`total_amount` +
 * `vat_amount` = `grand_total`): `total_amount` is the pre-VAT subtotal, not
 * what the guest pays.
 */

export const VAT_RATE = 0.18;

export interface PriceBreakdown {
  /** Pre-VAT subtotal: nightly rate × nights. Written to `reservations.total_amount`. */
  subtotal: number;
  /** 18% of the subtotal. Written to `reservations.vat_amount`. */
  vat: number;
  /** subtotal + vat — what the guest actually pays. Written to `reservations.grand_total`. */
  grandTotal: number;
}

function money(n: number): number {
  return Number(n.toFixed(2));
}

export function calculatePrice(pricePerNight: number, nights: number): PriceBreakdown {
  const subtotal = money(pricePerNight * nights);
  const vat = money(subtotal * VAT_RATE);
  return { subtotal, vat, grandTotal: money(subtotal + vat) };
}
