// One-time: shrink the camera originals in public/joyb_images to web size, in place.
// Filenames are referenced by lib/rooms.ts and app/page.tsx, so never rename.
//   node scripts/optimize-images.mjs
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIR = path.join(import.meta.dirname, "..", "public", "joyb_images");
const MAX_EDGE = 2560;
const QUALITY = 82;
const mb = (n) => (n / 1e6).toFixed(2);

const files = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f));
let before = 0;
let after = 0;

for (const file of files) {
  const filePath = path.join(DIR, file);
  const original = await readFile(filePath);
  const optimized = await sharp(original)
    .rotate() // bake in EXIF orientation, which resize would otherwise drop
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  // ponytail: keep the original if re-encoding made it bigger (already-small files)
  const keep = optimized.length < original.length ? optimized : original;
  if (keep !== original) await writeFile(filePath, keep);

  before += original.length;
  after += keep.length;
  console.log(`${file.padEnd(24)} ${mb(original.length)} MB -> ${mb(keep.length)} MB`);
}

console.log(
  `\n${files.length} files: ${mb(before)} MB -> ${mb(after)} MB ` +
    `(${(100 - (after / before) * 100).toFixed(0)}% smaller)`,
);
