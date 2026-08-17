#!/usr/bin/env node
/**
 * Regenerates KidTube PWA / favicon PNGs from the Wordmark mark
 * (coral rounded square + white play triangle).
 *
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORAL = "#FF6B57";
const WHITE = "#FFFFFF";

function iconSvg(size, { pad = 0, radiusRatio = 0.22 } = {}) {
  const inner = size - pad * 2;
  const r = inner * radiusRatio;
  const playScale = inner * 0.42;
  const cx = size / 2;
  const cy = size / 2;
  const ox = 13.5;
  const oy = 12;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="${CORAL}"/>
  <g transform="translate(${cx},${cy}) rotate(-4) scale(${playScale / 24}) translate(${-ox},${-oy})">
    <path d="M8 5.5v13l11-6.5z" fill="${WHITE}"/>
  </g>
</svg>`;
}

async function writePng(file, size, opts) {
  const svg = Buffer.from(iconSvg(size, opts));
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await sharp(svg).png().toFile(file);
  console.log("wrote", path.relative(ROOT, file), `(${size}×${size})`);
}

async function main() {
  const icons = path.join(ROOT, "public", "icons");
  await writePng(path.join(icons, "icon-192.png"), 192);
  await writePng(path.join(icons, "icon-512.png"), 512);
  await writePng(path.join(icons, "icon-512-maskable.png"), 512, {
    pad: 512 * 0.1,
    radiusRatio: 0.22,
  });
  await writePng(path.join(ROOT, "public", "favicon.png"), 32, { radiusRatio: 0.25 });
  await writePng(path.join(ROOT, "public", "apple-touch-icon.png"), 180);

  await fs.promises.writeFile(path.join(icons, "icon.svg"), iconSvg(512), "utf8");
  console.log("wrote", "public/icons/icon.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
