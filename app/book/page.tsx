import { redirect } from "next/navigation";

/**
 * The booking flow now lives on each room's details page (`/rooms/[id]`), so the
 * old multi-step `/book` page just forwards:
 *   - `/book?room=<id>` → that room's details page
 *   - `/book`           → the rooms catalogue
 * This keeps any existing links working while retiring the confusing picker.
 */
export default async function BookRedirect({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const room =
    typeof params.room === "string"
      ? params.room
      : typeof params.type === "string"
        ? params.type
        : "";

  redirect(room ? `/rooms/${room}` : "/rooms");
}
