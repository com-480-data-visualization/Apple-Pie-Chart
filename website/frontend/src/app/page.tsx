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

// Culture-specific text content
const cultureTexts = {
  'france': {
    description: "French music is characterized by sophisticated harmonic progressions and elegant melodic lines. From chanson to French pop, the musical traditions emphasize subtle chord movements and rich harmonic textures that reflect the country's artistic heritage.",
    features: [
      "🎵 Sophisticated Harmonies: Complex chord progressions with jazz influences",
      "📊 Chanson Tradition: Story-telling through melodic and harmonic expression",
      "🔗 Modal Influences: Use of church modes creating unique tonal colors",
      "🎨 Impressionistic Colors: Debussy-inspired harmonic ambiguity and color"
    ]
  },
  'usa-south': {
    description: "Southern American music features blues-based progressions, gospel influences, and country harmonies. The chord structures often emphasize the I-IV-V progression with added sevenths and blue notes that define genres like blues, country, and southern rock.",
    features: [
      "🎵 Blues Foundation: Heavy use of dominant 7th chords and blue notes",
      "📊 Gospel Influence: Rich vocal harmonies and church-inspired progressions",
      "🔗 Country Traditions: Simple but effective I-IV-V progressions",
      "🎨 Southern Rock: Power chords mixed with blues progressions"
    ]
  },
  'argentina-latin-america': {
    description: "Argentinian music, particularly tango, features dramatic harmonic shifts and passionate chord progressions. The music often uses minor keys, augmented chords, and sophisticated harmonic movements that reflect the emotional intensity of the dance.",
    features: [
      "🎵 Tango Passion: Dramatic minor key progressions with augmented chords",
      "📊 Bandoneon Harmonies: Unique chord voicings from the signature instrument",
      "🔗 Milonga Rhythms: Syncopated harmonic patterns in 2/4 time",
      "🎨 Emotional Intensity: Chromatic movements and unexpected harmonic turns"
    ]
  },
  'caribbean': {
    description: "Caribbean music blends African rhythmic traditions with European harmonic structures. Genres like reggae, calypso, and salsa feature distinctive chord progressions that emphasize rhythmic drive and danceable grooves.",
    features: [
      "🎵 Reggae Skank: Characteristic off-beat chord emphasis",
      "📊 Calypso Colors: Major key progressions with tropical brightness",
      "🔗 Salsa Montunos: Repetitive harmonic patterns over Afro-Cuban rhythms",
      "🎨 Steel Pan Harmonies: Unique chord voicings from steel drum traditions"
    ]
  },
  'brazil': {
    description: "Brazilian music showcases complex jazz harmonies mixed with African rhythms. Bossa nova and MPB feature sophisticated chord extensions, while samba and forró maintain more traditional harmonic approaches rooted in folk traditions.",
    features: [
      "🎵 Bossa Nova Sophistication: Jazz-influenced chord extensions and substitutions",
      "📊 Samba Traditions: Circular harmonic progressions supporting dance rhythms",
      "🔗 MPB Innovation: Modern Brazilian popular music with complex harmonies",
      "🎨 Choro Intricacy: Instrumental genre with intricate harmonic movements"
    ]
  },
  'uk-scotland-ireland': {
    description: "Scottish and Irish music features modal harmonies rooted in Celtic traditions. The chord progressions often use Dorian and Mixolydian modes, creating distinctive sounds that support traditional dances and storytelling ballads.",
    features: [
      "🎵 Celtic Modes: Dorian and Mixolydian scales creating unique harmonic colors",
      "📊 Traditional Ballads: Simple progressions supporting narrative songs",
      "🔗 Reel Harmonies: Fast dance tunes with driving harmonic rhythms",
      "🎨 Pipe Band Influence: Harmonies inspired by bagpipe drone traditions"
    ]
  },
  'germany': {
    description: "German music traditions range from classical influences to modern electronic music. The harmonic language includes everything from Bach-inspired progressions to industrial and electronic textures, reflecting the country's diverse musical heritage.",
    features: [
      "🎵 Classical Heritage: Bach-influenced counterpoint and harmonic complexity",
      "📊 Folk Traditions: Simple major key progressions in traditional songs",
      "🔗 Electronic Innovation: Synthesized harmonies in electronic music",
      "🎨 Industrial Sounds: Unconventional chord structures in experimental music"
    ]
  },
  'uk-england': {
    description: "English music encompasses everything from traditional folk to British rock and pop. The harmonic progressions reflect influences from classical music, music hall traditions, and the British Invasion era of rock and roll.",
    features: [
      "🎵 British Invasion: Classic rock progressions with blues influences",
      "📊 Music Hall Heritage: Victorian-era harmonic sensibilities",
      "🔗 Folk Revival: Traditional English folk song harmonies",
      "🎨 Brit Pop Evolution: Modern rock harmonies with melodic sophistication"
    ]
  },
  'mexico': {
    description: "Mexican music features rich harmonic traditions from mariachi to regional folk styles. The chord progressions often emphasize major keys with dramatic flourishes, supporting both celebratory and romantic musical expressions.",
    features: [
      "🎵 Mariachi Grandeur: Bold major key progressions with dramatic flair",
      "📊 Regional Diversity: Different harmonic styles across Mexican states",
      "🔗 Ranchera Romance: Emotional chord progressions in popular ballads",
      "🎨 Folk Simplicity: Traditional harmonic structures in indigenous music"
    ]
  },
  'spain': {
    description: "Spanish music is characterized by flamenco harmonies, classical guitar traditions, and distinctive modal influences. The chord progressions often feature Phrygian dominant scales and dramatic harmonic shifts that reflect the country's Moorish heritage.",
    features: [
      "🎵 Flamenco Fire: Phrygian dominant scales and dramatic chord changes",
      "📊 Classical Guitar: Traditional harmonic progressions for Spanish guitar",
      "🔗 Moorish Influences: Arabic scale influences in harmonic structures",
      "🎨 Regional Styles: Different harmonic traditions across Spanish regions"
    ]
  },
  'nordic': {
    description: "Nordic music features atmospheric harmonies often inspired by natural landscapes. From folk traditions to modern pop, the chord progressions tend to emphasize minor keys and open harmonies that evoke the region's vast, beautiful wilderness.",
    features: [
      "🎵 Atmospheric Harmonies: Open chords evoking natural landscapes",
      "📊 Folk Traditions: Simple progressions supporting traditional melodies",
      "🔗 Modern Nordic Pop: Sophisticated harmonies in contemporary music",
      "🎨 Minimalist Beauty: Sparse chord arrangements with maximum emotional impact"
    ]
  },
  'portugal': {
    description: "Portuguese music, particularly fado, features melancholic harmonic progressions that express saudade - a deep emotional longing. The chord structures support both traditional folk forms and modern Portuguese popular music.",
    features: [
      "🎵 Fado Melancholy: Minor key progressions expressing deep emotion",
      "📊 Saudade Expression: Harmonic language of longing and nostalgia",
      "🔗 Traditional Forms: Time-honored chord progressions in folk music",
      "🎨 Modern Fusion: Contemporary Portuguese music blending traditions"
    ]
  },
  'italy': {
    description: "Italian music combines operatic grandeur with folk simplicity. The harmonic progressions range from complex classical structures to simple, melodic accompaniments that support the country's emphasis on beautiful vocal lines.",
    features: [
      "🎵 Operatic Grandeur: Complex progressions supporting dramatic vocals",
      "📊 Folk Simplicity: Traditional harmonies in regional folk music",
      "🔗 Melodic Support: Chord progressions designed to enhance vocal melody",
      "🎨 Regional Diversity: Different harmonic styles across Italian regions"
    ]
  },
  'japan': {
    description: "Japanese music blends traditional pentatonic scales with modern Western harmony. From enka to J-pop, the chord progressions often feature unique scalar approaches and harmonic colors that reflect both ancient traditions and contemporary innovation.",
    features: [
      "🎵 Pentatonic Heritage: Traditional five-note scales in harmonic structures",
      "📊 J-Pop Innovation: Modern pop harmonies with Japanese characteristics",
      "🔗 Enka Tradition: Emotional ballad progressions in traditional style",
      "🎨 East-West Fusion: Blend of traditional and Western harmonic approaches"
    ]
  }
};

/* ---------- page component ---------- */
export default function Home() {
  const [activeView, setActiveView] = useState<'culture' | 'mood'>('culture');
  const [selectedCulture, setCulture] = useState(cultures[0]);

  /* handlers */
  const handleCultureSelect = useCallback((c: typeof cultures[number]) => {
    setCulture(c);
  }, []);

  // Get the current culture's text content
  const currentCultureText = cultureTexts[selectedCulture.id] || {
    description: "Explore the unique chord progressions and harmonic patterns that define the musical traditions of this region.",
    features: [
      "🎵 Interactive Visualization: hover over chords to see connections and details",
      "📊 Data-Driven: based on analysis of popular songs from this region", 
      "🔗 Chord Transitions: curved lines show transition probabilities between chords",
      "🎨 Visual Encoding: distance from center = chord quality, size = frequency, opacity = usage"
    ]
  };

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
                    {currentCultureText.description}
                  </p>
                  <ul className={styles.networkStats}>
                    {currentCultureText.features.map((feature, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
                    ))}
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