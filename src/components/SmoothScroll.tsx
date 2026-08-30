"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";

// The live instance, exposed so overlays can genuinely stop the page behind
// them. Null when reduced motion is on (no instance is created) or before the
// effect has run.
let instance: Lenis | null = null;
let snapInstance: Snap | null = null;
let pageSnapPaused = false;
let anchorSnapTimer = 0;

const ANCHOR_GUTTER = 16;

type AnchorAlign = "content" | "viewport";

type AnchorScrollOptions = {
  duration?: number;
  focus?: boolean;
  immediate?: boolean;
  onComplete?: () => void;
};

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

function decodeAnchorId(value: string): string {
  const raw = value.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isHidden(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return true;
    current = current.parentElement;
  }
  return false;
}

/** Resolve a named target, including a responsive fallback when one is set. */
export function resolveAnchorTarget(idOrHash: string): HTMLElement | null {
  let id = decodeAnchorId(idOrHash);
  const visited = new Set<string>();

  while (id && !visited.has(id)) {
    visited.add(id);
    const target = document.getElementById(id);
    if (!target) return null;
    if (!isHidden(target)) return target;
    id = target.dataset.anchorFallbackId ?? "";
  }

  return null;
}

function navbarClearance(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header || isHidden(header)) return 0;

  const bottom = Math.max(0, header.getBoundingClientRect().bottom);
  return Math.ceil(bottom + ANCHOR_GUTTER);
}

function updateAnchorClearance(): void {
  document.documentElement.style.setProperty(
    "--anchor-clearance",
    `${navbarClearance()}px`,
  );
}

/**
 * Return the absolute document position for an anchor.
 *
 * Structural sections can opt into `data-anchor-align="viewport"` so their
 * background begins at the very top of the viewport. Their own top padding
 * then keeps the heading clear of the floating navbar. Smaller, nested
 * destinations use the measured navbar clearance instead.
 */
export function getAnchorTop(target: HTMLElement): number {
  const align: AnchorAlign =
    target.dataset.anchorAlign === "viewport" ? "viewport" : "content";
  const documentTop = target.getBoundingClientRect().top + window.scrollY;
  const offset = align === "viewport" ? 0 : navbarClearance();
  return Math.max(0, Math.round(documentTop - offset));
}

function focusAnchor(target: HTMLElement): void {
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

function pauseSnapForAnchor(): void {
  snapInstance?.stop();
  window.clearTimeout(anchorSnapTimer);
  anchorSnapTimer = window.setTimeout(() => {
    if (!pageSnapPaused) snapInstance?.start();
  }, 1200);
}

/** Scroll to an anchor using the same geometry for clicks, route loads and UI controls. */
export function scrollToAnchor(
  idOrHash: string,
  options: AnchorScrollOptions = {},
): HTMLElement | null {
  const target = resolveAnchorTarget(idOrHash);
  if (!target) return null;

  updateAnchorClearance();
  resizeSmoothScroll();
  pauseSnapForAnchor();

  // Pass Lenis a number, not an element. Passing the element would make Lenis
  // apply CSS scroll-margin as well and double the navbar allowance.
  const top = getAnchorTop(target);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const immediate = options.immediate || reducedMotion;

  const complete = () => {
    // Content can settle while the animated scroll is in flight (fonts,
    // responsive imagery and client-rendered panels are the common cases).
    // Re-measure at the end so the final frame, rather than the click-time
    // layout, defines where the section lands.
    const settledTop = getAnchorTop(target);
    if (Math.abs(window.scrollY - settledTop) > 1) {
      if (instance) {
        instance.scrollTo(settledTop, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: settledTop, behavior: "auto" });
      }
    }
    if (options.focus) focusAnchor(target);
    options.onComplete?.();
  };

  if (instance) {
    instance.scrollTo(top, {
      duration: options.duration ?? 1,
      immediate,
      force: true,
      onComplete: complete,
    });
  } else {
    window.scrollTo({
      top,
      behavior: immediate ? "auto" : "smooth",
    });
    if (immediate) complete();
    else window.setTimeout(complete, (options.duration ?? 1) * 1000);
  }

  return target;
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lenis: Lenis | null = null;
    let frame = 0;
    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });
      instance = lenis;

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    }

    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const headerObserver = header
      ? new ResizeObserver(updateAnchorClearance)
      : null;
    if (header) headerObserver?.observe(header);
    updateAnchorClearance();
    window.addEventListener("resize", updateAnchorClearance);

    // Catch both `#section` and `/current-page#section`. Cross-route and
    // query-changing links still go through Next/browser navigation normally.
    const handleAnchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as HTMLElement | null)?.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!link || link.hasAttribute("download") || link.target === "_blank") {
        return;
      }

      let destination: URL;
      try {
        destination = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      const current = new URL(window.location.href);
      const isSameDocument =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search;
      if (!isSameDocument || !destination.hash || destination.hash === "#") {
        return;
      }

      const target = resolveAnchorTarget(destination.hash);
      if (!target) return;

      event.preventDefault();
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      if (window.location.hash !== destination.hash) {
        window.history.pushState(
          { ...currentState },
          "",
          `${destination.pathname}${destination.search}${destination.hash}`,
        );
      }
      scrollToAnchor(destination.hash, { focus: true });
    };

    const alignHistoryAnchor = () => {
      if (!window.location.hash) return;
      window.requestAnimationFrame(() => {
        scrollToAnchor(window.location.hash, {
          immediate: true,
          focus: false,
        });
      });
    };

    // Capture before Next's Link handler. Its same-page hash navigation calls
    // preventDefault at the React root; a bubble listener would see that and
    // never get the chance to apply our measured geometry.
    document.addEventListener("click", handleAnchor, true);
    window.addEventListener("hashchange", alignHistoryAnchor);
    window.addEventListener("popstate", alignHistoryAnchor);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchor, true);
      window.removeEventListener("hashchange", alignHistoryAnchor);
      window.removeEventListener("popstate", alignHistoryAnchor);
      window.removeEventListener("resize", updateAnchorClearance);
      headerObserver?.disconnect();
      lenis?.destroy();
      if (instance === lenis) instance = null;
    };
  }, []);

  // Cross-page hash links can arrive before fonts, imagery or client-rendered
  // content above the target has settled. Repeat the same deterministic
  // alignment through that short settling window, and stop as soon as the
  // visitor deliberately interacts.
  useEffect(() => {
    if (!window.location.hash) return;

    const targetId = decodeAnchorId(window.location.hash);
    if (!targetId) return;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    const timers: number[] = [];

    const align = () => {
      if (cancelled) return;
      scrollToAnchor(targetId, { immediate: true, focus: false });
    };
    const cancel = () => {
      cancelled = true;
    };

    firstFrame = window.requestAnimationFrame(() => {
      align();
      secondFrame = window.requestAnimationFrame(align);
    });
    timers.push(
      window.setTimeout(align, 150),
      window.setTimeout(align, 500),
      window.setTimeout(align, 1000),
    );
    void document.fonts?.ready.then(align);

    window.addEventListener("pointerdown", cancel, { once: true });
    window.addEventListener("touchstart", cancel, { once: true });
    window.addEventListener("wheel", cancel, { once: true });
    window.addEventListener("keydown", cancel, { once: true });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, [pathname]);

  // Page snapping is opt-in. Global auto-registration used to pull anchor
  // destinations to a different position after the deliberate anchor scroll.
  useEffect(() => {
    const lenis = instance;
    if (!lenis) return;

    let routeSnap: Snap | null = null;
    const frame = window.requestAnimationFrame(() => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("main > section[data-page-snap]"),
      ).filter((element) => element.offsetHeight > window.innerHeight * 0.5);
      if (sections.length === 0) return;

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
