import React from 'react';
import styles from './CultureSelector.module.css';

/* ---------- types ---------- */
type CultureId = 
  | 'france' 
  | 'usa-south' 
  | 'argentina-latin-america' 
  | 'caribbean' 
  | 'brazil' 
  | 'uk-scotland-ireland' 
  | 'germany' 
  | 'uk-england' 
  | 'mexico' 
  | 'spain' 
  | 'nordic' 
  | 'portugal' 
  | 'italy' 
  | 'japan';

interface Culture {
  id: CultureId;
  name: string;
  flag: string;
}

interface CultureSelectorProps {
  cultures: Culture[];
  selectedCulture: Culture;
  onCultureSelect: (culture: Culture) => void;
}

const CultureSelector: React.FC<CultureSelectorProps> = ({
  cultures,
  selectedCulture,
  onCultureSelect
}) => {
  return (
    <section className={styles.cultureSelector}>
      <h2 className={styles.title}>Choose a culture to explore!</h2>
      
      <div className={styles.flagGrid}>
        {cultures.map(culture => (
          <button
            key={culture.id}
            className={`${styles.flagButton} ${
              selectedCulture.id === culture.id ? styles.selected : ''
            }`}
            onClick={() => onCultureSelect(culture)}
          >
            <div className={styles.flagEmoji}>{culture.flag}</div>
            <div className={styles.cultureName}>{culture.name}</div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CultureSelector;