import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { isManagerEmail } from "@/lib/supabase-auth";
import { isWebsiteReservation, reservationBlocks } from "@/lib/types";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";
import {
  BookingsCalendar,
  type CalendarBooking,
} from "@/components/bookings-calendar";
import { Button, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage bookings",
  robots: { index: false, follow: false },
};

interface Row {
  id: number;
  tenant_name: string | null;
  tenant_email: string | null;
  tenant_phone: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string | null;
  notes: string | null;
  room_types: { name: string | null } | null;
}

// Room TYPE, not physical room — reception assigns the room at check-in.
const SELECT =
  "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, notes, room_types(name)";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Reservations that overlap the visible month: check_out >= monthStart AND
 *  check_in < first-of-next-month. */
async function loadMonth(month: string): Promise<CalendarBooking[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const [y, m] = month.split("-").map(Number);
  const monthStart = `${month}-01`;
  const next = new Date(y, m, 1);
  const monthEnd = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-01`;

  const { data, error } = await supabase
    .from("reservations")
    .select(SELECT)
    .gte("check_out_date", monthStart)
    .lt("check_in_date", monthEnd)
    .order("check_in_date", { ascending: true });

  if (error || !data) {
    if (error) console.error("loadMonth failed:", error.message);
    return [];
  }

  return (data as unknown as Row[])
    .filter((r) => r.check_in_date && r.check_out_date)
    .map((r) => ({
      id: r.id,
      roomName: r.room_types?.name ?? "Room",
      guestName: r.tenant_name ?? "Guest",
      guestEmail: r.tenant_email,
      guestPhone: r.tenant_phone,
      checkIn: r.check_in_date as string,
      checkOut: r.check_out_date as string,
      status: r.status,
      source: isWebsiteReservation(r.notes) ? "Website" : null,
      blocking: reservationBlocks(r.status),
    }));
}

export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getSessionUser();
  if (!user || !isManagerEmail(user.email)) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const fallback = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const raw = typeof params.month === "string" ? params.month : "";
  const month = /^\d{4}-\d{2}$/.test(raw) ? raw : fallback;

  const bookings = isSupabaseConfigured ? await loadMonth(month) : [];

  return (
    <Section className="py-12 sm:py-16" width="wide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
            Manage bookings
          </h1>
          <p className="mt-2 text-ink-soft">
            A calendar of every reservation. Select a day to view and cancel
            bookings.
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>

      <AdminNav className="mt-6" />

      {!isSupabaseConfigured ? (
        <div className="mt-10 rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5">
          <p className="text-ink-soft">
            The reservation database isn&apos;t connected. Add the Supabase
            server keys to view bookings.
          </p>
        </div>
      ) : (
        <BookingsCalendar month={month} bookings={bookings} />
      )}
    </Section>
  );
}
