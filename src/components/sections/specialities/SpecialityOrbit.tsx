"use client";

/*
  SpecialityOrbit — the consultants who treat a given cancer, arranged on dotted
  golden orbit rings around a central "N specialists" medallion, over the cream
  marble side of the speciality hero (see /specialities/[slug]).

  Two concentric dotted rings slowly drift (the `orbit-flow` keyframe); portraits
  alternate inner/outer ring, evenly spaced, and reveal a name chip on hover.
  Below xl it falls back to a stacked card list (which also carries the names,
  roles and treatments for SEO/accessibility).

  Hydration-safety: width is measured client-side (ResizeObserver) and the
  coordinate-dependent markup only renders once w > 0, so SSR and the first
  client render are identical. Coordinates are rounded (r2) so Node vs browser
  Math.cos ULP differences can't produce mismatched attribute strings.
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type OrbitConsultant = {
  name: string;
  slug: string;
  role?: string;
  shortRole?: string;
  photo?: string;
  hasProfile: boolean;
  modality?: string[];
};

const H = 636; // desktop orbit height
const PHOTO = 88; // portrait diameter
// every consultant gets their OWN elliptical orbit: an ellipse centred on the
// medallion, rotated so its long axis points at them (portrait at the outer
// tip). A = semi-major (distance to the portrait), B = semi-minor.
const A = 250;
const B = 108;
const NAVY = "#0a1f3f";
const GOLD = "#b98a2e";
const EASE = [0.22, 1, 0.36, 1] as const;

const r2 = (v: number) => Math.round(v * 100) / 100;

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

function Portrait({ c, size }: { c: OrbitConsultant; size: number }) {
  return (
    <span
      className="relative block overflow-hidden rounded-full bg-gradient-to-br from-[#ece2cd] to-[#f7f2e7] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 0 0 4px #ffffff, 0 4px 12px -4px rgba(61,45,10,0.3), 0 18px 36px -16px rgba(61,45,10,0.35)",
      }}
    >
      {c.photo ? (
        <Image
          src={c.photo}
          alt={`${c.name}, ${c.shortRole ?? c.role ?? ""}`}
          fill
          sizes={`${size}px`}
          className="object-cover object-top"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-display text-lg text-[#a9791a]">
          {initials(c.name)}
        </span>
      )}
    </span>
  );
}

export default function SpecialityOrbit({
  consultants,
}: {
  consultants: OrbitConsultant[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  // 0 until measured so SSR and first client render stay identical
  const [w, setW] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.getBoundingClientRect().width || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = consultants.length;
  const cx = r2(w / 2);
  const cy = r2(H / 2);

  // each consultant sits at the outer tip of their own ellipse; the ellipse is
  // rotated by `deg` so its long axis points at them. Consultants are evenly
  // (symmetrically) spaced around the centre, starting from the top.
  const nodes = consultants.map((c, i) => {
    const deg = -90 + (i * 360) / n;
    const a = (deg * Math.PI) / 180;
    return {
      ...c,
      deg: r2(deg),
      x: r2(cx + A * Math.cos(a)),
      y: r2(cy + A * Math.sin(a)),
    };
  });

  // a couple of faint gold beads riding the far arc of each orbit
  const beads = nodes.flatMap((node) => {
    const rad = (node.deg * Math.PI) / 180;
    const cr = Math.cos(rad);
    const sr = Math.sin(rad);
    return [150, 214].map((td) => {
      const t = (td * Math.PI) / 180;
      const lx = A * Math.cos(t);
      const ly = B * Math.sin(t);
      return {
        x: r2(cx + lx * cr - ly * sr),
        y: r2(cy + lx * sr + ly * cr),
        r: 2.2,
      };
    });
  });

  const ringV: Variants = {
    hidden: { opacity: 0, scale: 0.94 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.9, ease: EASE },
    },
  };
  const medV: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reduce ? 0 : 0.6,
        ease: EASE,
        delay: reduce ? 0 : 0.15,
      },
    },
  };
  const nodeV: Variants = {
    hidden: { opacity: 0, scale: 0.75 },
    show: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        duration: reduce ? 0 : 0.5,
        ease: EASE,
        delay: reduce ? 0 : 0.35 + i * 0.12,
      },
    }),
  };

  return (
    <div>
      {/* ── desktop orbit ── */}
      <div ref={ref} className="relative hidden xl:block" style={{ height: H }}>
        {w > 0 && (
          <motion.div
            className="absolute inset-0"
            // the hero orbit is above the fold on page entry, so animate on
            // mount — whileInView proved unreliable after full-page reloads
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            {/* dotted golden rings + beads */}
            <motion.svg
              className="absolute inset-0"
              width={w}
              height={H}
              viewBox={`0 0 ${w} ${H}`}
              fill="none"
              aria-hidden
              variants={ringV}
            >
              {nodes.map((node) => (
                <ellipse
                  key={node.slug}
                  cx={cx}
                  cy={cy}
                  rx={A}
                  ry={B}
                  transform={`rotate(${node.deg} ${cx} ${cy})`}
                  stroke={GOLD}
                  strokeOpacity={0.4}
                  strokeWidth={1.4}
                  strokeDasharray="0.5 8"
                  strokeLinecap="round"
                  className={reduce ? "" : "orbit-flow"}
                />
              ))}
              {beads.map((b, i) => (
                <circle
                  key={`bead-${i}`}
                  cx={b.x}
                  cy={b.y}
                  r={b.r}
                  fill={GOLD}
                  opacity={0.55}
                />
              ))}
            </motion.svg>

            {/* medallion — the -50% centring translate lives on an INNER div:
                framer-motion writes an inline transform on the motion element,
                which would clobber Tailwind translate classes placed there */}
            <motion.div
              className="absolute"
              style={{ left: cx, top: cy }}
              variants={medV}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span
                  aria-hidden
                  className="absolute -inset-4 rounded-full opacity-60 blur-lg"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 40%, rgba(185,138,46,0.25), transparent 70%)",
                  }}
                />
                <div className="relative flex h-[200px] w-[200px] flex-col items-center justify-center rounded-full border border-[#e9dab4] bg-gradient-to-b from-white to-[#f6f0e3] text-center shadow-[0_2px_4px_rgba(61,45,10,0.06),0_28px_56px_-24px_rgba(61,45,10,0.35)]">
                  <PeopleIcon className="h-8 w-8 text-[#0a1f3f]" />
                  <span className="mt-2 font-display text-[36px] leading-none text-[#0a1f3f]">
                    {n}
                  </span>
                  <span className="mt-1.5 font-display text-xl leading-none text-[#0a1f3f]">
                    specialist{n === 1 ? "" : "s"}
                  </span>
                  <span className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a9791a]">
                    here for you
                  </span>
                </div>
              </div>
            </motion.div>

            {/* portraits */}
            {nodes.map((node, i) => {
              const inner = (
                <>
                  <Portrait c={node} size={PHOTO} />
                  {/* name chip, revealed on hover */}
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2.5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full bg-white px-3.5 py-1.5 text-center opacity-0 shadow-[0_2px_4px_rgba(61,45,10,0.08),0_12px_28px_-12px_rgba(61,45,10,0.35)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="block text-[12px] font-semibold leading-tight text-[#0a1f3f]">
                      {node.name}
                    </span>
                    {node.shortRole && (
                      <span className="block text-[10px] leading-tight text-[#8a7a55]">
                        {node.shortRole}
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <motion.div
                  key={node.slug}
                  className="absolute"
                  style={{ left: node.x, top: node.y }}
                  variants={nodeV}
                  custom={i}
                >
                  {node.hasProfile ? (
                    <Link
                      href={`/consultants/${node.slug}`}
                      aria-label={`${node.name}${node.shortRole ? `, ${node.shortRole}` : ""}`}
                      className="group absolute block -translate-x-1/2 -translate-y-1/2"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="group absolute -translate-x-1/2 -translate-y-1/2">
                      {inner}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── mobile / tablet fallback ── */}
      <div className="grid gap-4 xl:hidden">
        {consultants.map((c) => {
          const inner = (
            <div className="card-soft flex items-center gap-5 p-5">
              <span className="shrink-0">
                <Portrait c={c} size={64} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg leading-tight text-ink">
                  {c.name}
                </h3>
                {c.role && <p className="text-sm text-ink-muted">{c.role}</p>}
                {c.modality && c.modality.length > 0 && (
                  <p className="mt-1.5 text-[12px] leading-snug text-[#a9791a]">
                    {c.modality.join(" · ")}
                  </p>
                )}
              </div>
            </div>
          );
          return c.hasProfile ? (
            <Link
              key={c.slug}
              href={`/consultants/${c.slug}`}
              className="group block"
            >
              {inner}
            </Link>
          ) : (
            <div key={c.slug}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
