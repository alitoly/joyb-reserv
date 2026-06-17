import type { Metadata } from "next";
import { listRooms } from "@/lib/rooms-data";
import { BookingForm } from "@/components/booking-form";
import { Reveal } from "@/components/reveal";
import { Kicker, Section } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book your stay",
  description:
    "Check live availability and reserve your room at JoyB Resort Zanzibar. Pick your dates, choose a room, and we'll hold it for you.",
};

const ASSURANCES = [
  "No payment needed to request; we confirm by email",
  "Live availability synced with our front desk",
  "Free to change your dates before you arrive",
];

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const roomParam =
    typeof params.room === "string"
      ? params.room
      : typeof params.type === "string"
        ? params.type
        : "";

  const rooms = await listRooms();

  return (
    <Section className="py-16 sm:py-24" width="wide">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        {/* Intro / assurances */}
        <Reveal>
          <Kicker>Book your stay</Kicker>
          <h1 className="mt-4 text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] text-charcoal">
            Reserve your room by the ocean
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            Choose your dates and your room. We check availability against every
            booking in real time, including reservations made at the front desk,
            so the dates you see are the dates you can have.
          </p>

          <ul className="mt-8 grid gap-4">
            {ASSURANCES.map((a) => (
              <li key={a} className="flex items-start gap-3 text-charcoal">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-rust">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span className="text-ink-soft">{a}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Form */}
        <Reveal delay={120}>
          {rooms.length > 0 ? (
            <BookingForm rooms={rooms} initialRoomId={roomParam} />
          ) : (
            <div className="rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5 sm:p-10">
              <h2 className="font-display text-2xl text-charcoal">
                Booking isn&apos;t connected yet
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                Our live room list isn&apos;t available right now. Please check
                back shortly, or contact us and we&apos;ll arrange your stay
                directly.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
