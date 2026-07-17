import { getServerSupabase } from "./supabase-server";
import type { RoomListing } from "./types";
import { FALLBACK_ROOM_IMAGE } from "./rooms";

/**
 * The room catalogue. `room_types` is the ONLY source — description, capacity
 * (`max_pax`), nightly rate (`price`) and inventory (`number_of_rooms`) all come
 * from that table, one `RoomListing` per row.
 *
 * The `rooms` table is deliberately NOT read here. Its rows are mock data left
 * over from the reception system's early testing, so its `day_payment`,
 * `max_pax` and row counts are meaningless to the website. The site sells a
 * TYPE; reception hands the guest a physical room at check-in.
 *
 * Imagery: `room_images` is keyed by physical room, so it is mock too and is not
 * used. Every type currently falls back to a shared image — `room_types` has no
 * image column yet. Ask the reception developer for one (or a
 * `room_type_images` table) to give each type its own photo.
 *
 * Server-only (uses the service-role client).
 */

interface RoomTypeRow {
  id: number;
  name: string | null;
  description: string | null;
  max_pax: number | null;
  number_of_rooms: number | null;
  price: number | null;
}

const TYPE_SELECT = "id, name, description, max_pax, number_of_rooms, price";

/**
 * A type is only sellable once reception has priced and stocked it. Rows with
 * `price = 0` or `number_of_rooms = 0` are half-finished entries (today:
 * "Standard" and "superior") and stay hidden — a guest must never see a $0 room.
 */
function isSellable(row: RoomTypeRow): boolean {
  return Number(row.price ?? 0) > 0 && Number(row.number_of_rooms ?? 0) > 0;
}

function toListing(row: RoomTypeRow): RoomListing {
  const typeName = row.name?.trim() || "Room";
  const maxPax = Number(row.max_pax ?? 0);

  return {
    id: String(row.id),
    name: typeName,
    typeName,
    capacity: maxPax > 0 ? maxPax : null,
    priceUsd: Number(row.price ?? 0),
    description: row.description?.trim() || null,
    imageUrl: FALLBACK_ROOM_IMAGE,
    images: [FALLBACK_ROOM_IMAGE],
    imageAlt: `${typeName} at JoyB Resort`,
    totalRooms: Number(row.number_of_rooms ?? 0),
  };
}

/** Every bookable room type — the source the room grid loops over. */
export async function listRooms(): Promise<RoomListing[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("room_types")
    .select(TYPE_SELECT)
    .order("id", { ascending: true });

  if (error || !data) {
    if (error) console.error("listRooms failed:", error.message);
    return [];
  }

  return (data as RoomTypeRow[])
    .filter(isSellable)
    .map(toListing)
    .sort((a, b) => a.priceUsd - b.priceUsd);
}

/** A single room type by id, for the booking page. Null when the type isn't
 *  sellable (unpriced or no rooms). */
export async function getRoomType(id: string): Promise<RoomListing | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const numId = Number(id);
  if (!Number.isInteger(numId)) return null;

  const { data, error } = await supabase
    .from("room_types")
    .select(TYPE_SELECT)
    .eq("id", numId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getRoomType failed:", error.message);
    return null;
  }

  const row = data as RoomTypeRow;
  return isSellable(row) ? toListing(row) : null;
}
