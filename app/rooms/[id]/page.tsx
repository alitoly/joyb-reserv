import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoomType } from "@/lib/rooms-data";
import { BATHROOM_PHOTOS, facilitiesForType, roomPhotosForType } from "@/lib/rooms";
import { getServerSupabase } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import {
  RoomBookingForm,
  type GuestDefaults,
} from "@/components/room-booking-form";
import { Reveal } from "@/components/reveal";
import { PhotoGrid } from "@/components/photo-grid";
import { Kicker, Section } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const room = await getRoomType(id);
  if (!room) return { title: "Room not found" };
  return {
    title: room.name,
    description:
      room.description ??
      `Book the ${room.name} at JoyB Resort Zanzibar from $${room.priceUsd} per night.`,
  };
}

/** Pre-fill the booking form for a signed-in guest: email from the session,
 *  name/phone from their most recent reservation (if any). */
async function guestDefaults(): Promise<GuestDefaults | undefined> {
  const user = await getSessionUser();
  if (!user?.email) return undefined;

  const defaults: GuestDefaults = { email: user.email };
  const supabase = getServerSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("reservations")
      .select("tenant_name, tenant_phone")
      .ilike("tenant_email", user.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      defaults.name = data.tenant_name ?? undefined;
      defaults.phone = data.tenant_phone ?? undefined;
    }
  }
  return defaults;
}

export default async function RoomDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const room = await getRoomType(id);
  if (!room) notFound();

  const defaultGuest = await guestDefaults();
  const facilities = facilitiesForType(room.typeName);
  const roomPhotos = roomPhotosForType(room.typeName);
  // Types carry different numbers of photos, so let the column count follow
  // them rather than stranding a lone tile on a half-empty row.
  const viewCols =
    (roomPhotos.length - 1) % 3 === 0 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <Section className="py-12 sm:py-16" width="wide">
      <Reveal>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
        >
          <span aria-hidden="true">←</span> All rooms
        </Link>
      </Reveal>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        {/* Left: gallery + details */}
        <div>
          <Reveal>
            <Kicker>Room type</Kicker>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] text-charcoal">
              {room.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
              {room.capacity && <span>Sleeps {room.capacity}</span>}
              {room.capacity && <span aria-hidden="true">·</span>}
              <span>
                {room.totalRooms} {room.totalRooms === 1 ? "room" : "rooms"} of this type
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-charcoal">
                <span className="font-display text-xl">${room.priceUsd}</span> /
                night
              </span>
            </p>
          </Reveal>

          {/* One grid, so the viewer's next/previous walks the whole room. The
              lead shot spans the full width; the rest fill complete rows. */}
          <Reveal delay={80} className="mt-7">
            <PhotoGrid
              photos={roomPhotos.map((photo, i) =>
                i === 0
                  ? { ...photo, className: "col-span-full aspect-[16/10]" }
                  : photo,
              )}
              className={`grid grid-cols-2 gap-3 ${viewCols}`}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 18vw"
              priorityFirst
            />
          </Reveal>

          {/* Every room has its own bathroom, and they share this design */}
          <Reveal delay={100} className="mt-10">
            <h2 className="font-display text-2xl text-charcoal">
              Your private bathroom
            </h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">
              Every room has its own bathroom with a rain shower, hot water, and
              fresh towels and toiletries waiting for you.
            </p>
            <PhotoGrid
              photos={BATHROOM_PHOTOS}
              className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 18vw"
            />
          </Reveal>

          {/* Description */}
          {room.description && (
            <Reveal delay={120} className="mt-10">
              <h2 className="font-display text-2xl text-charcoal">
                About this room
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
                {room.description}
              </p>
            </Reveal>
          )}

          {/* Facilities */}
          <Reveal delay={160} className="mt-10">
            <h2 className="font-display text-2xl text-charcoal">Facilities</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {facilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-ink-soft"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-green/10 text-green">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Right: booking form (sticky on large screens) */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal delay={100}>
            <h2 className="mb-4 font-display text-2xl text-charcoal">
              Book this room type
            </h2>
            <RoomBookingForm room={room} defaultGuest={defaultGuest} />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
