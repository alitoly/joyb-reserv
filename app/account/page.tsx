import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { isManagerEmail } from "@/lib/supabase-auth";
import { reservationBlocks } from "@/lib/types";
import { formatLong } from "@/lib/dates";
import { signOut } from "@/app/admin/actions";
import { Button, ButtonLink, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

interface BookingRow {
  id: number;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string | null;
  total_amount: number | null;
  created_at: string | null;
  room_types: { name: string | null } | null;
}

// Show the room TYPE the guest booked. `rooms(name)` is deliberately not joined:
// those rows are mock data, and reception assigns the real room at check-in.
const SELECT =
  "id, check_in_date, check_out_date, status, total_amount, created_at, room_types(name)";

/** Reservations belonging to this guest. The shared DB has no user_id, so we
 *  match on the email the booking was made with. */
async function loadMyBookings(email: string): Promise<BookingRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reservations")
    .select(SELECT)
    .ilike("tenant_email", email)
    .order("check_in_date", { ascending: false })
    .limit(100);
  if (error || !data) {
    if (error) console.error("loadMyBookings failed:", error.message);
    return [];
  }
  return data as unknown as BookingRow[];
}

function fmt(iso: string | null): string {
  return iso ? formatLong(iso) : "—";
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/account");

  const email = user.email ?? "";
  const bookings = email ? await loadMyBookings(email) : [];

  return (
    <Section className="py-12 sm:py-16" width="wide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
            My bookings
          </h1>
          <p className="mt-2 text-ink-soft">
            Signed in as {email}. Bookings made with this email appear here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isManagerEmail(email) && (
            <ButtonLink href="/admin/manage" variant="outline">
              Admin area
            </ButtonLink>
          )}
          <ButtonLink href="/rooms" variant="primary">
            Book a room
          </ButtonLink>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <div className="mt-10 rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5">
          <p className="text-ink-soft">
            The reservation database isn&apos;t connected yet.
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-10 rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5">
          <p className="text-ink-soft">
            You don&apos;t have any bookings yet.{" "}
            <Link href="/rooms" className="font-medium text-green hover:underline">
              Browse our rooms
            </Link>{" "}
            to make your first reservation.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {bookings.map((b) => {
            const cancelled = !reservationBlocks(b.status);
            return (
              <li
                key={b.id}
                className="rounded-[1.5rem] bg-surface p-6 ring-1 ring-charcoal/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-charcoal">
                      {b.room_types?.name ?? "Room"}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink-soft">
                      JB{String(b.id).padStart(5, "0")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      cancelled
                        ? "bg-sand-deep text-ink-soft line-through"
                        : "bg-green/10 text-green"
                    }`}
                  >
                    {b.status ?? "—"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-ink-soft">Check-in</dt>
                    <dd className="text-charcoal">{fmt(b.check_in_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Check-out</dt>
                    <dd className="text-charcoal">{fmt(b.check_out_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-soft">Total</dt>
                    <dd className="text-charcoal">
                      {b.total_amount != null ? `$${b.total_amount}` : "—"}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
