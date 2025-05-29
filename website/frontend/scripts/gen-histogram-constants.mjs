#!/usr/bin/env node
/**
 * 自动读取 src/app/cluster_data_emotion.json
 * 为 8 个情绪扇区 × 2 指标（gain / bpm）各输出一个 TSX 封装组件
 * 输出路径：
 *   src/app/components/mood-histograms/gain/<CamelCase>Gain.tsx
 *   src/app/components/mood-histograms/bpm/<CamelCase>Bpm.tsx
 *
 * 再在 MoodToHarmony.tsx 里 import 对应组件即可。
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ---------- helper ---------- */
const slug = (sector) =>
  sector                       // "0-45 deg (e.g., Energetic/Joyful)"
    .split(/[()]/)[1]          // Energetic/Joyful
    .replace(/[^\w]+/g, ' ')   // Energetic Joyful
    .trim()
    .split(/\s+/)             // [Energetic, Joyful]
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w.toLowerCase()))
    .join('');                 // energeticJoyful (camelCase)

/* ---------- load json ---------- */
const jsonPath = resolve(__dirname, '../src/app/cluster_data_emotion.json');
const raw = JSON.parse(readFileSync(jsonPath, 'utf8'));

/* ---------- prepare output dirs ---------- */
const baseDir = resolve(__dirname, '../src/app/components/mood-histograms');
mkdirSync(join(baseDir, 'gain'), { recursive: true });
mkdirSync(join(baseDir, 'bpm'),  { recursive: true });

/* ---------- generate files ---------- */
Object.entries(raw).forEach(([sector, { gain, bpm }]) => {
  const id       = slug(sector);            // energeticJoyful
  const baseName = id.charAt(0).toUpperCase() + id.slice(1); // EnergeticJoyful

  /* Gain component */
  const gainComp = `${baseName}Gain`;
  const gainTsx  = `// ⚠️ 由脚本自动生成，请勿手动修改\n'use client';\nimport GainDistribution from '../../GainDistribution';\n\nconst data = [${gain.join(', ')}];\n\nexport default function ${gainComp}() {\n  return (\n    <GainDistribution data={data} title=\"${sector} – Gain\" width={400} height={220} />\n  );\n}\n`;
  writeFileSync(join(baseDir, 'gain', `${gainComp}.tsx`), gainTsx);
  console.log(`✓ gain/${gainComp}.tsx`);

  /* BPM component */
  const bpmComp  = `${baseName}Bpm`;
  const bpmTsx   = `// ⚠️ 由脚本自动生成，请勿手动修改\n'use client';\nimport BPMDistribution from '../../BPMDistribution';\n\nconst data = [${bpm.join(', ')}];\n\nexport default function ${bpmComp}() {\n  return (\n    <BPMDistribution data={data} title=\"${sector} – BPM\" width={400} height={220} />\n  );\n}\n`;
  writeFileSync(join(baseDir, 'bpm', `${bpmComp}.tsx`), bpmTsx);
  console.log(`✓ bpm/${bpmComp}.tsx`);
});

console.log('\n✅ All histogram components generated successfully!');