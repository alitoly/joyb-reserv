// Read-only schema-drift check against the live reception Supabase DB.
// Run when rooms/bookings stop loading:  node scripts/check-db-schema.mjs
// Runs every SELECT the site uses (limit 1) and verifies the columns the
// booking INSERT/UPDATE write, so a renamed column is pinpointed in seconds.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Every read the site performs, with the file that owns it. The site books by
// room TYPE (pool of physical rooms per type) — see lib/rooms-data.ts and
// lib/bookings.ts isTypeAvailable.
const READS = [
  ["lib/rooms-data.ts listRooms/getRoomType", "rooms",
    "id, name, day_payment, status, description, max_pax, room_type_id, room_types(name, description, max_pax), room_images(image_path)"],
  ["lib/bookings.ts liveRoomsForType (pool)", "rooms",
    "id, name, status"],
  ["lib/bookings.ts reservations overlap", "reservations",
    "room_id, status, check_in_date, check_out_date"],
  ["lib/bookings.ts tenants occupancy", "tenants",
    "room_id, status, check_in, check_out"],
  ["app/account bookings list", "reservations",
    "id, check_in_date, check_out_date, status, total_amount, created_at, rooms(name)"],
  ["app/admin/reservations list", "reservations",
    "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, total_amount, notes, created_at, rooms(name)"],
  ["app/admin/manage calendar", "reservations",
    "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, notes, rooms(name)"],
];

// Columns the site WRITES (insert in app/book/actions.ts, update in
// app/admin/manage/actions.ts) — verified against the DB's own schema instead
// of test writes, so this script never touches live data.
const WRITE_COLUMNS = {
  reservations: [
    "room_id", "tenant_name", "tenant_email", "tenant_phone",
    "check_in_date", "check_out_date", "status", "total_amount", "notes",
  ],
};

let failures = 0;
const report = (label, ok, detail = "") => {
  console.log(`${ok ? "  OK " : "FAIL "} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

for (const [label, table, select] of READS) {
  const { error } = await supabase.from(table).select(select).limit(1);
  report(label, !error, error?.message);
}

const spec = await (
  await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
).json();

for (const [table, cols] of Object.entries(WRITE_COLUMNS)) {
  const live = Object.keys(spec.definitions?.[table]?.properties ?? {});
  const missing = cols.filter((c) => !live.includes(c));
  report(
    `write columns on ${table}`,
    live.length > 0 && missing.length === 0,
    missing.length ? `missing: ${missing.join(", ")}` : "",
  );
}

console.log(
  failures === 0
    ? "\nAll queries match the live schema."
    : `\n${failures} check(s) failed — the reception DB schema has drifted; update the queries above (and lib/types.ts constants if statuses changed).`,
);
process.exit(failures === 0 ? 0 : 1);
