# Booking website ↔ reception DB — what's left to fix

**To:** the developer maintaining the reception Supabase DB (`phohqwreweaucsvsnodd`)
**From:** JoyB booking website
**Updated:** 2026-07-15

Thanks for adding `reservations.room_type_id` and filling in `room_types` — that
resolved almost everything. The website now sells **room types** end to end:

- Catalogue (`name`, `description`, `max_pax`, `price`, `number_of_rooms`) is read
  **only** from `room_types`.
- Availability = `number_of_rooms` minus the reservations for that `room_type_id`
  overlapping the requested dates.
- A booking writes `room_type_id`. The guest is never shown a physical room.
- We ignore `rooms` / `room_images` entirely (understood: mock test data).
- We never collect or write `nationality` or `national_id`.

Three things still need you.

---

## 1. BLOCKER — `reservations.room_id` is still NOT NULL

You added `room_type_id` (nullable, FK → `room_types.id`) ✅ — but `room_id` remained
`NOT NULL`:

```
reservations required columns: id, room_id, tenant_name,
                               check_in_date, check_out_date, reference_number
```

So a website booking still cannot be saved without pointing at a `rooms` row — the table
we've just agreed is mock data. To keep bookings working we now insert an **arbitrary,
meaningless `room_id`** belonging to the booked type, purely to satisfy the constraint.

**Please make it nullable:**

```sql
ALTER TABLE reservations ALTER COLUMN room_id DROP NOT NULL;
```

Then a website booking is `room_type_id = <type>, room_id = NULL`, and reception fills in
`room_id` at check-in when it actually hands over a key. That is exactly how the hotel
works. We'll delete our placeholder shim the day you do this.

> ⚠️ Until then: **on website reservations, read `room_type_id`, not `room_id`.**
> The `room_id` we write is noise. It does not mean the guest was given that room.

**Related question we still can't answer:** is there an `EXCLUDE` / unique constraint on
`reservations` preventing two overlapping bookings on the same `room_id`? We didn't want
to write test rows into your production table to find out. If there is one, our
placeholder `room_id` will start colliding and bookings will fail — another reason to
make `room_id` nullable.

## 2. `room_type_id` must always be set — 5 existing rows have it NULL

Availability is counted on `room_type_id`. **Any reservation with a NULL `room_type_id` is
invisible to the website**, so it will not block those dates and we can oversell.

Right now 5 reservations have `room_type_id IS NULL`.

Please:
- **Backfill** the existing rows (derivable from `rooms.room_type_id` via `room_id`).
- Make sure the **reception app always writes `room_type_id`** on every new booking,
  including front-desk ones.
- Ideally `ALTER TABLE reservations ALTER COLUMN room_type_id SET NOT NULL` once
  backfilled, so it can never be missed.

## 3. `room_types` has no image column

There is nowhere to store a photo per room type. `room_images` is keyed by `room_id`
(mock), so we can't use it. **Every room type currently shows the same fallback photo on
the website**, which looks wrong on a resort site.

Please add either:
- `room_types.image_url text` (simplest — one photo per type), or
- a `room_type_images(room_type_id, image_path)` table if a type needs a gallery.

---

## Summary of asks

| # | Ask | Impact if not done |
|---|-----|--------------------|
| 1 | `room_id` → nullable | We keep writing a meaningless `room_id`; bookings may fail if an overlap constraint exists |
| 2 | Backfill + always set `room_type_id` | Front-desk bookings don't block the website → **double-booking** |
| 3 | Add an image column to `room_types` | All room types show the same photo |

Item 2 is the one that can actually cost the hotel a room, so it's the priority.
