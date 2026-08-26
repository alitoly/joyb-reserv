"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { GalleryImage } from "@/lib/gallery";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ImageRail({ images, direction }: { images: readonly GalleryImage[]; direction: "left" | "right" }) {
  const rail = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = rail.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      el,
      { xPercent: direction === "left" ? 2 : -18 },
      {
        xPercent: direction === "left" ? -18 : 2,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      },
    );
  }, { scope: rail });

  return (
    <div ref={rail} data-image-rail={direction} className="flex w-max gap-3 will-change-transform sm:gap-5">
      {images.map((photo, index) => (
        <figure
          key={photo.src}
          className={`group relative shrink-0 overflow-hidden bg-sand-deep ${index % 3 === 1 ? "mt-14 h-[60vw] w-[42vw] sm:h-[34rem] sm:w-[23rem]" : index % 3 === 2 ? "mt-4 h-[46vw] w-[60vw] sm:h-[27rem] sm:w-[40rem]" : "h-[54vw] w-[70vw] sm:h-[34rem] sm:w-[46rem]"}`}
        >
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 65vw, 40vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.025]" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-charcoal/80 to-transparent px-5 pt-16 pb-5 text-white">
            <span className="font-display text-2xl italic tracking-[-0.03em]">{photo.caption}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ScrollImageShowcase({ images }: { images: readonly GalleryImage[] }) {
  const midpoint = Math.ceil(images.length / 2);
  return (
    <div className="grid gap-4 overflow-hidden py-4 sm:gap-7 sm:py-8">
      <ImageRail images={images.slice(0, midpoint)} direction="left" />
      <ImageRail images={images.slice(midpoint)} direction="right" />
    </div>
  );
}
