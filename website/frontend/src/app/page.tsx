'use client';

import styles from './page.module.css';
import { useState, useCallback } from 'react';

import ChordNetworkDiagram from './components/ChordNetworkDiagram';
import MoodToHarmony from './components/MoodToHarmony';
import CultureSelector from './components/CultureSelector';

/* ---------- static data ---------- */
const cultures = [
  { id: 'france', name: 'France', flag: '🇫🇷' },
  { id: 'usa-south', name: 'USA (South)', flag: '🇺🇸' },
  { id: 'argentina-latin-america', name: 'Argentina', flag: '🇦🇷' },
  { id: 'caribbean', name: 'Caribbean', flag: '🏝️' },
  { id: 'brazil', name: 'Brazil', flag: '🇧🇷' },
  { id: 'uk-scotland-ireland', name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { id: 'germany', name: 'Germany', flag: '🇩🇪' },
  { id: 'uk-england', name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'mexico', name: 'Mexico', flag: '🇲🇽' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸' },
  { id: 'nordic', name: 'Nordic', flag: '🇳🇴' },
  { id: 'portugal', name: 'Portugal', flag: '🇵🇹' },
  { id: 'italy', name: 'Italy', flag: '🇮🇹' },
  { id: 'japan', name: 'Japan', flag: '🇯🇵' },
];

/* ---------- page component ---------- */
export default function Home() {
  const [activeView, setActiveView] = useState<'culture' | 'mood'>('culture');
  const [selectedCulture, setCulture] = useState(cultures[0]);

  /* handlers */
  const handleCultureSelect = useCallback((c: typeof cultures[number]) => {
    setCulture(c);
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.brand}>Moved&nbsp;to&nbsp;the&nbsp;Core</header>
      <h1 className={styles.title}>
        Welcome to your exploration of the music-chords world
      </h1>

      {/* top-level view switch */}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${activeView === 'culture' ? styles.activeButton : ''}`}
          onClick={() => setActiveView('culture')}
        >
          Culture&nbsp;to&nbsp;Chord
        </button>
        <button
          className={`${styles.button} ${activeView === 'mood' ? styles.activeButton : ''}`}
          onClick={() => setActiveView('mood')}
        >
          Mood&nbsp;to&nbsp;Harmony
        </button>
      </div>

      {/* ---------- view A: Culture to Chord ---------- */}
      {activeView === 'culture' && (
        <section className={styles.gallery}>
          <div className={styles.cultureChordLayout}>
            {/* left column - culture selector */}
            <div className={styles.cultureLeftColumn}>
              <CultureSelector
                cultures={cultures}
                selectedCulture={selectedCulture}
                onCultureSelect={handleCultureSelect}
              />
            </div>

            {/* right column - chord visualization */}
            <div className={styles.cultureRightColumn}>
              <div className={styles.chordPanel}>
                <h2 className={styles.chordPanelTitle}>
                  Details for&nbsp;
                  <span className={styles.selectedCultureName}>{selectedCulture.name}</span>
                </h2>

                {/* chord visualization */}
                <div className={styles.chordVisualizationContainer}>
                  <div className={styles.chordGraph}>
                    <ChordNetworkDiagram
                      cultureId={selectedCulture.id}
                      width={900}
                      height={600}
                    />
                  </div>
                </div>

                <div className={styles.cultureInfo}>
                  <h3>
                    Musical characteristics of&nbsp;{selectedCulture.name}
                  </h3>
                  <p>
                    Explore the unique chord progressions and harmonic patterns that define the
                    musical traditions of {selectedCulture.name}. The radial layout shows pitch 
                    classes as arms radiating from the center, with chord qualities positioned 
                    along each arm based on their harmonic function.
                  </p>
                  <ul className={styles.networkStats}>
                    <li><strong>🎵 Interactive Visualization:</strong> hover over chords to see connections and details</li>
                    <li><strong>📊 Data-Driven:</strong> based on analysis of popular songs from {selectedCulture.name}</li>
                    <li><strong>🔗 Chord Transitions:</strong> curved lines show transition probabilities between chords</li>
                    <li><strong>🎨 Visual Encoding:</strong> distance from center = chord quality, size = frequency, opacity = usage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- view B: Mood to Harmony ---------- */}
      {activeView === 'mood' && (
        <div className={styles.moodToHarmonyLayout}>
          <MoodToHarmony />
        </div>
      )}

      {/* footer */}
      <footer className={styles.contactSection}>
        <h3 className={styles.contactTitle}>Contact information</h3>
        <div className={styles.contactBox}>
          <p className={styles.teamName}>Team Apple-Pie-Chart</p>
          <ul className={styles.memberList}>
            <li>Yiwei Liu：<a href="mailto:yiw.liu@epfl.ch">yiw.liu@epfl.ch</a></li>
            <li>Tianhao Dai：<a href="mailto:tianhao.dai@epfl.ch">tianhao.dai@epfl.ch</a></li>
            <li>Ewan Golfier：<a href="mailto:ewan.golfier@epfl.ch">ewan.golfier@epfl.ch</a></li>
          </ul>
        </div>
      </footer>
    </main>
  );
}