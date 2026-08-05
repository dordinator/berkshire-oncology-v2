"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MotionValue } from "framer-motion";
import {
  ukOutline,
  counties,
  rivers,
  roadsMajor,
  roadsLocal,
  railways,
  sitePolys,
} from "@/content/mapPaths.generated";
import { mapLabels, type MapLabelKind } from "@/content/mapLabels";
import {
  BOX,
  ROAD_STYLE,
  buildFrames,
  cameraAt,
  layerAlphas,
  project,
  railDash,
  type MapStop,
} from "./mapCamera";

export type { MapStop };

// ─────────────────────────────────────────────────────────────────────────────
// The journey's map, drawn as SVG. The camera maths lives in mapCamera.ts,
// shared with the canvas renderer, so the two are interchangeable.
//
// This component owns no animation. It is handed a continuous `progress`
// MotionValue — the scroll scrub — and on every change writes one transform
// to the camera group, counter-scales the pins and labels, and sets each
// layer's opacity from its altitude band. Springs, observers and timing all
// live upstream in LocationsJourney; a renderer only ever answers "what does
// progress p look like".
//
// The pins counter-scale by 1/s inside the zooming group, so they stay the
// same size on screen at every zoom — they are markers of the map, not
// features on it. Same trick as vector-effect="non-scaling-stroke", which
// keeps every hairline one hairline wide throughout.
// ─────────────────────────────────────────────────────────────────────────────

export default function JourneyMap({
  stops,
  active,
  progress,
  className = "",
}: {
  stops: MapStop[];
  /** −1 during the hero, otherwise an index into stops — pin emphasis only. */
  active: number;
  /** The scrub: 0 = UK-wide hero frame, k = stop k−1 settled. */
  progress: MotionValue<number>;
  className?: string;
}) {
  const cameraRef = useRef<SVGGElement>(null);
  const riversRef = useRef<SVGGElement>(null);
  const roadsMajorRef = useRef<SVGGElement>(null);
  const roadsLocalRef = useRef<SVGGElement>(null);
  const railsRef = useRef<SVGGElement>(null);
  const polysRef = useRef<SVGGElement>(null);
  const pinRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRefs = useRef<(SVGGElement | null)[]>([]);
  const labelKindRefs = useRef<Partial<Record<MapLabelKind, SVGGElement | null>>>({});

  const frames = useMemo(() => buildFrames(stops), [stops]);

  useEffect(() => {
    const draw = (p: number) => {
      const cam = cameraAt(frames, p);
      cameraRef.current?.setAttribute(
        "transform",
        `translate(${BOX / 2} ${BOX / 2}) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`,
      );

      const inv = 1 / cam.s;
      for (const pin of pinRefs.current) {
        pin?.setAttribute("transform", `scale(${inv})`);
      }
      for (let i = 0; i < mapLabels.length; i++) {
        labelRefs.current[i]?.setAttribute(
          "transform",
          `scale(${inv}) rotate(${mapLabels[i].angle})`,
        );
      }

      const a = layerAlphas(cam.l);
      riversRef.current?.setAttribute("opacity", String(a.rivers));
      roadsMajorRef.current?.setAttribute("opacity", String(a.roadsMajor));
      roadsLocalRef.current?.setAttribute("opacity", String(a.roadsLocal));
      railsRef.current?.setAttribute("opacity", String(a.rails));
      polysRef.current?.setAttribute("opacity", String(a.polys));
      labelKindRefs.current.town?.setAttribute("opacity", String(a.townLabels));
      labelKindRefs.current.river?.setAttribute(
        "opacity",
        String(a.riverLabels),
      );
      labelKindRefs.current.street?.setAttribute(
        "opacity",
        String(a.streetLabels),
      );

      // The rail dash is drawn in user units, so unlike the non-scaling
      // stroke width it zooms with the map — recomputed to hold a constant
      // ~5px/3.5px rhythm on screen.
      const [dash, gap] = railDash(cam.s);
      railsRef.current?.setAttribute("stroke-dasharray", `${dash} ${gap}`);
    };
    draw(progress.get());
    return progress.on("change", draw);
  }, [frames, progress]);

  const pins = useMemo(
    () => stops.map((s) => ({ ...s, ...project(s.lat, s.lng) })),
    [stops],
  );

  // ~3,700 paths live in this SVG. `active` re-renders the component at every
  // stop change, so the unchanging layers are memoised into stable elements
  // React bails out of diffing entirely — only the six pins and six ground
  // polygons are reconciled per stop. Split in two because the grounds fills
  // must paint above the county lines but below the road network.
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
            const isActive = active >= 0 && stops[active]?.slug === p.slug;
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
            one or the other, which is why "Thames Valley" is not a flourish. */}
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
