// ─────────────────────────────────────────────────────────────────────────────
// The wave as a visual language rather than a single piece of artwork.
//
// One geometry, three jobs. The strand generator here is the same one in
// ResourceWave — same six coefficients, same two-`S` spline — with two knobs
// added: `amplitude` flattens the whole family toward its own centreline, and
// `count` thins it. Nothing reorders, nothing is replaced by a different shape.
// That is the entire discipline: the reader should recognise the hero's wave in
// an 80px rule without being told.
//
// WHERE IT IS SAFE TO CUT
// The family is not croppable at arbitrary x. Two positions are defensible:
//   x = 1088.5 — the node. Every strand passes through a span of 0.6 units, so
//                a cut there has essentially nothing to cut and the lines read
//                as radiating from a point rather than sliced off by a box.
//   x = 604    — the waist. A 12.5-unit bundle; tight enough to read as a taper.
// Anywhere else the cut edge must be hidden under a module edge or dissolved
// with a mask, which is what `fade` does.
//
// WHY NOT JUST SQUASH THE FULL WAVE INTO 80px
// preserveAspectRatio="none" scales stroke width by the geometric mean of the
// axis scales along the local tangent. Squeezing the full 1400×360 family into
// a full-bleed 80px band is a vertical scale near 0.22, which renders the flat
// middle at about a fifth of a pixel — it goes faint and flat at the same time,
// which is the opposite of a rule. Low-amplitude regeneration keeps the stroke
// honest and the shape recognisable.
// ─────────────────────────────────────────────────────────────────────────────

type Strand = { d: string; opacity: number; width: number };

/**
 * @param amplitude 1 is the hero's geometry; below 1 flattens the family toward
 *                  its own centreline without changing where it bends.
 * @param count     how many of the 19 strands to draw, evenly sampled about the
 *                  centre. Nineteen lines inside an 80px band is mud.
 */
/** The y the family flattens toward — roughly the mean of the six control
 *  values, so a low-amplitude wave settles around its own middle rather than
 *  drifting to the top of its box. */
const CENTRELINE = 180;

function strands(amplitude: number, count: number): Strand[] {
  // Amplitude has to pull TWO things in, not one: the spread of the fan
  // (coeff * offset) and the carrier's own vertical excursion (base). An
  // earlier version scaled only the fan, so at amplitude 0.3 the strands
  // bunched tightly around a centreline that still swung from y=116 to y=244 —
  // which a short viewBox then cropped through the middle, leaving a fan
  // visible at each end and nothing between them. It read as two stray streaks
  // rather than as a wave. Both terms are interpolated toward CENTRELINE here,
  // so a flattened wave stays inside a short band and keeps its shape.
  const flat = (base: number, coeff: number, offset: number) =>
    CENTRELINE + (base - CENTRELINE) * amplitude + coeff * offset * amplitude;

  const step = 18 / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const index = i * step;
    const offset = index - 9;

    const start = flat(116, 8.4, offset);
    const firstControl = flat(82, 8.1, offset);
    const firstEnd = flat(188, 3.2, offset);
    const middle = flat(292, 2.1, offset);
    const secondControl = flat(252, -4.1, offset);
    const end = flat(118, -7.2, offset);

    const centre = 1 - Math.abs(offset) / 10;
    return {
      d: `M -30 ${start.toFixed(1)} C 150 ${firstControl.toFixed(1)}, 270 ${(firstControl + 24 * amplitude).toFixed(1)}, 430 ${firstEnd.toFixed(1)} S 700 ${middle.toFixed(1)}, 900 ${(middle - 48 * amplitude).toFixed(1)} S 1180 ${secondControl.toFixed(1)}, 1430 ${end.toFixed(1)}`,
      opacity: centre,
      width: index === 9 ? 1.45 : Math.round(index) % 3 === 0 ? 1.1 : 0.85,
    };
  });
}

export type WaveMarkProps = {
  /** SVG user-space window. Cut at 1088.5 (node) or 604 (waist) where visible. */
  viewBox: string;
  amplitude?: number;
  count?: number;
  className?: string;
  stroke?: string;
  /** opacity of the outermost strand, and how much is added toward the centre */
  opacityBase?: number;
  opacitySpan?: number;
  strokeScale?: number;
  /** dissolve a cut edge that isn't at the node or the waist */
  fade?: "none" | "left" | "right" | "both";
  /** Required. url(#id) resolves to first-in-document, so two instances sharing
   *  a gradient id would silently paint each other. */
  idPrefix: string;
  mirrored?: boolean;
};

const FADE: Record<string, string> = {
  none: "",
  left: "linear-gradient(to right, transparent 0%, #000 22%, #000 100%)",
  right: "linear-gradient(to right, #000 0%, #000 78%, transparent 100%)",
  both: "linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%)",
};

export default function WaveMark({
  viewBox,
  amplitude = 1,
  count = 19,
  className = "",
  stroke = "#1a4d8f",
  opacityBase = 0.1,
  opacitySpan = 0.18,
  strokeScale = 1,
  fade = "none",
  idPrefix,
  mirrored = false,
}: WaveMarkProps) {
  const lines = strands(amplitude, count);
  const mask = FADE[fade];

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${mirrored ? "-scale-x-100" : ""} ${className}`}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
        role="presentation"
      >
        <g stroke={stroke} strokeLinecap="round">
          {lines.map((line, i) => (
            <path
              key={`${idPrefix}-${i}`}
              d={line.d}
              strokeOpacity={opacityBase + line.opacity * opacitySpan}
              strokeWidth={line.width * strokeScale}
              // Without this the anisotropy of preserveAspectRatio="none" makes
              // the fan tips render at roughly half the weight of the flat
              // middle on a phone — so the most distinctive part of the wave is
              // the faintest part on the device most people read it on.
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/**
 * The chapter rule. Same wave, flattened and thinned, cropped to the band its
 * ink actually occupies. Used between sections in place of a border, which is
 * the whole argument for having a motif: the divider is the brand.
 */
export function ChapterRule({
  className = "",
  idPrefix,
  mirrored = false,
}: {
  className?: string;
  idPrefix: string;
  mirrored?: boolean;
}) {
  return (
    <WaveMark
      idPrefix={idPrefix}
      mirrored={mirrored}
      viewBox="0 134 1400 84"
      amplitude={0.3}
      count={11}
      // Heavier than the hero's paint: at 84 user-units tall on a phone these
      // are hairlines on near-white, and the hero's opacities would render the
      // rule as blank padding rather than as a divider.
      opacityBase={0.16}
      opacitySpan={0.24}
      strokeScale={1.15}
      className={`h-14 w-full md:h-20 ${className}`}
    />
  );
}
