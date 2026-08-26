"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
  /** Extra grid classes for this tile (column span, aspect override). */
  className?: string;
}

/**
 * A grid of photographs that open full size when clicked.
 *
 * The viewer is a native `<dialog>` opened with `showModal()`, which gives
 * focus trapping, Esc to close, `::backdrop`, and focus restored to the tile
 * that opened it, none of which we have to write or ship a dependency for.
 */
export function PhotoGrid({
  photos,
  className = "",
  tileClassName = "aspect-[4/3]",
  sizes = "(max-width: 640px) 50vw, 33vw",
  priorityFirst = false,
}: {
  photos: readonly GalleryPhoto[];
  className?: string;
  tileClassName?: string;
  sizes?: string;
  priorityFirst?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = (i: number) => {
    setIndex(i);
    setIsOpen(true);
    dialogRef.current?.showModal();
  };

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length),
    [photos.length],
  );

  /**
   * Every dismissal goes through here. The dialog `close` event is not
   * dependable (it does not bubble, React's onClose does not always bind it,
   * and some engines never dispatch it at all), so nothing downstream of this
   * component is allowed to depend on it. Esc is handled explicitly below for
   * the same reason.
   */
  const closeViewer = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
  }, []);

  // showModal() blocks interaction with the page behind it but not scrolling.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const current = photos[index];

  return (
    <>
      <ul className={className}>
        {photos.map((photo, i) => (
          <li
            key={photo.src}
            data-gallery-tile
            className={`relative overflow-hidden bg-sand-deep ${photo.className ?? tileClassName}`}
          >
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`View larger: ${photo.alt}`}
              className="group absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={priorityFirst && i === 0}
                sizes={sizes}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </button>
            {photo.caption && (
              <p className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 bg-gradient-to-t from-charcoal/85 to-transparent px-4 pt-12 pb-4 text-xs font-medium tracking-wide text-white">
                {photo.caption}
              </p>
            )}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeViewer();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "Escape") {
            e.preventDefault();
            closeViewer();
          }
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-charcoal/90 open:flex open:items-center open:justify-center"
      >
        <div className="relative flex h-full w-full flex-col">
          <div className="flex shrink-0 items-center justify-between px-4 py-4 text-sand sm:px-6">
            <p className="editorial-label">JoyB gallery</p>
            <button
              type="button"
              onClick={closeViewer}
              aria-label="Close photo viewer"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-sand transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            {current && (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center bg-sand/10 text-sand transition-colors hover:bg-sand/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">←</span>
            </button>
            <p className="min-w-0 flex-1 text-center text-sm leading-relaxed text-sand/80">
              {current?.caption ?? current?.alt}
            </p>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center bg-sand/10 text-sand transition-colors hover:bg-sand/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
