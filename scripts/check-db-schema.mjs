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

// Every read the site performs, with the file that owns it. Everything hangs off
// `room_types` + `reservations.room_type_id`. The `rooms` table is mock data from
// the reception system's testing and is only touched by the placeholderRoomId
// shim, which exists solely because `reservations.room_id` is still NOT NULL.
const READS = [
  ["lib/rooms-data.ts listRooms/getRoomType (catalogue)", "room_types",
    "id, name, description, max_pax, number_of_rooms, price"],
  ["lib/bookings.ts declaredRoomCount (inventory)", "room_types",
    "number_of_rooms"],
  ["lib/bookings.ts occupiedCount (bookings per type)", "reservations",
    "status, room_type_id, check_in_date, check_out_date"],
  ["lib/bookings.ts placeholderRoomId (SHIM — delete when room_id is nullable)", "rooms",
    "id"],
  ["app/account bookings list", "reservations",
    "id, check_in_date, check_out_date, status, total_amount, created_at, room_types(name)"],
  ["app/admin/reservations list", "reservations",
    "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, total_amount, notes, created_at, room_types(name)"],
  ["app/admin/manage calendar", "reservations",
    "id, tenant_name, tenant_email, tenant_phone, check_in_date, check_out_date, status, notes, room_types(name)"],
];

// Columns the site WRITES (insert in app/book/actions.ts, update in
// app/admin/manage/actions.ts) — verified against the DB's own schema instead
// of test writes, so this script never touches live data. `nationality` and
// `national_id` are deliberately never written.
const WRITE_COLUMNS = {
  reservations: [
    "room_type_id", "room_id", "tenant_name", "tenant_email", "tenant_phone",
    "check_in_date", "check_out_date", "status", "total_amount",
    "reference_number", "notes",
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
  const def = spec.definitions?.[table];
  const liveProps = def?.properties ?? {};
  const live = Object.keys(liveProps);
  const required = def?.required ?? [];
  // Primary keys appear in `required` even when DB-generated (serial/identity)
  // — the site never sets them, so exclude from the "did we cover it" check.
  const pk = Object.entries(liveProps)
    .filter(([, p]) => p.description?.includes("Primary Key"))
    .map(([k]) => k);

  const renamedOrMissing = cols.filter((c) => !live.includes(c));
  report(
    `write columns exist on ${table}`,
    live.length > 0 && renamedOrMissing.length === 0,
    renamedOrMissing.length ? `missing: ${renamedOrMissing.join(", ")}` : "",
  );

  // Catches columns the DB requires (NOT NULL, no default) that our insert
  // doesn't set — e.g. reservations.reference_number, which silently broke
  // every booking with "Something went wrong saving your booking."
  const uncoveredRequired = required.filter((c) => !pk.includes(c) && !cols.includes(c));
  report(
    `required columns covered on ${table}`,
    uncoveredRequired.length === 0,
    uncoveredRequired.length
      ? `NOT NULL with no default, but the insert doesn't set: ${uncoveredRequired.join(", ")}`
      : "",
  );
}

console.log(
  failures === 0
    ? "\nAll queries match the live schema."
    : `\n${failures} check(s) failed — the reception DB schema has drifted; update the queries above (and lib/types.ts constants if statuses changed).`,
);
process.exit(failures === 0 ? 0 : 1);
