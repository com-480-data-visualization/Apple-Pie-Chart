#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const slug = (sector) => {
  const name = sector.includes('(') ? sector.split(/[()]/)[1] : sector;
  return name
    .replace(/[^\w]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join('');
};

const jsonPath = resolve(__dirname, '../src/app/data/cluster_key_counts_distribution.json');
const raw = JSON.parse(readFileSync(jsonPath, 'utf8'));

const baseDir = resolve(__dirname, '../src/app/components/mood-histograms/key');
mkdirSync(baseDir, { recursive: true });

Object.entries(raw).forEach(([sector, counts]) => {
  const id       = slug(sector);
  const baseName = id.charAt(0).toUpperCase() + id.slice(1);
  const compName = `${baseName}Key`;

  const tsx = `// ⚠️ 由脚本自动生成，请勿手动修改
'use client';
import KeyPuzzleDistribution from '../../KeyPuzzleDistribution';

const counts = ${JSON.stringify(counts, null, 2)};

export default function ${compName}() {
  return (
    <KeyPuzzleDistribution counts={counts} title="${sector} – Key" />
  );
}
`;

  /* ---- 这里改掉反斜杠 ---- */
  writeFileSync(join(baseDir, `${compName}.tsx`), tsx);
  console.log(`✓ key/${compName}.tsx`);
});

console.log('\n✅ Key-histogram components generated successfully!');
