// Generate AVIF + responsive WebP + sharp-optimized JPG for the hero photos
// that are referenced via the BaseLayout heroImage preload prop. Saves to a
// sibling .avif and .webp next to each source jpg.
import sharp from 'sharp';
import path from 'node:path';

const HEROES = [
  'public/images/products/OUTSIIDE-CORNER-MITER-INSTALLED.jpg',
  'public/images/products/straight-miter-fall-background.jpg',
  'public/images/products/ELS-miter-installed-wide_white.jpg',
  'public/images/jobs/clogged-leaves.jpg',
  'public/images/jobs/before-after-cleaning.jpg',
  'public/images/jobs/rotted-roof-deck.jpg',
];

for (const src of HEROES) {
  const dir = path.dirname(src);
  const base = path.basename(src, path.extname(src));
  const meta = await sharp(src).metadata();
  const targetW = Math.min(meta.width, 1280);

  // AVIF — small, modern
  await sharp(src)
    .resize({ width: targetW, withoutEnlargement: true })
    .avif({ quality: 50, effort: 5 })
    .toFile(path.join(dir, base + '.avif'));

  // WebP — fallback for older browsers
  await sharp(src)
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: 72, effort: 5 })
    .toFile(path.join(dir, base + '.webp'));

  const fs = await import('node:fs');
  const sizes = {
    jpg: fs.statSync(src).size,
    webp: fs.statSync(path.join(dir, base + '.webp')).size,
    avif: fs.statSync(path.join(dir, base + '.avif')).size,
  };
  console.log(`${base.padEnd(40)} jpg=${sizes.jpg} webp=${sizes.webp} avif=${sizes.avif}`);
}
