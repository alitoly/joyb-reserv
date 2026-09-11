import type { Metadata } from "next";
import Image from "next/image";
import { GalleryExperience } from "@/components/gallery-experience";
import { GALLERY_IMAGES } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Rooms, gardens, pool, dining spaces, gatherings, and evenings at JoyB Resort in Zanzibar.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="relative isolate -mt-24 flex min-h-[88svh] items-end overflow-hidden bg-charcoal">
        <Image src="/joyb_images/resort-twilight.jpg" alt="JoyB Resort pool and gardens at twilight" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/30 via-transparent to-charcoal/80" />
        <div className="mx-auto w-full max-w-[100rem] px-5 pb-14 sm:px-8 sm:pb-20">
          <h1 className="max-w-6xl text-[clamp(5rem,14vw,13rem)] leading-[0.7] text-white">A look inside<br /><em className="display-accent ml-[14vw]">JoyB Resort.</em></h1>
        </div>
      </section>
      <section className="bg-surface px-5 py-16 sm:px-8 sm:py-24">
        <GalleryExperience images={GALLERY_IMAGES} />
      </section>
    </>
  );
}
