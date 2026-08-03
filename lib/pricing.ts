/**
 * Booking price breakdown, shared by the booking form, the server action, and
 * the confirmation emails so the three never disagree.
 *
 * The live `reservations` schema has no separate `vat_amount` column, so VAT
 * is folded into `total_amount` — the one number the guest pays and reception
 * sees.
 */

/** Flat VAT charge per guest, per night. */
export const VAT_PER_GUEST_PER_NIGHT = 2;

export interface PriceBreakdown {
  /** Nightly rate × nights, before VAT. */
  subtotal: number;
  /** VAT_PER_GUEST_PER_NIGHT × guests × nights. */
  vat: number;
  /** subtotal + vat. Written to `reservations.total_amount`. */
  total: number;
}

function money(n: number): number {
  return Number(n.toFixed(2));
}

export function calculatePrice(
  pricePerNight: number,
  nights: number,
  guests: number,
): PriceBreakdown {
  const subtotal = money(pricePerNight * nights);
  const vat = money(VAT_PER_GUEST_PER_NIGHT * guests * nights);
  return { subtotal, vat, total: money(subtotal + vat) };
}
