import type { Metadata } from "next";
import { listRooms } from "@/lib/rooms-data";
import { BED_SIZES, FACILITIES } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui";
import { CheckIcon } from "@/components/icons";
import { PhotoGrid } from "@/components/photo-grid";

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
      <PageHero image="/joyb_images/deluxe-bright.jpg" alt="A bright guest room at JoyB Resort" title={<>Rooms and<br /><em className="display-accent">accommodation.</em></>} priority />

      <Section className="py-16 sm:py-24" width="wide">
        <PhotoGrid
          photos={[
            { src: "/joyb_images/deluxe-1.jpg", alt: "Deluxe room at JoyB", className: "col-span-2 aspect-[16/10] md:col-span-7" },
            { src: "/joyb_images/twin-1.jpg", alt: "Twin room at JoyB", className: "aspect-[3/4] md:col-span-3 md:mt-24" },
            { src: "/joyb_images/decorated-room.jpg", alt: "JoyB room prepared with towels and flowers", className: "aspect-[4/5] md:col-span-2 md:mt-10" },
          ]}
          className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5"
          sizes="(max-width: 768px) 50vw, 45vw"
          priorityFirst
        />
      </Section>

      {/* All rooms */}
      <Section className="pb-24 sm:pb-32" width="wide">
        <Reveal className="border-t border-charcoal/45 pt-4">
          <p className="editorial-label text-rust">Rooms & rates</p>
          <h2 className="mt-16 text-[clamp(4rem,8vw,8rem)] leading-[0.82] text-charcoal">Choose <em className="display-accent">your room.</em></h2>
        </Reveal>
        {rooms.length === 0 && <p className="mt-8 text-ink-soft">Our live room list isn&apos;t available right now.</p>}
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
