import type { Metadata } from "next";
import { ROOMS } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Rooms & rates",
  description:
    "Three room types at JoyB Resort Zanzibar: the Garden Single, the Ocean Twin, and the Master Suite. Each with a private bathroom and island calm.",
};

const INCLUDED = [
  "Private en-suite bathroom",
  "Daily housekeeping",
  "Air conditioning & ceiling fan",
  "Free Wi-Fi throughout",
  "Breakfast on the terrace",
  "Beach towels & loungers",
];

export default function RoomsPage() {
  return (
    <>
      <Section className="pt-16 pb-10 sm:pt-24">
        <Reveal className="max-w-3xl">
          <Kicker>Rooms &amp; rates</Kicker>
          <h1 className="mt-4 text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] text-charcoal">
            Find the room that fits your stay
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Every room opens to the garden or the sea, and every room comes with
            a private bathroom. Pick your dates on the booking page to see exactly
            what’s free.
          </p>
        </Reveal>
      </Section>

      <Section className="pb-16">
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {ROOMS.map((room, i) => (
            <Reveal as="div" key={room.slug} delay={i * 90} className="h-full">
              <RoomCard room={room} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* What's included */}
      <Section className="py-12">
        <Reveal className="rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5 sm:p-12">
          <h2 className="font-display text-3xl text-charcoal">
            Included with every room
          </h2>
          <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink-soft">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green/10 text-green">
                  <CheckIcon className="h-4 w-4" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      <Section className="pb-8">
        <Reveal className="rounded-[2rem] bg-charcoal px-6 py-14 text-center sm:px-10">
          <h2 className="mx-auto max-w-2xl text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight text-white">
            Ready when you are
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sand/80">
            Choose your dates and room, and we’ll hold it for you.
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink href="/book" variant="gold" className="px-8">
              Book your stay
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
