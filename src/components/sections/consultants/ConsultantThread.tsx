"use client";

/*
  ConsultantThread — the /consultants layout: the partners in rows of 3-4-3,
  threaded on ONE continuous line that flows left→right across row 1, U-turns
  down the right into row 2 (right→left), U-turns down the left into row 3
  (left→right). Small glyph "nodes" sit on the line between portraits.

  The whole thing starts from ONE moment — when the thread first scrolls into
  view (`started`). The line draws on and every portrait + node fades in with a
  delay equal to how far along the line it sits, so they reveal as the line
  reaches them. Because all delays count from the same `started` instant, a
  portrait low in the thread still reveals in step with the line (not only once
  it individually scrolls in). The line/nodes mount after the layout is measured,
  so they use an explicit initial→animate (which animates even when mounting
  late); the always-present portraits inherit the trigger via variants.

  Geometry (wrapper size + each row's vertical centre) is measured with a
  ResizeObserver. Below lg the line hides and all consultants fall back to a
  simple 2/3-col grid.
*/

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

export type ThreadConsultant = {
  slug: string;
  name: string;
  shortRole: string;
  photo: string;
  specialities: { slug: string; name: string }[];
};

const PORTRAIT = 138;
const BAND = 178;
const AMP = 10;
const GAP = 28;
const LINE_DUR = 2.6;
const EASE = [0.22, 1, 0.36, 1] as const;

function waveOffset(pct: number, flip: boolean) {
  return AMP * Math.sin((pct / 100) * Math.PI * 2.3 + (flip ? Math.PI : 0.6));
}

// inverse of ease-in-out (sinusoidal): length-fraction → time-fraction
function easeInOutInverse(L: number) {
  const x = Math.min(1, Math.max(0, L));
  return Math.acos(1 - 2 * x) / Math.PI;
}

function rowSizes(n: number): number[] {
  if (n === 10) return [3, 4, 3];
  const sizes: number[] = [];
  let r = n;
  while (r > 0) {
    sizes.push(Math.min(4, r));
    r -= 4;
  }
  return sizes;
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const cellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 8 },
  show: (delay: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay },
  }),
};

function NodeGlyph({ kind }: { kind: number }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (((kind % 4) + 4) % 4) {
    case 0:
      return (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <circle cx="10" cy="7" r="2.2" {...p} />
          <path d="M5.8 15c.5-2.2 2.1-3.4 4.2-3.4s3.7 1.2 4.2 3.4" {...p} />
        </svg>
      );
    case 1:
      return (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <path d="M10 3.5c1.8 0 2.8 1.4 2.8 3 0 3-3.4 5.6-5.4 9" {...p} />
          <path d="M10 3.5c-1.8 0-2.8 1.4-2.8 3 0 3 3.4 5.6 5.4 9" {...p} />
        </svg>
      );
    case 2:
      return (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <path
            d="M10 15.5C6.5 13 4.5 10.8 4.5 8.4c0-1.7 1.3-3 2.9-3 1 0 2 .5 2.6 1.5.6-1 1.6-1.5 2.6-1.5 1.6 0 2.9 1.3 2.9 3 0 2.4-2 4.6-5.5 7.1Z"
            {...p}
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <path d="M10 6v8M6 10h8" {...p} />
        </svg>
      );
  }
}

function Cell({ c, delay }: { c: ThreadConsultant; delay: number }) {
  return (
    <motion.div variants={cellVariants} custom={delay}>
      <Link
        href={`/consultants/${c.slug}`}
        className="group flex flex-col items-center text-center"
      >
        <span
          className="relative z-10 flex items-center justify-center"
          style={{ height: BAND }}
        >
          {/* golden backlight glow behind the portrait */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500 group-hover:opacity-100"
            style={{
              width: PORTRAIT * 1.85,
              height: PORTRAIT * 1.85,
              opacity: 0.85,
              background:
                "radial-gradient(circle, rgba(201,161,79,0.5) 0%, rgba(201,161,79,0.16) 42%, transparent 70%)",
            }}
          />
          <span
            className="relative block overflow-hidden rounded-full bg-gradient-to-br from-canvas-soft to-white shadow-[0_0_0_6px_#ffffff,0_2px_8px_rgba(20,35,70,0.12),0_24px_44px_-20px_rgba(20,35,70,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            style={{ width: PORTRAIT, height: PORTRAIT }}
          >
            {c.photo ? (
              <Image
                src={c.photo}
                alt={`${c.name}, ${c.shortRole}`}
                fill
                sizes={`${PORTRAIT}px`}
                className="object-cover object-top"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-3xl text-accent-soft">
                {initials(c.name)}
              </span>
            )}
          </span>
        </span>

        <span className="mt-3 block text-base font-semibold leading-tight text-ink transition-colors group-hover:text-accent">
          {c.name}
        </span>
        <span className="mt-1 block text-[13px] text-ink-muted">
          {c.shortRole}
        </span>

        {c.specialities.length > 0 && (
          <span className="mt-3 flex max-w-[230px] flex-wrap items-center justify-center gap-1.5">
            {c.specialities.slice(0, 4).map((s) => (
              <span
                key={s.slug}
                className="rounded-full bg-white px-2.5 py-1 text-[11px] leading-none text-ink-soft shadow-[0_1px_2px_rgba(20,35,70,0.08)] ring-1 ring-ink/10"
              >
                {s.name}
              </span>
            ))}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

export default function ConsultantThread({
  consultants,
}: {
  consultants: ThreadConsultant[];
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dims, setDims] = useState<{ w: number; h: number; rowY: number[] }>({
    w: 0,
    h: 0,
    rowY: [],
  });

  const sizes = useMemo(() => rowSizes(consultants.length), [consultants.length]);
  const rowStart = useMemo(() => {
    const s: number[] = [];
    let acc = 0;
    for (const sz of sizes) {
      s.push(acc);
      acc += sz;
    }
    return s;
  }, [sizes]);
  const rows = useMemo(
    () => sizes.map((sz, ri) => consultants.slice(rowStart[ri], rowStart[ri] + sz)),
    [consultants, sizes, rowStart],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const update = () =>
      setDims({
        w: wrap.clientWidth || 0,
        h: wrap.clientHeight || 0,
        rowY: rowRefs.current.map((el) => (el ? el.offsetTop + BAND / 2 : 0)),
      });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [rows.length]);

  const { w, rowY } = dims;

  const { d, nodes, cellDelays } = useMemo(() => {
    const empty = {
      d: "",
      nodes: [] as { x: number; y: number; kind: number; delay: number }[],
      cellDelays: consultants.map(() => 0),
    };
    if (w <= 0 || rowY.length !== rows.length || rowY.some((v) => v <= 0))
      return empty;

    const centersByRow = rows.map((row) => {
      const k = row.length;
      const colW = (w - (k - 1) * GAP) / k;
      return Array.from({ length: k }, (_, i) => i * (colW + GAP) + colW / 2);
    });
    const waveY = (ri: number, x: number) =>
      rowY[ri] + waveOffset((x / w) * 100, ri % 2 === 1);
    const f = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;

    // ── path ──
    let path = "";
    let prevEnd: { x: number; y: number } | null = null;
    rows.forEach((_, ri) => {
      const centres = centersByRow[ri];
      const leftX = centres[0];
      const rightX = centres[centres.length - 1];
      const goingRight = ri % 2 === 0;
      const sX = goingRight ? leftX : rightX;
      const eX = goingRight ? rightX : leftX;

      const stp = Math.max(10, Math.abs(eX - sX) / 60);
      const pts: [number, number][] = [];
      if (goingRight) for (let x = sX; x < eX; x += stp) pts.push([x, waveY(ri, x)]);
      else for (let x = sX; x > eX; x -= stp) pts.push([x, waveY(ri, x)]);
      pts.push([eX, waveY(ri, eX)]);

      if (ri === 0) {
        path = `M ${pts.map(([x, y]) => f(x, y)).join(" L ")}`;
      } else {
        const p0 = prevEnd!;
        const p1y = waveY(ri, sX);
        const turnRight = (ri - 1) % 2 === 0;
        const gap = Math.abs(p1y - p0.y);
        let bulge: number;
        if (turnRight) {
          const room = w + 12 - Math.max(p0.x, sX);
          bulge = Math.max(p0.x, sX) + Math.min(gap * 0.42, room);
        } else {
          const room = Math.min(p0.x, sX) + 12;
          bulge = Math.min(p0.x, sX) - Math.min(gap * 0.42, room);
        }
        path += ` C ${f(bulge, p0.y)}, ${f(bulge, p1y)}, ${f(sX, p1y)}`;
        path += ` L ${pts.slice(1).map(([x, y]) => f(x, y)).join(" L ")}`;
      }
      prevEnd = { x: eX, y: waveY(ri, eX) };
    });

    // ── arrival fractions along the visit-order polyline ──
    const visit: { gi: number; x: number; y: number; ri: number }[] = [];
    rows.forEach((row, ri) => {
      const centres = centersByRow[ri];
      const order = row.map((_, i) => i);
      if (ri % 2 === 1) order.reverse();
      order.forEach((li) =>
        visit.push({
          gi: rowStart[ri] + li,
          x: centres[li],
          y: waveY(ri, centres[li]),
          ri,
        }),
      );
    });
    const cums = [0];
    for (let i = 1; i < visit.length; i++) {
      const a = visit[i - 1];
      const b = visit[i];
      let dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (a.ri !== b.ri) dist *= 1.4;
      cums.push(cums[i - 1] + dist);
    }
    const total = cums[cums.length - 1] || 1;
    const fracByGi: Record<number, number> = {};
    visit.forEach((v, i) => (fracByGi[v.gi] = cums[i] / total));
    const delayFor = (frac: number) => LINE_DUR * easeInOutInverse(frac);

    const cellDelays = consultants.map((_, gi) => delayFor(fracByGi[gi] ?? 0));

    const nd: { x: number; y: number; kind: number; delay: number }[] = [];
    rows.forEach((_, ri) => {
      const centres = centersByRow[ri];
      for (let i = 1; i < centres.length; i++) {
        const x = (centres[i - 1] + centres[i]) / 2;
        const fa = fracByGi[rowStart[ri] + i - 1] ?? 0;
        const fb = fracByGi[rowStart[ri] + i] ?? 0;
        nd.push({ x, y: waveY(ri, x), kind: i + ri, delay: delayFor((fa + fb) / 2) });
      }
    });

    return { d: path, nodes: nd, cellDelays };
  }, [w, rowY, rows, rowStart, consultants]);

  // one shared start: the moment the thread first scrolls into view
  const inView = useInView(wrapRef, { once: true, margin: "-120px" });
  const started = reduce || inView;

  return (
    <div>
      {/* desktop threaded layout (lg+) */}
      <motion.div
        ref={wrapRef}
        className="relative hidden lg:block"
        initial={reduce ? false : "hidden"}
        animate={started ? "show" : "hidden"}
      >
        {d && (
          <svg
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={w}
            height={dims.h}
            viewBox={`0 0 ${w} ${dims.h}`}
            fill="none"
          >
            <defs>
              {/* navy → accent → glow, left to right across the thread */}
              <linearGradient
                id="thread-grad"
                gradientUnits="userSpaceOnUse"
                x1={0}
                y1={0}
                x2={w}
                y2={0}
              >
                <stop offset="0" stopColor="#0a2450" />
                <stop offset="0.5" stopColor="#1a4d8f" />
                <stop offset="1" stopColor="#a9c4e6" />
              </linearGradient>
              <filter
                id="thread-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                {/* soft edges: the strand fades smoothly from its centre outward */}
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>

            {/* single soft-edged gradient strand */}
            <motion.path
              d={d}
              stroke="url(#thread-grad)"
              strokeWidth={2.6}
              strokeLinecap="round"
              filter="url(#thread-glow)"
              initial={reduce ? false : { pathLength: 0 }}
              animate={started ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: reduce ? 0 : LINE_DUR, ease: "easeInOut" }}
            />

            {/* travelling "water packet": a tapered bulge + a light core that
                run along the strand (rotating to follow it), so the line swells
                then narrows as it passes — like a hose carrying a pulse */}
            {!reduce && (
              <>
                <ellipse
                  cx={0}
                  cy={0}
                  rx={17}
                  ry={4.6}
                  fill="url(#thread-grad)"
                  filter="url(#thread-glow)"
                  opacity={0}
                >
                  <animateMotion
                    dur="8s"
                    begin={`${LINE_DUR}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                    path={d}
                  />
                  <animate
                    attributeName="opacity"
                    dur="8s"
                    begin={`${LINE_DUR}s`}
                    repeatCount="indefinite"
                    values="0;0.9;0.9;0"
                    keyTimes="0;0.09;0.9;1"
                  />
                </ellipse>
                <ellipse
                  cx={0}
                  cy={0}
                  rx={9}
                  ry={2.2}
                  fill="#eaf3ff"
                  filter="url(#thread-glow)"
                  opacity={0}
                >
                  <animateMotion
                    dur="8s"
                    begin={`${LINE_DUR}s`}
                    repeatCount="indefinite"
                    rotate="auto"
                    path={d}
                  />
                  <animate
                    attributeName="opacity"
                    dur="8s"
                    begin={`${LINE_DUR}s`}
                    repeatCount="indefinite"
                    values="0;1;1;0"
                    keyTimes="0;0.09;0.9;1"
                  />
                </ellipse>
              </>
            )}
          </svg>
        )}

        <div className="space-y-16">
          {rows.map((row, ri) => (
            <div
              key={ri}
              ref={(el) => {
                rowRefs.current[ri] = el;
              }}
              className="relative"
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                  columnGap: GAP,
                }}
              >
                {row.map((c, i) => (
                  <Cell
                    key={c.slug}
                    c={c}
                    delay={reduce ? 0 : cellDelays[rowStart[ri] + i]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* mobile / tablet fallback */}
      <motion.div
        className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:hidden"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
      >
        {consultants.map((c, i) => (
          <Cell key={c.slug} c={c} delay={reduce ? 0 : (i % 3) * 0.08} />
        ))}
      </motion.div>
    </div>
  );
}
