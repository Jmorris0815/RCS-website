#!/usr/bin/env node
/**
 * Cross-page similarity audit for location pages.
 * Fails build if any pair of location pages has >30% text similarity.
 *
 * This is the HCU-protection: prevents templated location pages from shipping.
 *
 * Usage: node scripts/check-page-similarity.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const LOC_DIR = path.join(process.cwd(), 'src', 'content', 'locations');
const THRESHOLD = 0.30;

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3); // ignore short words
}

function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

async function run() {
  let files;
  try {
    files = (await readdir(LOC_DIR)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch (e) {
    console.log('No locations directory yet — skipping similarity check.');
    return;
  }

  if (files.length < 2) {
    console.log('Fewer than 2 location files — nothing to compare.');
    return;
  }

  const docs = [];
  for (const f of files) {
    const content = await readFile(path.join(LOC_DIR, f), 'utf-8');
    docs.push({ file: f, tokens: tokenize(content) });
  }

  let failed = false;
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const score = jaccard(docs[i].tokens, docs[j].tokens);
      if (score > THRESHOLD) {
        console.error(
          `❌ ${docs[i].file} ↔ ${docs[j].file}: similarity ${(score * 100).toFixed(1)}% (threshold ${THRESHOLD * 100}%)`
        );
        failed = true;
      } else {
        console.log(
          `✓  ${docs[i].file} ↔ ${docs[j].file}: similarity ${(score * 100).toFixed(1)}%`
        );
      }
    }
  }

  if (failed) {
    console.error(
      '\nLocation pages share too much language. Rewrite with more local specificity (real neighborhoods, real tree species, real customer scenarios) before merging.'
    );
    process.exit(1);
  }
  console.log('\nAll location pages are sufficiently unique.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
