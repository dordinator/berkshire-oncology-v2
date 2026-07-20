"use client";

/*
  HeadingSwoosh — the home-page HeroSwoosh technique behind the /consultants
  title: a bundle of silk hairline strands following one spine, spreading on a
  pinch envelope so they converge to a single point and the strand order
  inverts there — ONE twist. Blue palette with the odd gold strand (on white,
  not the hero's white-on-navy). Draws on left→right on mount; static under
  reduced motion. Geometry is measured (ResizeObserver) and built in px so the
  spine fits the heading band; renders only once w > 0 (SSR-safe).
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// dark → light blue, top strand to bottom strand
const BLUE_DARK = [12, 42, 84]; // #0c2a54
const BLUE_LIGHT = [178, 206, 236]; // #b2ceec

function blueShade(t: number) {
  const c = BLUE_DARK.map((d, i) =>
    Math.round(d + (BLUE_LIGHT[i] - d) * t),
  );
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

const STRANDS = 26;
const SAMPLES = 48;

type Pt = { x: number; y: number };

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}
function cubicDeriv(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  const f = (n: number) => n.toFixed(2);
  let d = `M ${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

function build(w: number, h: number) {
  const midY = h * 0.5;
  const spread = h * 0.28; // thinner fan
  // one gentle spine across the band
  const p0 = { x: -60, y: midY + h * 0.12 };
  const p1 = { x: w * 0.33, y: midY - h * 0.18 };
  const p2 = { x: w * 0.67, y: midY + h * 0.18 };
  const p3 = { x: w + 60, y: midY - h * 0.1 };

  const spineAt = (s: number) => {
    const point = cubic(p0, p1, p2, p3, s);
    const d = cubicDeriv(p0, p1, p2, p3, s);
    const len = Math.hypot(d.x, d.y) || 1;
    return { point, normal: { x: -d.y / len, y: d.x / len } };
  };

  const out: { d: string; color: string; opacity: number; width: number }[] = [];
  for (let i = 0; i < STRANDS; i++) {
    const u = (i / (STRANDS - 1)) * 2 - 1; // -1..1
    const edge = Math.abs(u);
    const phase = u * Math.PI * 1.1;
    const weave = (0.05 + 0.05 * edge) * spread;

    const pts: Pt[] = [];
    let prevN: Pt | null = null;
    for (let k = 0; k <= SAMPLES; k++) {
      const s = k / SAMPLES;
      const { point, normal } = spineAt(s);
      let n = normal;
      if (prevN && n.x * prevN.x + n.y * prevN.y < 0) n = { x: -n.x, y: -n.y };
      prevN = n;

      const fromCentre = Math.abs(2 * s - 1);
      const envelope = 0.5 + 0.5 * Math.pow(fromCentre, 1.2);
      const flip = Math.cos(Math.PI * (s - u * 0.06)); // +1 → 0 → −1 : ONE twist
      const drift = Math.sin(s * Math.PI * 2 + phase) * weave * envelope * 0.5;
      const offset = u * spread * envelope * flip + drift;

      pts.push({ x: point.x + n.x * offset, y: point.y + n.y * offset });
    }

    out.push({
      d: smoothPath(pts),
      color: blueShade(i / (STRANDS - 1)),
      opacity: 0.55 - edge * 0.14,
      width: 1.15 - edge * 0.4,
    });
  }
  return out;
}

export default function HeadingSwoosh({
  className = "",
}: {
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setDims({ w: el.clientWidth || 0, h: el.clientHeight || 0 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const strands = useMemo(
    () => (dims.w > 0 ? build(dims.w, dims.h) : []),
    [dims.w, dims.h],
  );

  return (
    <div ref={ref} aria-hidden className={className}>
      {dims.w > 0 && (
        <svg
          className="h-full w-full"
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          fill="none"
          preserveAspectRatio="none"
        >
          {strands.map((s, i) => (
            <motion.path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeOpacity={s.opacity}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? undefined : { pathLength: 0 }}
              animate={reduce ? undefined : { pathLength: 1 }}
              transition={{
                duration: 1.8,
                delay: 0.15 + i * 0.03,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
