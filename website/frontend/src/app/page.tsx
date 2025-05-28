'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useState } from 'react';
import ChordNetworkDiagram from './components/ChordNetworkDiagram';
import MoodWheelDiagram   from './components/MoodWheelDiagram';

const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/* ---------- Static Data ---------- */
const cultures = [
  // { id: 'usa-general', name: 'USA (General)' },
  { id: 'france', name: 'France' },
  { id: 'usa-south', name: 'USA (South)' },
  { id: 'argentina-latin-america', name: 'Argentina/Latin America' },
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
  // { id: 'turkey', name: 'Turkey' },
];

const moodData = [
  { emoji:'😢',    percentage:15},
  { emoji:'😡',    percentage:9},
  { emoji:'😊❤️', percentage:55},
  { emoji:'😊',    percentage:4},
  { emoji:'😴',    percentage:15},
];

const songs = [
  { name:'All too well',      image:`${prefix}/images/songs/all_too_well.jpg`,    alt:'All too well'},
  { name:'Taylor Swift',      image:`${prefix}/images/songs/taylor_swift.jpg`,    alt:'Taylor Swift'},
  { name:'Bohemian Rhapsody', image:`${prefix}/images/songs/bohemian.jpg`,        alt:'Bohemian Rhapsody'},
  { name:'No Woman, No Cry',  image:`${prefix}/images/songs/no_woman_no_cry.jpg`, alt:'No Woman, No Cry'},
];

// Updated Sector Labels to match MoodWheelDiagram (derived from image)
const pageSectorLabels = [
  'Tenderness', 'Surprise', 'Excited', 'Fear', 
  'Anger', 'Sadness', 'Tired', 'Relaxed'
];

/* ---------- Page Component ---------- */
export default function Home() {
  const [activeView, setActiveView] = useState('cultureToChord');
  const [currentMood, setCurrentMood] = useState<{ x: number; y: number } | null>(null);
  const [currentSector, setCurrentSector] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  
  // New state for selected culture
  const [selectedCulture, setSelectedCulture] = useState(cultures[0]); // Default to first culture

  const handleMoodUpdate = (moodData: { x: number; y: number; sector: number; angle: number }) => {
    setCurrentMood({ x: moodData.x, y: moodData.y });
    setCurrentSector(moodData.sector);
    setCurrentAngle(moodData.angle);
    console.log("Page - Current Mood Data:", moodData);
  };

  const handleCultureSelect = (culture: typeof cultures[0]) => {
    setSelectedCulture(culture);
  };

  return (
    <main className={styles.main}>
      <header className={styles.brand}>Moved to the Core</header>
      <h1 className={styles.title}>Welcome to your exploration of the music chords world</h1>

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${activeView === 'cultureToChord' ? styles.activeButton : ''}`}
          onClick={() => setActiveView('cultureToChord')}
        >
          Culture to Chord
        </button>
        <button
          className={`${styles.button} ${activeView === 'moodToHarmony' ? styles.activeButton : ''}`}
          onClick={() => setActiveView('moodToHarmony')}
        >
          Mood to Harmony
        </button>
      </div>

      {activeView === 'cultureToChord' && (
        <>
          {/* Entire white card for Culture to Chord */}
          <section className={styles.gallery}>

            {/* Genre Explorer Area */}
            <section className={styles.genreExplorer}>
              <h2 className={styles.genreExplorerTitle}>Choose a culture to explore!</h2>

              <div className={styles.genreBubblesContainer}>
                {cultures.map(c =>(
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

            {/* Detail Panel for Selected Culture */}
            <section className={styles.genreDetailPanel}>
              <h2 className={styles.detailPanelTitle}>
                Details for:&nbsp;
                <span className={styles.selectedGenreNameText}>
                  {selectedCulture.name}
                </span>
              </h2>

              <div className={styles.chordAndEmojiContainer}>
                {/* ChordGraph (dynamic) */}
                <div className={styles.chordGraph}>
                  <ChordNetworkDiagram 
                    cultureId={selectedCulture.id}
                    width={400}
                    height={300}
                  />
                </div>

                {/* EmojiBoard (static for now) */}
                <div className={styles.emojiBoard}>
                  <h3 className={styles.panelSubTitle}>Emoji mood board of your selection</h3>
                  <div className={styles.emojiContainer}>
                    {moodData.map((m,i)=>(
                      <div key={i} className={styles.emojiItem}>
                        <span className={styles.emoji}>{m.emoji}</span>
                        <span className={styles.percentage}>{m.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional culture info section */}
              <div className={styles.cultureInfo}>
                <h3 className={styles.panelSubTitle}>
                  Musical characteristics of {selectedCulture.name}
                </h3>
                <div className={styles.cultureDescription}>
                  <p>
                    Explore the unique chord progressions and harmonic patterns that define the musical 
                    traditions of {selectedCulture.name}. Click on any chord in the network above to 
                    hear how it sounds and discover the most common progressions used in this culture's music.
                  </p>
                  <div className={styles.networkStats}>
                    <div className={styles.statItem}>
                      <strong>🎵 Interactive Network:</strong> Click nodes to play chords
                    </div>
                    <div className={styles.statItem}>
                      <strong>📊 Data-Driven:</strong> Based on analysis of popular songs
                    </div>
                    <div className={styles.statItem}>
                      <strong>🔗 Chord Transitions:</strong> Arrow thickness shows probability
                    </div>
                  </div>
                </div>
              </div>

            </section>
          </section>
        </>
      )}

      {activeView === 'moodToHarmony' && (
        <>
          {/* Mood to Harmony Section */}
          <section className={`${styles.gallery} ${styles.moodToHarmonyLayout}`}>
            {/* Left Box for Mood Wheel */}
            <div className={styles.leftBox}>
              <MoodWheelDiagram onMoodChange={handleMoodUpdate} />
            </div>
            {/* Right Column for controls and info */}
            <div className={styles.rightColumn}>
              {/* Right Top Box for sliders */}
              <div className={styles.rightTopBox}>
                <div className={styles.sliderContainer}>
                  <label htmlFor="bpmSlider" className={styles.sliderLabel}>BPM</label>
                  <input type="range" id="bpmSlider" min="60" max="180" defaultValue="120" className={styles.slider} />
                </div>
                <div className={styles.sliderContainer}>
                  <label htmlFor="gainSlider" className={styles.sliderLabel}>Gain</label>
                  <input type="range" id="gainSlider" min="0" max="100" defaultValue="50" className={styles.slider} />
                </div>
              </div>
              {/* Right Bottom Box for mood details */}
              <div className={styles.rightBottomBox}>
                <h3 style={{ marginTop: '0', marginBottom: '15px' }}>Current Mood State</h3>
                {currentMood ? (
                  <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <div><strong>Sector:</strong> {pageSectorLabels[currentSector]} (#{currentSector + 1})</div>
                    <div><strong>Angle:</strong> {currentAngle.toFixed(1)}°</div>
                    <div><strong>X Coordinate:</strong> {currentMood.x.toFixed(3)}</div>
                    <div><strong>Y Coordinate:</strong> {currentMood.y.toFixed(3)}</div>
                    
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <h4>Suggested Music Features:</h4>
                      {currentSector === 0 && <p>🎵 Tender, warm melodies</p>} 
                      {currentSector === 1 && <p>🎵 Bright, surprising elements</p>}
                      {currentSector === 2 && <p>🎵 Fast-paced, high-energy music</p>}
                      {currentSector === 3 && <p>🎵 Tense, suspenseful sounds</p>} 
                      {currentSector === 4 && <p>🎵 Intense, fiery music</p>}      
                      {currentSector === 5 && <p>🎵 Slow, emotionally rich music</p>} 
                      {currentSector === 6 && <p>🎵 Low-energy, reflective tunes</p>} 
                      {currentSector === 7 && <p>🎵 Soothing, relaxing rhythms</p>} 
                    </div>
                  </div>
                ) : (
                  <p>Please drag the button on the circle to select a mood state.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}
      {/* Contact Information */}
      <footer className={styles.contactSection}>
        <h3 className={styles.contactTitle}>Contact information</h3>

        <div className={styles.contactBox}>
          <p className={styles.teamName}>Team Apple-Pie-Chart</p>

          <ul className={styles.memberList}>
            <li>
              Yiwei&nbsp;Liu ：
              <a href="mailto:blabla@blabla.com">blabla@blabla.com</a>
            </li>
            <li>
              Tianhao&nbsp;Dai ：
              <a href="mailto:blibli@blibli.com">blibli@blibli.com</a>
            </li>
            <li>
              Ewan&nbsp;Golfier ：
              <a href="mailto:bloblo@bloblo.com">bloblo@bloblo.com</a>
            </li>
          </ul>
        </div>
      </footer>
    </main>
  );
}