"use client";

import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import JourneyMapCanvas from "@/components/sections/locations/JourneyMapCanvas";
import Button from "@/components/ui/Button";
import { attribution } from "@/content/mapPaths.generated";
import { journeyStops } from "@/content/journey";

type ConsultantLocationsJourneyProps = {
  consultantName: string;
  locationSlugs: string[];
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

export default function ConsultantLocationsJourney({
  consultantName,
  locationSlugs,
}: ConsultantLocationsJourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rotationDirection = useRef<1 | -1>(1);
  const reducedMotion = useReducedMotion();
  const stops = useMemo(
    () =>
      journeyStops.filter(
        (stop) => Boolean(stop.slug) && locationSlugs.includes(stop.slug ?? ""),
      ),
    [locationSlugs],
  );
  const [activeLocation, setActiveLocation] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [rotationCycle, setRotationCycle] = useState(0);
  const mapProgress = useMotionValue(1);
  const activeStop = stops[activeLocation] ?? stops[0];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionVisible || reducedMotion || stops.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveLocation((current) => {
        if (current >= stops.length - 1) rotationDirection.current = -1;
        if (current <= 0) rotationDirection.current = 1;
        return current + rotationDirection.current;
      });
    }, 5200);

    return () => window.clearInterval(interval);
  }, [reducedMotion, rotationCycle, sectionVisible, stops.length]);

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
    rotationDirection.current = index >= activeLocation ? 1 : -1;
    setActiveLocation(index);
    setRotationCycle((cycle) => cycle + 1);
  }

  if (!activeStop) return null;

  return (
    <section
      id="locations"
      ref={sectionRef}
      className="flex min-h-[100svh] scroll-mt-24 items-center bg-[#d5e0dc] py-16 text-ink md:py-20 lg:pb-16 lg:pt-40"
    >
      <div className="grid w-full gap-12 px-5 sm:px-8 md:px-10 lg:grid-cols-[0.35fr_0.65fr] lg:items-center lg:gap-[5vw] lg:px-[5vw]">
        <div className="lg:max-w-[32rem]">
          <h2 className="max-w-[8ch] font-display text-[clamp(3rem,5vw,5.8rem)] font-semibold leading-[0.94] tracking-[-0.055em]">
            Where {consultantName} works.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
            {consultantName} practises at these sites. The right place depends
            on the consultation and care you need.
          </p>

          <div className="mt-8 border-y border-ink/20">
            {stops.map((stop, index) => {
              const active = index === activeLocation;
              const panelId = `consultant-location-${stop.slug}`;

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
                    <span className="mt-1 min-w-6 text-[10px] font-medium tabular-nums tracking-[0.12em] text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                        {stop.area}
                      </span>
                      <span className="mt-1 block font-display text-xl font-semibold leading-tight tracking-[-0.025em] text-ink md:text-2xl">
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

                  <AnimatePresence initial={false}>
                    {active ? (
                      <motion.div
                        id={panelId}
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
                          <p className="text-xs text-ink-muted">
                            {stop.provider ?? stop.eyebrow}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-base">
                            {stop.description}
                          </p>
                          <Link
                            href={stop.href}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink"
                          >
                            View this location <Arrow />
                          </Link>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
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
            <div className="absolute inset-0 overflow-hidden rounded-[calc(2.25rem-1px)] bg-[#fafbfc]">
              <JourneyMapCanvas
                stops={stops}
                active={activeLocation}
                progress={mapProgress}
              />

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#fafbfc]/65 via-transparent to-transparent"
                aria-hidden
              />

              <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-[#fafbfc]/80 px-2.5 py-1 text-[8px] leading-none text-ink-muted backdrop-blur-sm">
                {attribution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
