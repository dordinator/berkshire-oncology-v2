"use client";

import { useEffect, useRef } from "react";
import { ANCHOR_NAVIGATION_EVENT } from "./SmoothScroll";

/** Open the named item on arrival, without locking subsequent manual choices. */
export default function useAnchorSelection(ids: (string | undefined)[], onSelect: (index: number) => void) {
  const current = useRef({ ids, onSelect });
  current.current = { ids, onSelect };
  const key = ids.join("\0");

  useEffect(() => {
    const select = (id: string) => {
      const index = current.current.ids.indexOf(id);
      if (index >= 0) current.current.onSelect(index);
    };
    const readHash = () => {
      try { select(decodeURIComponent(window.location.hash.slice(1))); } catch { /* Invalid fragment. */ }
    };
    const followAnchor = (event: Event) => select((event as CustomEvent<{ id: string }>).detail.id);
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    window.addEventListener(ANCHOR_NAVIGATION_EVENT, followAnchor);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
      window.removeEventListener(ANCHOR_NAVIGATION_EVENT, followAnchor);
    };
  }, [key]);
}
