import type { ReactNode } from "react";
import CancerDirectory from "./CancerDirectory";
import styles from "./HomeChapters.module.css";

export interface CancerCard {
  slug: string;
  label: string;
  href: string;
}

export default function CancerCards({ cards, intro }: { cards: CancerCard[]; intro: ReactNode }) {
  return (
    <section className={styles.cancers} aria-labelledby="cancers">
      <div className={`${styles.inner} ${styles.cancerLayout}`}>
        <div className={`${styles.intro} ${styles.cancerIntro}`}>
          <span className={styles.cancerEyebrow}>Our specialisms</span>
          {intro}
        </div>
        <CancerDirectory cards={cards} />
      </div>
    </section>
  );
}
