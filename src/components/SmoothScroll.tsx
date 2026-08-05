"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // ── the instance ──────────────────────────────────────────────────────────
  // Created once and kept for the life of the app. Route changes must not tear
  // the scroller down and build it again: that drops a frame and resets
  // momentum mid-gesture.
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // lerp, not duration.
    //
    // `duration` gives every gesture the same fixed settle time regardless of
    // how far it is travelling, which is why the old scroll read as mechanical
    // — a flick and a nudge both took 1.1s. lerp is a per-frame easing
    // constant: the page always moves a fixed fraction of the remaining
    // distance, so a long throw glides and a small one settles immediately.
    // That is the "floaty" feel.
    //
    // The useful band is roughly 0.05–0.15. Below 0.05 the page keeps sliding
    // after the reader has stopped and feels unmoored; above 0.15 the easing
    // is over before it registers and you may as well not have it. 0.085 sits
    // just under the middle: unmistakably floaty, still obedient.
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      // Touch is already inertial in the OS. Lenis' own smoothing on top of
      // that reads as lag, so the wheel gets the float and the thumb does not.
      syncTouch: false,
      touchMultiplier: 1.5,
    });
    instance = lenis;

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
      lenis.destroy();
      instance = null;
    };
  }, []);

  // ── section settling ──────────────────────────────────────────────────────
  // Rebuilt per route, because which elements exist changes with the page and
  // the instance effect above deliberately does not re-run.
  //
  // A page opts out by putting [data-no-snap] anywhere in its tree. Snapping
  // and a long lerp pull in opposite directions: the lerp wants the reader to
  // coast, the snap wants to park them on a boundary, and on a page that is a
  // long index rather than a sequence of full-height chapters the snap wins
  // arguments it should not be having. Pages built as chapters keep it.
  useEffect(() => {
    const lenis = instance;
    if (!lenis) return;
    if (document.querySelector("[data-no-snap]")) return;

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

    return () => snap.destroy();
  }, [pathname]);

  return null;
}
