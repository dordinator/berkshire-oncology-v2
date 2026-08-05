"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion, useSpring, useTransform } from "framer-motion";
import {
  world,
  ukOutline,
  counties,
  rivers,
  roadsMajor,
  roadsLocal,
  railways,
  sitePolys,
} from "@/content/mapPaths.generated";
import { mapLabels, type MapLabelKind } from "@/content/mapLabels";

// ─────────────────────────────────────────────────────────────────────────────
// The journey's map: the UK as faint accent hairlines, with a camera that
// glides between stops.
//
// The drawing is one static SVG — country outline, county boundaries, six
// pins — and the "camera" is a single transform on the group that contains it.
// Nothing is re-projected or re-rendered when the frame changes: the springs
// write a transform attribute, the browser does the rest. That is what makes
// a 30× zoom from the whole country down to a Reading street corner cheap.
//
// Three springs, not one. Panning (cx, cy) and zooming (a log₂ scale) are
// separate physical motions with separate configs, and the zoom deliberately
// lags the pan slightly — gliding between two towns at street zoom reads as
// flight rather than a smear, because the frame breathes out fractionally
// while it travels. Zoom is sprung in log space: a linear spring on the raw
// scale spends almost all its time in the last octave and the UK-wide → town
// move would look like nothing happening followed by a lurch.
//
// The pins counter-scale by 1/s inside the zooming group, so they stay the
// same size on screen at every zoom — they are markers of the map, not
// features on it. Same trick as vector-effect="non-scaling-stroke", which
// keeps the boundary hairlines one hairline wide throughout.
//
// Reduced motion: the springs are jumped rather than set, so every frame
// change is an instant cut. The map is still legible — each stop is simply a
// different still.
// ─────────────────────────────────────────────────────────────────────────────

export interface MapStop {
  name: string;
  lat: number;
  lng: number;
  /** Diameter of the framed view at this stop, in metres on the ground. */
  spanM: number;
  nhs?: boolean;
  /** Matches sitePolys in the generated data, for grounds highlighting. */
  slug?: string;
}

/** Stroke weight and strength per road class — a hierarchy, so a motorway
 *  reads heavier than a residential street at every zoom. */
const ROAD_STYLE = {
  motorway: { w: 1.6, o: 0.3 },
  trunk: { w: 1.3, o: 0.26 },
  primary: { w: 1, o: 0.22 },
  secondary: { w: 0.8, o: 0.18 },
} as const;

/** The SVG's own coordinate box. Square, so slice-cropping trims evenly. */
const BOX = 1000;

/** Web Mercator into the generated module's world units — same formula as
 *  RegionMap and scripts/build-map-paths.mjs. */
function project(lat: number, lng: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * world,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * world,
  };
}

/** Ground metres per world unit of x at a given latitude. */
function metresPerUnit(lat: number) {
  return (40075017 / world) * Math.cos((lat * Math.PI) / 180);
}

interface Frame {
  cx: number;
  cy: number;
  /** log₂ of the group scale. */
  lz: number;
}

/** Rough box around the UK, for the opening frame. Slightly south-weighted:
 *  every pin is in the Thames Valley, so losing a sliver of Shetland to the
 *  crop matters less than losing the pins. */
const UK = { north: 58.7, south: 49.9, west: -8.2, east: 1.8 };

function ukFrame(): Frame {
  const a = project(UK.north, UK.west);
  const b = project(UK.south, UK.east);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  // Fit the whole box, plus breathing room for the slice crop.
  const half = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) / 2;
  return { cx, cy, lz: Math.log2(BOX / 2 / (half * 1.12)) };
}

// ── River-aware framing ──────────────────────────────────────────────────────
// A frame centred dead on the pin puts the nearest river exactly at the bezel:
// every site here sits 700 m – 1.6 km from its water, and the first cut proved
// it — the Kennet clipped the right edge at Reading, the Thames hid under the
// navbar at Windsor. So each stop's camera does what a cartographer would do:
// slide the centre three-tenths of the way from the pin towards the nearest
// point of river, and open the zoom just enough that the river sits at ~74% of
// the half-frame. The pin lands on the third, the river arcs through the shot,
// and nothing important lives in the slice-crop margin.

/** Every river vertex, decoded once. The generated encoding is strictly
 *  `M x y` then runs of relative `l` pairs, no Z (rivers are open). */
function riverVertices(): [number, number][] {
  const pts: [number, number][] = [];
  for (const r of rivers) {
    const toks = r.d.match(/[Ml]|-?\d*\.?\d+/g);
    if (!toks) continue;
    let x = 0;
    let y = 0;
    let absolute = false;
    for (let i = 0; i < toks.length; ) {
      const t = toks[i];
      if (t === "M") {
        absolute = true;
        i++;
        continue;
      }
      if (t === "l") {
        absolute = false;
        i++;
        continue;
      }
      const a = parseFloat(toks[i++]);
      const b = parseFloat(toks[i++]);
      if (absolute) {
        x = a;
        y = b;
        absolute = false;
      } else {
        x += a;
        y += b;
      }
      pts.push([x, y]);
    }
  }
  return pts;
}

function stopFrame(stop: MapStop, riverPts: [number, number][]): Frame {
  const { x, y } = project(stop.lat, stop.lng);
  // spanM is the diameter that must stay comfortably in view at minimum; the
  // 1.35 pads it against the slice crop on non-square containers.
  const baseHalf = (stop.spanM * 1.35) / 2 / metresPerUnit(stop.lat);

  let nearest: [number, number] | null = null;
  let best = Infinity;
  for (const [rx, ry] of riverPts) {
    const d2 = (rx - x) ** 2 + (ry - y) ** 2;
    if (d2 < best) {
      best = d2;
      nearest = [rx, ry];
    }
  }
  if (!nearest) return { cx: x, cy: y, lz: Math.log2(BOX / 2 / baseHalf) };

  const dx = nearest[0] - x;
  const dy = nearest[1] - y;
  const d = Math.sqrt(best);
  // Centre 35% of the way to the river, and open the frame to 1.15·d, which
  // puts the river at 0.65/1.15 ≈ 57% of the half-frame. The budget is set
  // against the WORST slice-crop axis, not the frame itself: the desktop
  // column shows only ~83% of the viewBox horizontally, so 57% of the frame
  // is ~68% of what is actually visible — comfortably in shot, which "74% of
  // the frame" (the first attempt) was not once the crop ate the margin.
  const half = Math.max(baseHalf, d * 1.15);
  return {
    cx: x + dx * 0.35,
    cy: y + dy * 0.35,
    lz: Math.log2(BOX / 2 / half),
  };
}

export default function JourneyMap({
  stops,
  active,
  className = "",
}: {
  stops: MapStop[];
  /** −1 for the UK-wide hero frame, otherwise an index into stops. */
  active: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const cameraRef = useRef<SVGGElement>(null);
  const riversRef = useRef<SVGGElement>(null);
  const roadsMajorRef = useRef<SVGGElement>(null);
  const roadsLocalRef = useRef<SVGGElement>(null);
  const railsRef = useRef<SVGGElement>(null);
  const polysRef = useRef<SVGGElement>(null);
  const pinRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGGElement | null)[]>([]);
  const labelKindRefs = useRef<Partial<Record<MapLabelKind, SVGGElement | null>>>({});

  const frames = useMemo(() => {
    const riverPts = riverVertices();
    return [ukFrame(), ...stops.map((s) => stopFrame(s, riverPts))];
  }, [stops]);
  const initial = frames[0];

  // Pan floatier than zoom: the camera starts moving before it commits to the
  // new altitude, which is what stops town-to-town moves reading as a smear.
  // Slightly overdamped, but not by much — the first cut of this sat at
  // stiffness 42/34 and its settling tail ran past three seconds on the
  // UK-to-street flight, which read as the camera never quite arriving.
  const cx = useSpring(initial.cx, { stiffness: 60, damping: 21, mass: 1 });
  const cy = useSpring(initial.cy, { stiffness: 60, damping: 21, mass: 1 });
  const lz = useSpring(initial.lz, { stiffness: 46, damping: 19, mass: 1.05 });

  useEffect(() => {
    const f = frames[Math.max(0, Math.min(active + 1, frames.length - 1))];
    if (reduced) {
      cx.jump(f.cx);
      cy.jump(f.cy);
      lz.jump(f.lz);
    } else {
      cx.set(f.cx);
      cy.set(f.cy);
      lz.set(f.lz);
    }
  }, [active, frames, reduced, cx, cy, lz]);

  // One derived value drives every attribute write. Written imperatively
  // because framer-motion has no first-class binding for an SVG transform
  // *attribute* — and an attribute it must be, since CSS transforms on inner
  // SVG elements still misbehave in enough engines to matter.
  const camera = useTransform([cx, cy, lz] as const, ([x, y, l]) => {
    const s = 2 ** (l as number);
    return { x: x as number, y: y as number, s };
  });

  useEffect(() => {
    const apply = ({ x, y, s }: { x: number; y: number; s: number }) => {
      cameraRef.current?.setAttribute(
        "transform",
        `translate(${BOX / 2} ${BOX / 2}) scale(${s}) translate(${-x} ${-y})`,
      );
      const inv = 1 / s;
      for (const pin of pinRefs.current) {
        pin?.setAttribute("transform", `scale(${inv})`);
      }
      // The rivers surface as the camera descends: invisible at the UK shot
      // (where a lone Thames Valley squiggle would read as a stray mark) and
      // fully drawn by town level, where they are what stops a close-up being
      // two pins in a white void. Faded in log-zoom space, like the zoom.
      const l = Math.log2(s);
      const ramp = (a: number, b: number) =>
        Math.min(1, Math.max(0, (l - a) / (b - a)));
      riversRef.current?.setAttribute("opacity", String(ramp(3, 5.3)));

      // The local cartography arrives in order of importance as the camera
      // descends: A-roads and motorways first (they orient a regional shot),
      // then railways, then the hospital grounds and the streets around them
      // at the deepest frames. Everything is gone at the UK-wide hero.
      roadsMajorRef.current?.setAttribute("opacity", String(ramp(3.2, 4.8)));
      railsRef.current?.setAttribute("opacity", String(ramp(3.8, 5.2)));
      roadsLocalRef.current?.setAttribute("opacity", String(ramp(5.8, 7)));
      polysRef.current?.setAttribute("opacity", String(ramp(5.5, 6.8)));
      // The rail dash is drawn in user units, so unlike the non-scaling
      // stroke width it zooms with the map — recomputed here to hold a
      // constant ~5px/3.5px rhythm on screen.
      railsRef.current?.setAttribute(
        "stroke-dasharray",
        `${5 * inv} ${3.5 * inv}`,
      );

      // Labels counter-scale like the pins, each keeping its set angle, and
      // each class holds its own altitude band: towns for the regional shots
      // (and gone again by street level, where a town name is noise), river
      // names arriving with the water, streets only at the deepest frames.
      for (let i = 0; i < mapLabels.length; i++) {
        labelRefs.current[i]?.setAttribute(
          "transform",
          `scale(${inv}) rotate(${mapLabels[i].angle})`,
        );
      }
      labelKindRefs.current.town?.setAttribute(
        "opacity",
        String(ramp(1, 2) * (1 - ramp(6.8, 7.6))),
      );
      labelKindRefs.current.river?.setAttribute("opacity", String(ramp(4.5, 5.5)));
      labelKindRefs.current.street?.setAttribute("opacity", String(ramp(6.3, 7)));
    };
    apply(camera.get());
    return camera.on("change", apply);
  }, [camera]);

  const pins = useMemo(
    () => stops.map((s) => ({ ...s, ...project(s.lat, s.lng) })),
    [stops],
  );

  // ~3,700 paths live in this SVG now. `active` re-renders the component at
  // every stop change, so the unchanging layers are memoised into stable
  // elements React bails out of diffing entirely — only the six pins and six
  // ground polygons are reconciled per stop. Split in two because the grounds
  // fills must paint above the county lines but below the road network.
  const staticUnder = useMemo(
    () => (
      <>
        {/* Country outline a shade firmer than the county lines beneath it,
            both one hairline wide at every zoom. */}
        {ukOutline.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.34}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        ))}
        {counties.map((c) => (
          <path
            key={c.name}
            d={c.d}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.14}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        ))}
      </>
    ),
    [],
  );

  const staticOver = useMemo(
    () => (
      <>
        {/* The road network, weighted by class so the M4 reads heavier than
            a Windsor side street. Streets exist only inside 2.5 km of the six
            sites — detail lives where the camera goes, nowhere else. */}
        <g ref={roadsMajorRef} opacity={0}>
          {roadsMajor.map((r, i) => (
            <path
              key={i}
              d={r.d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={ROAD_STYLE[r.cls].o}
              strokeWidth={ROAD_STYLE[r.cls].w}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
        <g ref={roadsLocalRef} opacity={0}>
          {roadsLocal.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeWidth={0.8}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
        {/* Dashed in the cartographic manner; the dash rhythm is recomputed
            against the camera because dash lengths scale and stroke width
            does not. */}
        <g ref={railsRef} opacity={0}>
          {railways.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.26}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </>
    ),
    [],
  );

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full text-accent ${className}`}
      role="img"
      aria-label={`Map of the United Kingdom marking ${stops
        .map((s) => s.name)
        .join(", ")}`}
    >
      <g ref={cameraRef}>
        {staticUnder}

        {/* The hospital grounds themselves — the destination as a shape
            rather than an abstract point, with the active stop's grounds a
            touch stronger. Under the roads, as a fill should be. */}
        <g ref={polysRef} opacity={0}>
          {sitePolys.map((p) => {
            const isActive =
              active >= 0 && stops[active]?.slug === p.slug;
            return (
              <path
                key={p.slug}
                d={p.d}
                fill="currentColor"
                fillOpacity={isActive ? 0.16 : 0.07}
                fillRule="evenodd"
                stroke="currentColor"
                strokeOpacity={isActive ? 0.42 : 0.28}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                className="transition-[fill-opacity,stroke-opacity] duration-500"
              />
            );
          })}
        </g>

        {staticOver}

        {/* The Thames and the Kennet — every one of the six sites stands on
            one or the other, which is why "Thames Valley" is not a flourish.
            Group opacity is driven by the camera (see above). */}
        <g ref={riversRef} opacity={0}>
          {rivers.map((r, i) => (
            <path
              key={`${r.name}-${i}`}
              d={r.d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.38}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Labels, grouped by kind so one opacity write fades a whole class.
            Each label counter-scales like a pin and carries a canvas-coloured
            halo (paint-order: stroke) so it stays legible across hairlines.
            The svg is role="img" with a label, so none of this reaches the
            accessibility tree — it is drawing, not document text. */}
        {(["town", "river", "street"] as const).map((kind) => (
          <g
            key={kind}
            opacity={0}
            ref={(el) => {
              labelKindRefs.current[kind] = el;
            }}
          >
            {mapLabels.map((label, i) =>
              label.kind !== kind ? null : (
                <g
                  key={`${label.text}-${i}`}
                  // toFixed, not raw doubles: Math.log/Math.sin differ in the
                  // last ulp between V8 on the server and the browser, so an
                  // unrounded projection hydration-mismatches. 2dp matches the
                  // data's own quantisation (~4 m on the ground).
                  transform={(() => {
                    const p = project(label.lat, label.lng);
                    return `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`;
                  })()}
                >
                  <text
                    ref={(el) => {
                      labelRefs.current[i] = el as unknown as SVGGElement;
                    }}
                    textAnchor="middle"
                    paintOrder="stroke"
                    stroke="#fafbfc"
                    strokeWidth={3}
                    className={
                      kind === "town"
                        ? "fill-ink-muted text-[11px] font-medium uppercase tracking-[0.22em]"
                        : kind === "river"
                          ? "fill-accent/70 font-display text-[11px] italic"
                          : "fill-ink-muted text-[9.5px] font-medium tracking-[0.04em]"
                    }
                  >
                    {label.text}
                  </text>
                </g>
              ),
            )}
          </g>
        ))}

        {pins.map((p, i) => {
          const isActive = i === active;
          // Before the journey starts every pin stands at full strength — the
          // hero's cluster in the south-east is the point of the wide shot.
          const dim = active >= 0 && !isActive;
          return (
            // toFixed for the same server/client float reason as the labels.
            <g
              key={p.name}
              transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`}
            >
              <g
                ref={(el) => {
                  pinRefs.current[i] = el;
                }}
              >
                <g
                  className="transition-[opacity,transform] duration-500"
                  style={{
                    opacity: dim ? 0.38 : 1,
                    transform: `scale(${isActive ? 1.18 : 1})`,
                  }}
                >
                  {/* Same drawn pin as RegionMap — inherits nothing by
                      accident, stays crisp at any scale. */}
                  <path
                    d="M0 2 C -7 -8, -11 -13, -11 -19 a 11 11 0 1 1 22 0 c 0 6, -4 11, -11 21 Z"
                    fill={isActive ? "#1a4d8f" : "#061c46"}
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  <circle cx={0} cy={-19} r={4} fill="#ffffff" />
                </g>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
