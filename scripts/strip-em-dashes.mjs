// Replace em dashes (—) and en dashes (–) used as sentence punctuation across
// all .md, .mdx, and .astro files in src/. Keep dashes inside numeric/time
// ranges and weekday ranges. Default to period + capitalize for sentence
// punctuation; comma for tight parentheticals (word—word).
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const EXTS = new Set(['.md', '.mdx', '.astro']);

let totalFiles = 0;
let totalReplaced = 0;
const perFile = [];

function transform(s) {
  let count = 0;
  const before = s;

  // 1. Weekday ranges (Mon–Fri etc) → hyphen
  s = s.replace(/\b(Mon|Tue|Tues|Wed|Thu|Thurs|Fri|Sat|Sun)\s*[–—]\s*(Mon|Tue|Tues|Wed|Thu|Thurs|Fri|Sat|Sun)\b/g, '$1-$2');

  // 2. Time ranges like "9:00 AM – 5:00 PM" → "9:00 AM to 5:00 PM"
  s = s.replace(/(\d{1,2}(?::\d{2})?\s?[AP]M)\s*[–—]\s*(\d{1,2}(?::\d{2})?\s?[AP]M)/gi, '$1 to $2');

  // 3. Numeric ranges (with optional $, %, units) → hyphen
  //    e.g. "$1,800–$4,200", "30–45 minutes", "5–7 days", "5,000–7,500"
  s = s.replace(/(\$?\d[\d,]*(?:\.\d+)?)\s*[–—]\s*(\$?\d[\d,]*(?:\.\d+)?)/g, '$1-$2');

  // 4. Year ranges like "2024–2026" already handled above. Inch/foot ranges
  //    like "5-inch–6-inch" rare; ignore.

  // 5. Em/en dash with surrounding spaces, next char lowercase letter
  //    → ". " + capitalize next letter
  s = s.replace(/(\S)\s+[—–]\s+([a-z])/g, (_, prev, c) => `${prev}. ${c.toUpperCase()}`);

  // 6. Em/en dash with surrounding spaces (next is uppercase or punctuation)
  //    → ". "
  s = s.replace(/(\S)\s+[—–]\s+/g, '$1. ');

  // 7. Em/en dash with no spaces between two word characters (parenthetical
  //    or appositive) → ", "
  s = s.replace(/(\w)[—–](\w)/g, '$1, $2');

  // 8. Any leftover bare em dash → ", "; bare en dash → hyphen
  s = s.replace(/—/g, ', ');
  s = s.replace(/–/g, '-');

  // Count replacements: # of original [—–] characters that no longer appear
  count = (before.match(/[—–]/g)?.length ?? 0) - (s.match(/[—–]/g)?.length ?? 0);

  return [s, count];
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (EXTS.has(path.extname(ent.name))) processFile(p);
  }
}

function processFile(p) {
  const src = fs.readFileSync(p, 'utf-8');
  if (!/[—–]/.test(src)) return;
  const [out, count] = transform(src);
  if (count > 0) {
    fs.writeFileSync(p, out);
    totalFiles++;
    totalReplaced += count;
    perFile.push([p, count]);
  }
}

walk(SRC);
console.log('Files updated:', totalFiles);
console.log('Dashes replaced:', totalReplaced);
console.log('---');
perFile.sort((a, b) => b[1] - a[1]).forEach(([p, c]) => console.log(`${String(c).padStart(4)}  ${p}`));
