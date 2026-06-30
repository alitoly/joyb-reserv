# JoyB Resort

Booking website for JoyB Resort, a small garden resort in the heart of Zanzibar, minutes from the airport.
Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and
Supabase for reservations.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase keys
npm run dev                         # http://localhost:3000
```

The marketing pages (Home, Rooms, About, Contact) render fully without Supabase.
Live availability and booking require the env vars below.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase-schema.sql`](./supabase-schema.sql). It creates
   the `room_types`, `rooms`, and `bookings` tables, a database-level guard against
   double-booking, Row Level Security policies, and seed data for the four room
   types and their 17 named rooms.
3. In **Project Settings → API**, copy the Project URL and the `anon` public key into
   `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Both values are public and safe to ship to the browser; access is restricted by RLS.
   **Never** put the `service_role` key here.

## How booking works

- The `/book` page checks availability live against `/api/availability`, which reads
  **all** blocking bookings (`pending` + `confirmed`) regardless of `source`.
- Submitting calls a Server Action (`app/book/actions.ts`) that re-validates everything
  on the server, picks a free physical room, and inserts a `pending` / `website` booking.
- A Postgres exclusion constraint makes it physically impossible to double-book the same
  room for overlapping dates, even under a race.

## Accounts & admin

- **Guests** can self-register at `/signup` (Supabase Auth) and see their own
  reservations at `/account` (matched by the email they booked with). Booking still
  works anonymously — an account is optional.
- **Managers** are the emails listed in `MANAGER_EMAILS` (comma-separated, **required**
  for admin access — an empty list means *no* admins). They get `/admin/reservations`
  (list) and `/admin/manage` (a calendar of every booking, with the ability to cancel
  any reservation). Cancelling sets the status to `Cancelled`, which also frees the
  dates for re-booking.
- Enable Email auth in the Supabase dashboard. If email confirmation is on, new
  signups must confirm via email before signing in.

## Reception / local system sync

The resort's local reservation system should write to the same Supabase `bookings`
table using the **`service_role`** key (server-side only), with
`source = 'reception'` or `'local_system'`. Those bookings immediately block the
matching dates on the website. See the header of `supabase-schema.sql` for details.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```
