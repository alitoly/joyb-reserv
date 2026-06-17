/**
 * Static presentation content the live database doesn't carry — facilities,
 * bed-size reference, and fallback imagery.
 *
 * Room inventory, prices, capacity, images and availability all come from
 * Supabase now: see `lib/rooms-data.ts` (listing) and `lib/bookings.ts`
 * (availability). This module is presentation-only.
 */

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** Shown when a room has no `image_path` in the database. */
export const FALLBACK_ROOM_IMAGE = unsplash("photo-1611892440504-42a792e24d32");
export const ROOM_IMAGE_ALT = "A bright, restful room at JoyB Resort";

/** Full facility names for prose / detail sections. */
export const FACILITIES = [
  "AC / Fan",
  "WiFi",
  "Towels",
  "Basic toiletries",
  "Fridge",
  "Kettle",
] as const;

/** Short facility labels for room cards and chips. */
export const FACILITY_LABELS = [
  "AC / Fan",
  "WiFi",
  "Towels",
  "Toiletries",
  "Fridge",
  "Kettle",
] as const;

/** One sentence describing what every room includes. */
export const FACILITIES_SENTENCE =
  "Each room includes AC or fan, WiFi, towels, basic toiletries, a fridge, and a kettle.";

export const BED_SIZES = [
  { label: "Single bed", size: "3.5 ft x 6 ft" },
  { label: "Twin bed", size: "5 ft x 6.5 ft" },
  { label: "Deluxe single bed", size: "3.5 ft x 6.5 ft" },
  { label: "Double bed", size: "6 ft x 6 ft" },
] as const;

export const BED_SIZES_SENTENCE =
  "Bed sizes vary by room type. Single beds are 3.5 ft x 6 ft, twin beds are 5 ft x 6.5 ft, deluxe single beds are 3.5 ft x 6.5 ft, and double beds are 6 ft x 6 ft.";
