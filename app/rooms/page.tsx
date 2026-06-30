import type { Metadata } from "next";
import { listRooms } from "@/lib/rooms-data";
import { BED_SIZES, FACILITIES, FACILITIES_SENTENCE } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { Reveal } from "@/components/reveal";
import { Kicker, Section } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms & rates",
  description:
    "Browse every room at JoyB Resort Zanzibar with live nightly rates, capacity, and facilities. Pick your dates on the booking page to see what's free.",
};

export default async function RoomsPage() {
  const rooms = await listRooms();

  return (
    <>
      <Section className="pt-16 pb-10 sm:pt-24">
        <Reveal className="max-w-3xl">
          <Kicker>Rooms &amp; rates</Kicker>
          <h1 className="mt-4 text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-charcoal">
            Find the room that fits your stay
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Every room comes with a private bathroom and the same thoughtful
            facilities. Pick your dates on the booking page to see exactly
            what&apos;s free.
          </p>
        </Reveal>
      </Section>

      {/* All rooms */}
      <Section className="py-12">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl text-charcoal">Our rooms</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            {rooms.length > 0
              ? "Here is every room with its type, capacity, and nightly rate."
              : "Our live room list isn't available right now. Please check back shortly."}
          </p>
        </Reveal>
        {rooms.length > 0 && (
          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <Reveal
                as="div"
                key={room.id}
                delay={(i % 3) * 90}
                className="h-full"
              >
                <RoomCard room={room} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {/* Facilities + Bed sizes */}
      <Section className="py-12">
        <div className="grid gap-7 lg:grid-cols-2">
          <Reveal className="rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5 sm:p-12">
            <h2 className="font-display text-3xl text-charcoal">In every room</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              {FACILITIES_SENTENCE}
            </p>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {FACILITIES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink-soft">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green/10 text-green">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5 sm:p-10">
            <h2 className="font-display text-3xl text-charcoal">Bed sizes</h2>
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-ink-soft">
                  <th className="py-3 font-medium">Bed type</th>
                  <th className="py-3 text-right font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {BED_SIZES.map((row) => (
                  <tr key={row.label} className="border-b border-charcoal/5 last:border-0">
                    <td className="py-3 text-charcoal">{row.label}</td>
                    <td className="py-3 text-right text-ink-soft">{row.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>

    </>
  );
}
