import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Kicker, Section } from "@/components/ui";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "JoyB Resort is a family-run garden guesthouse in the heart of Zanzibar, minutes from the airport, built on warm Swahili hospitality.",
};

const aboutImg = "/joyb_images/room-block.jpg";
const detailImg = "/joyb_images/reception.jpg";

const VALUES = [
  "Swahili hospitality",
  "Garden calm",
  "Just 17 rooms",
];

export default function AboutPage() {
  return (
    <>
      <PageHero image={aboutImg} alt="Coral stone room fronts shaded by old mango trees" title={<>The story of<br /><em className="display-accent">JoyB Resort.</em></>} priority />

      <Section className="py-20 sm:py-32" width="wide">
        <Reveal>
          <Kicker>In the heart of Zanzibar</Kicker>
          <p className="mt-16 max-w-6xl font-display text-[clamp(3.3rem,7vw,7rem)] leading-[0.94] tracking-[-0.055em] text-charcoal">A family home that grew into a quiet garden stay.</p>
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
          <div className="grid gap-12">
            {VALUES.map((value, i) => (
              <Reveal as="div" key={value} delay={i * 90} className="border-t border-charcoal/35 pt-5">
                <p className="text-xs font-semibold tracking-[0.2em] text-rust uppercase">0{i + 1}</p>
                <h2 className="mt-8 font-display text-[clamp(2.7rem,5vw,5rem)] leading-[0.9] text-charcoal">{value}</h2>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pb-8" width="wide">
        <Reveal className="bg-charcoal px-6 py-20 text-center sm:px-10 sm:py-28">
          <h2 className="mx-auto max-w-3xl text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] text-white">
            Come stay with us
          </h2>
          <Link href="/rooms" className="editorial-link mx-auto mt-8 text-sand">Find your room <span className="ml-2 text-rust">↗</span></Link>
        </Reveal>
      </Section>
    </>
  );
}
