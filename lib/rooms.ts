/**
 * Static presentation content the live database doesn't carry — facilities,
 * bed-size reference, and fallback imagery.
 *
 * Room inventory, prices, capacity, images and availability all come from
 * Supabase now: see `lib/rooms-data.ts` (listing) and `lib/bookings.ts`
 * (availability). This module is presentation-only.
 */

/** Shown when a room type has no photos of its own. */
export const FALLBACK_ROOM_IMAGE = "/joyb_images/double-1.jpg";
export const ROOM_IMAGE_ALT = "A bright, restful room at JoyB Resort";

/** Full facility names for prose / detail sections. */
export const FACILITIES = [
  "AC / Fan",
  "WiFi",
  "Towels",
  "Basic toiletries",
  "Fridge",
  "Kettle",
  "Safe box",
] as const;

/** Short facility labels for room cards and chips. */
export const FACILITY_LABELS = [
  "AC / Fan",
  "WiFi",
  "Towels",
  "Toiletries",
  "Fridge",
  "Kettle",
  "Safe box",
] as const;

/** One sentence describing what every room includes. */
export const FACILITIES_SENTENCE =
  "Each room includes AC or fan, WiFi, towels, basic toiletries, a fridge, a kettle, and a safe box.";

export const BED_SIZES = [
  { label: "Single bed", size: "3.5 ft x 6 ft" },
  { label: "Twin bed", size: "5 ft x 6.5 ft" },
  { label: "Deluxe single bed", size: "3.5 ft x 6.5 ft" },
  { label: "Double bed", size: "6 ft x 6 ft" },
] as const;

export const BED_SIZES_SENTENCE =
  "Bed sizes vary by room type. Single beds are 3.5 ft x 6 ft, twin beds are 5 ft x 6.5 ft, deluxe single beds are 3.5 ft x 6.5 ft, and double beds are 6 ft x 6 ft.";

// ---------------------------------------------------------------------------
// Per-room-type presentation defaults
//
// The shared front-desk database has no per-room "size" or "facilities"
// columns, so the room details page derives these from the room TYPE. These are
// display-only defaults — adjust the copy here, not in the database.
//
// Lookups go through `typeKey`, NOT through the raw name. Reception writes
// names like "Double Room", "Twin Room" and "Connecting room", which no exact
// key would ever match, so the whole map used to fall through to the defaults
// in silence. Keep matching on keywords so a rename at the front desk does not
// quietly blank out a room's facilities again.
// ---------------------------------------------------------------------------

/**
 * Reduce a live `room_types.name` to the key both maps below use. Order
 * matters: a "Double/Single" room must be caught before the plain "double"
 * test. Unknown types return "", which falls back to sensible defaults.
 */
function typeKey(typeName: string): string {
  const name = typeName.trim().toLowerCase();
  if (name.includes("delux")) return "deluxe";
  if (name.includes("connect")) return "interconnected";
  if (name.includes("twin")) return "twin";
  if (name.includes("double") && name.includes("single")) return "double/single";
  if (name.includes("double")) return "double";
  return "";
}

interface RoomTypePreset {
  /** Approximate room footprint, shown on the details page. */
  size: string;
  /** Extra, type-specific facilities layered on top of FACILITIES. */
  extras: readonly string[];
}

const ROOM_TYPE_PRESETS: Record<string, RoomTypePreset> = {
  "double/single": { size: "18 m² (approx.)", extras: ["Garden view"] },
  twin: { size: "20 m² (approx.)", extras: ["Two single beds", "Garden view"] },
  double: { size: "22 m² (approx.)", extras: ["Queen bed", "Garden view"] },
  deluxe: { size: "26 m² (approx.)", extras: ["Sofa", "Queen bed", "Garden view"] },
  interconnected: {
    size: "38 m² (approx.)",
    extras: ["Two connected rooms", "Family friendly", "Garden view"],
  },
};

const DEFAULT_PRESET: RoomTypePreset = {
  size: "20 m² (approx.)",
  extras: [],
};

function presetForType(typeName: string): RoomTypePreset {
  return ROOM_TYPE_PRESETS[typeKey(typeName)] ?? DEFAULT_PRESET;
}

/** Approximate size for a room type (presentation-only). */
export function roomSizeForType(typeName: string): string {
  return presetForType(typeName).size;
}

/** Full facilities list for a room type: the shared base plus type extras. */
export function facilitiesForType(typeName: string): string[] {
  return [...FACILITIES, ...presetForType(typeName).extras];
}

// ---------------------------------------------------------------------------
// Room photography
//
// `room_types` has no image column, and `room_images` is keyed by physical room
// and is mock data, so the site's imagery lives here, keyed by `typeKey` just
// like the presets above. Photos are the resort's own, in `public/joyb_images/`.
// ---------------------------------------------------------------------------

export interface RoomPhoto {
  src: string;
  alt: string;
}

/**
 * Every room shares the same bathroom design, and only three bathroom photos
 * exist, so every type shows this same set. Swap in per-type shots here if the
 * resort ever photographs them individually.
 */
export const BATHROOM_PHOTOS: readonly RoomPhoto[] = [
  {
    src: "/joyb_images/bathroom-1.jpg",
    alt: "Private bathroom with a rain shower, polished ochre plaster walls, toilet and vanity",
  },
  {
    src: "/joyb_images/bathroom-2.jpg",
    alt: "Rain shower head and handheld shower against warm plaster walls",
  },
  {
    src: "/joyb_images/bathroom-amenities.jpg",
    alt: "Mirrored bathroom cabinet stocked with shampoo, conditioner and soap",
  },
  {
    src: "/joyb_images/bathroom (2).JPG",
    alt: "Full bathroom with toilet, vanity sink and mirrored cabinet against ochre plaster walls",
  },
];

const ROOM_TYPE_PHOTOS: Record<string, readonly RoomPhoto[]> = {
  deluxe: [
    {
      src: "/joyb_images/deluxe-1.jpg",
      alt: "Deluxe room with a wide bed dressed in white linen, a kanga-cushioned daybed and woven wall discs",
    },
    {
      src: "/joyb_images/deluxe-2.jpg",
      alt: "The full length of the deluxe room, with a tea and coffee console and a mini fridge",
    },
    {
      src: "/joyb_images/deluxe-3.jpg",
      alt: "Daybed with kanga cushions beside an open wardrobe and glass doors onto the terrace",
    },
    {
      src: "/joyb_images/deluxe-4.jpg",
      alt: "Bed turned down with a petal welcome message and towel swans",
    },
    {
      src: "/joyb_images/deluxe-5.jpg",
      alt: "Crisp white pillows with a printed kanga cushion against a soft grey headboard",
    },
    {
      src: "/joyb_images/deluxe-bright.jpg",
      alt: "Bright deluxe room with a wide bed and woven wall decor",
    },
    {
      src: "/joyb_images/deluxe-corner.jpg",
      alt: "Deluxe room photographed from its seating area",
    },
    {
      src: "/joyb_images/decorated-room.jpg",
      alt: "Guest room prepared with folded towels and flower petals",
    },
    {
      src: "/joyb_images/delux (2).JPG",
      alt: "Deluxe room entrance with a wardrobe, armchair and glass doors onto the terrace",
    },
  ],
  twin: [
    {
      src: "/joyb_images/twin-1.jpg",
      alt: "Twin room with two carved wooden beds, kanga cushions and woven baskets on the wall",
    },
    {
      src: "/joyb_images/twin-2.jpg",
      alt: "The twin room seen through its doorway, name plate on the open door",
    },
    {
      src: "/joyb_images/twin-3.jpg",
      alt: "Corner of the twin room with a kettle, cups, bottled water and a mini fridge",
    },
    {
      src: "/joyb_images/decorated-room.jpg",
      alt: "JoyB guest room prepared with folded towels and flower petals",
    },
    {
      src: "/joyb_images/twin (2).JPG",
      alt: "Twin room with matching towel swans and woven wall discs above each bed",
    },
    {
      src: "/joyb_images/twin room.JPG",
      alt: "Twin room seen from the doorway, Moshi name plate and do-not-disturb sign on the door",
    },
    {
      src: "/joyb_images/WhatsApp Image 2026-08-22 at 3.47.13 PM (1).jpeg",
      alt: "Twin room with two beds facing each other and a bedside table between them",
    },
  ],
  double: [
    {
      src: "/joyb_images/double-1.jpg",
      alt: "Double room with a soft grey headboard, kanga cushions and woven wall discs",
    },
    {
      src: "/joyb_images/double-2.jpg",
      alt: "The double room seen from the doorway, bed turned down with petals",
    },
    {
      src: "/joyb_images/double-3.jpg",
      alt: "Foot of the bed beside the tea tray, bottled water and mini fridge",
    },
    {
      src: "/joyb_images/decorated-room.jpg",
      alt: "JoyB guest room prepared with folded towels and flower petals",
    },
    {
      src: "/joyb_images/double (2).JPG",
      alt: "Double room named Arusha, seen through the open doorway with a do-not-disturb sign",
    },
  ],
  interconnected: [
    {
      src: "/joyb_images/connecting-1.jpg",
      alt: "Interconnected room with a wide bed, petal welcome message and Stone Town paintings",
    },
    {
      src: "/joyb_images/connecting-2.jpg",
      alt: "Bedroom with the door to its private bathroom standing open",
    },
    {
      src: "/joyb_images/connecting-3.jpg",
      alt: "Framed painting of the Stone Town waterfront on the bedroom wall",
    },
    {
      src: "/joyb_images/connecting-4.jpg",
      alt: "Wardrobe alcove with hanging space, a safe box and a full length mirror",
    },
    {
      src: "/joyb_images/decorated-room.jpg",
      alt: "JoyB guest room prepared with folded towels and flower petals",
    },
    {
      src: "/joyb_images/connecting (2).JPG",
      alt: "Interconnected bedroom with a Stone Town street painting and a woven wall hanging",
    },
    {
      src: "/joyb_images/WhatsApp Image 2026-08-22 at 3.47.08 PM.jpeg",
      alt: "Bed turned down with a Karibu JoyB welcome message beneath a Stone Town waterfront painting",
    },
  ],
  // No photos of this type yet, so it borrows the two beds it actually has.
  "double/single": [
    {
      src: "/joyb_images/double-1.jpg",
      alt: "Double bed with a soft grey headboard and kanga cushions",
    },
    {
      src: "/joyb_images/twin-3.jpg",
      alt: "Single bed beside the tea tray, bottled water and mini fridge",
    },
    {
      src: "/joyb_images/decorated-room.jpg",
      alt: "JoyB guest room prepared with folded towels and flower petals",
    },
  ],
};

const DEFAULT_PHOTOS: readonly RoomPhoto[] = [
  { src: FALLBACK_ROOM_IMAGE, alt: ROOM_IMAGE_ALT },
];

/**
 * The room's own photos, lead shot first. Bathrooms are `BATHROOM_PHOTOS` and
 * are shown separately. Always returns at least one entry, so callers can
 * safely take `[0]`.
 */
export function roomPhotosForType(typeName: string): readonly RoomPhoto[] {
  return ROOM_TYPE_PHOTOS[typeKey(typeName)] ?? DEFAULT_PHOTOS;
}
