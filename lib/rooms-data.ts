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
 * Reads the room catalogue from the live database and shapes it into the
 * `RoomListing` view-model the UI loops over. Server-only (uses the
 * service-role client). Selects non-PII columns and joins the type, capacity
 * and image tables.
 */

interface RoomJoinRow {
  id: number;
  name: string | null;
  day_payment: number | null;
  status: string | null;
  description: string | null;
  max_pax: number | null;
  room_types: { name: string | null } | null;
  room_images: { image_path: string | null }[] | null;
}

// Live schema: rooms.name (not room_name), capacity on rooms.max_pax (the
// `pax` table is a guest registry, not capacity). See scripts/check-db-schema.mjs.
const SELECT =
  "id, name, day_payment, status, description, max_pax, room_types(name), room_images(image_path)";

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

function toListing(r: RoomJoinRow): RoomListing {
  const name = r.name?.trim() || `Room ${r.id}`;
  const typeName = r.room_types?.name?.trim() || "Room";
  // Resolve every image_path into a usable URL for the gallery. Always keep at
  // least one entry so the details page never renders an empty gallery.
  const resolved = (r.room_images ?? [])
    .map((img) => img?.image_path)
    .filter((p): p is string => Boolean(p && p.trim()))
    .map(resolveImageUrl);
  const images = resolved.length > 0 ? resolved : [resolveImageUrl(null)];
  return {
    id: String(r.id),
    name,
    typeName,
    capacity: r.max_pax ?? null,
    priceUsd: Number(r.day_payment ?? 0),
    description: r.description?.trim() || null,
    imageUrl: images[0],
    images,
    imageAlt: `${name} - ${typeName} at JoyB Resort`,
  };
}

/** All live, bookable rooms — the source the room grid loops over. */
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

  return (data as unknown as RoomJoinRow[])
    .filter((r) => isRoomLive(r.status))
    .map(toListing);
}

/** A single room by id, for the booking page. */
export async function getRoom(id: string): Promise<RoomListing | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const numId = Number(id);
  if (!Number.isInteger(numId)) return null;

  const { data, error } = await supabase
    .from("rooms")
    .select(SELECT)
    .eq("id", numId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getRoom failed:", error.message);
    return null;
  }
  return toListing(data as unknown as RoomJoinRow);
}
