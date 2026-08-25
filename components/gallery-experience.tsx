"use client";

import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryImage } from "@/lib/gallery";
import { PhotoGrid } from "./photo-grid";

type Filter = "All" | GalleryCategory;

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TILE_PATTERNS = [
  "col-span-2 aspect-[4/5] md:col-span-7 md:aspect-[16/10]",
  "col-span-1 aspect-[3/4] self-end md:col-span-3 md:mt-28",
  "col-span-1 aspect-square md:col-span-2 md:mt-10 md:aspect-[4/5]",
  "col-span-2 aspect-[5/4] md:col-span-4",
  "col-span-1 aspect-[3/4] md:col-span-3 md:mt-20",
  "col-span-1 aspect-[4/5] md:col-span-5",
  "col-span-2 aspect-[16/10] md:col-span-8",
  "col-span-2 aspect-[4/3] md:col-span-4 md:mt-28",
] as const;

export function GalleryExperience({ images }: { images: readonly GalleryImage[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const root = useRef<HTMLDivElement>(null);
  const filtered = useMemo(
    () => filter === "All" ? images : images.filter((photo) => photo.category === filter),
    [filter, images],
  );

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.utils.toArray<HTMLElement>("[data-gallery-tile]").forEach((tile, index) => {
      gsap.from(tile, {
        x: index % 2 === 0 ? -90 : 90,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: tile, start: "top 88%", once: true },
      });
    });
  }, { scope: root, dependencies: [filter], revertOnUpdate: true });

  return (
    <div ref={root} className="mx-auto max-w-[100rem]">
      <div className="sticky top-[4.75rem] z-20 -mx-5 border-y border-charcoal/35 bg-surface/94 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-[100rem] gap-1 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filter photographs">
          {GALLERY_CATEGORIES.map((category) => {
            const active = filter === category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={`shrink-0 cursor-pointer border-b px-4 py-3 text-[0.58rem] font-semibold tracking-[0.2em] uppercase transition-colors ${active ? "border-charcoal bg-charcoal text-white" : "border-transparent bg-transparent text-charcoal hover:border-rust hover:text-rust"}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">Showing {filter.toLowerCase()} photographs</p>
      <PhotoGrid
        key={filter}
        photos={filtered.map((photo, index) => ({
          src: photo.src,
          alt: photo.alt,
          caption: photo.caption,
          className: TILE_PATTERNS[index % TILE_PATTERNS.length],
        }))}
        className="mt-16 grid grid-cols-2 gap-x-3 gap-y-16 md:grid-cols-12 md:gap-x-5 md:gap-y-28"
        sizes="(max-width: 768px) 50vw, 34vw"
        priorityFirst
      />
    </div>
  );
}
