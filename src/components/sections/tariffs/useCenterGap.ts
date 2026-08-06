"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

// useLayoutEffect on the server is a no-op that React warns about; swap in
// useEffect for the SSR pass (the measurement only ever runs client-side).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Distance from the viewport's left edge to an element's left edge — the
 * inset at which a full-bleed background layer exactly matches the
 * element's box. The fees page's strip, shortfalls band and navy sheet all
 * draw their surfaces on full-bleed layers clipped by this value, so their
 * boxes can stretch edge to edge without the content ever reflowing.
 * Remeasured on resize; horizontal position doesn't change with scroll, so
 * scroll needn't retrigger it.
 */
export function useCenterGap(ref: RefObject<HTMLElement | null>): number {
  const [gap, setGap] = useState(0);
  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (el) setGap(Math.max(0, el.getBoundingClientRect().left));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref]);
  return gap;
}
