import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoom } from "@/lib/rooms-data";
import { facilitiesForType, roomSizeForType } from "@/lib/rooms";
import { getServerSupabase } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import {
  RoomBookingForm,
  type GuestDefaults,
} from "@/components/room-booking-form";
import { Reveal } from "@/components/reveal";
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
  const room = await getRoom(id);
  if (!room) return { title: "Room not found" };
  return {
    title: `${room.name} — ${room.typeName}`,
    description:
      room.description ??
      `Book ${room.name}, a ${room.typeName.toLowerCase()} at JoyB Resort Zanzibar from $${room.priceUsd} per night.`,
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
  const room = await getRoom(id);
  if (!room) notFound();

  const defaultGuest = await guestDefaults();
  const facilities = facilitiesForType(room.typeName);
  const size = roomSizeForType(room.typeName);
  const [hero, ...thumbs] = room.images;

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
            <Kicker>{room.typeName}</Kicker>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] text-charcoal">
              {room.name}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
              {room.capacity && <span>Sleeps {room.capacity}</span>}
              {room.capacity && <span aria-hidden="true">·</span>}
              <span>{size}</span>
              <span aria-hidden="true">·</span>
              <span className="text-charcoal">
                <span className="font-display text-xl">${room.priceUsd}</span> /
                night
              </span>
            </p>
          </Reveal>

          {/* Gallery */}
          <Reveal delay={80} className="mt-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-sand-deep">
              <Image
                src={hero}
                alt={room.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            {thumbs.length > 0 && (
              <ul className="mt-3 grid grid-cols-4 gap-3">
                {thumbs.slice(0, 4).map((src, i) => (
                  <li
                    key={`${src}-${i}`}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-sand-deep"
                  >
                    <Image
                      src={src}
                      alt={`${room.name} — view ${i + 2}`}
                      fill
                      sizes="(max-width: 1024px) 22vw, 12vw"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}
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
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green/10 text-green">
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
              Book this room
            </h2>
            <RoomBookingForm room={room} defaultGuest={defaultGuest} />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
