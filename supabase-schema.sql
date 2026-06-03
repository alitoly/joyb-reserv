-- ============================================================================
-- JoyB Resort — Supabase schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL editor (or `supabase db` migration).
-- It creates the room_types / rooms / bookings tables, a hard database-level
-- guard against double-booking, Row Level Security policies suited to the
-- public website (read availability + create pending bookings only), and seed
-- data for the three JoyB room types.
--
-- The local reception system should connect with the SERVICE ROLE key (server
-- side only) and write bookings with source = 'reception' or 'local_system'.
-- Those bookings then block availability on the website automatically.
-- ============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist";  -- exclusion constraint on room + daterange

-- room_types -----------------------------------------------------------------
create table if not exists public.room_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  capacity    integer not null default 1,
  base_price  numeric,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- rooms (physical inventory) -------------------------------------------------
create table if not exists public.rooms (
  id           uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id) on delete cascade,
  room_number  text not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (room_type_id, room_number)
);

-- bookings -------------------------------------------------------------------
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid references public.rooms(id) on delete set null,
  room_type_id  uuid not null references public.room_types(id),
  guest_name    text not null,
  guest_email   text not null,
  guest_phone   text not null,
  check_in      date not null,
  check_out     date not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'cancelled')),
  source        text not null default 'website'
                  check (source in ('website', 'reception', 'local_system')),
  message       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint chk_dates check (check_out > check_in)
);

create index if not exists bookings_type_status_dates_idx
  on public.bookings (room_type_id, status, check_in, check_out);

create index if not exists bookings_room_idx
  on public.bookings (room_id);

-- Keep updated_at fresh ------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- HARD double-booking guard.
-- Two ACTIVE (pending/confirmed) bookings for the SAME physical room may not
-- have overlapping date ranges. daterange '[check_in, check_out)' is
-- half-open: a checkout day and the next guest's check-in day can coincide.
-- Cancelled bookings are excluded so they never block.
-- This is the final safety net behind the application-level availability check
-- and makes simultaneous website requests physically unable to double-book.
-- ----------------------------------------------------------------------------
alter table public.bookings
  drop constraint if exists no_overlapping_active_bookings;

alter table public.bookings
  add constraint no_overlapping_active_bookings
  exclude using gist (
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status in ('pending', 'confirmed') and room_id is not null);

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- The website uses the ANON key. We allow:
--   * public SELECT on all three tables (needed to compute availability)
--   * public INSERT on bookings, but ONLY pending website bookings
-- We do NOT allow public UPDATE/DELETE. The reception/local system uses the
-- service_role key, which bypasses RLS entirely.
-- ============================================================================
alter table public.room_types enable row level security;
alter table public.rooms      enable row level security;
alter table public.bookings   enable row level security;

drop policy if exists "room_types public read" on public.room_types;
create policy "room_types public read"
  on public.room_types for select to anon, authenticated using (true);

drop policy if exists "rooms public read" on public.rooms;
create policy "rooms public read"
  on public.rooms for select to anon, authenticated using (true);

drop policy if exists "bookings public read" on public.bookings;
create policy "bookings public read"
  on public.bookings for select to anon, authenticated using (true);

drop policy if exists "bookings public insert pending website" on public.bookings;
create policy "bookings public insert pending website"
  on public.bookings for insert to anon, authenticated
  with check (status = 'pending' and source = 'website');

-- ============================================================================
-- Seed data
-- ----------------------------------------------------------------------------
-- Three room types + sample physical rooms. Edit room counts freely; the
-- website resolves availability from however many active rooms exist here.
-- ============================================================================
insert into public.room_types (name, slug, description, capacity, base_price, image_url)
values
  ('Garden Single Room', 'garden-single',
   'One bed with a private bathroom, opening onto the palm garden.', 1, 85,
   'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'),
  ('Ocean Twin Room', 'ocean-twin',
   'Two beds with a private bathroom and a breezy balcony.', 2, 120,
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'),
  ('Master Suite', 'master-suite',
   'One double bed with a private bathroom and panoramic ocean views.', 2, 195,
   'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do nothing;

-- Sample inventory: 3 garden singles, 2 ocean twins, 1 master suite.
insert into public.rooms (room_type_id, room_number)
select rt.id, v.room_number
from public.room_types rt
join (values
  ('garden-single', 'G1'),
  ('garden-single', 'G2'),
  ('garden-single', 'G3'),
  ('ocean-twin',    'O1'),
  ('ocean-twin',    'O2'),
  ('master-suite',  'M1')
) as v(slug, room_number) on v.slug = rt.slug
on conflict (room_type_id, room_number) do nothing;
