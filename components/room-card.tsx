import Image from "next/image";
import Link from "next/link";
import type { RoomContent } from "@/lib/rooms";
import { ButtonLink } from "./ui";

export function RoomCard({
  room,
  priority = false,
}: {
  room: RoomContent;
  priority?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_1px_3px_rgba(29,32,32,0.06)] ring-1 ring-charcoal/5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(29,32,32,0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.image}
          alt={room.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-sand/95 px-3 py-1 text-xs font-semibold text-charcoal">
          {room.tagline}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl text-charcoal">{room.name}</h3>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {room.beds} · sleeps {room.capacity}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {room.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((a) => (
            <li
              key={a}
              className="rounded-full bg-sand-deep px-3 py-1 text-xs font-medium text-charcoal/75"
            >
              {a}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-charcoal/10 pt-5">
          <p className="text-charcoal">
            <span className="text-sm text-ink-soft">from </span>
            <span className="font-display text-2xl">${room.priceFrom}</span>
            <span className="text-sm text-ink-soft"> / night</span>
          </p>
          <ButtonLink href={`/book?room=${room.slug}`} variant="primary">
            Book
          </ButtonLink>
        </div>

        <Link
          href={`/book?room=${room.slug}`}
          className="mt-3 text-center text-sm font-medium text-green underline-offset-4 hover:underline"
        >
          Check availability for {room.shortName}
        </Link>
      </div>
    </article>
  );
}
