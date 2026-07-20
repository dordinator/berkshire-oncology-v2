"use client";

/*
  SpecialityConstellation — the /specialities index "solar system": every cancer
  type is a white icon-bubble arranged on faint golden orbit rings around a
  central "Comprehensive Cancer Care" medallion. Rings gently shimmer; bubbles
  stay fixed and readable (lift on hover).

  Desktop (xl+) shows the orbit; below xl it falls back to a responsive grid of
  the same bubbles. Positions are measured client-side (ResizeObserver) and only
  rendered once w > 0 so SSR and the first client render match; coords are
  rounded (r2) to avoid Node/browser ULP drift. Links + labels render in the
  initial HTML (SSR) so they stay crawlable.
*/

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { specialityIcon } from "@/components/site/SpecialityIcons";

export type ConstellationItem = {
  slug: string;
  title: string;
  count: number;
};

const H = 830; // desktop diagram height
const BUBBLE = 130; // bubble diameter
const ICON = "#b0894e";
const NAVY = "#0a1f3f";

const r2 = (v: number) => Math.round(v * 100) / 100;

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

function Bubble({ item, size = BUBBLE }: { item: ConstellationItem; size?: number }) {
  const Icon = specialityIcon[item.slug];
  return (
    <Link
      href={`/specialities/${item.slug}`}
      className="group flex flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_2px_6px_rgba(61,45,10,0.05),0_20px_40px_-22px_rgba(30,40,70,0.45)] ring-1 ring-[#efe7d6] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_4px_10px_rgba(61,45,10,0.06),0_28px_54px_-22px_rgba(30,40,70,0.5)]"
      style={{ width: size, height: size, padding: size * 0.14 }}
    >
      {Icon && (
        <Icon
          className="mb-1.5 transition-colors duration-300 group-hover:text-[#8a6a2e]"
          style={{ width: 24, height: 24, color: ICON }}
        />
      )}
      <span
        className="font-display leading-[1.15]"
        style={{ color: NAVY, fontSize: 12.5 }}
      >
        {item.title}
      </span>
    </Link>
  );
}

export default function SpecialityConstellation({
  items,
}: {
  items: ConstellationItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.getBoundingClientRect().width || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cx = r2(w / 2);
  const cy = r2(H / 2);

  // two elliptical rings: 6 bubbles inner, the rest outer
  const inner = items.slice(0, 6);
  const outer = items.slice(6);
  const rings = {
    inner: { rx: 0.255 * w, ry: 218 },
    mid: { rx: 0.365 * w, ry: 288 },
    outer: { rx: 0.475 * w, ry: 348 },
  };

  const place = (
    list: ConstellationItem[],
    rx: number,
    ry: number,
    startDeg: number,
  ) =>
    list.map((item, i) => {
      // small deterministic radius jitter so it reads organic, not mechanical
      const jr = (((i * 37) % 3) - 1) * 0.03;
      const deg = startDeg + (i * 360) / list.length;
      const a = (deg * Math.PI) / 180;
      return {
        item,
        x: r2(cx + rx * (1 + jr) * Math.cos(a)),
        y: r2(cy + ry * (1 + jr) * Math.sin(a)),
      };
    });

  const innerNodes = place(inner, rings.inner.rx, rings.inner.ry, -90);
  const outerNodes = place(outer, rings.outer.rx, rings.outer.ry, -90 + 15);
  const nodes = [...innerNodes, ...outerNodes];

  return (
    <div>
      {/* ── desktop orbit ── */}
      <div ref={ref} className="relative hidden xl:block" style={{ height: H }}>
        {w > 0 && (
          <>
            {/* orbit rings */}
            <svg
              className="absolute inset-0"
              width={w}
              height={H}
              viewBox={`0 0 ${w} ${H}`}
              fill="none"
              aria-hidden
            >
              {(["inner", "mid", "outer"] as const).map((k) => (
                <ellipse
                  key={k}
                  cx={cx}
                  cy={cy}
                  rx={rings[k].rx}
                  ry={rings[k].ry}
                  stroke={ICON}
                  strokeOpacity={0.28}
                  strokeWidth={1.2}
                  strokeDasharray="0.5 9"
                  strokeLinecap="round"
                  className="orbit-flow"
                />
              ))}
            </svg>

            {/* central medallion */}
            <div
              className="absolute"
              style={{ left: cx, top: cy }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span
                  aria-hidden
                  className="absolute -inset-6 rounded-full opacity-70 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 40%, rgba(216,196,158,0.35), transparent 70%)",
                  }}
                />
                <div className="relative flex h-[184px] w-[184px] flex-col items-center justify-center rounded-full border border-[#ece0c4] bg-gradient-to-b from-white to-[#f7f1e6] px-7 text-center shadow-[0_2px_6px_rgba(61,45,10,0.06),0_36px_70px_-30px_rgba(30,40,70,0.5)]">
                  <PeopleIcon className="h-7 w-7" />
                  <span className="mt-2.5 font-display text-[20px] leading-[1.15] text-ink">
                    Comprehensive Cancer Care
                  </span>
                </div>
              </div>
            </div>

            {/* bubbles */}
            {nodes.map(({ item, x, y }) => (
              <div
                key={item.slug}
                className="absolute"
                style={{ left: x, top: y }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <Bubble item={item} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── mobile / tablet grid fallback ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:hidden">
        {items.map((item) => (
          <div key={item.slug} className="flex justify-center">
            <Bubble item={item} size={148} />
          </div>
        ))}
      </div>
    </div>
  );
}
