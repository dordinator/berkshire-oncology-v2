"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Snap from "lenis/snap";
import { getLenis } from "@/components/SmoothScroll";
import JourneyMapCanvas from "./JourneyMapCanvas";
import type { MapStop } from "./mapCamera";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — the scroll journey, as a stepped, locked experience.
//
// One viewport-tall stage stays pinned for the whole journey while a track of
// N×100svh behind it turns scroll depth into a single progress value:
// 0 = the hero beside the UK-wide map, k = stop k−1 settled. Everything is a
// function of that value —
//
//   • the camera scrubs through mapCamera's flight arc, pulling OUT until the
//     frame holds both stops and diving back IN as you approach the next lock;
//   • the text panels crossfade in step, each one fully readable at its lock
//     and handed over mid-gap;
//   • Lenis snap points at every lock mean the page always comes to rest ON a
//     stop, never in a between-state — six locks, plus the hero.
//
// The previous cut let the page free-scroll past panels while an observer
// retargeted springs mid-flight; quick scrolling made the camera dither, and
// the site-wide section snap (which registers every tall `main > section`)
// tugged at the whole 700vh block. The snap guard below disables our locks
// outside the stage so the tail of the page scrolls normally.
//
// Free-fall paths: with reduced motion (no Lenis, no locks) progress is
// stepped to whole stops, so every frame change is a cut; before hydration
// the stage shows the hero and the UK map.
// ─────────────────────────────────────────────────────────────────────────────

export interface JourneyStop extends MapStop {
  eyebrow: string;
  area: string;
  provider?: string;
  address?: string;
  description: string;
  href: string;
  linkLabel: string;
  external?: boolean;
}

function Arrow() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NhsPill() {
  return (
    <span className="type-label rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 text-accent">
      NHS
    </span>
  );
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** How far into a gap a panel stays visible; fully handed over by 0.45. */
// How far either side of a lock a panel stays visible, in lock units. Below 0.5
// there is a window in the middle where neither neighbour is painted and the
// text column goes blank; above 0.5 two panels would be drawn over each other.
// 0.49 keeps the single-panel guarantee and shrinks the blank window to about
// 2% of the gap — roughly one key press, now that the keyboard can stop there.
const FADE = 0.49;

const LOCATION_GROUPS = [
  {
    area: "Reading",
    locations: [
      { slug: "practice", label: "The practice" },
      { slug: "spire-dunedin-reading", label: "Spire Dunedin" },
      { slug: "royal-berkshire-hospital", label: "Royal Berkshire" },
    ],
  },
  {
    area: "Windsor",
    locations: [
      { slug: "princess-margaret-windsor", label: "Princess Margaret" },
      { slug: "genesiscare-windsor", label: "GenesisCare" },
    ],
  },
  {
    area: "Oxford",
    locations: [{ slug: "genesiscare-oxford", label: "GenesisCare" }],
  },
] as const;

function ScrollCue() {
  return (
    <p className="type-label mt-6 flex items-center gap-2.5 text-ink-muted lg:mt-8">
      Scroll to explore each location
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className="animate-cue-drift h-4 w-4 text-accent"
      >
        <path
          d="M8 2v11M3.5 8.5 8 13l4.5-4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </p>
  );
}

function HeroLocationSummary({
  stops,
  onSelect,
}: {
  stops: JourneyStop[];
  onSelect: (index: number) => void;
}) {
  return (
    <>
      <div className="mt-6 hidden max-w-md border-y border-ink/[0.07] lg:mt-8 lg:block">
        <p className="type-label border-b border-ink/[0.07] py-3 text-ink-muted">
          Jump directly to a location
        </p>

        {LOCATION_GROUPS.map((group, groupIndex) => (
          <div
            key={group.area}
            className={`grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-4 py-3 ${
              groupIndex > 0 ? "border-t border-ink/[0.07]" : ""
            }`}
          >
            <span className="font-display text-base text-ink lg:text-lg">
              {group.area}
            </span>

            <span className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-right text-sm leading-snug">
              {group.locations.map((location, index) => {
                const stopIndex = stops.findIndex(
                  (stop) => stop.slug === location.slug,
                );
                if (stopIndex < 0) return null;

                return (
                  <span
                    key={location.slug}
                    className="inline-flex items-center gap-2"
                  >
                    {index > 0 && (
                      <span aria-hidden className="text-ink/25">
                        ·
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelect(stopIndex)}
                      // 19px tall and 23.8px apart, against a 24px minimum for
                      // both. Real padding rather than a cancelled one: the
                      // spacing is the binding constraint here, and a negative
                      // margin would put the links back where they were.
                      className="py-1 font-medium text-accent underline decoration-accent/25 underline-offset-4 transition-colors hover:decoration-accent"
                    >
                      {location.label}
                    </button>
                  </span>
                );
              })}
            </span>
          </div>
        ))}
      </div>

      <ScrollCue />
    </>
  );
}

export default function LocationsJourney({
  stops,
  hero,
  outro,
  attribution,
}: {
  stops: JourneyStop[];
  hero: React.ReactNode;
  /** The final lock: camera back at the UK-wide shot, practical links beside. */
  outro: React.ReactNode;
  /** Licence line for the map data. Required — do not render without it. */
  attribution: string;
}) {
  const N = stops.length;
  /** The last lock's index: hero (0), stops (1..N), outro (N+1). */
  const LAST = N + 1;
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Progress ───────────────────────────────────────────────────────────────
  // Raw progress follows the native scroll position (which Lenis animates, so
  // it is already smooth); a light spring on top erases what wheel steps
  // remain. Reduced motion gets whole numbers — cuts, not glides.
  const rawP = useMotionValue(0);
  const sprungP = useSpring(rawP, { stiffness: 110, damping: 26, mass: 0.6 });
  const steppedP = useTransform(rawP, (v) => Math.round(v));
  const progress = reduced ? steppedP : sprungP;

  const [active, setActive] = useState(-1);

  // The journey — a pinned stage, snap locks, crossfading panels — is a desktop
  // composition. It never worked on a phone: the locks are computed from
  // `100svh`, which iOS Safari changes as its address bar collapses, and Lenis
  // snap fought the momentum scrolling underneath it, so a flick either stuck
  // mid-flight or was dragged back. Below `lg` the same panels are laid out as
  // an ordinary stacked page and the browser does the scrolling.
  //
  // Defaults to true so the server-rendered markup stays the desktop one; a
  // phone flips it on mount. The layout itself is switched in CSS, so nothing
  // reflows on that flip — only the behaviour is gated here.
  const [isWide, setIsWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Which panels hold more than they can show. Only those become tab stops:
  // a panel that fits has nothing to scroll, and a dead tab stop on every
  // panel would make the page longer to get through, not shorter.
  const [overflowing, setOverflowing] = useState<boolean[]>([]);

  useEffect(() => {
    // On a phone the panels sit in normal flow and never scroll on their own,
    // so none of them should become a tab stop.
    if (!isWide) {
      setOverflowing((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const measure = () => {
      const next = panelRefs.current.map(
        (el) => !!el && el.scrollHeight > el.clientHeight + 2,
      );
      setOverflowing((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i])
          ? prev
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const el of panelRefs.current) if (el) observer.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [LAST, isWide]);

  const goToStop = useCallback(
    (stopIndex: number) => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;

      const panelIndex = stopIndex + 1;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const target = trackTop + panelIndex * stage.getBoundingClientRect().height;
      const focusDestination = () => {
        panelRefs.current[panelIndex]
          ?.querySelector<HTMLElement>("h2")
          ?.focus({ preventScroll: true });
      };
      const lenis = getLenis();

      if (reduced || !lenis) {
        window.scrollTo({
          top: target,
          behavior: reduced ? "auto" : "smooth",
        });
        rawP.set(panelIndex);
        window.setTimeout(focusDestination, reduced ? 0 : 500);
        return;
      }

      lenis.scrollTo(target, {
        duration: 1.1,
        easing: easeInOutSine,
        lock: true,
        force: true,
        onComplete: focusDestination,
      });
    },
    [rawP, reduced],
  );

  useEffect(() => {
    if (!isWide) return;
    const el = trackRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;

    let trackTop = 0;
    let viewportHeight = 0;
    const measure = () => {
      trackTop = el.getBoundingClientRect().top + window.scrollY;
      viewportHeight = stage.getBoundingClientRect().height;
    };
    measure();

    const onScroll = () => {
      if (viewportHeight <= 0) return;
      rawP.set(
        Math.min(
          Math.max((window.scrollY - trackTop) / viewportHeight, 0),
          LAST,
        ),
      );
    };
    onScroll();

    const onResize = () => {
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [LAST, rawP, isWide]);

  // Panel crossfade and the active stop, written imperatively — a scrub emits
  // every frame, and neither job needs React until a stop actually changes.
  useEffect(() => {
    // On a phone the panels are a plain stacked list, so the crossfade must not
    // run — and anything it already wrote has to be cleared. `isWide` starts
    // true so the server render stays the desktop one, which means this effect
    // runs once before the breakpoint resolves and leaves inline opacity,
    // visibility and transform behind. The transforms are the harmful ones:
    // they shift each panel down by 36px more than the last, up to 252px, and
    // because a transform does not affect layout the container still measured
    // correctly while the last panel sat on top of the section beneath it.
    if (!isWide) {
      for (const panel of panelRefs.current) {
        if (!panel) continue;
        panel.style.opacity = "";
        panel.style.visibility = "";
        panel.style.transform = "";
      }
      return;
    }
    const drive = (p: number) => {
      for (let k = 0; k <= LAST; k++) {
        const panel = panelRefs.current[k];
        if (!panel) continue;
        const d = p - k;
        const opacity = Math.max(0, 1 - Math.abs(d) / FADE);
        panel.style.opacity = String(opacity);
        panel.style.visibility = opacity <= 0.02 ? "hidden" : "visible";
        panel.style.transform = `translateY(${(-d * 36).toFixed(1)}px)`;
      }
      const idx = Math.round(p) - 1;
      setActive((prev) => (prev === idx ? prev : idx));
    };
    drive(progress.get());
    return progress.on("change", drive);
  }, [LAST, progress, isWide]);

  // ── The locks ──────────────────────────────────────────────────────────────
  // Our own Snap instance on the site's Lenis: mandatory, so the page always
  // settles on a stop — but only while the stage owns the viewport. Mandatory
  // snapping is global to the scroll, so without the guard it would drag the
  // user back up out of the footer. With the wheel stepper below this is the
  // backstop for the inputs it does not own: touch flicks and scrollbar drags.
  useEffect(() => {
    if (!isWide) return;
    const lenis = getLenis();
    const el = trackRef.current;
    const stage = stageRef.current;
    if (!lenis || !el || !stage) return;

    let snap: InstanceType<typeof Snap> | null = null;
    let trackTop = 0;
    let stageEnd = 0;
    let viewportHeight = 0;

    const build = () => {
      snap?.destroy();
      trackTop = el.getBoundingClientRect().top + window.scrollY;
      viewportHeight = stage.getBoundingClientRect().height;
      if (viewportHeight <= 0) return;
      stageEnd = trackTop + LAST * viewportHeight;
      snap = new Snap(lenis, {
        // proximity, not mandatory: releasing near a stop still settles onto it,
        // which is what almost every gesture does. Mandatory additionally
        // refused to let a touch or scrollbar user rest anywhere else, and
        // fought a screen reader's cursor, which scrolls the page as it moves.
        type: "proximity",
        duration: 1.15,
        easing: easeInOutSine,
        debounce: 320,
      });
      for (let k = 0; k <= LAST; k++) {
        snap.add(trackTop + k * viewportHeight);
      }
      guard();
    };

    const guard = () => {
      if (!snap) return;
      const inStage = window.scrollY < stageEnd + viewportHeight * 0.4;
      if (inStage) snap.start();
      else snap.stop();
    };

    build();
    window.addEventListener("scroll", guard, { passive: true });
    window.addEventListener("resize", build);
    return () => {
      window.removeEventListener("scroll", guard);
      window.removeEventListener("resize", build);
      snap?.destroy();
    };
  }, [LAST, isWide]);

  // ── The stepper ────────────────────────────────────────────────────────────
  // One gesture, one stop — the flight is the same ~1.1s whether the wheel
  // turned a notch or a trackpad was flung. Wheel events inside the stage are
  // taken before Lenis sees them (capture phase, then stopImmediatePropagation)
  // and folded into a step; everything that arrives during the flight or in a
  // gesture's momentum tail is swallowed, which is precisely the "size of the
  // scroll" this removes. At the final lock a downward gesture is left alone,
  // so the page releases into the footer naturally; keyboard paging gets the
  // same treatment. Touch stays native — a flick already reads as one gesture,
  // and the snap above settles it onto a lock.
  useEffect(() => {
    if (!isWide) return;
    const lenis = getLenis();
    const el = trackRef.current;
    const stage = stageRef.current;
    if (!lenis || !el || !stage) return;

    let trackTop = 0;
    let viewportHeight = 0;
    const measure = () => {
      trackTop = el.getBoundingClientRect().top + window.scrollY;
      viewportHeight = stage.getBoundingClientRect().height;
    };
    measure();

    let stepping = false;
    let swallowTail = false;
    let lastWheel = 0;
    let acc = 0;
    let backstop: ReturnType<typeof setTimeout> | null = null;

    const currentLock = () =>
      viewportHeight > 0
        ? Math.round((window.scrollY - trackTop) / viewportHeight)
        : 0;
    const inStage = () =>
      window.scrollY <
      trackTop + LAST * viewportHeight + viewportHeight * 0.35;

    const panelCanScroll = (target: EventTarget | null, deltaY: number) => {
      if (!(target instanceof Element) || deltaY === 0) return false;
      const panel = target.closest<HTMLElement>(
        "[data-location-journey-scroll]",
      );
      if (!panel || !el.contains(panel)) return false;

      const maxScrollTop = panel.scrollHeight - panel.clientHeight;
      if (maxScrollTop <= 1) return false;
      return deltaY > 0
        ? panel.scrollTop < maxScrollTop - 1
        : panel.scrollTop > 1;
    };

    const step = (dir: 1 | -1) => {
      const next = Math.min(Math.max(currentLock() + dir, 0), LAST);
      if (next === currentLock()) return;
      stepping = true;
      swallowTail = true;
      lenis.scrollTo(trackTop + next * viewportHeight, {
        duration: 1.1,
        easing: easeInOutSine,
        lock: true,
        force: true,
        onComplete: () => {
          stepping = false;
        },
      });
      // If onComplete is ever lost (a resize mid-flight), free the stepper
      // rather than jamming it — the same lesson the canvas rAF taught.
      if (backstop) clearTimeout(backstop);
      backstop = setTimeout(() => {
        stepping = false;
      }, 1700);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (!inStage()) return;
      // A short viewport can make the active text panel taller than its box.
      // Let that panel consume the wheel until it reaches the relevant edge;
      // only then does the next gesture advance the journey.
      if (panelCanScroll(e.target, e.deltaY)) return;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      // Leaving: the last lock's downward gesture belongs to the page.
      if (!stepping && dir === 1 && currentLock() >= LAST) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      if (stepping) return;
      if (swallowTail) {
        // Momentum keeps emitting after a flight; only a genuine pause ends
        // the gesture and arms the next one.
        if (gap < 180) return;
        swallowTail = false;
        acc = 0;
      }
      acc += e.deltaY;
      if (Math.abs(acc) < 24) return;
      const d: 1 | -1 = acc > 0 ? 1 : -1;
      acc = 0;
      step(d);
    };

    // Arrow, Page and Space used to be captured here and remapped to a
    // whole-viewport jump, which left a keyboard user unable to scroll this
    // 700svh page by a line at all — SC 2.1.1. Those keys belong to the
    // browser. The wheel stepper below is unchanged, so a mouse still moves
    // lock to lock; the keyboard now scrolls the page, and the panels follow
    // scroll position exactly as they already do for anyone using Reduce
    // Motion, where none of this machinery installs.

    window.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("resize", measure);
      if (backstop) clearTimeout(backstop);
    };
  }, [LAST, isWide]);

  // Initial styles mirror p = 0 so the server render and the first client
  // frame agree: hero visible, everything else hidden.
  const panelStyle = (k: number): React.CSSProperties =>
    !isWide
      ? {}
      : k === 0
        ? { opacity: 1, visibility: "visible" }
        : { opacity: 0, visibility: "hidden" };

  const panels = useMemo(
    () => [
      <div key="hero">
        {hero}
        <HeroLocationSummary
          stops={stops}
          onSelect={goToStop}
        />
      </div>,
      ...stops.map((stop) => (
        <article key={stop.name}>
          <p className="type-label text-ink-muted">
            {stop.eyebrow}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 lg:mt-4">
            <h2
              tabIndex={-1}
              className="font-display text-2xl leading-tight text-ink md:text-4xl"
            >
              {stop.name}
            </h2>
            {stop.nhs && <NhsPill />}
          </div>

          <p className="mt-2 text-base text-ink-muted">
            {stop.area}
            {stop.provider ? ` · ${stop.provider}` : ""}
          </p>

          <p className="mt-4 max-w-md text-base leading-relaxed text-ink lg:mt-5">
            {stop.description}
          </p>

          {stop.address && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted lg:mt-4">
              {stop.address}
            </p>
          )}

          {stop.external ? (
            <a
              href={stop.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent lg:mt-7"
            >
              {stop.linkLabel}
              <Arrow />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link
              href={stop.href}
              className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent lg:mt-7"
            >
              {stop.linkLabel}
              <Arrow />
            </Link>
          )}
        </article>
      )),
      // The outro: index LAST, beside the camera's return to the wide shot.
      <div key="outro">{outro}</div>,
    ],
    [goToStop, hero, outro, stops],
  );

  return (
    // data-no-snap: this section runs its own Snap locks; the global
    // proximity snap must not compete (see SmoothScroll.tsx).
    <section data-no-snap className="relative">
      {/* Panels crossfade in and out under the reader as the page scrolls, and
          until now nothing said which one had arrived. Mounted here rather than
          inside the stage so it is in the document before the first change — a
          live region added at the moment it updates announces nothing. */}
      <p className="sr-only" role="status" aria-live="polite">
        {active >= 0 && active < N
          ? `${stops[active].name}. Location ${active + 1} of ${N}.`
          : ""}
      </p>

      {/* The track: its height is the journey's scroll length. Sticky travel
          is track height minus stage height, so LAST+1 viewport-heights give
          the stage LAST full gaps — one per lock-to-lock flight, the final
          one being the pull back out to the UK. */}
      {/* The track's height is the journey's scroll length, and it only exists
          from `lg`. On a phone the section is as tall as its content, so the
          page scrolls once, normally, instead of through a 700svh rail. The
          height is handed to CSS as a custom property so the breakpoint — not
          JavaScript — decides whether it applies. */}
      <div
        ref={trackRef}
        style={{ "--track-height": `${(LAST + 1) * 100}svh` } as React.CSSProperties}
        className="relative lg:h-[var(--track-height)]"
      >
        <div
          ref={stageRef}
          className="relative lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-hidden"
        >
          {/* ── The map ──────────────────────────────────────────────────
              Below lg: a band across the top of the stage, its last 26px
              ceded to the licence caption. From lg: the right half. */}
          <div className="relative aspect-[4/3] w-full shrink-0 sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-auto lg:w-[52%]">
            <div className="absolute inset-0 lg:bottom-0">
              {/* At the outro the raw index is N — out of stops' range — and
                  the renderer must read it as "no active stop": every pin at
                  full strength, no grounds highlighted, as in the hero's wide
                  shot. */}
              <JourneyMapCanvas
                stops={stops}
                active={active >= 0 && active < N ? active : -1}
                progress={progress}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-canvas to-transparent lg:hidden"
              />
            </div>

            {/* Required by the data licences. Do not remove from the desktop
                view. Hidden below `lg` at the practice's request: at 9px across
                the foot of a phone-width map it was the smallest text on the
                site and sat over the artwork. Note that the OGL and OSM terms
                ask for attribution that is visible to the reader, so while the
                map is shown on a phone this hides something the licences
                expect — raised with the practice rather than decided here. */}
            {/* ink-muted, not a faded ink: at this size the faded version
                measured 2.48:1 and axe rightly objected — a licence line is
                required to be readable, not merely present. */}
            <p className="pointer-events-none absolute inset-x-0 bottom-0 hidden px-4 pt-0.5 text-[9px] leading-[10px] text-ink-muted lg:inset-x-auto lg:bottom-1 lg:right-2 lg:block lg:px-0 lg:pt-0 lg:text-[10px] lg:leading-normal">
              {attribution}
            </p>
          </div>

          {/* ── The panels ───────────────────────────────────────────────
              Stacked in the same box and crossfaded by progress. Hidden
              panels are visibility:hidden so their links leave the tab
              order along with the view. */}
          <div className="relative divide-y divide-ink/10 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[48%] lg:divide-y-0">
            {panels.map((panel, k) => (
              <div
                key={k}
                ref={(node) => {
                  panelRefs.current[k] = node;
                }}
                style={panelStyle(k)}
                {...(isWide ? { "data-lenis-prevent": "" } : {})}
                data-location-journey-scroll
                // A scroll container that overflows has to be reachable by
                // keyboard. Below about 768px this panel holds 684px of content
                // in a 455px box, and the jump-list links inside it are
                // display:none at those widths — so there was nothing to tab to
                // and no way to scroll it, leaving the last 229px unreachable.
                // No role or label: the panel is a scroll container, not a
                // widget, and naming it would mean inventing a name.
                //
                // The lint rule and axe disagree here, and axe is right: a
                // scrollable region with no focusable content must itself be
                // focusable, or its overflow cannot be reached by keyboard.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={overflowing[k] ? 0 : undefined}
                className={`site-gutter relative flex py-10 lg:absolute lg:inset-0 lg:overflow-y-auto lg:py-0 lg:pb-6 lg:pr-14 lg:pt-24 xl:pb-0 focus-visible:shadow-[inset_0_0_0_2px_#061c46] ${
                  k === 0 ? "xl:pt-20" : "xl:pt-0"
                }`}
              >
                {/* my-auto, not justify-center on the flex box: flex centring
                    of overflowing content clips its top unreachably; auto
                    margins collapse instead, so a panel taller than the box
                    (the hero at 375px) scrolls from its true top. */}
                <div className="my-auto w-full py-5">{panel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
