"use client";

import { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Expressive mode: a visible flowing network.
//
// Direction matters more than decoration here. Every strand runs *inward*, from
// the edges of the frame to a single point — many people, services and sites
// converging on one patient. An outward-branching tree would animate as spread,
// which is precisely the reading this page must never invite.
//
// Geometry is deterministic (a small seeded generator, no Math.random) so the
// server and client render identical markup.
// ─────────────────────────────────────────────────────────────────────────────

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const W = 1200;
const H = 380;
const FOCUS = { x: 812, y: 196 };

export default function ExpressiveNetwork({
  className = "",
  strands = 26,
  seed = 7,
}: {
  className?: string;
  strands?: number;
  seed?: number;
}) {
  const paths = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: strands }, (_, i) => {
      const fromLeft = i % 3 !== 2;
      const x0 = fromLeft ? -40 : W + 40;
      const y0 = 20 + rand() * (H - 40);
      // Two control points pulled toward the focus, with a little lateral drift
      // so the bundle reads as organic rather than as a fan of spokes.
      const c1x = x0 + (FOCUS.x - x0) * (0.32 + rand() * 0.18);
      const c1y = y0 + (rand() - 0.5) * 150;
      const c2x = x0 + (FOCUS.x - x0) * (0.72 + rand() * 0.14);
      const c2y = FOCUS.y + (rand() - 0.5) * 90;
      return {
        d: `M${x0.toFixed(1)} ${y0.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(
          1,
        )}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${FOCUS.x} ${FOCUS.y}`,
        width: 0.6 + rand() * 1.1,
        opacity: 0.1 + rand() * 0.26,
        delay: (rand() * 14).toFixed(2),
        duration: (16 + rand() * 12).toFixed(2),
        gold: rand() > 0.78,
        node: rand() > 0.55 ? 0.35 + rand() * 0.3 : null,
      };
    });
  }, [strands, seed]);

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <radialGradient id="en-focus" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a4d8f" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#1a4d8f" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#1a4d8f" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* the light everything gathers into */}
        <circle cx={FOCUS.x} cy={FOCUS.y} r="150" fill="url(#en-focus)" />

        <g strokeLinecap="round">
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              stroke={p.gold ? "#c9a35a" : "#1a4d8f"}
              strokeOpacity={p.opacity}
              strokeWidth={p.width}
            />
          ))}
        </g>

        {/* travelling light along a subset of strands */}
        <g strokeLinecap="round">
          {paths.map((p, i) =>
            p.node ? (
              <path
                key={`f-${i}`}
                d={p.d}
                stroke={p.gold ? "#d9b878" : "#3f6fb0"}
                strokeOpacity={Math.min(0.5, p.opacity + 0.2)}
                strokeWidth={p.width + 0.35}
                pathLength={1}
                className="care-flow"
                style={{
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                }}
              />
            ) : null,
          )}
        </g>

        <circle cx={FOCUS.x} cy={FOCUS.y} r="4.5" fill="#061c46" fillOpacity="0.5" />
      </svg>
    </div>
  );
}
