"use client";

import { useState, type ReactNode } from "react";
import TestimonialReader from "./TestimonialReader";
import styles from "./HomeChapters.module.css";

export default function TestimonialCards({ intro }: { intro: ReactNode }) {
  const [variant, setVariant] = useState<"current" | "refined">("refined");

  return (
    <section className={styles.feedback} aria-labelledby="feedback" data-variant={variant}>
      <div className={styles.inner}>
        <div className={styles.feedbackPreview} role="group" aria-label="Testimonials design preview">
          <span>Design preview</span>
          <div className={styles.feedbackVariants}>
            <button type="button" aria-pressed={variant === "current"} aria-controls="feedback-comparison" onClick={() => setVariant("current")}>
              Current
            </button>
            <button type="button" aria-pressed={variant === "refined"} aria-controls="feedback-comparison" onClick={() => setVariant("refined")}>
              Refined
            </button>
          </div>
        </div>
        <div id="feedback-comparison" className={styles.feedbackLayout}>
          <div className={styles.intro}>{intro}</div>
          <TestimonialReader />
        </div>
      </div>
    </section>
  );
}
