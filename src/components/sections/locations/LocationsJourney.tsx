"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import JourneyMap, { type MapStop } from "./JourneyMap";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — the scroll journey. Borrowed knowingly from HCA's "Our
// locations": a hero beside a faint map of the whole country, and then, as you
// scroll, the map flies to each site in turn while its panel tells you what
// the building is.
//
// The scroll does not drive the camera continuously. Each panel is a stop, an
// IntersectionObserver watches a band across the middle of the viewport, and
// whichever panel holds that band is the active stop — the map's springs do
// the travelling. A scrubbed camera would fight Lenis's smoothing and jitter
// on trackpads; a sprung one glides identically however the user scrolls, and
// costs one class of bug less on a medical site.
//
// One DOM order serves both layouts — hero, then map, then panels:
//   • below lg that *is* the page: hero copy in flow, then the map reaches the
//     top of the screen and sticks there while the panels scroll through
//     beneath it;
//   • from lg the map lifts out to the right as an absolutely-positioned,
//     viewport-tall sticky column, and hero + panels form the left column.
// No duplicated hero, no order: juggling — sticky just does the work twice.
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

/** Shared left-column gutter: container-wide's padding below lg, and from lg a
 *  computed left inset that keeps the text aligned with the site's container
 *  while letting the column itself stretch to meet the map. */
const COLUMN =
  "px-6 md:px-10 lg:w-[48%] lg:pl-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))] lg:pr-14";

export default function LocationsJourney({
  stops,
  hero,
  attribution,
}: {
  stops: JourneyStop[];
  hero: React.ReactNode;
  /** Licence line for the boundary data. Required — do not render without it. */
  attribution: string;
}) {
  const [active, setActive] = useState(-1);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Below lg the map owns the top ~44% of the screen, so the band that
    // decides the active stop sits in the panel area beneath it rather than
    // across the true centre — otherwise a panel would have to climb halfway
    // under the map before its stop fired.
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.stop));
          }
        }
      },
      // When no panel holds the band (the moment between one leaving and the
      // next arriving) the last stop stays active — the camera holds rather
      // than resetting, which is the right behaviour.
      {
        rootMargin: mobile ? "-52% 0px -34% 0px" : "-43% 0px -43% 0px",
        threshold: 0,
      },
    );
    for (const el of panelRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative">
      {/* ── Stop −1: the hero copy ─────────────────────────────────────────── */}
      <div
        ref={(el) => {
          panelRefs.current[0] = el;
        }}
        data-stop={-1}
        className={`flex flex-col justify-end pb-12 pt-28 md:pt-36 lg:min-h-screen lg:justify-center lg:pb-0 ${COLUMN}`}
      >
        {hero}
      </div>

      {/* ── The map ─────────────────────────────────────────────────────────
          Below lg: a band that reaches the top of the screen and sticks, with
          canvas paint and z-10 so panels scroll in beneath it. From lg: the
          right half of the page, sticky for the full height of the journey. */}
      <div className="sticky top-0 z-10 h-[44svh] w-full bg-canvas lg:absolute lg:inset-y-0 lg:right-0 lg:z-0 lg:h-auto lg:w-[52%] lg:bg-transparent">
        <div className="relative h-full w-full lg:sticky lg:top-0 lg:h-screen">
          {/* Below lg the map cedes its last 26px to the licence caption —
              floated over the drawing, the caption wrapped to four lines and
              collided with the count chip. From lg it is a corner note again. */}
          <div className="absolute inset-x-0 bottom-[26px] top-0 lg:bottom-0">
            <JourneyMap stops={stops} active={active} />

            {/* A soft fade along the map's bottom edge so panels appear to
                slide beneath it rather than being guillotined. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-canvas to-transparent lg:hidden"
            />
          </div>

          {/* The HCA count card. Full card from lg, a compact chip below it;
              both belong to the wide shot and step aside once the journey
              begins. */}
          <div
            className={`absolute transition-opacity duration-500 ${
              active === -1 ? "opacity-100" : "pointer-events-none opacity-0"
            } bottom-[34px] left-4 lg:bottom-auto lg:left-0 lg:top-1/2 lg:-translate-y-1/2`}
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
          <p className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pt-1 text-[8px] leading-[9px] text-ink/40 lg:inset-x-auto lg:bottom-1 lg:right-2 lg:px-0 lg:pt-0 lg:text-[10px] lg:leading-normal">
            {attribution}
          </p>
        </div>
      </div>

      {/* ── The panels ─────────────────────────────────────────────────────── */}
      <div className={`relative ${COLUMN}`}>
        {stops.map((stop, i) => (
          <article
            key={stop.name}
            ref={(el) => {
              panelRefs.current[i + 1] = el;
            }}
            data-stop={i}
            className="flex min-h-[62svh] flex-col justify-center py-14 lg:min-h-screen lg:py-0"
          >
            <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              <span className="font-display text-base tracking-normal text-accent">
                {stop.index}
              </span>
              <span aria-hidden className="h-px w-8 bg-ink-muted/40" />
              {stop.eyebrow}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
                {stop.name}
              </h2>
              {stop.nhs && <NhsPill />}
            </div>

            <p className="mt-2 text-[15px] text-ink-muted">
              {stop.area}
              {stop.provider ? ` · ${stop.provider}` : ""}
            </p>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink md:text-base">
              {stop.description}
            </p>

            {stop.address && (
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {stop.address}
              </p>
            )}

            <Link
              href={stop.href}
              className="group mt-7 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent"
            >
              {stop.linkLabel}
              <Arrow />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
