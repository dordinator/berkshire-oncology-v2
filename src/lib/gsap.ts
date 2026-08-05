"use client";

import type gsapType from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { getLenis } from "@/components/SmoothScroll";

type Gsap = typeof gsapType;
type ScrollTriggerClass = typeof ScrollTriggerType;

// GSAP is loaded on demand rather than imported at the top of a component.
//
// Statically imported, gsap core plus ScrollTrigger added ~40kB to this route's
// first-load JS — and none of it is needed before first paint, because every
// animation it drives is triggered by scrolling. Behind a dynamic import it
// becomes a separate chunk fetched while the reader is still looking at the
// hero. Most of this site's traffic is on phones, and this is a page people
// reach on a bad day; the bytes are worth moving off the critical path.
let loader: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerClass }> | null =
  null;

export function loadGsap() {
  if (!loader) {
    loader = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([core, st]) => {
        const gsap = core.gsap ?? core.default;
        const { ScrollTrigger } = st;
        gsap.registerPlugin(ScrollTrigger);

        // ScrollTrigger listens for native scroll events. Lenis moves the page
        // inside its own rAF loop and fires its events after ScrollTrigger has
        // already measured, so left alone, scroll-linked animation lags the
        // page by a frame or two — at lerp 0.085 that lag is long enough to
        // see. One line fixes it: Lenis stays the clock and tells ScrollTrigger
        // when to re-read. No scrollerProxy, because Lenis is scrolling the
        // real window here rather than a wrapper element, so ScrollTrigger's
        // default scroller is already looking at the right number.
        getLenis()?.on("scroll", ScrollTrigger.update);

        return { gsap, ScrollTrigger };
      }
    );
  }
  return loader;
}
