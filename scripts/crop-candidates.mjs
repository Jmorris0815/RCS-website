import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'public/images/source/extracted';
const OUT = 'public/images/source/candidates';
await mkdir(OUT, { recursive: true });

// Crops are: { source, name, x, y, w, h }
// All extracted at 2048px scale. Coordinates are in source pixel space.
const CROPS = [
  // ---- rhino-offer-1 (postcard front, 2048x1326) ----
  // The whole house photo (center; product callout pills are baked into it; including for evaluation)
  { source: 'rhino-offer-1.jpg', name: 'offer1-house-full', x: 200, y: 200, w: 1700, h: 950 },
  // Try a tighter house crop avoiding top labels
  { source: 'rhino-offer-1.jpg', name: 'offer1-house-tight', x: 380, y: 700, w: 1300, h: 500 },

  // ---- rhino-offer-2 (postcard back, 2048x1326) ----
  // Top-left: leaves in stone/curved gutter
  { source: 'rhino-offer-2.jpg', name: 'offer2-leaves-curved', x: 0, y: 200, w: 800, h: 600 },
  // Right photo grid: 4 photos
  { source: 'rhino-offer-2.jpg', name: 'offer2-grid-all', x: 1230, y: 250, w: 800, h: 1000 },
  { source: 'rhino-offer-2.jpg', name: 'offer2-grid-tl', x: 1230, y: 250, w: 400, h: 500 },
  { source: 'rhino-offer-2.jpg', name: 'offer2-grid-tr', x: 1630, y: 250, w: 400, h: 500 },
  { source: 'rhino-offer-2.jpg', name: 'offer2-grid-bl', x: 1230, y: 750, w: 400, h: 500 },
  { source: 'rhino-offer-2.jpg', name: 'offer2-grid-br', x: 1630, y: 750, w: 400, h: 500 },

  // ---- rhino-2021-1 (full page ad, 1602x2048) ----
  // Hero shot of micro-mesh on shingle roof — left half avoids text columns on right
  { source: 'rhino-2021-1.jpg', name: '2021-mesh-hero-left', x: 0, y: 480, w: 900, h: 1100 },
  // Bigger crop including more of the roof
  { source: 'rhino-2021-1.jpg', name: '2021-mesh-hero-wider', x: 0, y: 380, w: 1200, h: 1300 },
  // Mesh detail closeup (mid-left, silver mesh w/ paver bg)
  { source: 'rhino-2021-1.jpg', name: '2021-mesh-detail', x: 60, y: 1080, w: 500, h: 380 },
  // Hemmed mesh closeup (lower-right, dark mesh angled)
  { source: 'rhino-2021-1.jpg', name: '2021-hemmed-detail', x: 250, y: 1480, w: 600, h: 280 },
  // Damage icons row (top) — for reference, evaluate
  { source: 'rhino-2021-1.jpg', name: '2021-icons-row', x: 100, y: 130, w: 1400, h: 220 },

  // ---- rhino-2022-1 (full page ad, 1602x2048) ----
  // Top damage row of 4 photos
  { source: 'rhino-2022-1.jpg', name: '2022-damage-row', x: 80, y: 280, w: 1450, h: 580 },
  { source: 'rhino-2022-1.jpg', name: '2022-damage-1', x: 80, y: 280, w: 360, h: 280 },
  { source: 'rhino-2022-1.jpg', name: '2022-damage-2', x: 80, y: 580, w: 360, h: 280 },
  { source: 'rhino-2022-1.jpg', name: '2022-damage-center', x: 460, y: 280, w: 700, h: 580 },
  { source: 'rhino-2022-1.jpg', name: '2022-damage-right', x: 1180, y: 280, w: 360, h: 580 },
  // Big foundation flooding photo center
  { source: 'rhino-2022-1.jpg', name: '2022-flood', x: 460, y: 280, w: 700, h: 580 },
  // Before/after split bottom-left
  { source: 'rhino-2022-1.jpg', name: '2022-beforeafter', x: 0, y: 1440, w: 900, h: 480 },
  { source: 'rhino-2022-1.jpg', name: '2022-beforeafter-tight', x: 60, y: 1480, w: 800, h: 400 },
  // Installer hand on mesh (bottom-right area near "ABSOLUTELY FREE" — try to find clean area)
  { source: 'rhino-2022-1.jpg', name: '2022-installer-area', x: 900, y: 1100, w: 700, h: 600 },
];

for (const c of CROPS) {
  try {
    const inPath = path.join(SRC, c.source);
    const outPath = path.join(OUT, c.name + '.jpg');
    await sharp(inPath)
      .extract({ left: c.x, top: c.y, width: c.w, height: c.h })
      .jpeg({ quality: 88 })
      .toFile(outPath);
    console.log('  ✓', c.name);
  } catch (e) {
    console.log('  ✗', c.name, e.message);
  }
}
console.log('Done. Output in:', OUT);
