'use client';

import styles from './page.module.css';
import { useState, useCallback } from 'react';

import ChordNetworkDiagram from './components/ChordNetworkDiagram';
import MoodToHarmony from './components/MoodToHarmony';

/* ---------- static data ---------- */
const cultures = [
  { id: 'france', name: 'France' },
  { id: 'usa-south', name: 'USA (South)' },
  { id: 'argentina-latin-america', name: 'Argentina / Latin-America' },
  { id: 'caribbean', name: 'Caribbean' },
  { id: 'brazil', name: 'Brazil' },
  { id: 'uk-scotland-ireland', name: 'UK (Scotland/Ireland)' },
  { id: 'germany', name: 'Germany' },
  { id: 'uk-england', name: 'UK (England)' },
  { id: 'mexico', name: 'Mexico' },
  { id: 'spain', name: 'Spain' },
  { id: 'nordic', name: 'Nordic' },
  { id: 'portugal', name: 'Portugal' },
  { id: 'italy', name: 'Italy' },
  { id: 'japan', name: 'Japan' },
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
          {/* bubble selector */}
          <section className={styles.genreExplorer}>
            <h2 className={styles.genreExplorerTitle}>Choose a culture to explore!</h2>

            <div className={styles.genreBubblesContainer}>
              {cultures.map(c => (
                <div
                  key={c.id}
                  className={`${styles.bubble} ${styles[c.id]} ${
                    selectedCulture.id === c.id ? styles.selectedBubble : ''
                  }`}
                  onClick={() => handleCultureSelect(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={styles.genreName}>{c.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* detail panel */}
          <section className={styles.genreDetailPanel}>
            <h2 className={styles.detailPanelTitle}>
              Details for&nbsp;
              <span className={styles.selectedGenreNameText}>{selectedCulture.name}</span>
            </h2>

            {/* chord visualization */}
            <div className={styles.chordVisualizationContainer}>
              <div className={styles.chordGraph}>
                <ChordNetworkDiagram
                  cultureId={selectedCulture.id}
                  width={800}
                  height={500}
                />
              </div>
            </div>

            <div className={styles.cultureInfo}>
              <h3 className={styles.panelSubTitle}>
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
          </section>
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