import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <p>
            <code className={styles.code}>Webpage for Yiwei's Semester Project!</code>
        </p>
      </div>
    </main>
  );
}
