/*
  HairlineWaves — the Quiet register.

  A shallow bundle of hairline strands with small directional markers riding
  along them. It reads as measurement rather than decoration: the strands are
  evenly spaced, the markers are chevrons pointing the way the eye should
  travel, and nothing is illustrative of anatomy or disease.

  Server component — pure geometry, no state. Motion is CSS-only and already
  suppressed by the prefers-reduced-motion block in globals.css.

  Strand shape is a single cubic sampled at SAMPLES points, offset vertically
  per strand with an eased spread so the bundle pinches at the left and fans
  gently to the right — the same visual grammar as the hero swoosh, at a much
  lower amplitude because this sits behind body copy.
*/

type Pt = { x: number; y: number };

const W = 1440;
const H = 200;

const P0: Pt = { x: -40, y: 128 };
const P1: Pt = { x: 380, y: 40 };
const P2: Pt = { x: 1020, y: 168 };
const P3: Pt = { x: 1480, y: 74 };

const STRANDS = 9;
const SAMPLES = 48;
const SPREAD = 26;

function cubic(t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x,
    y: u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y,
  };
}

/** Bundle is tight at both ends, widest in the middle. */
function spreadAt(t: number) {
  return Math.sin(Math.PI * t) ** 0.8;
}

function strandPath(offset: number) {
  let d = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const p = cubic(t);
    const y = p.y + offset * spreadAt(t);
    d += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/** Chevron pointing along the curve's tangent at t. */
function marker(t: number, offset: number, key: string, delay: number) {
  const p = cubic(t);
  const ahead = cubic(Math.min(1, t + 0.012));
  const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
  const y = p.y + offset * spreadAt(t);
  return (
    <g
      key={key}
      transform={`translate(${p.x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`}
      className="vein-breathe"
      style={{ animationDelay: `${delay}s` }}
    >
      <path
        d="M-3.5 -3.5 L 0.5 0 L -3.5 3.5"
        fill="none"
        stroke="#1a4d8f"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </g>
  );
}

export default function HairlineWaves({
  className = "",
  flip = false,
}: {
  className?: string;
  /** Mirror vertically, so a closing band doesn't repeat the opening one. */
  flip?: boolean;
}) {
  const strands = Array.from({ length: STRANDS }, (_, i) => {
    const k = i / (STRANDS - 1) - 0.5; // -0.5 … 0.5
    return {
      offset: k * SPREAD * 2,
      // Centre strands sit slightly stronger than the outer ones.
      opacity: 0.34 - Math.abs(k) * 0.4,
      width: Math.abs(k) < 0.2 ? 0.9 : 0.65,
      delay: i * 0.08,
    };
  });

  const markers: { t: number; offset: number; delay: number }[] = [
    { t: 0.2, offset: 0, delay: 0 },
    { t: 0.46, offset: -SPREAD * 0.55, delay: 1.1 },
    { t: 0.62, offset: SPREAD * 0.55, delay: 2.2 },
    { t: 0.85, offset: 0, delay: 3.1 },
  ];

  return (
    <div className={className} aria-hidden>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        style={flip ? { transform: "scaleY(-1)" } : undefined}
      >
        <defs>
          {/* Fade the bundle out at both edges so it never collides with the
              container gutters. */}
          <linearGradient id="hw-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.14" stopColor="#fff" stopOpacity="1" />
            <stop offset="0.86" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="hw-mask">
            <rect width={W} height={H} fill="url(#hw-fade)" />
          </mask>
        </defs>

        <g mask="url(#hw-mask)">
          {strands.map((s, i) => (
            <path
              key={i}
              d={strandPath(s.offset)}
              fill="none"
              stroke="#1a4d8f"
              strokeWidth={s.width}
              strokeLinecap="round"
              opacity={Math.max(0.06, s.opacity)}
              className="swoosh-draw-in"
              style={{ ["--swoosh-in-delay" as string]: `${s.delay}s` }}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* one gold strand, matching the brand's silver→gold accent */}
          <path
            d={strandPath(SPREAD * 0.22)}
            fill="none"
            stroke="#c8992f"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.28"
            className="swoosh-draw-in"
            style={{ ["--swoosh-in-delay" as string]: "0.5s" }}
            vectorEffect="non-scaling-stroke"
          />

          {markers.map((m, i) =>
            marker(m.t, m.offset, `m${i}`, m.delay),
          )}
        </g>
      </svg>
    </div>
  );
}
