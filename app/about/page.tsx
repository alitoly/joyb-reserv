import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "JoyB Resort is a family-run beachfront hideaway in Jambiani, Zanzibar, built on warm Swahili hospitality and the slow blue of the Indian Ocean.",
};

const aboutImg =
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80";
const detailImg =
  "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?auto=format&fit=crop&w=1200&q=80";

const VALUES = [
  {
    title: "Swahili hospitality",
    body: "Karibu means welcome, and we mean it. Our team is from the village next door, and they treat guests like family who came a long way.",
  },
  {
    title: "Gentle on the island",
    body: "Solar hot water, refillable glass bottles, and seafood bought each morning from Jambiani's fishermen. Small footprint, big flavour.",
  },
  {
    title: "Just 17 rooms",
    body: "We kept JoyB intimate on purpose. With only 17 rooms across four types, mornings stay quiet, the sand stays uncrowded, and there's time to learn your name.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate min-h-[58vh] w-full overflow-hidden">
        <Image
          src={aboutImg}
          alt="Wooden dhow boat resting on white sand at low tide under a wide Zanzibar sky"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/75 to-charcoal/25"
          aria-hidden="true"
        />
        <Section className="flex min-h-[58vh] flex-col justify-end pb-14 pt-28">
          <div className="max-w-2xl text-sand">
            <p className="font-medium tracking-wide text-gold">Our story</p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.04] text-white">
              A little place on a long white beach
            </h1>
          </div>
        </Section>
      </section>

      <Section className="py-16 sm:py-24" width="narrow">
        <Reveal>
          <Kicker>Jambiani, Zanzibar</Kicker>
          <p className="mt-6 text-xl leading-relaxed text-charcoal">
            JoyB began as a family home on the east coast of Zanzibar, where the
            tide pulls back half a kilometre each morning and the village wakes to
            the sound of fishermen pushing out.
          </p>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Over the years we grew to 17 rooms, a shaded terrace, and a kitchen
            that smells of cardamom and grilled fish. We never wanted a big hotel.
            We wanted a place where you could put your phone down, feel the sand
            warm under your feet, and remember what unhurried feels like. That’s
            still the whole idea.
          </p>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Today JoyB is still run by the same family, with a team from the
            village who know the reef, the best hour for a dhow trip, and exactly
            how you like your morning coffee by day three.
          </p>
        </Reveal>
      </Section>

      <Section className="pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={detailImg}
              alt="Breakfast of tropical fruit and spiced tea laid out on a sunlit terrace table"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div className="grid gap-8">
            {VALUES.map((v, i) => (
              <Reveal as="div" key={v.title} delay={i * 90}>
                <h2 className="font-display text-2xl text-charcoal">
                  {v.title}
                </h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pb-8">
        <Reveal className="rounded-[2rem] bg-green px-6 py-16 text-center sm:px-10">
          <h2 className="mx-auto max-w-2xl text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight text-white">
            Come stay with us
          </h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/book" variant="gold" className="px-8">
              Book your stay
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              className="border-sand/40 px-8 text-sand hover:border-sand hover:text-white"
            >
              Ask us anything
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
