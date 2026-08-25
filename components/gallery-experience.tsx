"use client";

import { useMemo, useState } from "react";
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryImage } from "@/lib/gallery";
import { PhotoGrid } from "./photo-grid";

type Filter = "All" | GalleryCategory;

export function GalleryExperience({ images }: { images: readonly GalleryImage[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const filtered = useMemo(
    () => filter === "All" ? images : images.filter((photo) => photo.category === filter),
    [filter, images],
  );

  return (
    <div>
      <div className="sticky top-[4.75rem] z-20 -mx-5 border-y border-charcoal/10 bg-sand/92 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filter photographs">
          {GALLERY_CATEGORIES.map((category) => {
            const active = filter === category;
            return (
              <button
                type="button"
                key={category}
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className={`shrink-0 cursor-pointer border px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase transition-colors ${active ? "border-green bg-green text-white" : "border-charcoal/15 bg-transparent text-charcoal hover:border-green hover:text-green"}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-soft" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}
      </p>
      <PhotoGrid
        key={filter}
        photos={filtered.map((photo, index) => ({
          src: photo.src,
          alt: photo.alt,
          caption: `${photo.category} · ${photo.caption}`,
          className: index % 11 === 0
            ? "col-span-2 aspect-[16/10] md:col-span-8"
            : index % 7 === 0
              ? "aspect-[4/5] md:col-span-4"
              : "aspect-[4/3] md:col-span-4",
        }))}
        className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5"
        sizes="(max-width: 768px) 50vw, 34vw"
        priorityFirst
      />
    </div>
  );
}
