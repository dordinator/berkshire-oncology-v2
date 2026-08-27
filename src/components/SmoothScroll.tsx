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
let snapInstance: Snap | null = null;
let pageSnapPaused = false;

/** The running Lenis instance, if there is one. */
export function getLenis(): Lenis | null {
  return instance;
}

/** Keep a deterministic Back restoration from being pulled to a section edge. */
export function stopPageSnap(): void {
  pageSnapPaused = true;
  snapInstance?.stop();
}

/** Re-enable the gentle section settling after restoration has finished. */
export function startPageSnap(): void {
  pageSnapPaused = false;
  snapInstance?.start();
}

/** Re-measure Lenis and its current route's section targets after layout changes. */
export function resizeSmoothScroll(): void {
  instance?.resize();
  snapInstance?.resize();
}

export default function SmoothScroll() {
  const pathname = usePathname();

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
          const currentState =
            window.history.state && typeof window.history.state === "object"
              ? window.history.state
              : {};
          window.history.pushState({ ...currentState }, "", id);
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

  // The root layout persists between App Router pages. Rebuild the proximity
  // targets for each route rather than keeping references to sections that were
  // removed from the DOM on the first navigation.
  useEffect(() => {
    const lenis = instance;
    if (!lenis) return;

    let routeSnap: Snap | null = null;
    const frame = window.requestAnimationFrame(() => {
      const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
      routeSnap = new Snap(lenis, {
        type: "proximity",
        duration: 1.4,
        easing: easeInOutSine,
        distanceThreshold: "18%",
        debounce: 450,
      });
      snapInstance = routeSnap;
      if (pageSnapPaused) routeSnap.stop();

      // Pages with their own snap controller opt sections out with data-no-snap.
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          "main > section:not([data-no-snap])",
        ),
      ).filter((element) => element.offsetHeight > window.innerHeight * 0.5);

      for (const section of sections) {
        routeSnap.addElement(section, { align: "start" });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      routeSnap?.destroy();
      if (snapInstance === routeSnap) snapInstance = null;
    };
  }, [pathname]);

  return null;
}
