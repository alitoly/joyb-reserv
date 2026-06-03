import type { RoomTypeSlug } from "./types";

/**
 * Static presentation content for the three room types.
 *
 * This lets the marketing pages render fully even before Supabase is wired up.
 * The `slug` and `capacity` here MUST match the seeded rows in
 * `supabase-schema.sql`; availability/booking is resolved against Supabase by
 * slug. Swap the imagery later by replacing `image`.
 */
export interface RoomContent {
  slug: RoomTypeSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  beds: string;
  capacity: number;
  /** Indicative nightly rate in USD; the resort can refine in Supabase. */
  priceFrom: number;
  amenities: string[];
  image: string;
  imageAlt: string;
}

const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const ROOMS: RoomContent[] = [
  {
    slug: "garden-single",
    name: "Garden Single Room",
    shortName: "Garden Single",
    tagline: "One bed · private bathroom",
    description:
      "A calm room for solo travellers, opening onto the palm garden. One comfortable bed, a private en-suite bathroom, and the sound of the sea a short walk away.",
    beds: "1 single bed",
    capacity: 1,
    priceFrom: 85,
    amenities: ["Private bathroom", "Garden view", "Air conditioning", "Free Wi-Fi"],
    image: unsplash("photo-1566073771259-6a8506099945"),
    imageAlt:
      "Sunlit single hotel room with crisp white linen and a private en-suite door",
  },
  {
    slug: "ocean-twin",
    name: "Ocean Twin Room",
    shortName: "Ocean Twin",
    tagline: "Two beds · private bathroom",
    description:
      "Made for friends and small families. Two beds, a private bathroom, and a breezy balcony that catches the Indian Ocean light through the morning.",
    beds: "2 twin beds",
    capacity: 2,
    priceFrom: 120,
    amenities: ["Private bathroom", "Ocean glimpse", "Balcony", "Air conditioning", "Free Wi-Fi"],
    image: unsplash("photo-1582719478250-c89cae4dc85b"),
    imageAlt:
      "Bright twin-bed room with two neatly made beds and a balcony overlooking greenery",
  },
  {
    slug: "master-suite",
    name: "Master Suite",
    shortName: "Master Suite",
    tagline: "One double bed · private bathroom",
    description:
      "Our signature room. A generous double bed, a spacious en-suite bathroom, and the best views on the property. The place to settle in for a slow Zanzibar week.",
    beds: "1 double bed",
    capacity: 2,
    priceFrom: 195,
    amenities: [
      "Private bathroom",
      "Panoramic ocean view",
      "Lounge corner",
      "Air conditioning",
      "Free Wi-Fi",
    ],
    image: unsplash("photo-1611892440504-42a792e24d32"),
    imageAlt:
      "Spacious master suite with a large double bed framed by soft natural light",
  },
];

export function getRoom(slug: string): RoomContent | undefined {
  return ROOMS.find((r) => r.slug === slug);
}
