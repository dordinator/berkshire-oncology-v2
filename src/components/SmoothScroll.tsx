"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Soft, Apple-style section settling. Proximity (not mandatory) keeps
    // sections taller than the viewport fully scrollable and never locks the
    // user in — it only eases toward a section top once they've slowed/stopped
    // *close* to a boundary.
    //   - easeInOutSine: no abrupt kick at the start, gentle arrival at the end.
    //   - longer duration: a slow, deliberate glide rather than a snap.
    //   - tighter distanceThreshold: only engages when genuinely near a section.
    //   - longer debounce: waits until scrolling has actually settled.
    const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    const snap = new Snap(lenis, {
      type: "proximity",
      duration: 1.4,
      easing: easeInOutSine,
      distanceThreshold: "18%",
      debounce: 450,
    });

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section")
    ).filter((el) => el.offsetHeight > window.innerHeight * 0.5);

    for (const section of sections) {
      snap.addElement(section, { align: "start" });
    }

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // Allow anchor links to scroll smoothly
    const handleAnchor = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el as HTMLElement, { offset: -80 });
      }
    };
    document.addEventListener("click", handleAnchor);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchor);
      snap.destroy();
      lenis.destroy();
    };
  }, []);

  return null;
}
