import Image from "next/image";
import Link from "next/link";
import type { RoomListing } from "@/lib/types";
import { FACILITY_LABELS, roomSizeForType } from "@/lib/rooms";
import { buttonClass } from "./ui";

/** Card for a room TYPE loaded from the database. The whole card links to the
 *  type's details page, where guests pick dates and the server auto-assigns
 *  any free physical room from that type's pool. */
export function RoomCard({
  room,
  priority = false,
}: {
  room: RoomListing;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_1px_3px_rgba(29,32,32,0.06)] ring-1 ring-charcoal/5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-18px_rgba(29,32,32,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
      aria-label={`View ${room.name} Room — $${room.priceUsd} per night`}
    >
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
          {room.totalRooms} {room.totalRooms === 1 ? "room" : "rooms"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl text-charcoal">{room.name} Room</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {room.capacity ? `Sleeps ${room.capacity}` : room.typeName}
          {" · "}
          {roomSizeForType(room.typeName)}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {FACILITY_LABELS.slice(0, 4).map((f) => (
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
          {/* Non-interactive affordance — the whole card is the link. */}
          <span className={buttonClass("primary", "pointer-events-none")}>
            View room
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
