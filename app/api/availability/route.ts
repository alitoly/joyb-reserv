import { NextResponse } from "next/server";
import { isTypeAvailable } from "@/lib/bookings";
import { isSupabaseConfigured } from "@/lib/supabase-server";
import { isValidISODate } from "@/lib/dates";
import { getRoomType } from "@/lib/rooms-data";

/**
 * GET /api/availability?room=<roomTypeId>&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
 *
 * `room` is a room-TYPE id (the site books by type, not physical room). When
 * both valid dates are supplied, returns the authoritative pool availability
 * for that type — free/total room counts, never "sold out" until every
 * physical room of the type is booked for the range.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomTypeId = searchParams.get("room") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  if (!isSupabaseConfigured) {
    return NextResponse.json({ configured: false, availability: null });
  }

  const roomType = await getRoomType(roomTypeId);
  if (!roomType) {
    return NextResponse.json({ error: "Unknown room type." }, { status: 400 });
  }

  let availability = null;
  if (isValidISODate(checkIn) && isValidISODate(checkOut) && checkOut > checkIn) {
    const result = await isTypeAvailable(roomTypeId, checkIn, checkOut);
    // Strip server-only fields (roomId/roomName) before returning to the client.
    availability = {
      configured: result.configured,
      available: result.available,
      message: result.message,
      freeCount: result.freeCount,
      totalCount: result.totalCount,
    };
  }

  return NextResponse.json({ configured: true, availability });
}
