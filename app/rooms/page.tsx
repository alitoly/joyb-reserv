import type { Metadata } from "next";
import { listRooms } from "@/lib/rooms-data";
import { BED_SIZES, FACILITIES, FACILITIES_SENTENCE } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui";
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
      <PageHero image="/joyb_images/deluxe-bright.jpg" alt="A bright guest room at JoyB Resort" kicker="Rooms & rates" title="Rooms made for slow mornings." description="Every room has a private bathroom and the comforts needed for a calm Zanzibar stay. Choose a room type to see live rates and availability." priority />

      {/* All rooms */}
      <Section className="py-20 sm:py-28" width="wide">
        <Reveal className="grid gap-6 md:grid-cols-[1fr_1.5fr] md:items-end">
          <p className="text-xs font-semibold tracking-[0.25em] text-rust uppercase">Choose your space</p>
          <h2 className="text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] text-charcoal">Your room, your pace.</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            {rooms.length > 0
              ? "Here is every room with its type, capacity, and nightly rate."
              : "Our live room list isn't available right now. Please check back shortly."}
          </p>
        </Reveal>
        {rooms.length > 0 && (
          <div className="mt-14 grid gap-x-7 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
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
      <section className="bg-charcoal py-20 text-sand sm:py-28">
      <Section>
        <div className="grid gap-7 lg:grid-cols-2">
          <Reveal className="border border-sand/15 p-8 sm:p-12">
            <h2 className="font-display text-4xl text-sand">In every room</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-sand/65">
              {FACILITIES_SENTENCE}
            </p>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {FACILITIES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sand/75">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-gold/15 text-gold">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120} className="border border-sand/15 p-8 sm:p-10">
            <h2 className="font-display text-4xl text-sand">Bed sizes</h2>
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sand/15 text-sand/55">
                  <th className="py-3 font-medium">Bed type</th>
                  <th className="py-3 text-right font-medium">Size</th>
                </tr>
              </thead>
              <tbody>
                {BED_SIZES.map((row) => (
                  <tr key={row.label} className="border-b border-sand/10 last:border-0">
                    <td className="py-3 text-sand">{row.label}</td>
                    <td className="py-3 text-right text-sand/60">{row.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>
      </section>

    </>
  );
}
