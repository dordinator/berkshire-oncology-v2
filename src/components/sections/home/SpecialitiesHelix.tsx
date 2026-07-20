"use client";

/*
  SpecialitiesHelix — the desktop "cancers we treat" band.

  The centre connector is a DNA double helix: two sine strands
  (y = MID ± AMP·cos(2π·PERIODS·x)) that cross each other, with faint
  rungs (base pairs) between them and a node where each icon meets a strand.
  The 18 icons ride the strands (gentle vertical undulation) and the two
  rows are staggered by half a column so they no longer read as pairs.

  Everything draws itself on when the band scrolls into view (framer-motion
  pathLength 0→1, staggered left-to-right); prefers-reduced-motion shows the
  finished, static drawing.
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { specialityIcon } from "@/components/site/SpecialityIcons";

type Item = { slug: string; title: string };

export function IconCircle({ slug }: { slug: string }) {
  const Icon = specialityIcon[slug];
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/75 transition-colors duration-300 group-hover:border-accent-glow/70 group-hover:text-white md:h-[52px] md:w-[52px]">
      {Icon ? <Icon className="h-6 w-6" /> : null}
    </span>
  );
}

export function Label({
  children,
  fixed,
}: {
  children: React.ReactNode;
  fixed?: boolean;
}) {
  return (
    <span
      className={`mt-3 px-1 text-center text-[11px] leading-tight text-white/55 transition-colors duration-300 group-hover:text-white ${
        fixed ? "flex h-12 items-start justify-center" : ""
      }`}
    >
      {children}
    </span>
  );
}

// ── helix geometry (px, in the band's own coordinate space) ──
const H = 452; // band height
const MID = 226; // strand vertical centre
const AMP = 24; // strand amplitude (± from MID)
const PERIODS = 3; // wave periods across the width
const ICON_OFFSET = 96; // MID → icon-row centre (keeps icons clear of the helix)
const ICON_WAVE = 9; // gentle icon undulation (kept small so icons never dip in)
const INSET = 0.04; // horizontal padding (fraction of width)

const strandY = (frac: number, sign: 1 | -1) =>
  MID + sign * AMP * Math.cos(2 * Math.PI * PERIODS * frac);

// outer edge of the helix ribbon at a given x (upper = -1, lower = +1) — icons
// tether to this envelope so their stems meet the helix without crossing it.
const envelopeY = (frac: number, side: 1 | -1) =>
  MID + side * AMP * Math.abs(Math.cos(2 * Math.PI * PERIODS * frac));

function strandPath(w: number, sign: 1 | -1) {
  const steps = Math.max(30, Math.round(w / 6));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const x = (frac * w).toFixed(1);
    const y = strandY(frac, sign).toFixed(1);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SpecialitiesHelix({
  top,
  bottom,
}: {
  top: Item[];
  bottom: Item[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(920);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.getBoundingClientRect().width || 920);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // horizontal placement: 9 evenly-spaced columns, the two rows offset by
  // half a column (±¼ each way) so tops and bottoms interleave.
  const u = 1 - 2 * INSET;
  const col = u / 9;
  const topFrac = (k: number) => INSET + col * (k + 0.5) - col * 0.25;
  const botFrac = (k: number) => INSET + col * (k + 0.5) + col * 0.25;
  // keep each label inside its own column lane so same-row labels never collide
  const laneW = Math.max(64, col * w - 6);

  const wave = (frac: number) => Math.cos(2 * Math.PI * PERIODS * frac);
  const icons = [
    ...top.map((s, k) => {
      const frac = topFrac(k);
      return {
        ...s,
        row: "top" as const,
        frac,
        x: frac * w,
        nodeY: envelopeY(frac, -1), // sits on the helix's upper edge
        iconY: MID - ICON_OFFSET - ICON_WAVE * wave(frac),
      };
    }),
    ...bottom.map((s, k) => {
      const frac = botFrac(k);
      return {
        ...s,
        row: "bottom" as const,
        frac,
        x: frac * w,
        nodeY: envelopeY(frac, 1), // sits on the helix's lower edge
        iconY: MID + ICON_OFFSET + ICON_WAVE * wave(frac),
      };
    }),
  ];
  // draw order runs left-to-right so the whole band unspools in one sweep
  const order = new Map(
    [...icons]
      .sort((a, b) => a.frac - b.frac)
      .map((it, i) => [it.slug, i] as const)
  );

  // rungs (base pairs) sampled evenly across the strands
  const rungCount = Math.max(12, Math.round(w / 26));
  const rungs = Array.from({ length: rungCount + 1 }, (_, i) => {
    const frac = INSET + u * (i / rungCount);
    return {
      i,
      x: frac * w,
      y1: strandY(frac, -1),
      y2: strandY(frac, 1),
      opacity: 0.05 + 0.11 * (Math.abs(Math.cos(2 * Math.PI * PERIODS * frac))),
    };
  });

  const strandV: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: reduce ? 0 : 1.7,
          ease: EASE,
          delay: reduce ? 0 : 0.1 + i * 0.2,
        },
        opacity: { duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1 + i * 0.2 },
      },
    }),
  };
  const drawV: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: reduce ? 0 : 0.45,
        ease: EASE,
        delay: reduce ? 0 : 0.55 + i * 0.02,
      },
    }),
  };
  const popV: Variants = {
    hidden: { opacity: 0, scale: 0 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: reduce ? 0 : 0.4,
        ease: EASE,
        delay: reduce ? 0 : 0.7 + i * 0.035,
      },
    }),
  };
  const iconV: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : 0.6,
        ease: EASE,
        delay: reduce ? 0 : 0.35 + i * 0.04,
      },
    }),
  };

  return (
    <motion.div
      ref={ref}
      className="relative"
      style={{ height: H }}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        width={w}
        height={H}
        viewBox={`0 0 ${w} ${H}`}
        fill="none"
        aria-hidden
      >
        {/* rungs — the base pairs between the two strands */}
        {rungs.map((r) => (
          <motion.line
            key={`rung-${r.i}`}
            x1={r.x}
            y1={r.y1}
            x2={r.x}
            y2={r.y2}
            stroke="#ffffff"
            strokeWidth={1}
            strokeOpacity={r.opacity}
            strokeLinecap="round"
            variants={drawV}
            custom={r.i}
          />
        ))}

        {/* stems — icon to its strand node */}
        {icons.map((it) => {
          const i = order.get(it.slug)!;
          const edge = it.row === "top" ? it.iconY + 26 : it.iconY - 26;
          return (
            <motion.line
              key={`stem-${it.slug}`}
              x1={it.x}
              y1={it.nodeY}
              x2={it.x}
              y2={edge}
              stroke="#ffffff"
              strokeWidth={1}
              strokeOpacity={0.14}
              strokeLinecap="round"
              variants={drawV}
              custom={i}
            />
          );
        })}

        {/* the two strands */}
        <motion.path
          d={strandPath(w, -1)}
          stroke="#9fb9dc"
          strokeWidth={1.6}
          strokeOpacity={0.55}
          strokeLinecap="round"
          variants={strandV}
          custom={0}
        />
        <motion.path
          d={strandPath(w, 1)}
          stroke="#6f86ad"
          strokeWidth={1.6}
          strokeOpacity={0.42}
          strokeLinecap="round"
          variants={strandV}
          custom={1}
        />

        {/* nodes where each icon meets its strand */}
        {icons.map((it) => {
          const i = order.get(it.slug)!;
          return (
            <motion.circle
              key={`node-${it.slug}`}
              cx={it.x}
              cy={it.nodeY}
              r={3}
              fill="#dbe6f5"
              fillOpacity={0.6}
              variants={popV}
              custom={i}
              style={{ transformOrigin: `${it.x}px ${it.nodeY}px` } as React.CSSProperties}
            />
          );
        })}
      </svg>

      {/* the icons themselves, riding the strands */}
      {icons.map((it) => {
        const i = order.get(it.slug)!;
        return (
          <motion.div
            key={it.slug}
            className="absolute"
            style={{ left: it.x, top: it.iconY }}
            variants={iconV}
            custom={i}
          >
            <div style={{ transform: "translate(-50%, -50%)" }}>
              <Link
                href={`/specialities/${it.slug}`}
                className="group relative block"
              >
                <IconCircle slug={it.slug} />
                <span
                  className={`pointer-events-none absolute left-1/2 -translate-x-1/2 text-center text-[11px] leading-tight text-white/55 transition-colors duration-300 group-hover:text-white ${
                    it.row === "top" ? "bottom-full mb-2" : "top-full mt-2"
                  }`}
                  style={{ width: laneW }}
                >
                  {it.title}
                </span>
              </Link>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
