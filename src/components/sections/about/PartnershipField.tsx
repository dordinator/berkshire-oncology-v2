"use client";

import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPORARY — VISUAL AMBITION COMPARISON DEVICE.  DELETE WHEN A LEVEL IS CHOSEN.
   ───────────────────────────────────────────────────────────────────────────
   This file exists so one person can look at three treatments of the same page
   and pick one. It is not a patient-facing feature: nothing on the page links
   to it, and a visitor who never touches the URL only ever sees DEFAULT_LEVEL.

   To compare:   /about?v=quiet   /about?v=integrated   /about?v=expressive

   To retire it once a level is chosen:
     1. Keep the chosen level's entry in RENDERERS and delete the other two.
     2. Delete the `Level` type, LEVELS, and the useEffect that reads the URL.
     3. Export the survivor directly — the call site in src/app/about/page.tsx
        passes no props, so nothing there needs to change.

   Nothing else in the page depends on this file. The motif is decorative only:
   aria-hidden, pointer-events-none, and behind every piece of clinical content.
   ═══════════════════════════════════════════════════════════════════════════ */

type Level = "quiet" | "integrated" | "expressive";

/** What a real visitor sees. Also the fallback for an unrecognised ?v= value. */
const DEFAULT_LEVEL: Level = "integrated";

const LEVELS: Level[] = ["quiet", "integrated", "expressive"];

// ─────────────────────────────────────────────────────────────────────────────
// The motif is drawn twice, because a phone and a desktop are not the same
// shape and the same drawing cannot serve both. A wide viewBox scaled to fill a
// narrow header shows a sliver of itself — two nodes and some passing lines,
// which reads as an accident rather than a figure. So: a wide arrangement for
// wide viewports, a tall serpentine one for narrow, both built from the same
// geometry with the viewBox as the parameter. Only one is ever in the layout.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Round every derived coordinate before it reaches an attribute.
 *
 * Math.sin and Math.cos are not required to be bit-identical across JS engines,
 * and they are not: Node renders cx="141.85372772816285" and V8 in the browser
 * renders cx="141.85372772816288". React sees the mismatch, fails hydration and
 * falls back to the error boundary — a blank page from a difference in the
 * fifteenth decimal place. Path data was already safe (toFixed(1) below); the
 * circle centres were not. Two decimals is far finer than a pixel at any of
 * these viewBox scales.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;

interface Shape {
  /** viewBox extent. */
  w: number;
  h: number;
  /** The ten partners. */
  nodes: { x: number; y: number }[];
  /** The wider network they connect to — expressive level only. */
  outer: { x: number; y: number }[];
  /** Flowing hairlines: [centre offset, amplitude, wavelength, phase]. */
  waves: [number, number, number, number][];
  compact: boolean;
}

const WIDE: Shape = {
  w: 1400,
  h: 620,
  // A shallow, wide arc — a line of colleagues. A circle would read as a logo,
  // a cluster as a crowd.
  nodes: Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    return {
      x: r2(96 + t * 1208),
      y: r2(322 - Math.sin(t * Math.PI) * 118 + Math.sin(t * Math.PI * 3) * 20),
    };
  }),
  outer: Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    return {
      x: r2(40 + t * 1320),
      y: r2(486 + Math.sin(t * Math.PI * 2 + 0.6) * 54),
    };
  }),
  waves: [
    [250, 24, 980, 140],
    [392, 28, 1120, 380],
    [470, 22, 880, 40],
  ],
  compact: false,
};

const TALL: Shape = {
  w: 420,
  h: 760,
  // The same ten, threaded down the page instead of across it.
  nodes: Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    return {
      x: r2(210 + Math.sin(t * Math.PI * 1.7 + 0.4) * 132),
      y: r2(70 + t * 620),
    };
  }),
  outer: Array.from({ length: 8 }, (_, i) => {
    const t = i / 7;
    return {
      x: r2(210 + Math.cos(t * Math.PI * 1.4) * 178),
      y: r2(120 + t * 540),
    };
  }),
  waves: [
    [190, 18, 420, 60],
    [430, 22, 500, 180],
    [640, 16, 380, 20],
  ],
  compact: true,
};

/** Consecutive links, plus chords for the cross-referral between partners. */
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9],
  [0, 4], [2, 7], [5, 9], [1, 6], [3, 8],
];

// ── geometry helpers ─────────────────────────────────────────────────────────
// Everything is computed from fixed inputs, never Math.random, and every value
// that reaches an attribute is rounded (see r2 above) — so the server and the
// client emit identical markup and hydration stays quiet.

/** One long flowing hairline: a sine drawn as half-wavelength bezier segments. */
function wavePath(
  y: number,
  amp: number,
  wavelength: number,
  phase: number,
  w: number,
) {
  const half = wavelength / 2;
  let x = -phase;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  let dir = 1;
  while (x < w + wavelength) {
    d +=
      ` C ${(x + half / 3).toFixed(1)} ${(y - amp * 1.3 * dir).toFixed(1)},` +
      ` ${(x + (half * 2) / 3).toFixed(1)} ${(y - amp * 1.3 * dir).toFixed(1)},` +
      ` ${(x + half).toFixed(1)} ${y.toFixed(1)}`;
    x += half;
    dir *= -1;
  }
  return d;
}

/** A link between two nodes. Chords bow, so the figure reads as drawn rather
 *  than plotted; on the tall arrangement they bow sideways, not downwards. */
function edgePath(
  p: { x: number; y: number },
  q: { x: number; y: number },
  bow: number,
  compact: boolean,
) {
  const mx = (p.x + q.x) / 2 + (compact ? bow : 0);
  const my = (p.y + q.y) / 2 + (compact ? 0 : bow);
  return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
}

// ── primitives ───────────────────────────────────────────────────────────────

function Stroke({
  d,
  i,
  opacity,
  width = 1,
}: {
  d: string;
  i: number;
  opacity: number;
  width?: number;
}) {
  return (
    <path
      d={d}
      className="sketch-path"
      pathLength={1}
      style={{ ["--i" as string]: i }}
      fill="none"
      stroke="currentColor"
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

function Node({
  x,
  y,
  r = 3,
  i,
  dim = 1,
}: {
  x: number;
  y: number;
  r?: number;
  i: number;
  dim?: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" fillOpacity={0.34 * dim} />
      <circle
        cx={x}
        cy={y}
        r={r * 3.1}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.13 * dim}
        strokeWidth={0.9}
        className="sketch-path"
        pathLength={1}
        style={{ ["--i" as string]: i }}
      />
    </g>
  );
}

function Waves({ s, opacities }: { s: Shape; opacities: number[] }) {
  return (
    <>
      {s.waves.map(([y, amp, wl, ph], i) => (
        <Stroke
          key={i}
          d={wavePath(y, amp, wl, ph, s.w)}
          i={i}
          opacity={opacities[i] ?? 0.1}
        />
      ))}
    </>
  );
}

function PartnerWeb({ s, from = 3 }: { s: Shape; from?: number }) {
  // On a phone the figure sits directly behind the headline rather than beside
  // it, so it gets the thread without the web: consecutive links only, and
  // everything dimmer. The motif is meant to be noticed second, not first.
  const edges = s.compact ? EDGES.filter(([a, b]) => b - a === 1) : EDGES;
  const dim = s.compact ? 0.55 : 1;

  return (
    <>
      {edges.map(([a, b], i) => {
        const skip = Math.abs(b - a) > 1;
        return (
          <Stroke
            key={i}
            d={edgePath(s.nodes[a], s.nodes[b], skip ? 28 : 0, s.compact)}
            i={from + i * 0.45}
            opacity={(skip ? 0.12 : 0.22) * dim}
            width={skip ? 0.85 : 1.05}
          />
        );
      })}
      {s.nodes.map((n, i) => (
        <Node key={i} x={n.x} y={n.y} i={from + 3 + i * 0.4} dim={dim} />
      ))}
    </>
  );
}

// ── the three levels ─────────────────────────────────────────────────────────

/** Quiet — fine-line waves and nothing else. Whitespace carries the page. */
function Quiet({ s }: { s: Shape }) {
  return (
    <>
      <Waves s={s} opacities={[0.16, 0.2, 0.13]} />
      <Stroke
        d={wavePath(
          s.compact ? 320 : 300,
          s.compact ? 24 : 32,
          s.compact ? 460 : 1080,
          s.compact ? 120 : 320,
          s.w,
        )}
        i={3}
        opacity={0.14}
      />
    </>
  );
}

/**
 * Integrated — the quiet waves, with a branching motif over them: ten nodes,
 * linked. The partnership's whole argument is that its consultants are
 * connected rather than merely co-located, and this is that argument, drawn.
 */
function Integrated({ s }: { s: Shape }) {
  return (
    <>
      <Waves s={s} opacities={[0.11, 0.09, 0.07]} />
      <PartnerWeb s={s} />
    </>
  );
}

/**
 * Expressive — a larger flowing field, and a second tier of nodes for the
 * hospitals, NHS teams and referrers the partnership connects to. Still
 * hairlines at low opacity: greater in extent, not louder in contrast.
 */
function Expressive({ s }: { s: Shape }) {
  return (
    <>
      <Waves s={s} opacities={[0.12, 0.1, 0.08]} />
      {/* extra field lines, offset from the three shared ones */}
      {s.waves.map(([y, amp, wl, ph], i) => (
        <Stroke
          key={`x${i}`}
          d={wavePath(y - (s.compact ? 92 : 116), amp * 1.2, wl * 1.15, ph + 200, s.w)}
          i={i + 0.5}
          opacity={0.07}
        />
      ))}

      {/* partnership tier reaching down into the wider network */}
      {s.nodes.map((p, i) => {
        const q = s.outer[Math.round((i / 9) * (s.outer.length - 1))];
        return (
          <Stroke
            key={`d${i}`}
            d={edgePath(p, q, 18, s.compact)}
            i={8 + i * 0.4}
            opacity={0.08}
            width={0.8}
          />
        );
      })}

      {s.outer.slice(0, -1).map((n, i) => (
        <Stroke
          key={`o${i}`}
          d={`M ${n.x.toFixed(1)} ${n.y.toFixed(1)} L ${s.outer[i + 1].x.toFixed(1)} ${s.outer[i + 1].y.toFixed(1)}`}
          i={10 + i * 0.3}
          opacity={0.1}
          width={0.8}
        />
      ))}
      {s.outer.map((n, i) => (
        <Node
          key={`on${i}`}
          x={n.x}
          y={n.y}
          r={2.1}
          i={12 + i * 0.3}
          dim={s.compact ? 0.55 : 1}
        />
      ))}

      <PartnerWeb s={s} />
    </>
  );
}

const RENDERERS: Record<Level, (p: { s: Shape }) => JSX.Element> = {
  quiet: Quiet,
  integrated: Integrated,
  expressive: Expressive,
};

function Field({ level, shape }: { level: Level; shape: Shape }) {
  const Render = RENDERERS[level];
  return (
    <svg
      viewBox={`0 0 ${shape.w} ${shape.h}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full text-accent"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <Render s={shape} />
    </svg>
  );
}

export default function PartnershipField({
  className = "",
}: {
  className?: string;
}) {
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);

  // Read on the client after mount rather than from searchParams on the server:
  // the page stays statically rendered, and a decorative swap costs nothing.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("v");
    if (v && (LEVELS as string[]).includes(v)) setLevel(v as Level);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
      data-ambition={level}
    >
      <div className="h-full w-full md:hidden">
        <Field level={level} shape={TALL} />
      </div>
      <div className="hidden h-full w-full md:block">
        <Field level={level} shape={WIDE} />
      </div>
    </div>
  );
}
