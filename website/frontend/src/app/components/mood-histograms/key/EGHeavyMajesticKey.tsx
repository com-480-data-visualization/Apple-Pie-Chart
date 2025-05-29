// ⚠️ 由脚本自动生成，请勿手动修改
'use client';
import KeyPuzzleDistribution from '../../KeyPuzzleDistribution';

const counts = {
  "A major": 74,
  "A minor": 64,
  "A# major": 29,
  "A# minor": 14,
  "B major": 36,
  "B minor": 37,
  "C major": 95,
  "C minor": 45,
  "C# major": 33,
  "C# minor": 44,
  "D major": 76,
  "D minor": 61,
  "D# major": 43,
  "D# minor": 33,
  "E major": 42,
  "E minor": 81,
  "F major": 49,
  "F minor": 34,
  "F# major": 27,
  "F# minor": 18,
  "G major": 77,
  "G minor": 40,
  "G# major": 36,
  "G# minor": 24
};

export default function EGHeavyMajesticKey() {
  return (
    <KeyPuzzleDistribution counts={counts} title="135-180 deg (e.g., Heavy/Majestic) – Key" />
  );
}
