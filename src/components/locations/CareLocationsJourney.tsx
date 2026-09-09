"use client";

import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import JourneyMapCanvas from "@/components/sections/locations/JourneyMapCanvas";
import Button from "@/components/ui/Button";
import { mapAttribution } from "@/content/mapAttribution";
import { journeyStops } from "@/content/journey";

type CareLocationsJourneyProps = {
  title: string;
  introduction: string;
  locationSlugs: string[];
  className?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Arrow() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3.5 9h11M10.5 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CareLocationsJourney({
  title,
  introduction,
  locationSlugs,
  className = "",
}: CareLocationsJourneyProps) {
  const reducedMotion = useReducedMotion();
  const stops = useMemo(
    () =>
      journeyStops.filter(
        (stop) => Boolean(stop.slug) && locationSlugs.includes(stop.slug ?? ""),
      ),
    [locationSlugs],
  );
  const [activeLocation, setActiveLocation] = useState(0);
  const mapProgress = useMotionValue(1);
  const activeStop = stops[activeLocation] ?? stops[0];

  // These locations used to advance on their own every 5.2 seconds. That is
  // an SC 2.2.2 failure — auto-updating information with no way to pause it —
  // and clicking a location restarted the timer rather than stopping it. The
  // list is now driven only by the reader.

  useEffect(() => {
    const destination = activeLocation + 1;
    const distance = Math.abs(mapProgress.get() - destination);
    const controls = animate(mapProgress, destination, {
      duration: reducedMotion ? 0 : Math.min(1.9, 1.05 + distance * 0.18),
      ease: EASE,
    });
    return () => controls.stop();
  }, [activeLocation, mapProgress, reducedMotion]);

  function chooseLocation(index: number) {
    setActiveLocation(index);
  }

  if (!activeStop) return null;

  return (
    <section
      id="locations"
      data-anchor-align="viewport"
      className={`flex min-h-[100svh] scroll-mt-24 items-center bg-sage-panel text-ink ${className}`}
    >
      <div className="site-gutter grid w-full gap-12 lg:grid-cols-[0.35fr_0.65fr] lg:items-center lg:gap-[5vw]">
        <div className="lg:max-w-[32rem]">
          <h2 className="type-feature-title max-w-[8ch]">
            {title}
          </h2>
          <p className="type-section-lede mt-6 max-w-md text-ink-muted">
            {introduction}
          </p>

          <div className="mt-8 border-y border-ink/20">
            {stops.map((stop, index) => {
              const active = index === activeLocation;
              const panelId = `care-location-${stop.slug}`;

              return (
                <div
                  key={stop.slug}
                  className="border-b border-ink/20 last:border-b-0"
                >
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls={panelId}
                    onClick={() => chooseLocation(index)}
                    className="group flex w-full items-start gap-4 py-5 text-left"
                  >
                    <span className="type-label mt-1 min-w-6 tabular-nums text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="type-label block text-ink-muted">
                        {stop.area}
                      </span>
                      <span className="type-compact-title mt-1 block text-ink">
                        {stop.name}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="relative mt-2 h-4 w-4 shrink-0 text-ink"
                    >
                      <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
                      <motion.span
                        initial={false}
                        animate={{ scaleY: active ? 0 : 1 }}
                        transition={{ duration: reducedMotion ? 0 : 0.28 }}
                        className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current"
                      />
                    </span>
                  </button>

                  <div id={panelId}>
                    <AnimatePresence initial={false}>
                      {active ? (
                        <motion.div
                          key={panelId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: reducedMotion ? 0 : 0.38,
                            ease: EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="pb-6 pl-10 pr-8">
                            <p className="type-supporting text-ink-muted">
                              {stop.nhs ? `${stop.provider ?? stop.eyebrow} · NHS care` : stop.provider ?? stop.eyebrow}
                            </p>
                            <p className="type-body mt-3 text-ink-muted">
                              {stop.description}
                            </p>
                            <Link
                              href={stop.href}
                              className="type-button mt-4 inline-flex items-center gap-2 text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink"
                            >
                              View this location <Arrow />
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          <Button href="/locations" variant="ghost" className="mt-7">
            Explore all locations
          </Button>
        </div>

        <div>
          <div className="relative min-h-[520px] rounded-[2.25rem] border border-ink/10 shadow-[0_28px_75px_-48px_rgba(6,28,70,0.38)] lg:min-h-[clamp(480px,62svh,620px)]">
            <div className="absolute inset-0 overflow-hidden rounded-[calc(2.25rem-1px)] bg-canvas">
              <JourneyMapCanvas
                stops={stops}
                active={activeLocation}
                progress={mapProgress}
              />

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/65 via-transparent to-transparent"
                aria-hidden
              />

              {/* Same treatment as the cancer-types map on /specialities: the
                  8px overlay is kept above `lg` (1024px), where the map is wide enough
                  to carry it, and below `lg` the licence line moves out to a
                  readable caption underneath rather than shrinking onto the
                  map. Whichever does not apply is `display: none`, so a screen
                  reader meets the attribution exactly once. */}
              <p className="pointer-events-none absolute right-3 top-3 hidden rounded-full bg-canvas/80 px-2.5 py-1 text-[8px] leading-none text-ink-muted backdrop-blur-sm lg:block">
                {mapAttribution}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-muted lg:hidden">
            {mapAttribution}
          </p>
        </div>
      </div>
    </section>
  );
}
