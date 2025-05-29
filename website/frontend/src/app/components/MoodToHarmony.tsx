'use client';

import React, { useState, useCallback } from 'react';
import styles from '../page.module.css';
import MoodWheelDiagram from './MoodWheelDiagram';

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


const gainComponents = [
    EGEnergeticJoyfulGain,     // 0
    EGExcitedSurprisedGain,    // 1
    EGAgitatedAngryGain,       // 2
    EGTragicYearningGain,      // 3
    EGDarkDepressedGain,       // 4
    EGDreamySentimentalGain,   // 5
    EGCalmRelaxedGain,         // 6
    EGHeavyMajesticGain,       // 7
  ];
  
  const bpmComponents  = [
    EGEnergeticJoyfulBpm,      // 0
    EGExcitedSurprisedBpm,     // 1
    EGAgitatedAngryBpm,        // 2
    EGTragicYearningBpm,       // 3
    EGDarkDepressedBpm,        // 4
    EGDreamySentimentalBpm,    // 5
    EGCalmRelaxedBpm,          // 6
    EGHeavyMajesticBpm,        // 7
  ];

/* ---------- sector label / 音乐建议 ---------- */
const sectorLabels = [
  'Energetic / Joyful','Excited / Surprised','Agitated / Tense','Anxious / Angry',
  'Sad / Depressed','Gloomy / Tired','Calm / Relaxed','Content / Serene'
];
const suggestions = [
  ['🎵 Up-beat rhythms','🎵 Major keys','🎵 Fast tempo 120-140 BPM','🎵 Rich harmonies'],
  ['🎵 Dynamic tempo','🎵 Unexpected chords','🎵 Sparkling timbre','🎵 Syncopation'],
  /* …其余 6 组自定义 … */
];

export default function MoodToHarmony() {
  const [sector, setSector]       = useState(0);
  const [hoverSector, setHover]   = useState<number | null>(null);

  /* 左侧轮盘回调 */
  const handleMoodChange = useCallback(
    ({ sector: s }: { sector:number }) => setSector(s),
    []
  );
  const handleHover = useCallback((s: number|null)=> setHover(s), []);

  /* 取出当前要渲染的两个组件 */
  const GainChart = gainComponents[sector]   ?? (() => <p>TODO Gain #{sector}</p>);
  const BpmChart  = bpmComponents[sector]    ?? (() => <p>TODO BPM #{sector}</p>);
  const idx       = hoverSector ?? sector;

  return (
    <section className={styles.gallery}>
      <div className={styles.moodToHarmonyLayout}>
        {/* -------- 左半 -------- */}
        <div className={styles.leftBox}>
          <MoodWheelDiagram
            onMoodChange={handleMoodChange}
            onSectorHover={handleHover}
            highlightedSector={idx}
          />

          <div className={styles.moodStateCard}>
            <h3 className={styles.moodTitle}>Current Mood State</h3>
            <h4 className={styles.moodLabel}>{sectorLabels[idx]}</h4>
            <h4 className={styles.musicFeaturesTitle}>Suggested Music Features:</h4>
            {suggestions[idx]?.map((f,i)=>(
              <div key={i} className={styles.featureItem}>{f}</div>
            ))}
          </div>
        </div>

        {/* -------- 右半 -------- */}
        <div className={styles.rightColumn}>
          <div className={styles.distributionCard}>
            <h3 className={styles.distributionTitle}>Gain Distribution</h3>
            <GainChart />
          </div>

          <div className={styles.distributionCard}>
            <h3 className={styles.distributionTitle}>BPM Distribution</h3>
            <BpmChart />
          </div>
        </div>
      </div>
    </section>
  );
}
