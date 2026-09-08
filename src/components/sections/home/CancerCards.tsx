import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./HomeChapters.module.css";

export interface CancerCard {
  slug: string;
  label: string;
  href: string;
}

export default function CancerCards({ cards, intro }: { cards: CancerCard[]; intro: ReactNode }) {
  return (
    <section className={styles.cancers} aria-labelledby="cancers">
      <div className={styles.inner}>
        <div className={`${styles.intro} ${styles.cancerIntro}`}>{intro}</div>
        <ul className={styles.directory}>
          {cards.map((card) => (
            <li key={card.slug}>
              <Link href={card.href} className={styles.directoryLink}>
                <span>
                  <span className={styles.directoryTitle}>{card.label}</span>
                  <span className={styles.directoryAction} data-copy-key="cancers.card.action">View cancer type</span>
                </span>
                <svg className={styles.directoryArrow} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
