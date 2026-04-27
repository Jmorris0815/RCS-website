// Sort raw photos from public/images/Inbox/ into permanent, descriptively-named
// locations under public/images/. Generates AVIF/WebP variants for hero-grade
// photos. Any photo not in the explicit map below is skipped (stays in Inbox).
import sharp from 'sharp';
import { mkdir, copyFile, unlink, readdir } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';

// Inbox source name → { dest path (no ext), kind: 'hero' generates avif/webp/jpg, 'asset' just copies as jpg }
const MAP = [
  // Trucks & Crew — strongest brand photo, hero-grade
  ['Right choice gutters.jpg', 'public/images/jobs/truck-jobsite-barn', 'hero', 'jpg', 1600],
  ['gutters box truck.jpg', 'public/images/jobs/truck-commercial-flatroof', 'hero', 'jpg', 1100],

  // Real install photos — gallery + service heroes
  ['downspouts.jpg', 'public/images/jobs/install-downspout-sage-clapboard', 'hero', 'jpg', 1100],
  ['copper-gutter-installation-service-400x300.jpg', 'public/images/jobs/install-copper-brick-home', 'asset', 'jpg', 800],
  ['copper-gutter-installations-400x300.jpg', 'public/images/jobs/install-copper-federal-brick', 'asset', 'jpg', 800],
  ['new-home-gutter-installation-project-400x300.jpg', 'public/images/jobs/install-soffit-detail', 'asset', 'jpg', 800],
  ['new-home-gutter-installation-service-400x300.jpg', 'public/images/jobs/install-modern-board-batten', 'asset', 'jpg', 800],
  ['new-home-gutter-installations-400x300.jpg', 'public/images/jobs/install-dark-clad-barn', 'asset', 'jpg', 800],
  ['quality-home-gutter-installations-400x300.jpg', 'public/images/jobs/install-brick-and-blue-siding', 'asset', 'jpg', 800],
  ['quality-home-gutters-400x300.jpg', 'public/images/jobs/install-gray-ranch', 'asset', 'jpg', 800],
  ['quality-home-gutters-installation-400x300.jpg', 'public/images/jobs/install-gray-ranch-screened-porch', 'asset', 'jpg', 800],

  // Cleaning — low-res, include but flag
  ['man-cleaning-gutter.jpg', 'public/images/jobs/cleaning-hand-removal', 'asset', 'jpg', 600],

  // Products — RCS-branded parts diagram (PNG → JPG, AI-generated; cleanly labeled)
  ['ChatGPT Image Apr 27, 2026, 12_13_10 PM.png', 'public/images/products/rcs-parts-diagram', 'hero', 'jpg', 1400],

  // Skip: Screenshot 2026-04-26 193721.png (low-quality phone screenshot, no value)
];

const SKIP = ['Screenshot 2026-04-26 193721.png'];

async function ensureDir(p) {
  await mkdir(path.dirname(p), { recursive: true });
}

async function process(srcName, destBase, kind, ext, maxW) {
  const srcPath = path.join('public/images/Inbox', srcName);
  if (!fs.existsSync(srcPath)) {
    console.log('  · missing', srcName);
    return false;
  }
  await ensureDir(destBase);
  const meta = await sharp(srcPath).metadata();
  const w = Math.min(meta.width, maxW);
  const jpgOut = `${destBase}.${ext}`;
  await sharp(srcPath)
    .resize({ width: w, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(jpgOut);
  let sizes = `jpg=${fs.statSync(jpgOut).size}`;
  if (kind === 'hero') {
    const avif = `${destBase}.avif`;
    const webp = `${destBase}.webp`;
    await sharp(srcPath).resize({ width: w, withoutEnlargement: true }).avif({ quality: 50, effort: 5 }).toFile(avif);
    await sharp(srcPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(webp);
    sizes += ` webp=${fs.statSync(webp).size} avif=${fs.statSync(avif).size}`;
  }
  console.log(`  ✓ ${srcName.padEnd(58)} → ${destBase}.${ext}  (${meta.width}→${w}px, ${sizes})`);
  return true;
}

console.log('Sorting Inbox into permanent folders:');
let processed = 0;
for (const [src, base, kind, ext, maxW] of MAP) {
  if (await process(src, base, kind, ext, maxW)) processed++;
}
console.log(`\nProcessed ${processed} photos. Skipping ${SKIP.length}: ${SKIP.join(', ')}.`);

// Empty the Inbox
console.log('\nEmptying Inbox...');
const files = await readdir('public/images/Inbox');
for (const f of files) {
  await unlink(path.join('public/images/Inbox', f));
  console.log('  · removed', f);
}
const remaining = (await readdir('public/images/Inbox')).length;
console.log(`Inbox is now ${remaining === 0 ? 'empty' : 'still has ' + remaining + ' file(s)'}.`);
