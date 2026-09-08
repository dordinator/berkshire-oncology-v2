"use client";

import { useState } from "react";
import { testimonials, PLACEHOLDER } from "@/content/testimonials";
import styles from "./HomeChapters.module.css";

export default function TestimonialReader() {
  const [active, setActive] = useState(0);
  if (!testimonials.length) return null;
  const move = (step: number) => setActive((current) => (current + step + testimonials.length) % testimonials.length);

  return (
    <div className={styles.quotePanel}>
      {PLACEHOLDER && (
        <p className={styles.warning} data-copy-key="feedback.placeholder.warning">
          <strong>Prototype content — not for publication.</strong>
          These quotations are illustrative, not real patient feedback. They must be replaced with verified, approved testimonials—or removed—before launch.
        </p>
      )}
      {/* The longest quotation sets the height, preventing layout jumps.
          Inactive figures remain hidden visually and from assistive technology. */}
      <div id="home-feedback-quote" className={styles.quoteStack} aria-live="polite" aria-atomic="true">
        {testimonials.map((testimonial, index) => (
          <figure className={styles.quote} key={testimonial.attribution} aria-hidden={index !== active}>
            <span className={styles.quoteMark} aria-hidden="true">“</span>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>{PLACEHOLDER ? `Illustrative example ${index + 1}` : testimonial.attribution}</figcaption>
          </figure>
        ))}
      </div>
      {testimonials.length > 1 && (
        <div className={styles.quoteControls}>
          <span className={styles.quoteCount} aria-hidden="true">{String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}</span>
          <div className={styles.quoteButtons}>
            <button type="button" aria-label="Previous quotation" aria-controls="home-feedback-quote" onClick={() => move(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" aria-label="Next quotation" aria-controls="home-feedback-quote" onClick={() => move(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
