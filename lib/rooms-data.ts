import { getServerSupabase } from "./supabase-server";
import { isRoomLive, type RoomListing } from "./types";
import { FALLBACK_ROOM_IMAGE } from "./rooms";

/**
 * Base URL for the host that serves files referenced by `room_images.image_path`
 * (e.g. the reception system's storage, "https://example.com/storage"). These
 * images are NOT in Supabase Storage. When unset, rooms fall back to a generic
 * image so the page never shows a broken link.
 */
const ROOM_IMAGE_BASE_URL = process.env.ROOM_IMAGE_BASE_URL?.replace(/\/+$/, "");

/**
 * Reads the room catalogue from the live database and shapes it into
 * `RoomListing` view-models — one per room TYPE, not per physical room. The
 * site books by type: guests pick a type + dates, and the server assigns any
 * free physical room from that type's pool (see `lib/bookings.ts`
 * `isTypeAvailable`). Server-only (uses the service-role client).
 */

interface RoomRow {
  id: number;
  name: string | null;
  day_payment: number | null;
  status: string | null;
  description: string | null;
  max_pax: number | null;
  room_type_id: number | null;
  room_types: {
    name: string | null;
    description: string | null;
    max_pax: number | null;
  } | null;
  room_images: { image_path: string | null }[] | null;
}

// Live schema: rooms.name (not room_name), capacity on rooms.max_pax (the
// `pax` table is a guest registry, not capacity). See scripts/check-db-schema.mjs.
const SELECT =
  "id, name, day_payment, status, description, max_pax, room_type_id, room_types(name, description, max_pax), room_images(image_path)";

/** Resolve an `image_path` to a usable URL: pass through full URLs, prefix a
 *  relative path with ROOM_IMAGE_BASE_URL when configured, otherwise fall back. */
function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return FALLBACK_ROOM_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;
  if (ROOM_IMAGE_BASE_URL) {
    return `${ROOM_IMAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
  }
  return FALLBACK_ROOM_IMAGE;
}

/** Group live physical rooms by `room_type_id` into one RoomListing per type. */
function groupByType(rows: RoomRow[]): RoomListing[] {
  const liveRows = rows.filter((r) => isRoomLive(r.status) && r.room_type_id != null);

  const byType = new Map<number, RoomRow[]>();
  for (const r of liveRows) {
    const typeId = r.room_type_id as number;
    const members = byType.get(typeId);
    if (members) members.push(r);
    else byType.set(typeId, [r]);
  }

  const listings: RoomListing[] = [];
  for (const [typeId, members] of byType) {
    const first = members[0];
    const typeName = first.room_types?.name?.trim() || "Room";

    const description =
      first.room_types?.description?.trim() ||
      members.map((m) => m.description?.trim()).find(Boolean) ||
      null;

    const memberCapacities = members
      .map((m) => m.max_pax)
      .filter((n): n is number => typeof n === "number" && n > 0);
    const capacity =
      first.room_types?.max_pax && first.room_types.max_pax > 0
        ? first.room_types.max_pax
        : memberCapacities.length > 0
          ? Math.max(...memberCapacities)
          : null;

    const prices = members
      .map((m) => Number(m.day_payment ?? 0))
      .filter((p) => p > 0);
    const priceUsd = prices.length > 0 ? Math.min(...prices) : 0;

    const resolved = members
      .flatMap((m) => m.room_images ?? [])
      .map((img) => img?.image_path)
      .filter((p): p is string => Boolean(p && p.trim()))
      .map(resolveImageUrl);
    const images = resolved.length > 0 ? resolved : [resolveImageUrl(null)];

    listings.push({
      id: String(typeId),
      name: typeName,
      typeName,
      capacity,
      priceUsd,
      description,
      imageUrl: images[0],
      images,
      imageAlt: `${typeName} at JoyB Resort`,
      totalRooms: members.length,
    });
  }

  return listings.sort((a, b) => a.priceUsd - b.priceUsd);
}

/** Every bookable room type — the source the room grid loops over. */
export async function listRooms(): Promise<RoomListing[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rooms")
    .select(SELECT)
    .order("id", { ascending: true });

  if (error || !data) {
    if (error) console.error("listRooms failed:", error.message);
    return [];
  }

  return groupByType(data as unknown as RoomRow[]);
}

/** A single room type by id, for the booking page. Null if the type has no
 *  live physical rooms (nothing bookable). */
export async function getRoomType(id: string): Promise<RoomListing | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const numId = Number(id);
  if (!Number.isInteger(numId)) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select(SELECT)
    .eq("room_type_id", numId);

  if (error || !data) {
    if (error) console.error("getRoomType failed:", error.message);
    return null;
  }

  return groupByType(data as unknown as RoomRow[])[0] ?? null;
}
