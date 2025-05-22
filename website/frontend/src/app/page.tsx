'use client';

import Image from 'next/image';
import styles from './page.module.css';

const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/* ---------- 纯静态数据 ---------- */
const genres = [
  { id:'reggae',     name:'Reggae'     },
  { id:'pop',        name:'Pop'        },
  { id:'classical',  name:'Classical'  },
  { id:'electronic', name:'Electronic' },
  { id:'disco',      name:'Disco'      },
  { id:'rap',        name:'Rap'        },
  { id:'rock',       name:'Rock'       },
  { id:'rnb',        name:'RnB'        },
  { id:'jazz',       name:'Jazz'       },
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
  return (
    <main className={styles.main}>
      <header className={styles.brand}>Moved to the Core</header>
      <h1 className={styles.title}>Welcome to your exploration of the music chords world</h1>

      {/* 整个白色卡片 */}
      <section className={styles.gallery}>

        {/* Genre Explorer 区域 */}
        <section className={styles.genreExplorer}>
          <h2 className={styles.genreExplorerTitle}>Choose a genre to explore!</h2>

          <div className={styles.genreBubblesContainer}>
            {genres.map(g=>(
              <div key={g.id} className={`${styles.bubble} ${styles[g.id]}`}>
                <span className={styles.genreName}>{g.name}</span>
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
              <h3 className={styles.panelSubTitle}>Pick a sequence of chords…</h3>

              {/* ───────── 列状 bubble 开始 ───────── */}
              {/*
                  每个子数组代表一列。
                  实际项目里你可以按算法动态生成；这里为了展示写死。
              */}
              {(() => {
                const chordColumns = [
                  ['C', 'Am', 'G', 'F', 'D'],
                  ['F', 'G', 'Em', 'C', 'Am'],
                  ['Am', 'Em', 'F', 'C'],
                  ['C', 'F'],
                ];
                const highlighted = ['C', 'G', 'Am', 'F']; // 需要高亮的和弦

                return (
                  <div className={styles.chordColumnContainer}>
                    {chordColumns.map((col, ci) => (
                      <div key={ci} className={styles.chordColumn}>
                        {col.map((ch) => (
                          <div
                            key={ch}
                            className={`${styles.chordCircle} ${
                              highlighted.includes(ch) ? styles.chordActive : ''
                            }`}
                          >
                            {ch}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
              {/* ───────── 列状 bubble 结束 ───────── */}

              <div className={styles.selectedSequenceDisplay}>
                Selected sequence:&nbsp;
                <span className={styles.sequenceText}>C, Am, F, G</span>
              </div>
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

          {/* SongSelector（静态） */}
          <div className={styles.songSelector}>
            <h3 className={styles.panelSubTitle}>…or choose a song!</h3>
            <div className={styles.songContainer}>
              {songs.map(s=>(
                <div key={s.name} className={styles.songItem}>
                  <Image
                    src={s.image}
                    alt={s.alt}
                    width={50}
                    height={50}
                    className={styles.songImage}
                  />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </section>
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