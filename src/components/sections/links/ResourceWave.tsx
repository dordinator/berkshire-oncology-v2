// ─────────────────────────────────────────────────────────────────────────────
// The resources hero wave, in four strengths.
//
// The strand geometry is unchanged in all four — it is the shape the hero was
// built around and the thing worth keeping. What varies is paint: how the
// strokes are coloured, how far the opacity range opens, and how much blue
// sits behind them. 1 is a tuned version of what was already there; 4 is a
// genuine departure.
//
// 2 ("Tide") is the one in use. The review switcher that compared them has been
// removed; the other three stay here because changing which one the hero uses
// should be a one-number edit rather than a rebuild.
// ─────────────────────────────────────────────────────────────────────────────

export const WAVE_VARIANTS = [
  { id: 1, name: "Quiet", note: "today's wave, deeper" },
  { id: 2, name: "Tide", note: "gradient strands, soft wash" },
  { id: 3, name: "Current", note: "blue atmosphere, lit strands" },
  { id: 4, name: "Deep", note: "saturated field, hands off to navy" },
] as const;

export type WaveVariant = (typeof WAVE_VARIANTS)[number]["id"];

/** Brand palette, so nothing below invents a colour. */
const C = {
  ink: "#061c46",
  deep: "#0a2b5c",
  accent: "#1a4d8f",
  soft: "#3f6fb0",
  glow: "#9fb9dc",
  lilac: "#aec6e6",
  pale: "#cbdcee",
  steel: "#8ca7c9",
};

type Paint = {
  /** stroke for the 19 background strands */
  strand: string;
  /** opacity at the outermost strand, and how much is added at the centre */
  opacityBase: number;
  opacitySpan: number;
  strokeScale: number;
  /** the single emphasised strand through the middle */
  hero: string;
  heroOpacity: number;
  heroWidth: number;
  /** a blurred copy under the hero strand */
  heroGlow: number;
  /** indices of strands promoted to the accent colour */
  lit: number[];
};

const PAINT: Record<WaveVariant, Paint> = {
  1: {
    strand: C.steel,
    opacityBase: 0.1,
    opacitySpan: 0.26,
    strokeScale: 1.1,
    hero: C.accent,
    heroOpacity: 0.85,
    heroWidth: 1.9,
    heroGlow: 0,
    lit: [],
  },
  2: {
    strand: "url(#wg2)",
    opacityBase: 0.14,
    opacitySpan: 0.3,
    strokeScale: 1.2,
    hero: C.accent,
    heroOpacity: 0.9,
    heroWidth: 2,
    heroGlow: 0.28,
    lit: [],
  },
  3: {
    strand: "url(#wg3)",
    opacityBase: 0.18,
    opacitySpan: 0.34,
    strokeScale: 1.35,
    hero: C.deep,
    heroOpacity: 1,
    heroWidth: 2.2,
    heroGlow: 0.42,
    lit: [6, 12],
  },
  4: {
    strand: "url(#wg4)",
    opacityBase: 0.26,
    opacitySpan: 0.42,
    strokeScale: 1.55,
    hero: "#2f6fc0",
    heroOpacity: 1,
    heroWidth: 2.6,
    heroGlow: 0.7,
    lit: [4, 9, 14],
  },
};

export default function ResourceWave({
  className = "",
  variant = 2,
}: {
  className?: string;
  variant?: WaveVariant;
}) {
  const p = PAINT[variant] ?? PAINT[2];

  const strands = Array.from({ length: 19 }, (_, index) => {
    const offset = index - 9;
    const start = 116 + offset * 8.4;
    const firstControl = 82 + offset * 8.1;
    const firstEnd = 188 + offset * 3.2;
    const middle = 292 + offset * 2.1;
    const secondControl = 252 - offset * 4.1;
    const end = 118 - offset * 7.2;

    return {
      d: `M -30 ${start.toFixed(1)} C 150 ${firstControl.toFixed(1)}, 270 ${(firstControl + 24).toFixed(1)}, 430 ${firstEnd.toFixed(1)} S 700 ${middle.toFixed(1)}, 900 ${(middle - 48).toFixed(1)} S 1180 ${secondControl.toFixed(1)}, 1430 ${end.toFixed(1)}`,
      opacity: p.opacityBase + (1 - Math.abs(offset) / 10) * p.opacitySpan,
      width:
        (index === 9 ? 1.45 : index % 3 === 0 ? 1.1 : 0.85) * p.strokeScale,
    };
  });

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1400 360"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          {/* Strand gradients. Left-to-right rather than top-to-bottom: the
              strands travel horizontally, so a horizontal ramp reads as the
              light changing along their length instead of as a band laid over
              them. */}
          <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.glow} />
            <stop offset="55%" stopColor={C.soft} />
            <stop offset="100%" stopColor={C.accent} />
          </linearGradient>
          <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.lilac} />
            <stop offset="35%" stopColor={C.soft} />
            <stop offset="72%" stopColor={C.accent} />
            <stop offset="100%" stopColor={C.deep} />
          </linearGradient>
          <linearGradient id="wg4" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.pale} />
            <stop offset="28%" stopColor="#4d8fd6" />
            <stop offset="62%" stopColor={C.accent} />
            <stop offset="100%" stopColor={C.ink} />
          </linearGradient>

          {/* Atmosphere. Each is a rect painted with its own gradient; because
              the whole SVG is preserveAspectRatio="none", these stretch with
              the hero and stay in register with the strands at any height.

              All of it peaks around 62–70% of the height, which is where the
              strands actually are, and is transparent at both ends. Colour that
              ran to the bottom edge of the SVG left a hard horizontal seam
              against the canvas below it — a band, not an atmosphere. */}
          <linearGradient id="wash2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.soft} stopOpacity="0" />
            <stop offset="66%" stopColor={C.soft} stopOpacity="0.12" />
            <stop offset="100%" stopColor={C.soft} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="pool3" cx="0.5" cy="0.7" r="0.72">
            <stop offset="0%" stopColor={C.soft} stopOpacity="0.26" />
            <stop offset="100%" stopColor={C.soft} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pool3b" cx="0.14" cy="0.52" r="0.5">
            <stop offset="0%" stopColor={C.lilac} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.lilac} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="field4" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.lilac} stopOpacity="0" />
            <stop offset="38%" stopColor={C.soft} stopOpacity="0.26" />
            <stop offset="66%" stopColor={C.accent} stopOpacity="0.5" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lift4" cx="0.7" cy="0.66" r="0.58">
            <stop offset="0%" stopColor="#5b9ae0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5b9ae0" stopOpacity="0" />
          </radialGradient>

          {/* Belt and braces on the seam: whatever a variant paints, the last
              fifth of the height is faded out by this mask, so no background
              layer can ever meet the bottom edge at full strength. */}
          <linearGradient id="fadeout" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="78%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="bottomfade">
            <rect x="0" y="0" width="1400" height="360" fill="url(#fadeout)" />
          </mask>

          <filter id="waveblur" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* ── background ─────────────────────────────────────────────────── */}
        <g mask="url(#bottomfade)">
          {variant === 2 && (
            <rect x="0" y="0" width="1400" height="360" fill="url(#wash2)" />
          )}
          {variant === 3 && (
            <>
              <rect x="0" y="0" width="1400" height="360" fill="url(#pool3)" />
              <rect x="0" y="0" width="1400" height="360" fill="url(#pool3b)" />
            </>
          )}
          {variant === 4 && (
            <>
              <rect x="0" y="0" width="1400" height="360" fill="url(#field4)" />
              <rect x="0" y="0" width="1400" height="360" fill="url(#lift4)" />
            </>
          )}
        </g>

        {/* ── strands ────────────────────────────────────────────────────── */}
        <g stroke={p.strand} strokeLinecap="round">
          {strands.map((strand, index) => (
            <path
              key={index}
              d={strand.d}
              stroke={p.lit.includes(index) ? C.accent : undefined}
              strokeOpacity={
                p.lit.includes(index) ? strand.opacity + 0.22 : strand.opacity
              }
              strokeWidth={
                p.lit.includes(index) ? strand.width * 1.25 : strand.width
              }
            />
          ))}
        </g>

        {/* ── the one strand that carries the eye ────────────────────────── */}
        {p.heroGlow > 0 && (
          <path
            d={strands[9].d}
            stroke={p.hero}
            strokeOpacity={p.heroGlow}
            strokeWidth={p.heroWidth * 3.2}
            strokeLinecap="round"
            filter="url(#waveblur)"
          />
        )}
        <path
          d={strands[9].d}
          stroke={p.hero}
          strokeOpacity={p.heroOpacity}
          strokeWidth={p.heroWidth}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
