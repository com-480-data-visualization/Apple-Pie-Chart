// ⚠️ 由脚本自动生成，请勿手动修改
'use client';
import KeyPuzzleDistribution from '../../KeyPuzzleDistribution';

const counts = {
  "A major": 139,
  "A minor": 160,
  "A# major": 77,
  "A# minor": 22,
  "B major": 54,
  "B minor": 87,
  "C major": 159,
  "C minor": 64,
  "C# major": 44,
  "C# minor": 77,
  "D major": 144,
  "D minor": 108,
  "D# major": 80,
  "D# minor": 64,
  "E major": 101,
  "E minor": 121,
  "F major": 110,
  "F minor": 47,
  "F# major": 50,
  "F# minor": 41,
  "G major": 153,
  "G minor": 73,
  "G# major": 51,
  "G# minor": 31
};

export default function EGDarkDepressedKey() {
  return (
    <KeyPuzzleDistribution counts={counts} title="180-225 deg (e.g., Dark/Depressed) – Key" />
  );
}
