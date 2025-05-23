'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useState } from 'react';
import ChordNetworkDiagram from './ChordNetworkDiagram';
import MoodWheelDiagram from './MoodWheelDiagram';

const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/* ---------- 纯静态数据 ---------- */
const cultures = [
  { id: 'usa-general', name: 'USA (General)' },
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
  { id: 'turkey', name: 'Turkey' },
];

const chordData = [
  { chord: 'C',  connections: ['Am','F','G']},
  { chord: 'Am', connections: ['F','G','C']},
  { chord: 'F',  connections: ['C','G','Am']},
  { chord: 'G',  connections: ['Am','C','Em']},
  { chord: 'Em', connections: ['C','G','D']},
  { chord: 'D',  connections: ['G','Em']},
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

/* ---------- 页面组件（全部静态） ---------- */
export default function Home() {
  const [activeView, setActiveView] = useState('cultureToChord');

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
          {/* 整个白色卡片 */}
          <section className={styles.gallery}>

            {/* Genre Explorer 区域 */}
            <section className={styles.genreExplorer}>
              <h2 className={styles.genreExplorerTitle}>Choose a culture to explore!</h2>

              <div className={styles.genreBubblesContainer}>
                {cultures.map(c =>(
                  <div key={c.id} className={`${styles.bubble} ${styles[c.id]}`}>
                    <span className={styles.genreName}>{c.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 下面直接显示 Pop 的 Detail Panel（纯静态） */}
            <section className={styles.genreDetailPanel}>
              <h2 className={styles.detailPanelTitle}>
                Details for:&nbsp;<span className={styles.selectedGenreNameText}>Pop</span>
              </h2>

              <div className={styles.chordAndEmojiContainer}>
                {/* ChordGraph（静态） */}
                <div className={styles.chordGraph}>
                  {/* <h3 className={styles.panelSubTitle}>Pick a sequence of chords…</h3> */}
                  <ChordNetworkDiagram />
                </div>

                {/* EmojiBoard（静态） */}
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

            </section>
          </section>
        </>
      )}

      {activeView === 'moodToHarmony' && (
        <>
          {/* Mood to Harmony Section */}
          <section className={`${styles.gallery} ${styles.moodToHarmonyLayout}`}>
            {/* Left Box */}
            <div className={styles.leftBox}>
              {/* <p>Left Box</p> */}
              <MoodWheelDiagram />
            </div>
            {/* Right Column */}
            <div className={styles.rightColumn}>
              {/* Right Top Box */}
              <div className={styles.rightTopBox}>
                <div className={styles.sliderContainer}>
                  <label htmlFor="bpmSlider" className={styles.sliderLabel}>BPM</label>
                  <input type="range" id="bpmSlider" min="60" max="180" defaultValue="120" className={styles.slider} />
                  {/* Optional: Display BPM value here */}
                </div>
                <div className={styles.sliderContainer}>
                  <label htmlFor="gainSlider" className={styles.sliderLabel}>Gain</label>
                  <input type="range" id="gainSlider" min="0" max="100" defaultValue="50" className={styles.slider} />
                  {/* Optional: Display Gain value here */}
                </div>
              </div>
              {/* Right Bottom Box */}
              <div className={styles.rightBottomBox}>
                <p>Right Bottom Box (4/5)</p>
              </div>
            </div>
          </section>
        </>
      )}
      {/* ───────── 联系方式 ───────── */}
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