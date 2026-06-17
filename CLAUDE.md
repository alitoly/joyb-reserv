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

Booking website for **JoyB Resort**, a beachfront resort in Zanzibar. Five pages
(Home, Rooms, About, Contact, Book) plus a Supabase-backed booking flow that must
stay in sync with the resort's separate front-desk reservation system.

## Architecture

The site reads its room catalogue and availability from the resort's **live
reservation database** (Supabase project `phohqwreweaucsvsnodd`) — the same DB the
front desk uses — and writes new website bookings back into it. Rooms are looped
dynamically per-room (not hardcoded, not grouped by type).

**Booking is server-authoritative — the client is never trusted for availability.**

1. **DB access is server-only** (`lib/supabase-server.ts`): the `service_role` key
   (env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, **no `NEXT_PUBLIC_`**) behind an
   `import "server-only"` guard. It bypasses RLS, so it must never reach the browser;
   all Supabase calls happen in Server Components / Route Handlers / Server Actions and
   select non-PII columns. When env vars are absent, helpers return `null`/`[]` and the
   app degrades gracefully.
2. **Room listing** (`lib/rooms-data.ts`): `listRooms()` / `getRoom(id)` join
   `rooms → room_types(name), pax(value), room_images(image_path)` into the
   `RoomListing` view-model. `day_payment` is the nightly price; `pax.value` is
   capacity; the first `room_images` row resolves to a Storage public URL.
3. **Availability** (`lib/bookings.ts`): per-room. A room is unavailable when a
   blocking `reservations` row overlaps `[checkIn, checkOut)` (overlap rule
   `existing.check_in_date < new.check_out AND existing.check_out_date > new.check_in`),
   or — when `CONSIDER_TENANT_OCCUPANCY` — a long-term `tenants` occupancy overlaps.
   Reads all reservations regardless of `source`, so front-desk bookings block the site.
4. **Status rules are centralised in `lib/types.ts`** (`HIDDEN_ROOM_STATUSES`,
   `NON_BLOCKING_RESERVATION_STATUSES`, `NON_BLOCKING_TENANT_STATUSES`,
   `NEW_RESERVATION_STATUS`/`SOURCE`). They are lenient for display and conservative for
   availability; **confirm the real status strings with the reception-system developer**
   and adjust them in that one place.
5. `app/book/actions.ts` (`"use server"`) re-validates every field, re-checks
   `isRoomAvailable`, computes `total_amount = day_payment × nights`, and inserts into
   `reservations` with `source = 'website'`. It treats a Postgres `23P01`
   (exclusion_violation) as "just taken" — relevant only if the DB has a double-booking
   exclusion constraint (confirm; add one if missing).

**Prerequisite:** the `service_role` role needs `GRANT SELECT` on `rooms, room_types,
pax, room_images, reservations, tenants` and `GRANT INSERT` on `reservations` — until
then every query returns `permission denied` and the site shows its graceful empty/not-
connected states. `next.config.ts` allows `*.supabase.co/storage/v1/object/public/**`
for room images. `lib/rooms.ts` is now **presentation-only** (facilities, bed sizes,
fallback image) — it no longer defines inventory.

## Design system

Light theme only, driven by committed brand colors (the logo palette). Tokens are
defined as Tailwind v4 `@theme` variables in `app/globals.css` (`bg-green`,
`text-gold`, `text-charcoal`, `bg-sand`, etc.) — use those utilities, not raw hexes.
Fonts: Marcellus (display, `font-display`) + Mulish (body, `font-sans`) via
`next/font/google` in `app/layout.tsx`.

Two skills informed the UI and are worth re-reading before significant design work:
`.claude/skills/ui-ux-pro-max` (run via `py .claude/skills/.../search.py`) and
`.claude/skills/impeccable` (brand-register craft rules: real imagery only — verify
Unsplash URLs resolve before use; no gradient text / glassmorphism / per-section
eyebrows / em dashes). Animation is reduced-motion-aware: the `Reveal` component and
`.reveal` CSS keep content visible by default and only enhance under
`prefers-reduced-motion: no-preference`.

Path alias: `@/*` maps to the project root.
