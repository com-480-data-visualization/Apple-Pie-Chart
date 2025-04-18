// src/app/page.tsx
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* teamname */}
      <header className={styles.brand}>Apple Pie Chart</header>

      {/* welcome */}
      <h1 className={styles.title}>
        Welcome to your exploration of the music chords world
      </h1>

      {/* skethces */}
      <section className={styles.gallery}>
        <div className={styles.imageContainer}>
          <Image 
            src="/1.jpeg" 
            alt="chords 1" 
            width={1600} 
            height={1200}
            className={`${styles.image} ${styles.firstImage}`}
          />
          <Image 
            src="/2.jpeg" 
            alt="chords 2" 
            width={1200} 
            height={900}
            className={styles.image}
          />
          <Image 
            src="/3.jpeg" 
            alt="chords 3" 
            width={1200} 
            height={900}
            className={styles.image}
          />
          <Image 
            src="/4.jpeg" 
            alt="chords 3" 
            width={800} 
            height={600}
            className={styles.image}
          />
        </div>
      </section>
    </main>
  );
}