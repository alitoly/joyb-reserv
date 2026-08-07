import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "JoyB Resort is a family-run garden guesthouse in the heart of Zanzibar, minutes from the airport, built on warm Swahili hospitality.",
};

const aboutImg = "/joyb_images/room-block.jpg";
const detailImg = "/joyb_images/reception.jpg";

const VALUES = [
  {
    title: "Swahili hospitality",
    body: "Karibu means welcome, and we mean it. Our team is from the neighbourhood, and they treat guests like family who came a long way.",
  },
  {
    title: "Gentle on the island",
    body: "Solar hot water, refillable glass bottles, and produce from the local market each morning. Small footprint, big flavour.",
  },
  {
    title: "Just 17 rooms",
    body: "We kept JoyB intimate on purpose. With only 17 rooms across four types, mornings stay quiet, the garden stays calm, and there's time to learn your name.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate -mt-20 flex min-h-[80vh] w-full items-end overflow-hidden">
        <Image
          src={aboutImg}
          alt="Coral stone room fronts with red shutters, shaded by old mango trees"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        {/* Same treatment as the home hero, tuned to this photograph: sky
            shows through the canopy here, so the wash is a few points heavier
            than the home page needs to clear 3:1 on the headline. */}
        <div className="absolute inset-0 -z-10 bg-charcoal/20" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/35 from-0% via-charcoal/10 via-35% to-charcoal/95 to-100%"
          aria-hidden="true"
        />
        <Section className="pt-32 pb-16">
          <div className="max-w-4xl">
            <p className="text-sm tracking-[0.2em] text-white/80 uppercase">
              Our story
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.03em] text-white">
              A little garden guesthouse in Zanzibar
            </h1>
          </div>
        </Section>
      </section>

      <Section className="py-16 sm:py-24" width="narrow">
        <Reveal>
          <Kicker>In the heart of Zanzibar</Kicker>
          <p className="mt-6 text-xl leading-relaxed text-charcoal">
            In the heart of Zanzibar, JoyB began as a family home, a short
            drive from the airport and the winding lanes of Stone Town.
          </p>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Over the years, we grew to 17 rooms around a pool, with a restaurant
            under the mango trees and a juice bar beside the water.
            We never wanted a big hotel; we wanted a quiet, green place where
            you could put your phone down and remember what &ldquo;unhurried&rdquo;
            feels like. That is still the whole idea.
          </p>
          <p className="mt-5 leading-relaxed text-ink-soft">
            Today, JoyB is still run by the same family, supported by a team
            from the neighbourhood who know the island inside out, from the
            best routes into town to exactly how you like your morning coffee
            by day three.
          </p>
        </Reveal>
      </Section>

      <Section className="pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={detailImg}
              alt="The reception desk at JoyB, a carved wooden bureau with two Zanzibari chairs beside it"
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
        <Reveal className="bg-green px-6 py-16 text-center sm:px-10">
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
