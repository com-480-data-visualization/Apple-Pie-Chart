'use client';

import styles from './page.module.css';
import { useState, useCallback } from 'react';

import ChordNetworkDiagram from './components/ChordNetworkDiagram';
import MoodToHarmony       from './components/MoodToHarmony';

/* ---------- static data ---------- */
const cultures = [
  { id: 'france',               name: 'France' },
  { id: 'usa-south',            name: 'USA (South)' },
  { id: 'argentina-latin-america', name: 'Argentina / Latin-America' },
  { id: 'caribbean',            name: 'Caribbean' },
  { id: 'brazil',               name: 'Brazil' },
  { id: 'uk-scotland-ireland',  name: 'UK (Scotland/Ireland)' },
  { id: 'germany',              name: 'Germany' },
  { id: 'uk-england',           name: 'UK (England)' },
  { id: 'mexico',               name: 'Mexico' },
  { id: 'spain',                name: 'Spain' },
  { id: 'nordic',               name: 'Nordic' },
  { id: 'portugal',             name: 'Portugal' },
  { id: 'italy',                name: 'Italy' },
  { id: 'japan',                name: 'Japan' },
];

const moodBoard = [
  { emoji: '😢',    percentage: 15 },
  { emoji: '😡',    percentage: 9  },
  { emoji: '😊❤️', percentage: 55 },
  { emoji: '😊',    percentage: 4  },
  { emoji: '😴',    percentage: 15 },
];

/* ---------- page component ---------- */
export default function Home() {
  const [activeView, setActiveView]   = useState<'culture' | 'mood'>('culture');
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

            <div className={styles.chordAndEmojiContainer}>
              {/* chord network */}
              <div className={styles.chordGraph}>
                <ChordNetworkDiagram
                  cultureId={selectedCulture.id}
                  width={400}
                  height={300}
                />
              </div>

              {/* emoji mood board */}
              <div className={styles.emojiBoard}>
                <h3 className={styles.panelSubTitle}>Emoji mood board of your selection</h3>
                <div className={styles.emojiContainer}>
                  {moodBoard.map((m, i) => (
                    <div key={i} className={styles.emojiItem}>
                      <span className={styles.emoji}>{m.emoji}</span>
                      <span className={styles.percentage}>{m.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cultureInfo}>
              <h3 className={styles.panelSubTitle}>
                Musical characteristics of&nbsp;{selectedCulture.name}
              </h3>
              <p>
                Explore the unique chord progressions and harmonic patterns that define the
                musical traditions of {selectedCulture.name}. Click any node in the network
                above to hear how it sounds and discover common transitions.
              </p>
              <ul className={styles.networkStats}>
                <li><strong>🎵 Interactive Network:</strong> click nodes to play chords</li>
                <li><strong>📊 Data-Driven:</strong> based on analysis of popular songs</li>
                <li><strong>🔗 Chord Transitions:</strong> arrow thickness denotes probability</li>
              </ul>
            </div>
          </section>
        </section>
      )}

      {/* ---------- view B: Mood to Harmony ---------- */}
      {activeView === 'mood' && <MoodToHarmony />}

      {/* footer */}
      <footer className={styles.contactSection}>
        <h3 className={styles.contactTitle}>Contact information</h3>
        <div className={styles.contactBox}>
          <p className={styles.teamName}>Team Apple-Pie-Chart</p>
          <ul className={styles.memberList}>
            <li>Yiwei Liu：<a href="yiw.liu@epfl.ch">yiw.liu@epfl.ch</a></li>
            <li>Tianhao Dai：<a href="mailto:tianhao.dai@epfl.ch">tianhao.dai@epfl.ch</a></li>
            <li>Ewan Golfier：<a href="mailto:ewan.golfier@epfl.ch">ewan.golfier@epfl.ch</a></li>
          </ul>
        </div>
      </footer>
    </main>
  );
}
