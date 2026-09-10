"use client";

import { useEffect, useRef, useState } from "react";
import { testimonials, PLACEHOLDER } from "@/content/testimonials";
import styles from "./HomeChapters.module.css";

export default function TestimonialReader() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (panel.current) observer.observe(panel.current);
    return () => {
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (testimonials.length < 2 || hovered || focused || reducedMotion || !visible || !pageVisible) return;
    // Restart the full reading interval after manual navigation or a pause.
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % testimonials.length), 7000);
    return () => window.clearTimeout(timer);
  }, [active, hovered, focused, reducedMotion, visible, pageVisible]);

  if (!testimonials.length) return null;
  const move = (step: number) => setActive((current) => (current + step + testimonials.length) % testimonials.length);

  return (
    <div
      ref={panel}
      className={styles.quotePanel}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {PLACEHOLDER && (
        <p className={styles.warning} data-copy-key="feedback.placeholder.warning">
          <strong>Prototype content — not for publication.</strong>
          These quotations are illustrative, not real patient feedback. They must be replaced with verified, approved testimonials—or removed—before launch.
        </p>
      )}
      {/* The longest quotation sets the height, preventing layout jumps.
          Inactive figures remain hidden visually and from assistive technology. */}
      <div id="home-feedback-quote" className={styles.quoteStack} aria-live={focused ? "polite" : "off"} aria-atomic="true">
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
