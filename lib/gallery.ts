export const GALLERY_CATEGORIES = [
  "All",
  "Rooms",
  "Pool",
  "Gardens",
  "Dining",
  "Gatherings",
  "Night",
  "Moments",
] as const;

export type GalleryCategory = Exclude<(typeof GALLERY_CATEGORIES)[number], "All">;

export interface GalleryImage {
  src: string;
  width: number;
  height: number;
  category: GalleryCategory;
  caption: string;
  alt: string;
  featured?: boolean;
}

const image = (
  file: string,
  width: number,
  height: number,
  category: GalleryCategory,
  caption: string,
  alt: string,
  featured = false,
): GalleryImage => ({
  src: `/joyb_images/${file}`,
  width,
  height,
  category,
  caption,
  alt,
  featured,
});

/** Every resort photograph supplied for the redesign, presented without invented claims. */
export const GALLERY_IMAGES: readonly GalleryImage[] = [
  image("garden-lawn.jpg", 2560, 1609, "Gardens", "Under the palms", "JoyB Resort lawn beneath mango trees and young palms", true),
  image("resort-twilight.jpg", 2560, 1707, "Night", "Blue hour", "JoyB Resort pool and gardens glowing at twilight", true),
  image("pool-golden-hour.jpg", 2560, 1707, "Pool", "Golden hour", "Sunset light across the pool and garden", true),
  image("restaurant-night.jpg", 1920, 2560, "Dining", "Dinner under the thatch", "Open-air restaurant with wicker pendant lights after dark", true),
  image("deluxe-1.jpg", 2560, 1707, "Rooms", "Deluxe room", "Deluxe room with crisp linen, woven wall pieces, and a daybed", true),
  image("gathering-dining.jpg", 2560, 1707, "Gatherings", "A table in the garden", "Dining tables prepared beneath a lit garden pergola", true),
  image("night-pool.jpg", 2560, 1617, "Night", "After dark", "Pool illuminated in turquoise and violet after dark", true),
  image("juice-point.jpg", 2560, 1707, "Dining", "Fresh Juice Point", "Colorful fresh juice counter beside the pool loungers"),
  image("pool-loungers.jpg", 2560, 1707, "Pool", "Poolside pause", "Loungers with rolled towels along the pool"),
  image("pool-terrace.jpg", 2560, 1707, "Pool", "Beside the water", "Pool terrace with garden planting and shaded seating"),
  image("poolside-rooms.jpg", 2560, 1707, "Pool", "Rooms by the pool", "Coral stone room fronts opening onto the pool terrace"),
  image("night-pool-wide.jpg", 2560, 1920, "Night", "Evening swim", "Wide view of the illuminated pool and resort rooms"),
  image("night-restaurant.jpg", 2560, 1707, "Night", "Garden evenings", "Warm lights around the open-air restaurant at night"),
  image("rooms-at-night.jpg", 2560, 1707, "Night", "A warm welcome", "Resort rooms and palms illuminated after sunset"),
  image("room-block.jpg", 2560, 1920, "Gardens", "Garden rooms", "Resort rooms facing the pool and garden"),
  image("shade-sail-lounge.jpg", 2560, 1707, "Gardens", "A shaded corner", "Outdoor lounge seating beneath a shade sail"),
  image("dhow-courtyard.jpg", 2560, 1707, "Gardens", "The dhow courtyard", "Carved wooden dhow resting beside a painted wave mural"),
  image("safari-mural.jpg", 2560, 1740, "Gardens", "Art in the garden", "Hand-painted safari mural behind a coral rock water feature"),
  image("reception.jpg", 2560, 1707, "Moments", "Arrive at JoyB", "JoyB Resort reception desk and entrance"),
  image("certificates.jpg", 2560, 1707, "Moments", "JoyB details", "Framed JoyB Resort certificates displayed on a wall"),
  image("joyb-moments.jpg", 2560, 1707, "Moments", "A JoyB moment", "Three people sharing a moment indoors at JoyB Resort"),
  image("restaurant-pergola.jpg", 2560, 1707, "Dining", "Garden dining", "Wooden tables beneath the shaded restaurant pergola"),
  image("restaurant-terrace.jpg", 2560, 1707, "Dining", "Open-air table", "Restaurant terrace with tables among the garden trees"),
  image("juice-point-courtyard.jpg", 1600, 1200, "Dining", "Courtyard refreshment", "Fresh Juice Point and loungers in the resort courtyard"),
  image("gathering-poolside.jpg", 2560, 1707, "Gatherings", "Poolside gathering", "Tables and decorations arranged beside the pool"),
  image("gathering-seating.jpg", 2560, 1707, "Gatherings", "Garden seating", "Rows of chairs arranged for a gathering at JoyB"),
  image("gathering-dhow-courtyard.jpg", 2560, 1707, "Gatherings", "Courtyard tables", "Tables arranged around the dhow courtyard"),
  image("gathering-courtyard.jpg", 2560, 1707, "Gatherings", "Together outside", "A gathering set in the resort courtyard"),
  image("gathering-at-dusk.jpg", 2560, 1707, "Gatherings", "Gathering at dusk", "Poolside gathering as evening light settles over the resort"),
  image("bathroom-1.jpg", 1920, 2560, "Rooms", "Private bathroom", "Private bathroom with rain shower, vanity, and warm plaster walls"),
  image("bathroom-2.jpg", 1707, 2560, "Rooms", "Rain shower", "Rain shower and handheld shower against warm plaster walls"),
  image("bathroom-amenities.jpg", 1920, 2560, "Rooms", "Room amenities", "Mirrored bathroom cabinet with toiletries"),
  image("decorated-room.jpg", 1600, 1200, "Rooms", "A thoughtful welcome", "Guest room bed decorated with folded towels and flower petals"),
  image("deluxe-2.jpg", 2560, 1707, "Rooms", "Space to settle in", "Deluxe room with tea console and mini fridge"),
  image("deluxe-3.jpg", 2560, 1707, "Rooms", "A quiet corner", "Daybed with colorful cushions beside the wardrobe"),
  image("deluxe-4.jpg", 2560, 1707, "Rooms", "Welcome details", "Deluxe bed prepared with petals and towel swans"),
  image("deluxe-5.jpg", 2560, 1707, "Rooms", "Restful details", "White pillows and a printed cushion against a soft headboard"),
  image("deluxe-bright.jpg", 1600, 1200, "Rooms", "Light-filled room", "Bright deluxe room with a wide bed and woven wall decor"),
  image("deluxe-corner.jpg", 1600, 1200, "Rooms", "Room to unwind", "Deluxe guest room photographed from the seating area"),
  image("double-1.jpg", 2560, 1707, "Rooms", "Double room", "Double room with a soft headboard and woven wall pieces"),
  image("double-2.jpg", 2560, 1707, "Rooms", "Turned down", "Double room viewed from the doorway with the bed prepared"),
  image("double-3.jpg", 2560, 1707, "Rooms", "In-room comforts", "Tea tray, bottled water, and mini fridge beside the bed"),
  image("twin-1.jpg", 2560, 1707, "Rooms", "Twin room", "Twin room with two carved wooden beds and colorful cushions"),
  image("twin-2.jpg", 2560, 1707, "Rooms", "Your room", "Twin room seen through its open doorway"),
  image("twin-3.jpg", 2560, 1707, "Rooms", "Everything at hand", "Tea, water, and a mini fridge in the twin room"),
  image("connecting-1.jpg", 2560, 1707, "Rooms", "Interconnected room", "Interconnected room with a wide bed and Stone Town artwork"),
  image("connecting-2.jpg", 2560, 1707, "Rooms", "Private and connected", "Bedroom with its private bathroom door open"),
  image("connecting-3.jpg", 2560, 1707, "Rooms", "Island artwork", "Framed Stone Town waterfront painting in a guest room"),
  image("connecting-4.jpg", 2560, 1707, "Rooms", "Storage and space", "Wardrobe alcove with a safe and full-length mirror"),
];

export const FEATURED_GALLERY_IMAGES = GALLERY_IMAGES.filter((item) => item.featured);
