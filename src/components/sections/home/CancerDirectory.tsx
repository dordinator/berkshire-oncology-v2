"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CancerCard } from "./CancerCards";
import styles from "./HomeChapters.module.css";

export default function CancerDirectory({ cards }: { cards: CancerCard[] }) {
  const [wideDesktop, setWideDesktop] = useState(false);
  const fixedCount = wideDesktop ? 8 : 5;
  const fixed = cards.slice(0, fixedCount);
  const rotating = cards.slice(fixedCount);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const panel = useRef<HTMLDivElement>(null);
  const current = rotating[index % rotating.length];

  useEffect(() => {
    // Keep this breakpoint in sync with the three-column directory styles.
    const desktop = window.matchMedia("(min-width: 1600px)");
    const updateDesktop = () => setWideDesktop(desktop.matches);
    updateDesktop();
    desktop.addEventListener("change", updateDesktop);
    return () => desktop.removeEventListener("change", updateDesktop);
  }, []);

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
    if (rotating.length < 2 || reducedMotion || hovered || focused || !visible || !pageVisible) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % rotating.length), 5000);
    return () => window.clearInterval(timer);
  }, [rotating.length, reducedMotion, hovered, focused, visible, pageVisible]);

  const arrow = (
    <svg className={styles.directoryArrow} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div ref={panel} className={styles.directoryPanel}>
      <ul className={styles.directory}>
        {fixed.map((card) => (
          <li key={card.slug}>
            <Link href={card.href} className={styles.directoryLink}>
              <span>
                <span className={styles.directoryTitle}>{card.label}</span>
                <span className={styles.directoryAction} data-copy-key="cancers.card.action">View cancer type</span>
              </span>
              {arrow}
            </Link>
          </li>
        ))}
        {current && (
          <li
            id="rotating-cancer-type"
            aria-live="off"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            <Link href={current.href} className={styles.directoryLink}>
              <span className={styles.rotatingCopy}>
                {/* Reserve the tallest label's space, including at enlarged text sizes.
                    Only the current label is exposed to assistive technology. */}
                <span className={styles.rotatingTitles}>
                  {rotating.map((card) => (
                    <span key={card.slug} className={styles.directoryTitle} aria-hidden={card.slug !== current.slug}>
                      {card.label}
                    </span>
                  ))}
                </span>
                <span className={styles.directoryAction}>View cancer type</span>
              </span>
              {arrow}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
