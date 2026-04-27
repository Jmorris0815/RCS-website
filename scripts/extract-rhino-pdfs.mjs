import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const poppler = require('pdf-poppler');

const PDFS = [
  ['rhino-offer', 'C:/dev/tmp/rhino-offer.pdf'],
  ['rhino-2021', 'C:/dev/tmp/rhino-2021.pdf'],
  ['rhino-2022', 'C:/dev/tmp/rhino-2022.pdf'],
];

const outDir = path.resolve('public/images/source/extracted');
await mkdir(outDir, { recursive: true });

for (const [prefix, file] of PDFS) {
  console.log(`Rendering ${prefix} from ${path.basename(file)}...`);
  try {
    await poppler.convert(file, {
      format: 'jpeg',
      out_dir: outDir,
      out_prefix: prefix,
      page: null,
      scale: 2048,
    });
    console.log(`  ✓ done`);
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
  }
}
console.log('All done. Output in:', outDir);
