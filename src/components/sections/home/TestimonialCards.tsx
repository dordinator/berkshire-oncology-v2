import type { ReactNode } from "react";
import TestimonialReader from "./TestimonialReader";
import styles from "./HomeChapters.module.css";

export default function TestimonialCards({ intro }: { intro: ReactNode }) {
  return (
    <section className={styles.feedback} aria-labelledby="feedback">
      <div className={`${styles.inner} ${styles.feedbackLayout}`}>
        <div className={styles.intro}>{intro}</div>
        <TestimonialReader />
      </div>
    </section>
  );
}
