// ─────────────────────────────────────────────────────────────────────────────
// A field of fine-line waves, sitting behind a section as texture.
//
// This replaces the ten-node PartnershipField motif behind "NHS and private
// practice". That figure was an argument — ten consultants, linked — and it was
// put there because the section was the longest unbroken run of text on the
// page and needed something to carry it. Now that the section is mostly a row
// of hospitals, it needs a backdrop rather than a second argument, so this is
// waves and nothing else.
//
// One drawing rather than the wide/tall pair PartnershipField needs, because
// horizontal lines crop far better than a node figure does.
//
// It crops rather than stretches. `preserveAspectRatio="none"` was the obvious
// choice and is wrong: on a phone the section is far taller than it is wide, and
// stretching a 1400×620 field into that shape multiplies every amplitude until
// the hairlines become huge sweeping loops behind the text. Slicing keeps the
// wave shape at any container ratio and simply shows less of the field on a
// narrow screen. vector-effect="non-scaling-stroke" then keeps the hairlines
// hairline whatever the scale.
// ─────────────────────────────────────────────────────────────────────────────

/** viewBox extent. Arbitrary, since the field stretches to its container. */
const W = 1400;
const H = 620;

/** [centre y, amplitude, wavelength, phase, opacity] */
const WAVES: [number, number, number, number, number][] = [
  [104, 26, 1180, 240, 0.1],
  [196, 34, 940, 60, 0.14],
  [288, 22, 1320, 420, 0.09],
  [370, 38, 1040, 180, 0.13],
  [462, 28, 860, 520, 0.08],
  [548, 20, 1240, 320, 0.11],
];

/**
 * One flowing hairline: a sine drawn as half-wavelength beziers.
 *
 * Every coordinate is fixed to one decimal before it reaches the attribute.
 * This renders on the server only, so there is no hydration comparison to fail
 * — but PartnershipField learned the hard way that Math.sin is not bit-identical
 * across engines, and rounding costs nothing here.
 */
function wavePath(y: number, amp: number, wavelength: number, phase: number) {
  const half = wavelength / 2;
  let x = -phase;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  let dir = 1;
  while (x < W + wavelength) {
    d +=
      ` C ${(x + half / 3).toFixed(1)} ${(y - amp * 1.3 * dir).toFixed(1)},` +
      ` ${(x + (half * 2) / 3).toFixed(1)} ${(y - amp * 1.3 * dir).toFixed(1)},` +
      ` ${(x + half).toFixed(1)} ${y.toFixed(1)}`;
    x += half;
    dir *= -1;
  }
  return d;
}

export default function WaveField({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full text-accent"
        fill="none"
        focusable="false"
      >
        {WAVES.map(([y, amp, wl, phase, opacity], i) => (
          <path
            key={i}
            d={wavePath(y, amp, wl, phase)}
            stroke="currentColor"
            strokeOpacity={opacity}
            strokeWidth={1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
