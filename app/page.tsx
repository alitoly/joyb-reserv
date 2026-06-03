import Image from "next/image";
import { ROOMS } from "@/lib/rooms";
import { RoomCard } from "@/components/room-card";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";
import { WaveIcon, BedIcon, CalendarIcon } from "@/components/icons";

const heroImg =
  "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=2000&q=80";
const storyImg =
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80";

const FEATURES = [
  {
    icon: WaveIcon,
    title: "On the beach",
    body: "Step from your room onto soft white sand. The Indian Ocean sets the rhythm of every JoyB day, from sunrise swims to dhow sunsets.",
  },
  {
    icon: BedIcon,
    title: "Rooms made for rest",
    body: "Three room types, each with a private bathroom, cool air conditioning, and linen kept crisp. Designed for calm, not clutter.",
  },
  {
    icon: CalendarIcon,
    title: "Booking without the back-and-forth",
    body: "Pick your dates, see what's free in real time, and reserve in a minute. Your booking syncs straight to our front desk.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[88vh] w-full overflow-hidden">
        <Image
          src={heroImg}
          alt="Turquoise water meeting white sand on the Zanzibar coast at golden hour"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover animate-kenburns"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/55 via-charcoal/25 to-charcoal/65"
          aria-hidden="true"
        />
        <Section className="flex min-h-[88vh] flex-col justify-center py-28">
          <div className="max-w-2xl text-sand">
            <p className="font-medium tracking-wide text-gold">
              Jambiani · Zanzibar
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.02] text-white">
              A barefoot-luxury escape on the Zanzibar coast
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand/90">
              JoyB Resort is a small beachfront hideaway where warm Swahili
              hospitality meets the slow blue of the Indian Ocean. Stay a few
              nights. Leave on island time.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/book" variant="gold" className="px-8">
                Book now
              </ButtonLink>
              <ButtonLink
                href="/rooms"
                variant="outline"
                className="border-sand/40 px-8 text-sand hover:border-sand hover:text-white"
              >
                View rooms
              </ButtonLink>
            </div>
          </div>
        </Section>
      </section>

      {/* Features */}
      <Section className="py-20 sm:py-28">
        <Reveal className="max-w-2xl">
          <Kicker>Why JoyB</Kicker>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight text-charcoal">
            Small resort, generous in every way that matters
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="div" key={f.title} delay={i * 90}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green/10 text-green">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-2xl text-charcoal">
                {f.title}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Story split */}
      <Section className="py-12 sm:py-16">
        <div className="grid items-center gap-10 rounded-[2rem] bg-surface p-6 ring-1 ring-charcoal/5 sm:p-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <Image
              src={storyImg}
              alt="Palm-shaded terrace with loungers looking out over a calm turquoise lagoon"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <Kicker>Island time</Kicker>
            <h2 className="mt-4 text-[clamp(1.9rem,3.5vw,2.75rem)] leading-tight text-charcoal">
              Days that move at the pace of the tide
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Wake to the sound of the reef. Spend the morning in the water, the
              afternoon under a palm, the evening with grilled seafood and the
              sky going gold. JoyB is built around doing less, beautifully.
            </p>
            <div className="mt-8">
              <ButtonLink href="/about" variant="outline">
                Our story
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Rooms preview */}
      <Section className="py-20 sm:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Kicker>Where you’ll stay</Kicker>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-tight text-charcoal">
              Three rooms, one unforgettable view
            </h2>
          </div>
          <ButtonLink href="/rooms" variant="outline">
            All rooms &amp; rates
          </ButtonLink>
        </Reveal>

        <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {ROOMS.map((room, i) => (
            <Reveal as="div" key={room.slug} delay={i * 90} className="h-full">
              <RoomCard room={room} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <Section className="pb-8">
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-green px-6 py-16 text-center sm:px-10 sm:py-20">
          <h2 className="mx-auto max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-tight text-white">
            Your room by the ocean is waiting
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sand/90">
            Check live availability and reserve in under a minute. No account
            needed.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/book" variant="gold" className="px-8">
              Check availability
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
