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
          className={`group relative shrink-0 overflow-hidden rounded-[2rem] bg-sand-deep ${index % 3 === 1 ? "mt-10 h-[48vw] w-[36vw] sm:h-[28rem] sm:w-[20rem]" : "h-[48vw] w-[62vw] sm:h-[28rem] sm:w-[37rem]"}`}
        >
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 65vw, 40vw" className="object-cover transition-transform duration-1000 group-hover:scale-[1.025]" />
          <figcaption className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 text-white">
            <span className="rounded-full bg-charcoal/65 px-4 py-2 text-[0.62rem] font-bold tracking-[0.13em] uppercase backdrop-blur">{photo.caption}</span>
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
