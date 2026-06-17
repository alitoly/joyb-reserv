import { NextResponse } from "next/server";
import { getRoomBlockingRanges, isRoomAvailable } from "@/lib/bookings";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { isValidISODate } from "@/lib/dates";
import { getRoom } from "@/lib/rooms-data";

/**
 * GET /api/availability?room=<roomId>&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
 *
 * Returns the room's upcoming blocking date ranges (for UI hints) and — when
 * both valid dates are supplied — the authoritative availability for that room
 * and range. Reflects all reservations regardless of source.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("room") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  if (!isSupabaseConfigured) {
    return NextResponse.json({ configured: false, ranges: [], availability: null });
  }

  const room = await getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Unknown room." }, { status: 400 });
  }

  const ranges = await getRoomBlockingRanges(roomId);

  let availability = null;
  if (isValidISODate(checkIn) && isValidISODate(checkOut) && checkOut > checkIn) {
    availability = await isRoomAvailable(roomId, checkIn, checkOut);
  }

  return NextResponse.json({ configured: true, ranges, availability });
}
