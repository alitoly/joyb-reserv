import { NextResponse } from "next/server";
import { checkAvailability, getBlockingRanges } from "@/lib/bookings";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isValidISODate } from "@/lib/dates";
import { getRoom } from "@/lib/rooms";
import type { RoomTypeSlug } from "@/lib/types";

/**
 * GET /api/availability?room=<slug>&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
 *
 * Always returns the room type's upcoming blocking date ranges (for UI hints),
 * and — when both valid dates are supplied — the authoritative availability
 * result for that range. Reads all blocking bookings regardless of source, so
 * reception / local-system bookings are reflected here.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomSlug = searchParams.get("room") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  if (!getRoom(roomSlug)) {
    return NextResponse.json({ error: "Unknown room type." }, { status: 400 });
  }
  const slug = roomSlug as RoomTypeSlug;

  if (!isSupabaseConfigured) {
    return NextResponse.json({ configured: false, ranges: [], availability: null });
  }

  const ranges = await getBlockingRanges(slug);

  let availability = null;
  if (isValidISODate(checkIn) && isValidISODate(checkOut) && checkOut > checkIn) {
    availability = await checkAvailability(slug, checkIn, checkOut);
  }

  return NextResponse.json({ configured: true, ranges, availability });
}
