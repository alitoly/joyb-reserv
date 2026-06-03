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

**Booking is server-authoritative and race-safe — this is the core invariant.**
The client is never trusted for availability. The flow:

1. `lib/bookings.ts` holds all availability logic (server-only, plain functions).
   Availability is resolved against **physical `rooms`**, not room types: a type
   is available only while at least one active room of that type has no blocking
   booking overlapping the range. It reads **all** blocking bookings regardless of
   `source`, so front-desk bookings block the website.
2. The overlap rule is `existing.check_in < new.check_out AND existing.check_out > new.check_in`,
   counting only `pending` + `confirmed` (see `BLOCKING_STATUSES` in `lib/types.ts`).
   `check_out` is exclusive.
3. `/api/availability` (Route Handler) exposes read-only availability + upcoming
   booked ranges to the client form for live feedback.
4. `app/book/actions.ts` (`"use server"`) re-validates every field, re-runs the
   availability check, picks a free physical room, and inserts a `pending`/`website`
   booking. It treats a Postgres `23P01` (exclusion_violation) as "just taken".
5. `supabase-schema.sql` defines a `btree_gist` **exclusion constraint** on
   `(room_id, daterange)` for active bookings — the final guard that makes
   simultaneous double-booking physically impossible even if the app checks pass.

**Supabase access** (`lib/supabase.ts`): only `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are used (same client server- and browser-side).
Security is enforced by **RLS policies** in `supabase-schema.sql`: public can read
all three tables and insert only `pending`/`website` bookings; no public
update/delete. The reception/local system writes with the `service_role` key
(server-side, bypasses RLS) using `source = 'reception' | 'local_system'`.
When env vars are absent, `getSupabase()` returns `null` and everything degrades
gracefully — marketing pages render, the booking form shows an "not connected" notice.

**Room data lives in two places that must stay aligned**: `lib/rooms.ts` holds the
static presentation content (names, copy, images, prices) so marketing pages render
without a database; `supabase-schema.sql` seeds the matching `room_types` (by `slug`)
and sample `rooms`. When changing rooms, edit both — the `slug` is the join key.

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
