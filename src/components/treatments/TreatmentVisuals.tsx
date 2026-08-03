"use client";

/*
  The mode-aware visual layer for /treatments/*.

  Two pieces:

    AmbientBand    the decorative band behind a heading. Hairline waves in the
                   quiet and integrated registers; the tariffs particle field in
                   expressive, so the section shares a visual language with the
                   rest of the site rather than inventing a second one.

    PathwaySection the care-pathway diagram. Absent in quiet, present from
                   integrated up. This is the only piece that changes what is
                   *explained* rather than what is decorated — hence the plain
                   fallback below it in quiet mode, so no route is ever hidden
                   by a visual preference.

  Both wait for `ready` before rendering anything, so the server render and the
  first client render always agree. They fade in, which reads as intentional
  rather than as a flash of late content.
*/

import Link from "next/link";
import ParticleField from "@/components/sections/tariffs/ParticleField";
import HairlineWaves from "./HairlineWaves";
import PathwayDiagram, { type PathwayStop } from "./PathwayDiagram";
import { useTreatmentMode } from "./TreatmentMode";

export function AmbientBand({
  className = "",
  flip = false,
  edgeFade = "band",
}: {
  className?: string;
  flip?: boolean;
  edgeFade?: "band" | "card" | "footer";
}) {
  const { mode, ready } = useTreatmentMode();

  return (
    <div
      aria-hidden
      className={`pointer-events-none transition-opacity duration-700 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {ready &&
        (mode === "expressive" ? (
          <ParticleField
            className="h-full w-full"
            midYFrac={flip ? 0.35 : 0.6}
            layers={7}
            edgeFade={edgeFade}
          />
        ) : (
          <HairlineWaves className="h-full w-full" flip={flip} />
        ))}
    </div>
  );
}

export function PathwaySection({
  stops,
  heading = "The route through treatment",
  intro,
}: {
  stops: PathwayStop[];
  heading?: string;
  intro?: string;
}) {
  const { mode, ready } = useTreatmentMode();
  const showDiagram = ready && mode !== "quiet";

  return (
    <div className="mt-14">
      <h2 className="font-display text-2xl text-ink md:text-3xl">{heading}</h2>
      {intro && (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          {intro}
        </p>
      )}

      {showDiagram ? (
        <PathwayDiagram stops={stops} className="mt-9" />
      ) : (
        // Quiet register, and the pre-hydration render. The same information,
        // as a plain list — a visual preference must never remove a route.
        <ul className="mt-7 space-y-3.5">
          {stops.map((stop) => (
            <li
              key={stop.stage}
              className="flex gap-3.5 text-[15px] leading-relaxed text-ink/80"
            >
              <span
                aria-hidden
                className="mt-[0.62em] h-1.5 w-1.5 flex-none rounded-full bg-accent/50"
              />
              <span>
                <span className="font-medium text-ink">{stop.stage}.</span>{" "}
                {stop.body}
                {stop.link && (
                  <>
                    {" "}
                    <Link
                      href={stop.link.href}
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      {stop.link.label}
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
