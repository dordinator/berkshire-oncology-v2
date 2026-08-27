"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { usePathname } from "next/navigation";
import {
  getLenis,
  resizeSmoothScroll,
  startPageSnap,
  stopPageSnap,
} from "@/components/SmoothScroll";

const HISTORY_KEY = "__berkshireHomepageReturn";
const SNAPSHOT_VERSION = 1;

export const HOME_RETURN_UI_EVENT = "berkshire:restore-home-ui";

type ViewportKind = "desktop" | "compact";

export interface HomeUiSnapshot {
  viewport: ViewportKind;
  desktopNavId: string | null;
  desktopPanelScrollTop: number;
  mobileMenuOpen: boolean;
  mobileSectionId: string | null;
  mobileMenuScrollTop: number;
  searchOpen: boolean;
  searchQuery: string;
  searchActiveIndex: number;
  searchScrollTop: number;
}

export interface HomeReturnUiEventDetail {
  ui: HomeUiSnapshot;
  viewportMatches: boolean;
}

interface ElementReference {
  id?: string;
  href?: string;
  text?: string;
  occurrence?: number;
}

interface ScrollPosition {
  left: number;
  top: number;
}

interface HomepageSnapshot {
  version: typeof SNAPSHOT_VERSION;
  savedAt: number;
  windowX: number;
  windowY: number;
  details: Record<string, boolean>;
  scrollers: Record<string, ScrollPosition>;
  ui: HomeUiSnapshot;
  origin: ElementReference | null;
  focus: ElementReference | null;
}

let removeSnapResumeListeners: (() => void) | null = null;
let skipNextCapturedLink = false;
const pausedContentScrollers = new Map<HTMLElement, string>();

function pauseContentScrollSnap(element: HTMLElement): void {
  if (!pausedContentScrollers.has(element)) {
    pausedContentScrollers.set(element, element.style.scrollSnapType);
  }
  element.style.scrollSnapType = "none";
}

function releaseContentScrollSnap(): void {
  pausedContentScrollers.forEach((value, element) => {
    if (value) element.style.scrollSnapType = value;
    else element.style.removeProperty("scroll-snap-type");
  });
  pausedContentScrollers.clear();
}

function resumePageSnapOnNextInput(): void {
  removeSnapResumeListeners?.();
  const resume = () => {
    startPageSnap();
    releaseContentScrollSnap();
    removeSnapResumeListeners?.();
    removeSnapResumeListeners = null;
  };
  const remove = () => {
    window.removeEventListener("wheel", resume);
    window.removeEventListener("touchstart", resume);
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
  };
  removeSnapResumeListeners = remove;
  window.addEventListener("wheel", resume, { passive: true, once: true });
  window.addEventListener("touchstart", resume, { passive: true, once: true });
  window.addEventListener("pointerdown", resume, { passive: true, once: true });
  window.addEventListener("keydown", resume, { once: true });
}

function viewportKind(): ViewportKind {
  return window.matchMedia("(min-width: 1280px)").matches
    ? "desktop"
    : "compact";
}

function normaliseText(element: HTMLElement): string {
  return element.innerText.replace(/\s+/g, " ").trim();
}

function referenceFor(element: Element | null): ElementReference | null {
  const actionable = element?.closest<HTMLElement>(
    "a[href], button, input, summary, [tabindex]",
  );
  if (!actionable) return null;

  const reference: ElementReference = {};
  if (actionable.id) reference.id = actionable.id;

  if (actionable instanceof HTMLAnchorElement) {
    const href = actionable.href;
    const text = normaliseText(actionable);
    const matches = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).filter(
      (candidate) => candidate.href === href && normaliseText(candidate) === text,
    );

    reference.href = href;
    reference.text = text;
    reference.occurrence = Math.max(0, matches.indexOf(actionable));
  }

  return Object.keys(reference).length > 0 ? reference : null;
}

function elementFor(reference: ElementReference | null): HTMLElement | null {
  if (!reference) return null;
  if (reference.id) {
    const byId = document.getElementById(reference.id);
    if (byId) return byId;
  }
  if (!reference.href) return null;

  const matches = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).filter(
    (candidate) =>
      candidate.href === reference.href &&
      normaliseText(candidate) === (reference.text ?? ""),
  );
  return matches[reference.occurrence ?? 0] ?? null;
}

function captureUi(): HomeUiSnapshot {
  const desktopTrigger = document.querySelector<HTMLAnchorElement>(
    '[id^="nav-trigger-"][aria-expanded="true"]',
  );
  const desktopPanel = document.querySelector<HTMLElement>(
    '[data-home-return-overlay-scroll="desktop-nav"]',
  );
  const mobileMenu = document.getElementById("site-mobile-menu");
  const mobileSection = mobileMenu?.querySelector<HTMLButtonElement>(
    'button[aria-expanded="true"][aria-controls^="mobile-panel-"]',
  );
  const searchInput = document.getElementById(
    "site-search-input",
  ) as HTMLInputElement | null;
  const searchScroller = document.querySelector<HTMLElement>(
    '[data-home-return-overlay-scroll="search-results"]',
  );
  const activeSearchId = searchInput?.getAttribute("aria-activedescendant") ?? "";
  const activeSearchIndex = Number(activeSearchId.replace("search-option-", ""));

  return {
    viewport: viewportKind(),
    desktopNavId: desktopTrigger?.id.replace("nav-trigger-", "") ?? null,
    desktopPanelScrollTop: desktopPanel?.scrollTop ?? 0,
    mobileMenuOpen: Boolean(mobileMenu),
    mobileSectionId:
      mobileSection?.getAttribute("aria-controls")?.replace("mobile-panel-", "") ?? null,
    mobileMenuScrollTop: mobileMenu?.scrollTop ?? 0,
    searchOpen: Boolean(searchInput),
    searchQuery: searchInput?.value ?? "",
    searchActiveIndex: Number.isFinite(activeSearchIndex) ? activeSearchIndex : 0,
    searchScrollTop: searchScroller?.scrollTop ?? 0,
  };
}

function captureSnapshot(origin?: Element | null): HomepageSnapshot {
  const details: Record<string, boolean> = {};
  document
    .querySelectorAll<HTMLDetailsElement>("details[data-home-return-details]")
    .forEach((element) => {
      const key = element.dataset.homeReturnDetails;
      if (key) details[key] = element.open;
    });

  const scrollers: Record<string, ScrollPosition> = {};
  document
    .querySelectorAll<HTMLElement>("[data-home-return-scroll]")
    .forEach((element) => {
      const key = element.dataset.homeReturnScroll;
      if (key) {
        scrollers[key] = { left: element.scrollLeft, top: element.scrollTop };
      }
    });

  const previous = readSnapshot();
  return {
    version: SNAPSHOT_VERSION,
    savedAt: Date.now(),
    windowX: window.scrollX,
    windowY: window.scrollY,
    details,
    scrollers,
    ui: captureUi(),
    origin: referenceFor(origin ?? null) ?? previous?.origin ?? null,
    focus: referenceFor(document.activeElement),
  };
}

function readSnapshot(state: unknown = window.history.state): HomepageSnapshot | null {
  if (!state || typeof state !== "object") return null;
  const snapshot = (state as Record<string, unknown>)[HISTORY_KEY];
  if (!snapshot || typeof snapshot !== "object") return null;
  if ((snapshot as HomepageSnapshot).version !== SNAPSHOT_VERSION) return null;
  return snapshot as HomepageSnapshot;
}

/**
 * Save the current homepage entry before a programmatic navigation. Standard
 * links are captured automatically; SearchBar calls this for keyboard Enter.
 */
export function captureHomepageReturn(origin?: Element | null): void {
  if (typeof window === "undefined" || window.location.pathname !== "/") return;
  saveSnapshot(captureSnapshot(origin));
}

function saveSnapshot(snapshot: HomepageSnapshot): void {
  const currentState =
    window.history.state && typeof window.history.state === "object"
      ? window.history.state
      : {};
  window.history.replaceState(
    { ...currentState, [HISTORY_KEY]: snapshot },
    "",
    window.location.href,
  );
}

/** Give keyboard search activation the exact same single-entry Link journey. */
export function followHomepageLinkFromKeyboard(
  anchor: HTMLAnchorElement,
  origin?: Element | null,
): void {
  captureHomepageReturn(origin);
  skipNextCapturedLink = true;
  try {
    anchor.click();
  } finally {
    skipNextCapturedLink = false;
  }
}

function isSameTabInternalLink(event: MouseEvent, anchor: HTMLAnchorElement): boolean {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.hasAttribute("download") ||
    (anchor.target && anchor.target.toLowerCase() !== "_self")
  ) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);
  return (
    url.origin === window.location.origin &&
    url.href !== window.location.href &&
    (url.protocol === "http:" || url.protocol === "https:")
  );
}

function restoreDetails(snapshot: HomepageSnapshot): void {
  document
    .querySelectorAll<HTMLDetailsElement>("details[data-home-return-details]")
    .forEach((element) => {
      const key = element.dataset.homeReturnDetails;
      if (key && Object.prototype.hasOwnProperty.call(snapshot.details, key)) {
        element.open = snapshot.details[key];
      }
    });
}

function restoreContentScrollers(snapshot: HomepageSnapshot): void {
  document
    .querySelectorAll<HTMLElement>("[data-home-return-scroll]")
    .forEach((element) => {
      const key = element.dataset.homeReturnScroll;
      const position = key ? snapshot.scrollers[key] : undefined;
      if (!position) return;
      pauseContentScrollSnap(element);
      element.scrollLeft = position.left;
      element.scrollTop = position.top;
    });
}

function restoreWindow(snapshot: HomepageSnapshot): void {
  resizeSmoothScroll();
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(snapshot.windowY, {
      immediate: true,
      force: true,
    });
  } else {
    window.scrollTo({
      left: snapshot.windowX,
      top: snapshot.windowY,
      behavior: "auto",
    });
  }
}

function dispatchUiRestore(snapshot: HomepageSnapshot): void {
  const detail: HomeReturnUiEventDetail = {
    ui: snapshot.ui,
    viewportMatches: snapshot.ui.viewport === viewportKind(),
  };
  window.dispatchEvent(
    new CustomEvent<HomeReturnUiEventDetail>(HOME_RETURN_UI_EVENT, { detail }),
  );
}

function restoreOverlayScroll(snapshot: HomepageSnapshot): void {
  if (snapshot.ui.viewport !== viewportKind()) return;

  const desktopPanel = document.querySelector<HTMLElement>(
    '[data-home-return-overlay-scroll="desktop-nav"]',
  );
  if (desktopPanel) desktopPanel.scrollTop = snapshot.ui.desktopPanelScrollTop;

  const mobileMenu = document.getElementById("site-mobile-menu");
  if (mobileMenu) mobileMenu.scrollTop = snapshot.ui.mobileMenuScrollTop;

  const searchScroller = document.querySelector<HTMLElement>(
    '[data-home-return-overlay-scroll="search-results"]',
  );
  if (searchScroller) searchScroller.scrollTop = snapshot.ui.searchScrollTop;
}

function restoreFocus(snapshot: HomepageSnapshot): void {
  if (snapshot.ui.searchOpen && snapshot.ui.viewport === viewportKind()) {
    document.getElementById("site-search-input")?.focus({ preventScroll: true });
    return;
  }
  const target = elementFor(snapshot.origin) ?? elementFor(snapshot.focus);
  target?.focus({ preventScroll: true });
}

function scheduleRestore(snapshot: HomepageSnapshot): () => void {
  let cancelled = false;
  const frames: number[] = [];
  const timers: number[] = [];

  const applyDocumentState = () => {
    if (cancelled) return;
    stopPageSnap();
    restoreDetails(snapshot);
    restoreContentScrollers(snapshot);
    restoreWindow(snapshot);
  };

  const cancel = () => {
    removeSnapResumeListeners?.();
    removeSnapResumeListeners = null;
    if (cancelled) {
      startPageSnap();
      releaseContentScrollSnap();
      return;
    }
    cancelled = true;
    frames.forEach((frame) => window.cancelAnimationFrame(frame));
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener("wheel", onUserInput);
    window.removeEventListener("touchstart", onUserInput);
    window.removeEventListener("pointerdown", onUserInput);
    window.removeEventListener("keydown", onUserInput);
    startPageSnap();
    releaseContentScrollSnap();
  };

  const onUserInput = () => cancel();
  const later = (delay: number, callback: () => void) => {
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) callback();
      }, delay),
    );
  };

  removeSnapResumeListeners?.();
  removeSnapResumeListeners = null;
  releaseContentScrollSnap();
  stopPageSnap();
  applyDocumentState();

  frames.push(
    window.requestAnimationFrame(() => {
      applyDocumentState();
      dispatchUiRestore(snapshot);

      frames.push(
        window.requestAnimationFrame(() => {
          applyDocumentState();
          restoreOverlayScroll(snapshot);
          restoreFocus(snapshot);
        }),
      );
    }),
  );

  later(140, () => {
    applyDocumentState();
    // Passive route-change effects close the old page's menus. Repeat the UI
    // restore after those effects have certainly flushed, then wait one frame
    // for its panel contents before restoring their own scroll positions.
    dispatchUiRestore(snapshot);
    frames.push(
      window.requestAnimationFrame(() => {
        restoreOverlayScroll(snapshot);
      }),
    );
  });
  later(650, () => {
    applyDocumentState();
    restoreOverlayScroll(snapshot);
    restoreFocus(snapshot);
  });
  later(1250, () => {
    // Reveal transitions and late browser scroll anchoring have finished by
    // this pass. Any genuine user input cancels these repetitions immediately.
    applyDocumentState();
    restoreOverlayScroll(snapshot);
    restoreFocus(snapshot);
    // Stay paused until the next real interaction. Starting immediately can
    // release a debounced pre-navigation snap after the exact position is set.
    resumePageSnapOnNextInput();
    window.removeEventListener("wheel", onUserInput);
    window.removeEventListener("touchstart", onUserInput);
    window.removeEventListener("pointerdown", onUserInput);
    window.removeEventListener("keydown", onUserInput);
    cancelled = true;
  });

  window.addEventListener("wheel", onUserInput, { passive: true });
  window.addEventListener("touchstart", onUserInput, { passive: true });
  window.addEventListener("pointerdown", onUserInput, { passive: true });
  window.addEventListener("keydown", onUserInput);

  return cancel;
}

function replaceCleanup(
  cleanupRef: MutableRefObject<() => void>,
  snapshot: HomepageSnapshot,
): void {
  cleanupRef.current();
  cleanupRef.current = scheduleRestore(snapshot);
}

/**
 * Homepage-wide Back/Forward memory. The snapshot belongs to the individual
 * browser history entry, so a fresh visit never inherits an older visit's UI.
 */
export default function HomepageReturnState() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const cleanupRef = useRef<() => void>(() => undefined);
  const pendingSnapshotRef = useRef<HomepageSnapshot | null>(null);
  const returnRequestedRef = useRef(false);
  const cancelActiveRestore = useCallback(() => cleanupRef.current(), []);

  pathnameRef.current = pathname;

  useEffect(() => {
    if (pathname !== "/") return;
    if (!returnRequestedRef.current) return;
    const snapshot = pendingSnapshotRef.current;
    returnRequestedRef.current = false;
    pendingSnapshotRef.current = null;
    if (snapshot) replaceCleanup(cleanupRef, snapshot);
  }, [pathname]);

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (window.location.pathname !== "/") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !isSameTabInternalLink(event, anchor)) return;
      if (skipNextCapturedLink) {
        skipNextCapturedLink = false;
        return;
      }
      // Save before React closes a menu/search sheet and before Next creates
      // the destination entry. A touch-only first tap may merely open a menu;
      // that harmless snapshot is replaced by the eventual navigation.
      saveSnapshot(captureSnapshot(anchor));
    };

    const onPopState = (event: PopStateEvent) => {
      if (window.location.pathname !== "/") {
        returnRequestedRef.current = false;
        pendingSnapshotRef.current = null;
        return;
      }

      const snapshot = readSnapshot(event.state);
      if (!snapshot) return;
      returnRequestedRef.current = true;
      pendingSnapshotRef.current = snapshot;

      // Hash-only Back never changes usePathname, so restore it directly.
      if (pathnameRef.current === "/") {
        returnRequestedRef.current = false;
        pendingSnapshotRef.current = null;
        replaceCleanup(cleanupRef, snapshot);
      }
    };

    document.addEventListener("click", onClickCapture, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      cancelActiveRestore();
      document.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, [cancelActiveRestore]);

  return null;
}
