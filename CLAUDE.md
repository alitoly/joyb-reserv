# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Read `AGENTS.md` first.** This is Next.js **16.2.7** — App Router APIs and
> conventions differ from older training data. Verify syntax against the bundled
> docs in `node_modules/next/dist/docs/` before writing new patterns (`params`,
> `searchParams`, `cookies()`, `headers()` are all **async**; Route Handlers use
> Web `Request`/`Response`; mutations use Server Actions).

## Commands

```bash
npm run dev      # dev server (Turbopack) at http://localhost:3000
npm run build    # production build — also runs TypeScript + static generation
npm run lint     # ESLint 9 (flat config). Lint is NOT run by `build`; run it explicitly.
npm run start    # serve the production build
```

No test framework is configured. Lint enforces React 19 rules that bite often
here: `react-hooks/set-state-in-effect` (no synchronous `setState` in an effect
body — move it into a handler or async callback) and `react/no-unescaped-entities`
(use `'` not `'` in JSX text; copy also avoids em dashes by house style).

## What this is

Booking website for **JoyB Resort**, a garden resort in the heart of Zanzibar, minutes from the airport. Five pages
(Home, Rooms, About, Contact, Book) plus a Supabase-backed booking flow that must
stay in sync with the resort's separate front-desk reservation system.

## Architecture

The site reads its room catalogue and availability from the resort's **live
reservation database** (Supabase project `phohqwreweaucsvsnodd`) — the same DB the
front desk uses — and writes new website bookings back into it.

**The site sells room TYPES, never physical rooms.** A guest picks a type and dates;
reception hands them an actual room at check-in. Everything hangs off `room_types` and
`reservations.room_type_id`. **The `rooms` / `room_images` tables are mock data** left
from the reception system's early testing — their prices, capacities and row counts are
meaningless and must not be read (the one exception is the `placeholderRoomId` shim,
below).

**Booking is server-authoritative — the client is never trusted for availability.**

1. **DB access is server-only** (`lib/supabase-server.ts`): the `service_role` key
   (env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, **no `NEXT_PUBLIC_`**) behind an
   `import "server-only"` guard. It bypasses RLS, so it must never reach the browser;
   all Supabase calls happen in Server Components / Route Handlers / Server Actions and
   select non-PII columns. When env vars are absent, helpers return `null`/`[]` and the
   app degrades gracefully.
2. **`room_types` IS the catalogue** (`lib/rooms-data.ts`): `listRooms()` /
   `getRoomType(id)` read `room_types(id, name, description, max_pax, number_of_rooms,
   price)` — one `RoomListing` per row, and nothing else. `priceUsd` =
   `room_types.price`, `capacity` = `room_types.max_pax`, `totalRooms` =
   `room_types.number_of_rooms`. A type is only listed when `price > 0 &&
   number_of_rooms > 0`, so half-finished rows never reach a guest as a $0 room.
   `room_types` has **no image column yet** and `room_images` is keyed by physical room
   and is mock, so photography is committed to the repo (`public/joyb_images/`) and
   mapped per room TYPE by `roomPhotosForType` in `lib/rooms.ts`. That lookup and the
   facilities/size presets both key off `typeKey()`, which matches on **keywords**
   because reception writes names like "Double Room" and "Connecting room" that no
   exact key matches. Add a new type's photos there, not in the database. Run
   `node scripts/check-db-schema.mjs` when queries start failing — the reception
   developer has renamed columns before.
3. **Availability is inventory-based** (`lib/bookings.ts` `isTypeAvailable`): the type's
   `number_of_rooms` is the inventory. It counts blocking `reservations` rows for that
   `room_type_id` overlapping `[checkIn, checkOut)` (overlap rule
   `existing.check_in_date < new.check_out AND existing.check_out_date > new.check_in`)
   and reports `number_of_rooms - occupied` free. Reads all reservations regardless of
   `notes` tag, so front-desk bookings block the site.

   ⚠️ **Reservations with a NULL `room_type_id` are invisible to this count** (5 legacy
   rows today). The reception app must always populate `room_type_id`, or a front-desk
   booking won't block the website.

   ⚠️ **`reservations.room_id` is still NOT NULL** (FK → `rooms.id`), so a booking can't
   be saved without naming a physical room even though the guest only chose a type. Until
   the reception developer drops that constraint, `placeholderRoomId()` attaches an
   arbitrary `rooms` row of that type purely to satisfy it. **The value is meaningless —
   read `room_type_id`, not `room_id`, on website bookings.** Delete the shim (and the
   `room_id` line in `actions.ts`) the moment the column goes nullable.
4. **Status rules are centralised in `lib/types.ts`** (`HIDDEN_ROOM_STATUSES`,
   `NON_BLOCKING_RESERVATION_STATUSES`, `NON_BLOCKING_TENANT_STATUSES`,
   `NEW_RESERVATION_STATUS`, `WEBSITE_NOTES_TAG`). They are lenient for display and conservative for
   availability; **confirm the real status strings with the reception-system developer**
   and adjust them in that one place.
5. `app/book/actions.ts` (`"use server"`) re-validates every field, re-checks
   `isTypeAvailable`, computes `total_amount = room_types.price × nights`, and inserts
   into `reservations` with **`room_type_id`** — the guest's real choice — plus the
   `room_id` placeholder described above. The guest is never shown a physical room name.
   The live table has **no `source` column**, so website bookings are tagged with
   `WEBSITE_NOTES_TAG` inside `notes`. Guest counts are written to the `adults` /
   `children` columns. `total_amount` is what the guest pays — the live schema has
   no `vat_amount` / `grand_total` columns.
   **`nationality` / `national_id` are never collected or written** — the site does not
   handle national ID credentials. `/account` and `/admin/**` display `room_types(name)`,
   never `rooms(name)`.

**Auth (`lib/supabase-auth*.ts`, `proxy.ts`):** Supabase Auth (anon key, `NEXT_PUBLIC_`)
powers two roles. Guests self-signup at `/signup` and see their own bookings at
`/account` (matched on `tenant_email`; booking stays anonymous-optional). Managers are
the emails in **`MANAGER_EMAILS`** (now **required** — an empty list grants admin to no
one) and get `/admin/reservations` + `/admin/manage` (calendar). Cancelling a booking
writes `CANCELLED_RESERVATION_STATUS`, which is non-blocking so the dates free up. The
`proxy.ts` matcher guards `/account/**` (any user) and `/admin/**` (managers only).

**Prerequisite:** the `service_role` role needs `GRANT SELECT` on `rooms, room_types,
pax, room_images, reservations, tenants` and `GRANT INSERT, UPDATE` on `reservations`
(UPDATE is what admin cancellation uses) — until then every query returns
`permission denied` and the site shows its graceful empty/not-connected states. `next.config.ts` allows `*.supabase.co/storage/v1/object/public/**`
for room images. `lib/rooms.ts` is now **presentation-only** (facilities, bed sizes,
fallback image) — it no longer defines inventory.

## Design system

Light theme only, driven by committed brand colors (the logo palette). Tokens are
defined as Tailwind v4 `@theme` variables in `app/globals.css` (`bg-green`,
`text-gold`, `text-charcoal`, `bg-sand`, etc.) — use those utilities, not raw hexes.
Fonts: **Outfit** (display, `font-display`, variable weight so headings can go 700
and the hero 800) + Mulish (body, `font-sans`) via `next/font/google` in
`app/layout.tsx`.

**Everything is square.** There is no border radius anywhere on this site: no
`rounded-*` utilities on images, cards, panels, inputs or buttons, and no
`border-radius` on the focus ring. Adding one back breaks the shape system.

**Photographic heroes** (`/` and `/about`) run full bleed under a transparent
header, which is why they carry `-mt-20` (the header is exactly 80px) and a two
part scrim: a flat wash plus a bottom weighted gradient. Those scrim values are
**measured against the actual image**, not chosen by eye. Both photos are bright
enough that centred white type failed WCAG against their blown highlights, so the
type sits low over the darkest band. If you swap a hero image, re-measure: sample
the pixels behind the headline and confirm 3:1 for display type, 4.5:1 for the
subtext. `components/site-header.tsx` keys off `HERO_PAGES` to decide whether it
can render transparent with light type.

Two skills informed the UI and are worth re-reading before significant design work:
`.claude/skills/ui-ux-pro-max` (run via `py .claude/skills/.../search.py`) and
`.claude/skills/impeccable` (brand-register craft rules: real imagery only — verify
Unsplash URLs resolve before use; no gradient text / glassmorphism / per-section
eyebrows / em dashes). Animation is reduced-motion-aware: the `Reveal` component and
`.reveal` CSS keep content visible by default and only enhance under
`prefers-reduced-motion: no-preference`.

Path alias: `@/*` maps to the project root.
