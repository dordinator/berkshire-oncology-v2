/*
  HeroSwoosh — dense hairline white bundle matching the hero reference:
  silk-smooth strands, left → pinch at house bottom-left → fan right,
  with strand order inverted through the trough (left-top becomes right-bottom).

  Intro: draw-in left→right once.
  Pulse: one simple L→R highlight on all strands (same timing), then rest.
*/

type Pt = { x: number; y: number };

type Strand = {
  d: string;
  opacity: number;
  width: number;
};

type Spark = {
  cx: number;
  cy: number;
  r: number;
};

/*
  Spine minima = bottom-left of the house sketch.
  House local: left wall x=520, ground y=818; sketch group is
  translate(380,20) scale(1.02) → viewBox point ≈ (910, 854).
*/
const HOUSE_DIP = { x: 910, y: 854 } as const;

const SEG1 = {
  p0: { x: -100, y: 520 },
  p1: { x: 280, y: 640 },
  p2: { x: 640, y: HOUSE_DIP.y },
  p3: { x: HOUSE_DIP.x, y: HOUSE_DIP.y },
} as const;

const SEG2 = (() => {
  const { p2, p3 } = SEG1;
  const p4 = { x: p3.x + (p3.x - p2.x), y: p3.y + (p3.y - p2.y) };
  return {
    p0: p3,
    p1: p4,
    p2: { x: 1380, y: 420 },
    p3: { x: 1780, y: 280 },
  };
})();

const STRAND_COUNT = 36;
const SAMPLES = 64;
const MAX_SPREAD = 165;

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
}

function cubicDeriv(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

function spineAt(s: number): { point: Pt; normal: Pt } {
  const seg = s < 0.5 ? SEG1 : SEG2;
  const t = s < 0.5 ? s * 2 : (s - 0.5) * 2;
  const point = cubic(seg.p0, seg.p1, seg.p2, seg.p3, t);
  const d = cubicDeriv(seg.p0, seg.p1, seg.p2, seg.p3, t);
  const len = Math.hypot(d.x, d.y) || 1;
  return { point, normal: { x: -d.y / len, y: d.x / len } };
}

function pointsToSmoothPath(pts: Pt[]): string {
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

function buildStrands(): Strand[] {
  const strands: Strand[] = [];

  for (let i = 0; i < STRAND_COUNT; i++) {
    const u = (i / (STRAND_COUNT - 1)) * 2 - 1;
    const edge = Math.abs(u);
    const phase = u * Math.PI * 1.1;
    const weave = (0.04 + 0.05 * edge) * MAX_SPREAD;

    const pts: Pt[] = [];
    let prevN: Pt | null = null;

    for (let k = 0; k <= SAMPLES; k++) {
      const s = k / SAMPLES;
      const { point, normal } = spineAt(s);

      let n = normal;
      if (prevN && n.x * prevN.x + n.y * prevN.y < 0) {
        n = { x: -n.x, y: -n.y };
      }
      prevN = n;

      const fromCentre = Math.abs(2 * s - 1);
      const envelope = 0.48 + 0.52 * Math.pow(fromCentre, 1.15);
      const flip = Math.cos(Math.PI * (s - u * 0.07));

      const drift =
        Math.sin(s * Math.PI * 2 + phase) * weave * envelope * 0.55 +
        Math.sin(s * Math.PI * 4 + phase * 1.3) * weave * envelope * 0.18;

      const offset = u * MAX_SPREAD * envelope * flip + drift;
      pts.push({
        x: point.x + n.x * offset,
        y: point.y + n.y * offset,
      });
    }

    strands.push({
      d: pointsToSmoothPath(pts),
      opacity: 0.72 - edge * 0.38,
      width: 1.9 - edge * 0.7,
    });
  }

  return strands;
}

function buildSparks(): Spark[] {
  const fracs = [0.22, 0.35, 0.48, 0.58, 0.7, 0.82];
  return fracs.map((s, i) => {
    const { point, normal } = spineAt(s);
    const nudge = ((i % 3) - 1) * 8;
    return {
      cx: point.x + normal.x * nudge,
      cy: point.y + normal.y * nudge,
      r: 1.6 + (i % 3) * 0.35,
    };
  });
}

const STRANDS = buildStrands();
const GLOW_STRANDS = STRANDS.filter((_, i) => i % 2 === 0);
const SPARKS = buildSparks();

function Hairlines({
  strands,
  opacityScale = 1,
}: {
  strands: Strand[];
  opacityScale?: number;
}) {
  return (
    <>
      {strands.map((s, idx) => (
        <path
          key={idx}
          d={s.d}
          pathLength={1}
          className="swoosh-draw-in"
          style={{ "--swoosh-in-delay": `${idx * 0.02}s` } as React.CSSProperties}
          stroke="#ffffff"
          strokeWidth={s.width}
          strokeOpacity={s.opacity * opacityScale}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </>
  );
}

export default function HeroSwoosh() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg
        className="swoosh-glow absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
      >
        <Hairlines strands={GLOW_STRANDS} opacityScale={0.85} />
      </svg>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
      >
        <Hairlines strands={STRANDS} />

        {/* single L→R pulse — all strands, identical timing */}
        <g className="swoosh-pulse-layer">
          {STRANDS.map((s, idx) => (
            <path
              key={`pulse-${idx}`}
              d={s.d}
              pathLength={1}
              className="swoosh-pulse"
              stroke="#ffffff"
              strokeWidth={s.width + 1}
              strokeOpacity={0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </g>

        {/* static glints — not animated */}
        {SPARKS.map((sp, idx) => (
          <circle
            key={idx}
            cx={sp.cx}
            cy={sp.cy}
            r={sp.r}
            fill="#ffffff"
            fillOpacity={0.35}
          />
        ))}
      </svg>
    </div>
  );
}
