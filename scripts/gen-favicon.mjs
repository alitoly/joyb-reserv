// One-off: regenerate app/icon.png and app/favicon.ico from public/logo.png so
// the browser tab shows the JoyB logo instead of the default Next.js icon.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "public/logo.png";
const meta = await sharp(SRC).metadata();
const side = Math.max(meta.width, meta.height);

// Square, centered, transparent canvas — avoids the logo looking stretched
// when a browser/OS forces the favicon into a square slot.
const squareBuf = await sharp(SRC)
  .resize(side, side, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp(squareBuf).resize(512, 512).png().toFile("app/icon.png");

async function pngAt(size) {
  return sharp(squareBuf).resize(size, size).png().toBuffer();
}

// ICO container embedding PNG-format frames (valid since Windows Vista;
// every modern browser reads it). 16/32/48 covers tab, taskbar, and
// high-DPI tab icons.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(pngAt));

const headerSize = 6 + 16 * images.length;
let offset = headerSize;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

const dirEntries = [];
for (let i = 0; i < images.length; i++) {
  const size = sizes[i];
  const img = images[i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(img.length, 8); // data size
  entry.writeUInt32LE(offset, 12); // data offset
  offset += img.length;
  dirEntries.push(entry);
}

const ico = Buffer.concat([header, ...dirEntries, ...images]);
writeFileSync("app/favicon.ico", ico);

console.log(`app/icon.png: 512x512 (from ${meta.width}x${meta.height} source)`);
console.log(`app/favicon.ico: ${sizes.join("/")} px, ${ico.length} bytes`);
