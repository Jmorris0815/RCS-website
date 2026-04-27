// Download per-product photos from leafsolution.com (RCS is an authorized
// dealer; rights for public use still pending email confirmation per TODO.md).
// Saves to public/images/products/leafsolution/{xtreme,new-wave,evelyns}/.
import fs from 'node:fs';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const BASE = 'https://lirp.cdn-website.com/3f189d5d/dms3rep/multi/opt/';
const RAW = 'https://irp.cdn-website.com/3f189d5d/dms3rep/multi/';

// Per-product downloads. Source URL → local-name (no extension).
const SETS = {
  xtreme: [
    { url: BASE + 'Xtreme+inside+corner+miter+USE-1920w.jpg', name: 'installed-corner-miter', hero: true },
    { url: BASE + 'XTREME+hemmed+mesh+dark+black+USE+ls-1920w.jpg', name: 'hemmed-mesh-detail' },
    { url: BASE + 'Xtreme+water+flow+USE-1920w.jpg', name: 'water-flow' },
    { url: BASE + 'SELF+SHEDDING+with+shingles+Xtreme+USE+copy-1920w.jpg', name: 'self-shedding-shingles' },
    { url: BASE + 'xtreme+SYSTEM+CALLOUTS+USE-1920w.png', name: 'system-callouts-diagram', diagram: true },
    { url: BASE + 'UNDER+SHINGLE+INSTALL+STUDIO+SHOT+vin-1920w.jpg', name: 'under-shingle-install' },
  ],
  'new-wave': [
    { url: BASE + 'new+wave+installed+fall+trees+wide-2880w.jpg', name: 'installed-fall-wide', hero: true },
    { url: RAW + 'vin+newwave+inside+miter.jpg', name: 'installed-inside-miter' },
    { url: BASE + 'NEW+wave+fascia+mount+vin+dramatic-1920w.jpg', name: 'fascia-mount-dramatic' },
    { url: BASE + 'teardrop+openings-1920w.jpg', name: 'teardrop-openings' },
    { url: BASE + 'mre+wave+water+collection-1920w.jpg', name: 'water-collection' },
    { url: BASE + 'new-wave-SIMPLE-DIAGRAM-system-bronze-1920w.png', name: 'system-diagram-bronze', diagram: true },
    { url: BASE + 'before-after-new-wave+vin+copy-1920w.jpg', name: 'before-after' },
  ],
  evelyns: [
    { url: BASE + 'ELS+INSTALLED+FALL+HERO+copy+3-2880w.jpg', name: 'installed-fall-hero', hero: true },
    { url: BASE + 'Leaf+Solution+studio+inside+miter+USE-1920w.jpg', name: 'studio-inside-miter' },
    { url: BASE + 'ELS+capillary+dips+USE-1920w.jpg', name: 'capillary-dips' },
    { url: BASE + 'ELS+water+flowing+into+gutter+USE-1920w.jpg', name: 'water-flowing' },
    { url: BASE + 'Leaf+Solution+-SIMPLE-DIAGRAM-system-bronze+USE-1920w.png', name: 'system-diagram-bronze', diagram: true },
    { url: BASE + 'web-size-before-after-working-els-copy.jpg', name: 'before-after' },
    { url: BASE + 'Leaf+Solution+under+shingle+USE-1920w.jpg', name: 'under-shingle-install' },
  ],
};

async function fetchBuf(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

async function process(product, item) {
  const dir = `public/images/products/leafsolution/${product}`;
  await mkdir(dir, { recursive: true });

  const ext = item.url.match(/\.(png|jpe?g)/i)?.[1].toLowerCase() || 'jpg';
  const isHero = item.hero === true;
  const isDiagram = item.diagram === true;
  const targetW = isHero ? 1280 : (isDiagram ? 1100 : 1000);

  const buf = await fetchBuf(item.url);
  const img = sharp(buf);
  const meta = await img.metadata();

  // Save base format
  const baseExt = isDiagram && ext === 'png' ? 'png' : 'jpg';
  const basePath = path.join(dir, `${item.name}.${baseExt}`);
  if (baseExt === 'png') {
    await sharp(buf).resize({ width: targetW, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toFile(basePath);
  } else {
    await sharp(buf).resize({ width: targetW, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(basePath);
  }

  // Hero shots get AVIF + WebP; diagrams stay PNG only
  if (isHero || (!isDiagram && (ext === 'jpg' || ext === 'jpeg'))) {
    await sharp(buf).resize({ width: targetW, withoutEnlargement: true }).avif({ quality: isHero ? 50 : 55, effort: 5 }).toFile(path.join(dir, `${item.name}.avif`));
    await sharp(buf).resize({ width: targetW, withoutEnlargement: true }).webp({ quality: isHero ? 72 : 75, effort: 5 }).toFile(path.join(dir, `${item.name}.webp`));
  }

  console.log(`  ✓ ${product}/${item.name}.${baseExt}  (src ${meta.width}px → ${targetW}px${isHero ? ', HERO' : isDiagram ? ', diagram' : ''})`);
}

console.log('Downloading Leaf Solution per-product photos:\n');
for (const [product, items] of Object.entries(SETS)) {
  console.log(`-- ${product} --`);
  for (const item of items) {
    try { await process(product, item); }
    catch (e) { console.log(`  ✗ ${product}/${item.name}: ${e.message}`); }
  }
}
console.log('\nDone.');
