import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Kicker, Section } from "@/components/ui";
import { PageHero } from "@/components/page-hero";

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
      <PageHero image={aboutImg} alt="Coral stone room fronts shaded by old mango trees" kicker="Our story" title="A garden guesthouse, grown with care." description="JoyB began as a family home near Zanzibar Airport and grew into 17 rooms around a pool and garden." priority />

      <Section className="py-20 sm:py-32" width="narrow">
        <Reveal>
          <Kicker>In the heart of Zanzibar</Kicker>
          <p className="mt-7 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.05] text-charcoal">
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

      <Section className="pb-24 sm:pb-32" width="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <Reveal className="relative aspect-[4/5] overflow-hidden lg:aspect-[5/6]">
            <Image
              src={detailImg}
              alt="The reception desk at JoyB, a carved wooden bureau with two Zanzibari chairs beside it"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div className="grid gap-10">
            {VALUES.map((v, i) => (
              <Reveal as="div" key={v.title} delay={i * 90}>
                <p className="text-xs font-semibold tracking-[0.2em] text-rust uppercase">0{i + 1}</p>
                <h2 className="mt-3 font-display text-4xl text-charcoal">
                  {v.title}
                </h2>
                <p className="mt-2 leading-relaxed text-ink-soft">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pb-8" width="wide">
        <Reveal className="bg-green px-6 py-20 text-center sm:px-10 sm:py-28">
          <h2 className="mx-auto max-w-3xl text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] text-white">
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
