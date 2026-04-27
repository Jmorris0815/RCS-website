import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = 'public/images/products';
const files = await readdir(DIR);

for (const f of files) {
  const inPath = path.join(DIR, f);
  const ext = path.extname(f).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
  const meta = await sharp(inPath).metadata();
  if (meta.width <= 1400) {
    console.log(`  · ${f}  ${meta.width}x${meta.height}  (already small, skipping)`);
    continue;
  }
  const tmpPath = inPath + '.tmp';
  if (ext === '.png') {
    await sharp(inPath).resize({ width: 1400, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toFile(tmpPath);
  } else {
    await sharp(inPath).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 84, mozjpeg: true }).toFile(tmpPath);
  }
  const { default: fs } = await import('node:fs');
  fs.renameSync(tmpPath, inPath);
  const m2 = await sharp(inPath).metadata();
  console.log(`  ✓ ${f}  ${meta.width}→${m2.width}  ${(meta.size||fs.statSync(inPath).size)} bytes`);
}
