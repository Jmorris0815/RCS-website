import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'public/images/source/extracted';
const OUT = 'public/images/jobs';
await mkdir(OUT, { recursive: true });

// Tight crops verified to exclude Rhino branding, mascot, Bucs colors, phone numbers,
// and obviously-Florida vegetation. All extracted from RHINO ad PDFs (Scott was part of
// the Rhino crew, so the underlying photos are legitimately RCS's to reuse).
const FINAL = [
  // From rhino-offer-2 (postcard back, 2048x1326)
  // Top-left: leaves in shingle-roof gutter. x=340 to drop "WHY PROTECT" orange text
  { source: 'rhino-offer-2.jpg', name: 'clogged-leaves.jpg',
    x: 0, y: 220, w: 340, h: 580 },

  // Right grid - cleaning out tighter
  { source: 'rhino-offer-2.jpg', name: 'gutter-pulling-away.jpg',
    x: 1240, y: 290, w: 380, h: 220 },
  { source: 'rhino-offer-2.jpg', name: 'attic-water-damage.jpg',
    x: 1640, y: 290, w: 360, h: 220 },
  { source: 'rhino-offer-2.jpg', name: 'rotted-roof-deck.jpg',
    x: 1240, y: 520, w: 360, h: 210 },

  // From rhino-2022-1 (full ad, 1602x2048)
  // BEFORE/AFTER split — w=430 drops the orange F + Rhino mascot
  { source: 'rhino-2022-1.jpg', name: 'before-after-cleaning.jpg',
    x: 60, y: 1490, w: 430, h: 370 },
];

console.log('Producing final cropped photos:');
for (const c of FINAL) {
  try {
    const inPath = path.join(SRC, c.source);
    const outPath = path.join(OUT, c.name);
    const meta = await sharp(inPath).metadata();
    // Clamp coordinates
    const x = Math.max(0, Math.min(c.x, meta.width - 10));
    const y = Math.max(0, Math.min(c.y, meta.height - 10));
    const w = Math.min(c.w, meta.width - x);
    const h = Math.min(c.h, meta.height - y);
    await sharp(inPath)
      .extract({ left: x, top: y, width: w, height: h })
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(outPath);
    const outMeta = await sharp(outPath).metadata();
    console.log(`  ✓ ${c.name}  ${outMeta.width}x${outMeta.height}`);
  } catch (e) {
    console.log(`  ✗ ${c.name}  ${e.message}`);
  }
}
