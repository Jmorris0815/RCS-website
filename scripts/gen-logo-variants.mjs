// Generate logo variants from public/logo.png.
// Run: node scripts/gen-logo-variants.mjs
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs';
import path from 'node:path';

const PUB = 'public';
const SRC = path.join(PUB, 'logo.png');

// Source PNG was authored with an opaque white background. Strip it via alpha-key:
// pixels close to pure white become fully transparent; pixels at the soft edge fade
// proportionally, preserving anti-aliasing without a white halo on dark backgrounds.
async function alphaKeyWhite(srcBuf) {
  const { data, info } = await sharp(srcBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2];
    // distance-from-white per channel; 0 if pure white, 255 if pure black
    const dist = 255 - Math.min(r, g, b);
    // ramp: pixels with min channel >=250 fully transparent; below ~232 fully opaque.
    out[i + 3] = Math.min(255, Math.round(dist * 14));
  }
  return sharp(out, { raw: info }).png({ compressionLevel: 9 }).toBuffer();
}

// Pre-compute a trimmed transparent master once; all subsequent variants reuse it.
const transparentMaster = await alphaKeyWhite(await fs.promises.readFile(SRC));
// Tighten by trimming any fully-transparent border that the alpha-key produced.
const transparentTrimmed = await sharp(transparentMaster).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toBuffer();

// 1) logo-horizontal — display-optimized transparent PNG for header/footer (full source
// is too heavy to ship on every pageview). Source kept at full res in logo.png.
await sharp(transparentTrimmed)
  .resize({ width: 540, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUB, 'logo-horizontal.png'));
console.log('wrote logo-horizontal.png (540w, transparent)');

// Replace logo.png with a transparent full-res version (was opaque white from source).
await sharp(transparentMaster)
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUB, 'logo.png'));
console.log('rewrote logo.png (full-res, transparent)');

// Mark source = transparent trimmed master (mascot circle + wordmark overlap by
// design, so the whole logo IS the mark — padded square in markOnCanvas).
const markPng = transparentTrimmed;
const markMeta = await sharp(markPng).metadata();
console.log(`mark source: transparent logo ${markMeta.width}x${markMeta.height}`);

async function markOnCanvas(size, bg = '#ffffff', { palette = false, transparent = false } = {}) {
  const pad = Math.round(size * 0.04);
  const inner = size - pad * 2;
  const fitBg = transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : bg;
  const resized = await sharp(markPng)
    .resize({ width: inner, height: inner, fit: 'contain', background: fitBg })
    .png()
    .toBuffer();
  const canvas = transparent
    ? sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    : sharp({ create: { width: size, height: size, channels: 3, background: bg } });
  return canvas
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9, quality: 90, palette: transparent ? false : palette })
    .toBuffer();
}

// 3) logo-mark.png 512x512 — transparent (used wherever the surrounding bg may vary)
await fs.promises.writeFile(path.join(PUB, 'logo-mark.png'), await markOnCanvas(512, '#ffffff', { transparent: true }));
console.log('wrote logo-mark.png 512x512 (transparent)');

// 4) apple-touch-icon.png 180x180 — solid white bg (iOS auto-rounds; transparent
// alpha would let the OS show a black box behind it, which looks broken)
await fs.promises.writeFile(path.join(PUB, 'apple-touch-icon.png'), await markOnCanvas(180, '#ffffff', { palette: true }));
console.log('wrote apple-touch-icon.png 180x180 (white bg, iOS-friendly)');

// 5) favicon.ico (16/32/48 multi-size, transparent)
const ico = await pngToIco([
  await markOnCanvas(16, '#ffffff', { transparent: true }),
  await markOnCanvas(32, '#ffffff', { transparent: true }),
  await markOnCanvas(48, '#ffffff', { transparent: true }),
]);
await fs.promises.writeFile(path.join(PUB, 'favicon.ico'), ico);
console.log('wrote favicon.ico (16/32/48, transparent)');

// 6) favicon.svg — wrap the 64x64 transparent PNG in a tiny SVG container
const buf64 = await markOnCanvas(64, '#ffffff', { transparent: true });
const b64 = buf64.toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <image width="64" height="64" href="data:image/png;base64,${b64}"/>
</svg>
`;
await fs.promises.writeFile(path.join(PUB, 'favicon.svg'), svg);
console.log('wrote favicon.svg');

// 7) og-image.png 1200x630 — solid white bg + transparent logo composited on top
// (social platforms expect non-transparent OG images for consistent previews).
const fullForOg = await sharp(transparentTrimmed)
  .resize({ width: 900, height: 360, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const taglineSvg = Buffer.from(`<svg width="1200" height="120" xmlns="http://www.w3.org/2000/svg">
  <style>
    .t { fill: #1f2937; font-family: -apple-system, "Segoe UI", Roboto, sans-serif; font-size: 28px; font-weight: 500; }
  </style>
  <text x="600" y="48" text-anchor="middle" class="t">Family-owned seamless gutter installation, cleaning, and gutter guards across Central Virginia.</text>
</svg>`);
const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([
    { input: fullForOg, top: 110, left: 150 },
    { input: taglineSvg, top: 490, left: 0 },
  ])
  .png()
  .toBuffer();
await fs.promises.writeFile(path.join(PUB, 'og-image.png'), og);
console.log('wrote og-image.png 1200x630');

console.log('\n--- final sizes ---');
for (const f of ['logo.png','logo-horizontal.png','logo-mark.png','favicon.ico','favicon.svg','apple-touch-icon.png','og-image.png']) {
  const p = path.join(PUB, f);
  if (fs.existsSync(p)) console.log(`  ${f}: ${(fs.statSync(p).size/1024).toFixed(1)}KB`);
}
