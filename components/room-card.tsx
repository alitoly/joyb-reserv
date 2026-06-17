import Image from "next/image";
import type { RoomListing } from "@/lib/types";
import { FACILITY_LABELS } from "@/lib/rooms";
import { ButtonLink } from "./ui";

/** Card for a single room loaded from the database. */
export function RoomCard({
  room,
  priority = false,
}: {
  room: RoomListing;
  priority?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_1px_3px_rgba(29,32,32,0.06)] ring-1 ring-charcoal/5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(29,32,32,0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.imageUrl}
          alt={room.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-sand/95 px-3 py-1 text-xs font-semibold text-charcoal">
          {room.typeName}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl text-charcoal">{room.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {room.capacity
            ? `Sleeps ${room.capacity} - ${room.typeName}`
            : room.typeName}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {FACILITY_LABELS.map((f) => (
            <li
              key={f}
              className="rounded-full bg-sand-deep px-3 py-1 text-xs font-medium text-charcoal/75"
            >
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-charcoal/10 pt-5">
          <p className="text-charcoal">
            <span className="font-display text-2xl">${room.priceUsd}</span>
            <span className="text-sm text-ink-soft"> / night</span>
          </p>
          <ButtonLink href={`/book?room=${room.id}`} variant="primary">
            Book
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
