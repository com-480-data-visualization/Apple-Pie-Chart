'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useState, useEffect, useCallback } from 'react';
import ChordNetworkDiagram from './components/ChordNetworkDiagram';
import MoodWheelDiagram   from './components/MoodWheelDiagram';
import GainDistribution from './components/GainDistribution';
import BPMDistribution from './components/BPMDistribution';

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

// Define emotion data interface
interface ClusterData {
  gain: number[];
  bpm: number[];
}

interface EmotionData {
  [key: string]: ClusterData;
}

// Define 8 sectors mapping
const sectors = [
  { key: '0-45 deg (e.g., Energetic/Joyful)', angle: 22.5, label: 'Energetic/Joyful' },
  { key: '45-90 deg (e.g., Excited/Surprised)', angle: 67.5, label: 'Excited/Surprised' },
  { key: '90-135 deg (e.g., Tense/Aggressive)', angle: 112.5, label: 'Tense/Aggressive' },
  { key: '135-180 deg (e.g., Angry/Frustrated)', angle: 157.5, label: 'Angry/Frustrated' },
  { key: '180-225 deg (e.g., Sad/Depressed)', angle: 202.5, label: 'Sad/Depressed' },
  { key: '225-270 deg (e.g., Bored/Tired)', angle: 247.5, label: 'Bored/Tired' },
  { key: '270-315 deg (e.g., Calm/Peaceful)', angle: 292.5, label: 'Calm/Peaceful' },
  { key: '315-360 deg (e.g., Content/Happy)', angle: 337.5, label: 'Content/Happy' }
];

/* ---------- Page Component ---------- */
export default function Home() {
  const [activeView, setActiveView] = useState('cultureToChord');
  const [currentMood, setCurrentMood] = useState<{ x: number; y: number } | null>(null);
  const [currentSector, setCurrentSector] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  
  // New state for selected culture
  const [selectedCulture, setSelectedCulture] = useState(cultures[0]); // Default to first culture

  // New states for emotion data
  const [emotionData, setEmotionData] = useState<EmotionData>({});
  const [currentData, setCurrentData] = useState<ClusterData>({ gain: [], bpm: [] });
  const [selectedSector, setSelectedSector] = useState<string>('0-45 deg (e.g., Energetic/Joyful)');

  // Load emotion data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/cluster_data_emotion.json');
        const data = await response.json();
        setEmotionData(data);
        
        // Set initial data based on default sector (0)
        const initialSectorKey = sectors[0]?.key;
        if (initialSectorKey && data[initialSectorKey]) {
          setSelectedSector(initialSectorKey);
          setCurrentData(data[initialSectorKey]);
          console.log('Initial data loaded for sector:', initialSectorKey, data[initialSectorKey]);
        }
      } catch (error) {
        console.error('Error loading emotion data:', error);
      }
    };

    loadData();
  }, []); // 确保只运行一次

  const handleMoodUpdate = useCallback((moodData: { x: number; y: number; sector: number; angle: number }) => {
    // 始终更新位置和角度
    setCurrentMood({ x: moodData.x, y: moodData.y });
    setCurrentAngle(moodData.angle);
    
    // 只在sector实际改变时更新状态
    if (moodData.sector !== currentSector) {
      setCurrentSector(moodData.sector);
      
      // Update emotion data based on sector
      const sectorKey = sectors[moodData.sector]?.key;
      if (sectorKey && emotionData[sectorKey] && sectorKey !== selectedSector) {
        setSelectedSector(sectorKey);
        setCurrentData(emotionData[sectorKey]);
      }
    }
    
    console.log("Page - Current Mood Data:", moodData);
  }, [currentSector, selectedSector, emotionData]); // 添加依赖项

  const handleCultureSelect = useCallback((culture: typeof cultures[0]) => {
    setSelectedCulture(culture);
  }, []);

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
          {/* Mood to Harmony Section - Redesigned */}
          <section className={styles.gallery}>
            <div className={styles.moodToHarmonyLayout}>
              {/* Left Side - Mood Wheel and Info */}
              <div className={styles.leftBox}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <MoodWheelDiagram onMoodChange={handleMoodUpdate} />
                  </div>
                  
                  {/* Current mood info card */}
                  <div style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    padding: '20px', 
                    backgroundColor: '#e6f0fa', 
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ 
                      marginTop: '0', 
                      marginBottom: '15px', 
                      fontSize: '1.2rem',
                      color: '#1a365d',
                      textAlign: 'center'
                    }}>
                      Current Mood State
                    </h3>
                    {currentMood ? (
                      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Sector:</strong> {pageSectorLabels[currentSector]} (#{currentSector + 1})
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Angle:</strong> {currentAngle.toFixed(1)}°
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>X:</strong> {currentMood.x.toFixed(3)} | <strong>Y:</strong> {currentMood.y.toFixed(3)}
                        </div>
                        
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '12px', 
                          backgroundColor: 'rgba(255,255,255,0.7)', 
                          borderRadius: '6px' 
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Suggested Music Features:</h4>
                          {currentSector === 0 && <p style={{ margin: '0' }}>🎵 Tender, warm melodies</p>} 
                          {currentSector === 1 && <p style={{ margin: '0' }}>🎵 Bright, surprising elements</p>}
                          {currentSector === 2 && <p style={{ margin: '0' }}>🎵 Fast-paced, high-energy music</p>}
                          {currentSector === 3 && <p style={{ margin: '0' }}>🎵 Tense, suspenseful sounds</p>} 
                          {currentSector === 4 && <p style={{ margin: '0' }}>🎵 Intense, fiery music</p>}      
                          {currentSector === 5 && <p style={{ margin: '0' }}>🎵 Slow, emotionally rich music</p>} 
                          {currentSector === 6 && <p style={{ margin: '0' }}>🎵 Low-energy, reflective tunes</p>} 
                          {currentSector === 7 && <p style={{ margin: '0' }}>🎵 Soothing, relaxing rhythms</p>} 
                        </div>
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', color: '#666' }}>
                        Please drag the button on the circle to select a mood state.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Side - Distribution Charts */}
              <div className={styles.rightColumn}>
                {/* Gain Distribution */}
                <div className={styles.rightTopBox} style={{ 
                  backgroundColor: '#e6f0fa', 
                  padding: '20px', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  marginBottom: '1.5rem',
                  minHeight: '300px'
                }}>
                  <h3 style={{ 
                    marginTop: '0', 
                    marginBottom: '15px', 
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    color: '#1a365d'
                  }}>
                    Gain Distribution
                  </h3>
                  {currentData.gain.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <GainDistribution 
                        data={currentData.gain} 
                        title={sectors[currentSector]?.label || 'Selected Emotion'}
                        width={400}
                        height={220}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      color: '#666',
                      flexDirection: 'column'
                    }}>
                      <p>Loading gain data...</p>
                      <small>Sector: {currentSector}, Data length: {currentData.gain.length}</small>
                    </div>
                  )}
                </div>
                
                {/* BPM Distribution */}
                <div className={styles.rightBottomBox} style={{ 
                  backgroundColor: '#e6f0fa', 
                  padding: '20px', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  minHeight: '300px'
                }}>
                  <h3 style={{ 
                    marginTop: '0', 
                    marginBottom: '15px', 
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    color: '#1a365d'
                  }}>
                    BPM Distribution
                  </h3>
                  {currentData.bpm.length > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <BPMDistribution 
                        data={currentData.bpm} 
                        title={sectors[currentSector]?.label || 'Selected Emotion'}
                        width={400}
                        height={220}
                      />
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '200px',
                      color: '#666',
                      flexDirection: 'column'
                    }}>
                      <p>Loading BPM data...</p>
                      <small>Sector: {currentSector}, Data length: {currentData.bpm.length}</small>
                    </div>
                  )}
                </div>
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