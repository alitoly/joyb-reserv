import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ScrollLine } from "@/components/scroll-line";
import { ButtonLink, Kicker, Section } from "@/components/ui";
import { GALLERY_IMAGES } from "@/lib/gallery";
import { ScrollImageShowcase } from "@/components/scroll-image-showcase";

export const revalidate = 300;

const EXPERIENCES = [
  { src: "/joyb_images/pool-loungers.jpg", label: "The pool", title: "Long afternoons beside the water", body: "The full-length pool sits at the centre of the garden, with loungers, towels, and shade close by." },
  { src: "/joyb_images/restaurant-night.jpg", label: "Dining", title: "Warm light, open air", body: "Breakfast beneath the thatch, tables among the trees, and a fresh juice counter by the courtyard." },
  { src: "/joyb_images/deluxe-1.jpg", label: "The rooms", title: "A quiet place to return to", body: "Comfortable rooms with private bathrooms, cool interiors, and the essentials for an easy stay." },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate -mt-24 flex min-h-[100svh] items-end overflow-hidden bg-charcoal">
        <Image src="/joyb_images/garden-lawn.jpg" alt="The lawn at JoyB Resort beneath old mango trees and young palms" fill priority sizes="100vw" className="animate-settle -z-10 object-cover object-[52%_center]" />
        <div className="absolute inset-0 -z-10 bg-charcoal/15" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/45 via-charcoal/5 to-charcoal/95" aria-hidden="true" />
        <div className="relative w-full px-5 pb-12 sm:px-8 sm:pb-16">
          <div className="mx-auto grid max-w-7xl gap-8 border-t border-white/45 pt-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-5 text-[0.68rem] font-semibold tracking-[0.32em] text-gold uppercase sm:text-xs">A garden retreat · Zanzibar</p>
              <h1 className="display-xl max-w-5xl font-display text-[clamp(4.3rem,13vw,11.5rem)] text-white">Stay close<br />to nature.</h1>
            </div>
            <div className="max-w-xs pb-2 lg:text-right">
              <p className="text-sm leading-7 text-white/75">Seventeen rooms, a pool beneath the palms, and an unhurried place to return to.</p>
              <a href="#discover" className="mt-6 inline-flex items-center gap-4 text-xs font-semibold tracking-[0.2em] text-white uppercase">Discover JoyB <span className="h-px w-12 bg-gold" aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      <Section id="discover" className="relative py-24 sm:py-36">
        <div className="absolute top-0 left-8 hidden h-full md:block"><ScrollLine /></div>
        <div className="grid gap-12 md:grid-cols-[1fr_2.1fr] md:gap-20 md:pl-16">
          <Reveal>
            <Kicker>Why JoyB</Kicker>
            <p className="mt-8 max-w-xs text-sm leading-7 text-ink-soft">Close to Zanzibar Airport, yet held inside a garden of mango trees, palms, and quiet corners.</p>
          </Reveal>
          <Reveal delay={100}><h2 className="max-w-4xl text-[clamp(3rem,6.7vw,6.5rem)] leading-[0.93] text-charcoal">A small resort, generous in every way that matters.</h2></Reveal>
        </div>
      </Section>

      <section className="bg-green py-24 text-sand sm:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 flex flex-col gap-6 border-b border-sand/25 pb-8 sm:flex-row sm:items-end sm:justify-between">
            <Reveal><Kicker>Life at JoyB</Kicker><h2 className="mt-5 text-[clamp(3rem,6vw,5.6rem)] leading-[0.92] text-sand">Let the day<br />find its own pace.</h2></Reveal>
            <Reveal delay={100}><ButtonLink href="/gallery" variant="light">See the full gallery</ButtonLink></Reveal>
          </div>
          <div className="grid gap-12 lg:grid-cols-3">
            {EXPERIENCES.map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <article className={index === 1 ? "lg:mt-16" : ""}>
                  <div className={`relative overflow-hidden bg-green-strong ${index === 1 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                    <Image src={item.src} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-1000 hover:scale-[1.025]" />
                  </div>
                  <p className="mt-6 text-[0.68rem] font-semibold tracking-[0.28em] text-gold uppercase">0{index + 1} · {item.label}</p>
                  <h3 className="mt-3 text-3xl leading-none text-sand">{item.title}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-sand/65">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-sand py-24 sm:py-36">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><Kicker>Seen at JoyB</Kicker><h2 className="mt-5 text-[clamp(3rem,6vw,5.5rem)] leading-[0.92] text-charcoal">The island mood,<br />moving with you.</h2></div>
            <Link href="/gallery" className="group inline-flex items-center gap-4 text-xs font-semibold tracking-[0.18em] text-rust uppercase">Explore 49 photographs <span className="h-px w-12 bg-rust transition-all group-hover:w-16" aria-hidden="true" /></Link>
          </Reveal>
        </div>
        <div className="mt-14"><ScrollImageShowcase images={GALLERY_IMAGES.slice(0, 16)} /></div>
      </section>

      <section className="relative isolate overflow-hidden bg-charcoal py-28 text-center text-white sm:py-44">
        <Image src="/joyb_images/resort-twilight.jpg" alt="JoyB Resort pool and garden at twilight" fill sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-charcoal/35" />
        <Reveal className="mx-auto max-w-4xl px-5">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">Your Zanzibar stay</p>
          <h2 className="mt-5 text-[clamp(3.8rem,9vw,8rem)] leading-[0.85] text-white">Come home to the garden.</h2>
          <ButtonLink href="/rooms" variant="light" className="mt-9">Find your room</ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
