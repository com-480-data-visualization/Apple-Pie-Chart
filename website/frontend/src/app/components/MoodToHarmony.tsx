'use client';

import React, { useState, useCallback } from 'react';
import styles from '../page.module.css';
import MoodWheelDiagram from './MoodWheelDiagram';

/* ---------- 添加 KeyPuzzleDistribution 导入 ---------- */
import KeyPuzzleDistribution from './KeyPuzzleDistribution';

/* ---------- 16 个直方图封装组件 ---------- */
import EGEnergeticJoyfulGain      from './mood-histograms/gain/EGEnergeticJoyfulGain';
import EGEnergeticJoyfulBpm       from './mood-histograms/bpm/EGEnergeticJoyfulBpm';

import EGExcitedSurprisedGain     from './mood-histograms/gain/EGExcitedSurprisedGain';
import EGExcitedSurprisedBpm      from './mood-histograms/bpm/EGExcitedSurprisedBpm';

import EGAgitatedAngryGain        from './mood-histograms/gain/EGAgitatedAngryGain';
import EGAgitatedAngryBpm         from './mood-histograms/bpm/EGAgitatedAngryBpm';

import EGTragicYearningGain       from './mood-histograms/gain/EGTragicYearningGain';
import EGTragicYearningBpm        from './mood-histograms/bpm/EGTragicYearningBpm';

import EGDarkDepressedGain        from './mood-histograms/gain/EGDarkDepressedGain';
import EGDarkDepressedBpm         from './mood-histograms/bpm/EGDarkDepressedBpm';

import EGDreamySentimentalGain    from './mood-histograms/gain/EGDreamySentimentalGain';
import EGDreamySentimentalBpm     from './mood-histograms/bpm/EGDreamySentimentalBpm';

import EGCalmRelaxedGain          from './mood-histograms/gain/EGCalmRelaxedGain';
import EGCalmRelaxedBpm           from './mood-histograms/bpm/EGCalmRelaxedBpm';

import EGHeavyMajesticGain        from './mood-histograms/gain/EGHeavyMajesticGain';
import EGHeavyMajesticBpm         from './mood-histograms/bpm/EGHeavyMajesticBpm';

/* ---------- import Key charts ---------- */
import EGEnergeticJoyfulKey  from './mood-histograms/key/EGEnergeticJoyfulKey';
import EGExcitedSurprisedKey from './mood-histograms/key/EGExcitedSurprisedKey';
import EGAgitatedAngryKey    from './mood-histograms/key/EGAgitatedAngryKey';
import EGHeavyMajesticKey    from './mood-histograms/key/EGHeavyMajesticKey';
import EGDarkDepressedKey    from './mood-histograms/key/EGDarkDepressedKey';
import EGTragicYearningKey   from './mood-histograms/key/EGTragicYearningKey';
import EGDreamySentimentalKey from './mood-histograms/key/EGDreamySentimentalKey';
import EGCalmRelaxedKey      from './mood-histograms/key/EGCalmRelaxedKey';


const gainComponents = [
  EGEnergeticJoyfulGain,     // 0
  EGExcitedSurprisedGain,    // 1
  EGAgitatedAngryGain,       // 2
  EGHeavyMajesticGain,       // 3
  EGDarkDepressedGain,       // 4
  EGTragicYearningGain,      // 5
  EGDreamySentimentalGain,   // 6
  EGCalmRelaxedGain,         // 7
];

const bpmComponents = [
  EGEnergeticJoyfulBpm,      // 0
  EGExcitedSurprisedBpm,     // 1
  EGAgitatedAngryBpm,        // 2
  EGHeavyMajesticBpm,        // 3
  EGDarkDepressedBpm,        // 4
  EGTragicYearningBpm,       // 5
  EGDreamySentimentalBpm,    // 6
  EGCalmRelaxedBpm,          // 7
];

/* ---------- arrays ---------- */
const keyComponents = [
  EGEnergeticJoyfulKey,     // 0
  EGExcitedSurprisedKey,    // 1
  EGAgitatedAngryKey,       // 2
  EGHeavyMajesticKey,       // 3
  EGDarkDepressedKey,       // 4
  EGTragicYearningKey,      // 5
  EGDreamySentimentalKey,   // 6
  EGCalmRelaxedKey,         // 7
];

/* ---------- sector label / 音乐建议 ---------- */
const sectorLabels = [
  'Energetic / Joyful',
  'Excited / Surprised',
  'Agitated / Angry',
  'Heavy / Majestic',
  'Dark / Depressed',
  'Tragic / Yearning',
  'Dreamy / Sentimental',
  'Calm / Relaxed',
];

const suggestions = [
  ['🎵 Up-beat rhythms','🎵 Major keys','🎵 Fast tempo 120-140 BPM','🎵 Rich harmonies'],
  ['🎵 Dynamic tempo','🎵 Unexpected chords','🎵 Sparkling timbre','🎵 Syncopation'],
  ['🎵 Strong percussion','🎵 Minor keys','🎵 Fast tempo','🎵 Dissonant harmonies'],
  ['🎵 Slow tempo','🎵 Rich orchestration','🎵 Minor keys','🎵 Deep bass'],
  ['🎵 Slow tempo','🎵 Minor keys','🎵 Sparse arrangement','🎵 Low energy'],
  ['🎵 Melancholic melodies','🎵 Minor keys','🎵 Slow to moderate tempo','🎵 Emotional depth'],
  ['🎵 Soft textures','🎵 Ambient sounds','🎵 Slow tempo','🎵 Ethereal harmonies'],
  ['🎵 Gentle rhythms','🎵 Soft dynamics','🎵 Slow tempo','🎵 Peaceful harmonies'],
];

export default function MoodToHarmony() {
  const [sector, setSector] = useState(0);
  const [hoverSector, setHover] = useState<number | null>(null);

  /* 左侧轮盘回调 */
  const handleMoodChange = useCallback(
    ({ sector: s }: { sector: number }) => setSector(s),
    []
  );
  const handleHover = useCallback((s: number | null) => setHover(s), []);

  /* 取出当前要渲染的三个组件 */
  const GainChart = gainComponents[sector] ?? (() => <p>TODO Gain #{sector}</p>);
  const BpmChart = bpmComponents[sector] ?? (() => <p>TODO BPM #{sector}</p>);
  const KeyChart = keyComponents[sector] ?? (() => <p>TODO Key #{sector}</p>);
  const idx = hoverSector ?? sector;

  return (
    <div className={styles.moodToHarmonyLayout}>
      {/* 左半：轮盘 + 心情卡片 */}
      <div className={styles.leftColumn}>
        {/* MoodWheel容器 */}
        <div className={styles.moodWheelPanel}>
          <MoodWheelDiagram
            onMoodChange={handleMoodChange}
            onSectorHover={handleHover}
            highlightedSector={idx}
          />
          
          <div className={styles.moodStateCard}>
            <h3 className={styles.moodTitle}>Current Mood State</h3>
            <h4 className={styles.moodLabel}>{sectorLabels[idx]}</h4>
            
            <div className={styles.musicFeaturesContainer}>
              <h4 className={styles.musicFeaturesTitle}>Suggested Music Features:</h4>
              <div className={styles.featuresList}>
                {suggestions[idx]?.map((f, i) => (
                  <div key={i} className={styles.featureItem}>{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右半：分布图 */}
      <div className={styles.rightColumn}>
        <div className={styles.distributionsRow}>
          <div className={styles.distributionCard}>
            <h3 className={styles.distributionTitle}>Gain Distribution</h3>
            <div className={styles.distributionContent}>
              <GainChart />
            </div>
          </div>

          <div className={styles.distributionCard}>
            <h3 className={styles.distributionTitle}>BPM Distribution</h3>
            <div className={styles.distributionContent}>
              <BpmChart />
            </div>
          </div>
        </div>

        {/* Key Distribution - 使用正确的 CSS 模块类名 */}
        <div className={styles.keyDistributionCard}>
          <h3 className={styles.keyDistributionTitle}>Key Distribution</h3>
          <div className={styles.keyDistributionContent}>
            <KeyChart />
          </div>
        </div>
      </div>
    </div>
  );
}