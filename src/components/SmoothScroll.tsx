"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";

// The live instance, exposed so overlays can genuinely stop the page behind
// them. Adding `overflow: hidden` to <html> is not enough on its own: Lenis
// preventDefaults the wheel event and scrolls the document programmatically,
// which `overflow: hidden` does not block. Null when reduced motion is on (no
// instance is created) or before the effect has run.
let instance: Lenis | null = null;

/** The running Lenis instance, if there is one. */
export function getLenis(): Lenis | null {
  return instance;
}

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
    instance = lenis;

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

    // data-no-snap opts a section out — pages that run their own snap points
    // (the /locations journey registers a mandatory Snap for its scroll
    // locks) must not have this proximity instance competing for the same
    // stretch of scroll: two instances pulling at once reads as a glitch.
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section:not([data-no-snap])")
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

        // preventDefault also suppresses what the browser would otherwise do
        // for an in-page link: move focus to the target and restart sequential
        // navigation from there. Without this a keyboard user who activates
        // "Breast" in a jump list, or the skip link, sees the page move while
        // Tab carries on from where they were. Put both back by hand.
        const target = el as HTMLElement;
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        if (window.location.hash !== id) {
          window.history.pushState(null, "", id);
        }
      }
    };
    document.addEventListener("click", handleAnchor);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchor);
      snap.destroy();
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
