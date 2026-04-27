// Generate AVIF + WebP variants alongside every JPEG in /jobs/, /products/, /team/.
// Re-encodes existing AVIF/WebP at consistent quality. Also pushes JPGs through
// mozjpeg for smaller bytes.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const DIRS = ['public/images/jobs', 'public/images/products', 'public/images/team'];
// Photos used as eager full-bleed heroes — keep at higher max width
const HERO_BASES = new Set([
  'truck-jobsite-barn',
  'truck-commercial-flatroof',
  'OUTSIIDE-CORNER-MITER-INSTALLED',
  'straight-miter-fall-background',
  'ELS-miter-installed-wide_white',
  'install-downspout-sage-clapboard',
  'clogged-leaves',
  'before-after-cleaning',
  'rotted-roof-deck',
  'rcs-parts-diagram',
  'scott',
]);

let processed = 0;
let totalSaved = 0;

async function process(jpgPath) {
  const dir = path.dirname(jpgPath);
  const base = path.basename(jpgPath, path.extname(jpgPath));
  const meta = await sharp(jpgPath).metadata();
  const isHero = HERO_BASES.has(base);
  const targetW = Math.min(meta.width, isHero ? 1280 : 800);
  const avifQ = isHero ? 50 : 55;
  const webpQ = isHero ? 72 : 75;

  const before = {
    jpg: fs.statSync(jpgPath).size,
    avif: fs.existsSync(path.join(dir, base + '.avif')) ? fs.statSync(path.join(dir, base + '.avif')).size : 0,
    webp: fs.existsSync(path.join(dir, base + '.webp')) ? fs.statSync(path.join(dir, base + '.webp')).size : 0,
  };

  const tmpJpg = jpgPath + '.tmp';
  await sharp(jpgPath).resize({ width: targetW, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(tmpJpg);
  fs.renameSync(tmpJpg, jpgPath);

  await sharp(jpgPath).resize({ width: targetW, withoutEnlargement: true }).avif({ quality: avifQ, effort: 5 }).toFile(path.join(dir, base + '.avif'));
  await sharp(jpgPath).resize({ width: targetW, withoutEnlargement: true }).webp({ quality: webpQ, effort: 5 }).toFile(path.join(dir, base + '.webp'));

  const after = {
    jpg: fs.statSync(jpgPath).size,
    avif: fs.statSync(path.join(dir, base + '.avif')).size,
    webp: fs.statSync(path.join(dir, base + '.webp')).size,
  };
  const savedAvif = (before.avif || before.jpg) - after.avif;
  totalSaved += Math.max(savedAvif, 0);
  console.log(`  ${base.padEnd(46)} ${meta.width}→${targetW}px  avif=${after.avif}b webp=${after.webp}b jpg=${after.jpg}b ${isHero ? '(hero)' : ''}`);
  processed++;
}

console.log('Regenerating image variants:');
for (const dir of DIRS) {
  for (const f of fs.readdirSync(dir)) {
    if (!f.toLowerCase().endsWith('.jpg') && !f.toLowerCase().endsWith('.jpeg')) continue;
    await process(path.join(dir, f));
  }
}
console.log(`\nProcessed ${processed} photos. AVIF savings ≈ ${(totalSaved / 1024).toFixed(0)}KB.`);
