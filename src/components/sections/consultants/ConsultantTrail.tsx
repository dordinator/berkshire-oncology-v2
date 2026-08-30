"use client";

/*
  ConsultantTrail — the "care pathway": consultants presented as portraits
  threaded onto a flowing line.

  Desktop (xl+): a gradient, softly-glowing serpentine path runs top→bottom from
  a "N experts" medallion, weaving through consultant portraits that alternate
  left/right of centre. Each portrait sits on the line like a bead — layered
  rings, a soft halo and a deep navy shadow give it presence — with the name,
  role, specialty tags and a "View profile" link set on the outer side. A soft
  light travels down the path. Everything draws on (framer-motion) and re-draws
  when the filtered list changes.

  Below xl: a refined vertical list with a gradient rail.
  prefers-reduced-motion renders everything static.
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type TrailConsultant = {
  slug: string;
  name: string;
  shortRole: string;
  role: string;
  photo: string;
  specialities: { slug: string; name: string }[];
};

const PHOTO = 132; // desktop portrait diameter
const TW = 224; // text-block width beside each node
const GAP = 26; // portrait → text gap in the amplitude maths (≥ the mr-6 = 24px used visually)
const ROW_H = 202; // vertical spacing between nodes
const HEAD = 172; // space reserved for the medallion
const PAD_BOTTOM = 60;
const EASE = [0.22, 1, 0.36, 1] as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

// Catmull-Rom → cubic bézier, for a smooth flowing line through the points.
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

const HALO =
  "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--brand-blue) 28%, transparent), color-mix(in srgb, var(--brand-blue) 12%, transparent) 46%, transparent 72%)";

function Tags({
  items,
  align,
}: {
  items: { slug: string; name: string }[];
  align: "start" | "end";
}) {
  const shown = items.slice(0, 3);
  const extra = items.length - shown.length;
  return (
    <div
      className={`mt-3 flex flex-wrap gap-1.5 ${
        align === "end" ? "justify-end" : "justify-start"
      }`}
    >
      {shown.map((s) => (
        <span
          key={s.slug}
          className="type-supporting rounded-full border border-ink/[0.06] bg-white px-2.5 py-1 font-medium leading-none text-ink-muted shadow-[0_1px_2px_rgba(6,28,70,0.04)]"
        >
          {s.name}
        </span>
      ))}
      {extra > 0 && (
        <span className="type-supporting px-1 py-1 font-medium leading-none text-ink-muted/60">
          +{extra}
        </span>
      )}
    </div>
  );
}

function ViewProfile() {
  return (
    <span className="type-button mt-3.5 inline-flex items-center gap-1.5 text-accent">
      View profile
      <svg
        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function Portrait({
  src,
  alt,
  size,
  ringPx,
}: {
  src: string;
  alt: string;
  size: number;
  ringPx: number;
}) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      {/* soft colour halo — blooms on hover */}
      <span
        aria-hidden
        className="absolute -inset-5 rounded-full opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: HALO }}
      />
      {/* thin accent ring, just outside the white edge */}
      <span
        aria-hidden
        className="absolute rounded-full border border-accent/25 transition-colors duration-500 group-hover:border-accent/50"
        style={{ inset: -(ringPx + 3) }}
      />
      {/* the photo — white ring + layered navy shadow in one box-shadow */}
      <span
        className="relative block overflow-hidden rounded-full bg-gradient-to-br from-accent/10 to-accent-glow/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 0 ${ringPx}px #ffffff, 0 6px 16px -6px rgba(6,28,70,0.4), 0 22px 46px -18px rgba(6,28,70,0.45)`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
        />
      </span>
    </span>
  );
}

export default function ConsultantTrail({
  items,
}: {
  items: TrailConsultant[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(860);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.getBoundingClientRect().width || 860);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const centerX = w / 2;
  // amplitude shrinks the braid at narrow widths so the outer text never clips
  const A = clamp(w / 2 - (PHOTO / 2 + GAP + TW), 54, 185);
  const nodes = items.map((c, i) => {
    const left = i % 2 === 0;
    return {
      ...c,
      left,
      x: centerX + (left ? -A : A),
      y: HEAD + i * ROW_H + PHOTO / 2,
    };
  });
  const totalH = HEAD + items.length * ROW_H + PAD_BOTTOM;
  const pathPts = [
    { x: centerX, y: HEAD - 34 },
    ...nodes.map((n) => ({ x: n.x, y: n.y })),
  ];
  const dPath = smoothPath(pathPts);
  const sig = items.map((i) => i.slug).join(",");

  const pathV: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: reduce ? 0 : 1.8, ease: EASE },
        opacity: { duration: reduce ? 0 : 0.5 },
      },
    },
  };
  const nodeV: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 8 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.6,
        ease: EASE,
        delay: reduce ? 0 : 0.25 + i * 0.13,
      },
    }),
  };
  const medV: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.6, ease: EASE },
    },
  };

  return (
    <div>
      {/* ── desktop: the care pathway ── */}
      <div ref={ref} className="relative hidden xl:block">
        {/* ambient depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-[12%] h-80 w-80 rounded-full bg-accent/[0.07] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-[58%] h-72 w-72 rounded-full bg-accent-glow/25 blur-3xl"
        />

        <motion.div
          key={sig}
          className="relative"
          style={{ height: totalH }}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <svg
            className="absolute inset-0"
            width={w}
            height={totalH}
            viewBox={`0 0 ${w} ${totalH}`}
            fill="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="trail-stroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--brand-blue)" />
                <stop
                  offset="0.55"
                  stopColor="color-mix(in srgb, var(--brand-blue) 78%, white)"
                />
                <stop
                  offset="1"
                  stopColor="color-mix(in srgb, var(--brand-blue) 38%, white)"
                />
              </linearGradient>
              <filter
                id="trail-glow"
                x="-30%"
                y="-2%"
                width="160%"
                height="104%"
              >
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>
            {/* glow underlay */}
            <motion.path
              d={dPath}
              stroke="url(#trail-stroke)"
              strokeWidth={7}
              strokeOpacity={0.22}
              strokeLinecap="round"
              filter="url(#trail-glow)"
              variants={pathV}
            />
            {/* crisp line */}
            <motion.path
              d={dPath}
              stroke="url(#trail-stroke)"
              strokeWidth={2.4}
              strokeOpacity={0.85}
              strokeLinecap="round"
              variants={pathV}
            />
          </svg>

          {/* travelling light */}
          {!reduce && (
            <span
              key={`comet-${sig}`}
              aria-hidden
              className="trail-comet pointer-events-none absolute left-0 top-0 h-3 w-3 rounded-full"
              style={{
                offsetPath: `path('${dPath}')`,
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.95), color-mix(in srgb, var(--brand-blue) 38%, white) 40%, transparent 72%)",
                boxShadow:
                  "0 0 14px 5px color-mix(in srgb, var(--brand-blue) 45%, transparent)",
              }}
            />
          )}

          {/* medallion */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: centerX, top: HEAD - 88 }}
            variants={medV}
          >
            <span
              aria-hidden
              className="absolute -inset-6 rounded-full opacity-70 blur-lg"
              style={{ background: HALO }}
            />
            <span
              aria-hidden
              className="absolute -inset-2 rounded-full border border-accent/15"
            />
            <div className="relative flex h-[140px] w-[140px] flex-col items-center justify-center rounded-full border border-white bg-gradient-to-b from-white to-canvas-soft text-center shadow-[0_2px_4px_rgba(6,28,70,0.05),0_26px_54px_-22px_rgba(6,28,70,0.4)]">
              <PeopleIcon className="h-7 w-7 text-accent" />
              <span className="mt-2 font-display text-[22px] leading-none text-ink">
                {items.length}{" "}
                {items.length === 1 ? "expert" : "experts"}
              </span>
              <span className="type-label mt-1.5 text-accent">
                Here for you
              </span>
            </div>
          </motion.div>

          {/* nodes */}
          {nodes.map((n, i) => (
            <motion.div
              key={n.slug}
              className="absolute"
              style={{ left: n.x, top: n.y }}
              variants={nodeV}
              custom={i}
            >
              <Link
                href={`/consultants/${n.slug}`}
                className="group absolute block -translate-x-1/2 -translate-y-1/2"
              >
                <Portrait
                  src={n.photo}
                  alt={`${n.name}, ${n.shortRole}`}
                  size={PHOTO}
                  ringPx={5}
                />

                {/* text block, on the outer side */}
                <div
                  className={`absolute top-1/2 flex -translate-y-1/2 flex-col ${
                    n.left
                      ? "right-full mr-6 items-end text-right"
                      : "left-full ml-6 items-start text-left"
                  }`}
                  style={{ width: TW }}
                >
                  <p className="type-label text-accent-soft">
                    {n.shortRole}
                  </p>
                  <h3 className="type-compact-title mt-1 text-ink transition-colors duration-300 group-hover:text-accent">
                    {n.name}
                  </h3>
                  <Tags
                    items={n.specialities}
                    align={n.left ? "end" : "start"}
                  />
                  <ViewProfile />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── compact list (below xl) ── */}
      <div className="relative xl:hidden">
        <span
          aria-hidden
          className="absolute bottom-10 left-[34px] top-10 w-[2px] rounded-full bg-gradient-to-b from-accent/50 via-accent-soft/40 to-accent-glow/40"
        />
        <ul className="space-y-7">
          {items.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/consultants/${c.slug}`}
                className="group flex items-center gap-5"
              >
                <span className="relative z-10 shrink-0">
                  <Portrait
                    src={c.photo}
                    alt={`${c.name}, ${c.shortRole}`}
                    size={72}
                    ringPx={4}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="type-label text-accent-soft">
                    {c.shortRole}
                  </p>
                  <h3 className="type-compact-title text-ink transition-colors duration-300 group-hover:text-accent">
                    {c.name}
                  </h3>
                  <Tags items={c.specialities} align="start" />
                </div>
                <span className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-ink/[0.08] bg-white text-accent shadow-sm transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PeopleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7.5 18.5c0-2.5 2-4.3 4.5-4.3s4.5 1.8 4.5 4.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="5.2" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="18.8" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M2.5 18c0-1.9 1.3-3.2 3-3.4M21.5 18c0-1.9-1.3-3.2-3-3.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
