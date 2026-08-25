import type { Metadata } from "next";
import Image from "next/image";
import { GalleryExperience } from "@/components/gallery-experience";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/ui";
import { GALLERY_IMAGES } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore JoyB Resort through 49 photographs of the rooms, gardens, pool, dining spaces, gatherings, and evenings in Zanzibar.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="relative isolate -mt-24 flex min-h-[78svh] items-end overflow-hidden bg-charcoal">
        <Image src="/joyb_images/resort-twilight.jpg" alt="JoyB Resort pool and gardens at twilight" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/45 via-charcoal/10 to-charcoal/90" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">49 photographs · One place</p>
            <h1 className="mt-4 max-w-5xl text-[clamp(4.5rem,12vw,10rem)] leading-[0.82] text-white">The JoyB gallery.</h1>
          </Reveal>
        </div>
      </section>
      <Section width="wide" className="py-16 sm:py-24">
        <Reveal className="mb-12 grid gap-7 md:grid-cols-[1.2fr_1fr] md:items-end">
          <h2 className="text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] text-charcoal">Rooms, gardens, and the light between.</h2>
          <p className="max-w-lg leading-8 text-ink-soft">Browse the complete JoyB collection. Filter by scene, then open any photograph to move through the set with the arrow keys or on-screen controls.</p>
        </Reveal>
        <GalleryExperience images={GALLERY_IMAGES} />
      </Section>
    </>
  );
}
