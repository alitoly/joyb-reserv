import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ScrollLine } from "@/components/scroll-line";
import { Kicker, Section } from "@/components/ui";
import { GALLERY_IMAGES } from "@/lib/gallery";
import { ScrollImageShowcase } from "@/components/scroll-image-showcase";

export const revalidate = 300;

const EXPERIENCES = [
  { src: "/joyb_images/pool-loungers.jpg", label: "The pool", title: "Long afternoons beside the water", frame: "lg:mt-20" },
  { src: "/joyb_images/restaurant-night.jpg", label: "Dining", title: "Warm light, open air", frame: "" },
  { src: "/joyb_images/deluxe-1.jpg", label: "The rooms", title: "A quiet place to return to", frame: "lg:mt-36" },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate -mt-24 flex min-h-[100svh] items-end overflow-hidden bg-charcoal text-white">
        <Image src="/joyb_images/garden-lawn.jpg" alt="The lawn at JoyB Resort beneath old mango trees and young palms" fill priority sizes="100vw" className="animate-settle -z-10 object-cover object-[52%_center]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/35 via-transparent to-charcoal/70" />
        <div className="w-full px-5 pb-10 sm:px-8 sm:pb-14">
          <p className="editorial-label mb-8 text-white/90">Zanzibar · Tanzania</p>
          <h1 className="display-xl max-w-[95rem] text-[clamp(5.2rem,16.5vw,16rem)] text-white">
            Welcome to<br /><em className="display-accent ml-[12vw]">JoyB Resort.</em>
          </h1>
        </div>
        <div className="absolute right-5 bottom-12 hidden items-center gap-4 editorial-label text-white md:flex [writing-mode:vertical-rl]">
          Scroll to explore <span className="h-20 w-px bg-white/60" />
        </div>
      </section>

      <Section id="discover" className="relative min-h-[88svh] py-20 sm:py-32" width="wide">
        <div className="absolute top-0 left-8 hidden h-full md:block"><ScrollLine /></div>
        <div className="flex justify-between border-t border-charcoal/45 pt-4 editorial-label"><span>JoyB Zanzibar</span><span>A garden stay</span></div>
        <div className="grid gap-12 pt-24 md:grid-cols-[0.7fr_2fr] md:gap-20 md:pt-36">
          <Reveal><Kicker>Why JoyB</Kicker></Reveal>
          <Reveal delay={100}><h2 className="max-w-5xl text-[clamp(3.6rem,7vw,7.2rem)] leading-[0.93] text-charcoal">A small resort, generous in every way that matters.</h2></Reveal>
        </div>
      </Section>

      <section className="bg-charcoal py-20 text-sand sm:py-28">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <div className="flex items-end justify-between border-t border-sand/35 pt-4">
            <Kicker>Life at JoyB</Kicker>
            <Link href="/gallery" className="editorial-link text-sand">Open gallery <span className="ml-2 text-rust">↗</span></Link>
          </div>
          <Reveal><h2 className="mt-20 max-w-5xl text-[clamp(4rem,8vw,8rem)] leading-[0.82] text-sand">Life at <em className="display-accent">JoyB Resort.</em></h2></Reveal>
          <div className="mt-20 grid items-start gap-12 lg:grid-cols-[0.9fr_1.25fr_0.8fr] lg:gap-7">
            {EXPERIENCES.map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <article className={item.frame}>
                  <div className={`group relative overflow-hidden bg-green-strong ${index === 1 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
                    <Image src={item.src} alt={item.title} fill sizes="(max-width: 1024px) 100vw, 36vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.035]" />
                  </div>
                  <p className="mt-5 editorial-label text-rust">0{index + 1} · {item.label}</p>
                  <h3 className="mt-3 max-w-sm text-[clamp(2rem,3.2vw,3.3rem)] leading-[0.98] text-sand">{item.title}</h3>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          <Reveal className="flex flex-col gap-8 border-t border-charcoal/45 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div><Kicker>Seen at JoyB</Kicker><h2 className="mt-16 text-[clamp(4rem,8vw,8rem)] leading-[0.82] text-charcoal">A closer look<br /><em className="display-accent">at the resort.</em></h2></div>
            <Link href="/gallery" className="editorial-link text-charcoal">Open gallery <span className="ml-2 text-rust">↗</span></Link>
          </Reveal>
        </div>
        <div className="mt-16"><ScrollImageShowcase images={GALLERY_IMAGES.slice(0, 16)} /></div>
      </section>

      <section className="grid min-h-[86svh] bg-sand lg:grid-cols-[1.55fr_1fr]">
        <Reveal className="relative min-h-[68svh] overflow-hidden"><Image src="/joyb_images/resort-twilight.jpg" alt="JoyB Resort pool and garden at twilight" fill sizes="(max-width: 1024px) 100vw, 62vw" className="object-cover" /></Reveal>
        <Reveal className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-[7vw]">
          <Kicker>A slower rhythm</Kicker>
          <h2 className="mt-16 text-[clamp(4.2rem,7vw,7rem)] leading-[0.82] text-charcoal">Your stay<br />at <em className="display-accent">JoyB Resort.</em></h2>
          <Link href="/rooms" className="editorial-link mt-14 text-charcoal">Find your room <span className="ml-2 text-rust">↗</span></Link>
        </Reveal>
      </section>
    </>
  );
}
