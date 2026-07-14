import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getSessionUser } from "@/lib/supabase-auth-server";
import { isManagerEmail } from "@/lib/supabase-auth";
import { formatLong } from "@/lib/dates";
import { isWebsiteReservation, reservationBlocks } from "@/lib/types";
import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";
import { CancelBookingForm } from "@/components/cancel-booking-form";
import { Button, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservations",
  robots: { index: false, follow: false },
};

interface ReservationRow {
  id: number;
  tenant_name: string | null;
  tenant_email: string | null;
  tenant_phone: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string | null;
  total_amount: number | null;
  notes: string | null;
  created_at: string | null;
  room_types: { name: string | null } | null;
}

// Room TYPE, not physical room — reception assigns the room at check-in.
const SELECT =
  "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, total_amount, notes, created_at, room_types(name)";

async function loadReservations(): Promise<ReservationRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reservations")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error || !data) {
    if (error) console.error("loadReservations failed:", error.message);
    return [];
  }
  return data as unknown as ReservationRow[];
}

function fmt(iso: string | null): string {
  return iso ? formatLong(iso) : "—";
}

export default async function ReservationsPage() {
  // Authoritative server-side check (the proxy guards too).
  const user = await getSessionUser();
  if (!user || !isManagerEmail(user.email)) redirect("/login");

  const reservations = await loadReservations();

  return (
    <Section className="py-12 sm:py-16" width="wide">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-charcoal sm:text-4xl">
            Reservations
          </h1>
          <p className="mt-2 text-ink-soft">
            Signed in as {user.email}. Website requests are{" "}
            <span className="font-medium text-charcoal">Pending</span> until you
            confirm with the guest.
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
      ) : reservations.length === 0 ? (
        <div className="mt-10 rounded-[2rem] bg-surface p-8 ring-1 ring-charcoal/5">
          <p className="text-ink-soft">No reservations yet.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-[2rem] bg-surface ring-1 ring-charcoal/5">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-charcoal/10 text-ink-soft">
                <th className="px-5 py-4 font-medium">Ref</th>
                <th className="px-5 py-4 font-medium">Room</th>
                <th className="px-5 py-4 font-medium">Guest</th>
                <th className="px-5 py-4 font-medium">Stay</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Total</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-charcoal/5 align-top last:border-0"
                >
                  <td className="px-5 py-4 font-mono text-xs text-ink-soft">
                    JB{String(r.id).padStart(5, "0")}
                  </td>
                  <td className="px-5 py-4 text-charcoal">
                    {r.room_types?.name ?? "—"}
                    {isWebsiteReservation(r.notes) && (
                      <span className="mt-1 block text-xs text-ink-soft">
                        via Website
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-medium text-charcoal">
                      {r.tenant_name ?? "—"}
                    </span>
                    {r.tenant_email && (
                      <a
                        href={`mailto:${r.tenant_email}`}
                        className="block text-xs text-ink-soft hover:text-green"
                      >
                        {r.tenant_email}
                      </a>
                    )}
                    {r.tenant_phone && (
                      <a
                        href={`tel:${r.tenant_phone}`}
                        className="block text-xs text-ink-soft hover:text-green"
                      >
                        {r.tenant_phone}
                      </a>
                    )}
                    {r.notes && (
                      <span className="mt-1 block whitespace-pre-line text-xs text-ink-soft">
                        {r.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-charcoal">
                    <span className="block">{fmt(r.check_in_date)}</span>
                    <span className="block text-xs text-ink-soft">
                      to {fmt(r.check_out_date)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-sand-deep px-3 py-1 text-xs font-medium text-charcoal">
                      {r.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-charcoal">
                    {r.total_amount != null ? `$${r.total_amount}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      {reservationBlocks(r.status) ? (
                        <CancelBookingForm id={r.id} />
                      ) : (
                        <span className="text-xs text-ink-soft">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
