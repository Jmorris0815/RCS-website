// Generate logo variants from public/logo.png.
// Run: node scripts/gen-logo-variants.mjs
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'node:fs';
import path from 'node:path';

const PUB = 'public';
const SRC = path.join(PUB, 'logo.png');

// 1) logo-horizontal — display-optimized PNG for header/footer (full source is too heavy
// to ship on every pageview). Source kept at full res in logo.png for OG/print/3x DPR.
await sharp(SRC)
  .resize({ width: 540, withoutEnlargement: true })
  .png({ compressionLevel: 9, quality: 90, palette: true })
  .toFile(path.join(PUB, 'logo-horizontal.png'));
console.log('wrote logo-horizontal.png (540w, optimized)');

// 2) Trim source whitespace, then carve the leftmost square as the mark candidate.
const trimmed = await sharp(SRC).trim({ threshold: 12 }).png().toBuffer();
const trMeta = await sharp(trimmed).metadata();
console.log(`trimmed: ${trMeta.width}x${trMeta.height}`);

// The mascot circle and wordmark visually overlap by design (the red checkmark crosses
// into the circle), so cleanly isolating just the round portion produces awkward
// wordmark fragments. Treat the entire logo as the "mark" — pad it square and use that
// as the source for favicons/apple-touch/logo-mark. Brand identity stays intact.
const markPng = trimmed;
const markMeta = trMeta;
console.log(`mark source: full logo ${markMeta.width}x${markMeta.height} (padded to square in markOnCanvas)`);

async function markOnCanvas(size, bg = '#ffffff', { palette = false } = {}) {
  const pad = Math.round(size * 0.04);
  const inner = size - pad * 2;
  const resized = await sharp(markPng)
    .resize({ width: inner, height: inner, fit: 'contain', background: bg })
    .png()
    .toBuffer();
  const buf = await sharp({ create: { width: size, height: size, channels: 3, background: bg } })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9, quality: 90, palette })
    .toBuffer();
  return buf;
}

// 3) logo-mark.png 512x512 (palette-quantized for size — losslessly visually similar)
await fs.promises.writeFile(path.join(PUB, 'logo-mark.png'), await markOnCanvas(512, '#ffffff', { palette: true }));
console.log('wrote logo-mark.png 512x512');

// 4) apple-touch-icon.png 180x180
await fs.promises.writeFile(path.join(PUB, 'apple-touch-icon.png'), await markOnCanvas(180, '#ffffff', { palette: true }));
console.log('wrote apple-touch-icon.png 180x180');

// 5) favicon.ico (16/32/48 multi-size)
const ico = await pngToIco([await markOnCanvas(16), await markOnCanvas(32), await markOnCanvas(48)]);
await fs.promises.writeFile(path.join(PUB, 'favicon.ico'), ico);
console.log('wrote favicon.ico (16/32/48)');

// 6) favicon.svg — wrap the 64x64 PNG in a tiny SVG container
const buf64 = await markOnCanvas(64);
const b64 = buf64.toString('base64');
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <image width="64" height="64" href="data:image/png;base64,${b64}"/>
</svg>
`;
await fs.promises.writeFile(path.join(PUB, 'favicon.svg'), svg);
console.log('wrote favicon.svg');

// 7) og-image.png 1200x630 (logo + tagline on white)
const fullForOg = await sharp(SRC)
  .resize({ width: 900, height: 360, fit: 'contain', background: '#ffffff' })
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
