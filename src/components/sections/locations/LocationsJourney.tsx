"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import Snap from "lenis/snap";
import { getLenis } from "@/components/SmoothScroll";
import JourneyMap from "./JourneyMap";
import type { MapStop } from "./mapCamera";

// Client-only: a canvas has no server-rendered output, and the SVG renderer
// covers the first paint anyway.
const JourneyMapCanvas = dynamic(() => import("./JourneyMapCanvas"), {
  ssr: false,
});

type Renderer = "svg" | "canvas";
const RENDERER_KEY = "bop-map-renderer";
/** Flip after measuring; the toggle lets anyone compare live. */
const DEFAULT_RENDERER: Renderer = "canvas";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — the scroll journey, as a stepped, locked experience.
//
// One viewport-tall stage stays pinned for the whole journey while a track of
// N×100vh behind it turns scroll depth into a single progress value:
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
  /** "01" … "06" — set once in the content layer so numbering never drifts. */
  index: string;
  eyebrow: string;
  area: string;
  provider?: string;
  address?: string;
  description: string;
  href: string;
  linkLabel: string;
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
    <span className="rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
      NHS
    </span>
  );
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** How far into a gap a panel stays visible; fully handed over by 0.45. */
const FADE = 0.45;

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

  // Which renderer draws the map. SVG until hydration (it server-renders);
  // then the saved choice, or the default. The pill below flips it live —
  // the camera maths is shared, so the swap is invisible except in feel.
  const [renderer, setRenderer] = useState<Renderer>("svg");
  useEffect(() => {
    const saved = window.localStorage.getItem(RENDERER_KEY);
    setRenderer(saved === "svg" || saved === "canvas" ? saved : DEFAULT_RENDERER);
  }, []);
  const pickRenderer = (r: Renderer) => {
    setRenderer(r);
    window.localStorage.setItem(RENDERER_KEY, r);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let trackTop = 0;
    const measure = () => {
      trackTop = el.getBoundingClientRect().top + window.scrollY;
    };
    measure();

    const onScroll = () => {
      const vh = window.innerHeight;
      rawP.set(
        Math.min(Math.max((window.scrollY - trackTop) / vh, 0), LAST),
      );
    };
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [LAST, rawP]);

  // Panel crossfade and the active stop, written imperatively — a scrub emits
  // every frame, and neither job needs React until a stop actually changes.
  useEffect(() => {
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
  }, [LAST, progress]);

  // ── The locks ──────────────────────────────────────────────────────────────
  // Our own Snap instance on the site's Lenis: mandatory, so the page always
  // settles on a stop — but only while the stage owns the viewport. Mandatory
  // snapping is global to the scroll, so without the guard it would drag the
  // user back up out of the footer. With the wheel stepper below this is the
  // backstop for the inputs it does not own: touch flicks and scrollbar drags.
  useEffect(() => {
    const lenis = getLenis();
    const el = trackRef.current;
    if (!lenis || !el) return;

    let snap: InstanceType<typeof Snap> | null = null;
    let trackTop = 0;
    let stageEnd = 0;

    const build = () => {
      snap?.destroy();
      trackTop = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      stageEnd = trackTop + LAST * vh;
      snap = new Snap(lenis, {
        type: "mandatory",
        duration: 1.15,
        easing: easeInOutSine,
        debounce: 320,
      });
      for (let k = 0; k <= LAST; k++) snap.add(trackTop + k * vh);
      guard();
    };

    const guard = () => {
      if (!snap) return;
      const inStage = window.scrollY < stageEnd + window.innerHeight * 0.4;
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
  }, [LAST]);

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
    const lenis = getLenis();
    const el = trackRef.current;
    if (!lenis || !el) return;

    let trackTop = 0;
    let vh = window.innerHeight;
    const measure = () => {
      trackTop = el.getBoundingClientRect().top + window.scrollY;
      vh = window.innerHeight;
    };
    measure();

    let stepping = false;
    let swallowTail = false;
    let lastWheel = 0;
    let acc = 0;
    let backstop: ReturnType<typeof setTimeout> | null = null;

    const currentLock = () =>
      Math.round((window.scrollY - trackTop) / vh);
    const inStage = () =>
      window.scrollY < trackTop + LAST * vh + vh * 0.35;

    const step = (dir: 1 | -1) => {
      const next = Math.min(Math.max(currentLock() + dir, 0), LAST);
      if (next === currentLock()) return;
      stepping = true;
      swallowTail = true;
      lenis.scrollTo(trackTop + next * vh, {
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

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (!inStage()) return;
      const down =
        e.key === "PageDown" ||
        e.key === "ArrowDown" ||
        (e.key === " " && !e.shiftKey);
      const up =
        e.key === "PageUp" ||
        e.key === "ArrowUp" ||
        (e.key === " " && e.shiftKey);
      if (!down && !up) return;
      if (down && currentLock() >= LAST) return;
      e.preventDefault();
      if (!stepping) step(down ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", measure);
      if (backstop) clearTimeout(backstop);
    };
  }, [LAST]);

  // Initial styles mirror p = 0 so the server render and the first client
  // frame agree: hero visible, everything else hidden.
  const panelStyle = (k: number): React.CSSProperties =>
    k === 0
      ? { opacity: 1, visibility: "visible" }
      : { opacity: 0, visibility: "hidden" };

  const panels = useMemo(
    () => [
      <div key="hero">{hero}</div>,
      ...stops.map((stop) => (
        <article key={stop.name}>
          <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            <span className="font-display text-base tracking-normal text-accent">
              {stop.index}
            </span>
            <span aria-hidden className="h-px w-8 bg-ink-muted/40" />
            {stop.eyebrow}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 lg:mt-4">
            <h2 className="font-display text-[26px] leading-tight text-ink md:text-4xl">
              {stop.name}
            </h2>
            {stop.nhs && <NhsPill />}
          </div>

          <p className="mt-2 text-[15px] text-ink-muted">
            {stop.area}
            {stop.provider ? ` · ${stop.provider}` : ""}
          </p>

          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink md:text-base lg:mt-5">
            {stop.description}
          </p>

          {stop.address && (
            <p className="mt-3 text-sm leading-relaxed text-ink-muted lg:mt-4">
              {stop.address}
            </p>
          )}

          <Link
            href={stop.href}
            className="group mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent lg:mt-7"
          >
            {stop.linkLabel}
            <Arrow />
          </Link>
        </article>
      )),
      // The outro: index LAST, beside the camera's return to the wide shot.
      <div key="outro">{outro}</div>,
    ],
    [hero, outro, stops],
  );

  return (
    // data-no-snap: this section runs its own Snap locks; the global
    // proximity snap must not compete (see SmoothScroll.tsx).
    <section data-no-snap className="relative">
      {/* The track: its height is the journey's scroll length. Sticky travel
          is track height minus stage height, so LAST+1 viewport-heights give
          the stage LAST full gaps — one per lock-to-lock flight, the final
          one being the pull back out to the UK. */}
      <div
        ref={trackRef}
        style={{ height: `${(LAST + 1) * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden lg:block">
          {/* ── The map ──────────────────────────────────────────────────
              Below lg: a band across the top of the stage, its last 26px
              ceded to the licence caption. From lg: the right half. */}
          <div className="relative h-[44svh] w-full shrink-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[52%]">
            <div className="absolute inset-x-0 bottom-[26px] top-0 lg:bottom-0">
              {/* At the outro the raw index is N — out of stops' range — and
                  the renderers must read it as "no active stop": every pin at
                  full strength, no grounds highlighted, as in the hero's wide
                  shot. The count card keys off the raw value instead, so it
                  stays a hero-only object. */}
              {renderer === "canvas" ? (
                <JourneyMapCanvas
                  stops={stops}
                  active={active >= 0 && active < N ? active : -1}
                  progress={progress}
                />
              ) : (
                <JourneyMap
                  stops={stops}
                  active={active >= 0 && active < N ? active : -1}
                  progress={progress}
                />
              )}

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-canvas to-transparent lg:hidden"
              />
            </div>

            {/* The HCA count card — belongs to the wide shot, steps aside
                once the journey begins. */}
            <div
              className={`absolute transition-opacity duration-500 ${
                active === -1 ? "opacity-100" : "pointer-events-none opacity-0"
              } left-4 top-24 lg:left-0 lg:top-1/2 lg:-translate-y-1/2`}
            >
              <div className="rounded-2xl bg-ink px-5 py-4 text-white shadow-[0_24px_70px_-28px_rgba(6,28,70,0.55)] lg:rounded-3xl lg:px-10 lg:py-12">
                <p className="font-display text-4xl leading-none lg:text-7xl">
                  {stops.length}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-white/90 lg:mt-4 lg:text-lg">
                  Locations across the
                  <br className="hidden lg:block" /> Thames Valley
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/50 lg:mt-6 lg:text-[12px]">
                  Scroll down to explore
                </p>
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  fill="none"
                  className="mt-3 hidden h-5 w-5 text-white/80 lg:block"
                >
                  <path
                    d="M8 2v11M3.5 8.5 8 13l4.5-4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Required by the data licences. Do not remove. */}
            {/* ink-muted, not a faded ink: at this size the faded version
                measured 2.48:1 and axe rightly objected — a licence line is
                required to be readable, not merely present. */}
            <p className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pt-0.5 text-[9px] leading-[10px] text-ink-muted lg:inset-x-auto lg:bottom-1 lg:right-2 lg:px-0 lg:pt-0 lg:text-[10px] lg:leading-normal">
              {attribution}
            </p>

            {/* Renderer comparison toggle — same camera, different painter. */}
            <div className="absolute right-2 top-24 z-20 flex overflow-hidden rounded-full border border-ink/10 bg-white/85 text-[10px] font-medium uppercase tracking-[0.08em] backdrop-blur-sm lg:right-auto lg:left-4 lg:top-auto lg:bottom-9">
              {(["svg", "canvas"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRenderer(r)}
                  aria-pressed={renderer === r}
                  className={`px-2.5 py-1 transition-colors ${
                    renderer === r
                      ? "bg-ink text-white"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {r === "svg" ? "Vector" : "Canvas"}
                </button>
              ))}
            </div>
          </div>

          {/* ── The panels ───────────────────────────────────────────────
              Stacked in the same box and crossfaded by progress. Hidden
              panels are visibility:hidden so their links leave the tab
              order along with the view. */}
          <div className="relative min-h-0 flex-1 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[48%]">
            {panels.map((panel, k) => (
              <div
                key={k}
                ref={(node) => {
                  panelRefs.current[k] = node;
                }}
                style={panelStyle(k)}
                className="absolute inset-0 flex overflow-y-auto px-6 md:px-10 lg:pl-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))] lg:pr-14"
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
