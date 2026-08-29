"use client";

// ─────────────────────────────────────────────────────────────────────────────
// The graphic layer behind the five pathway cards. One component, three levels,
// driven by the shared site-wide toggle in @/components/graphic/GraphicMode.
// the same context the cancer-type pages use, so a visitor who picks "quiet"
// there gets a quiet patient hub too.
//
// Every level obeys the same rule: the patient information is the page, and the
// drawing is behind it. Nothing here is interactive, nothing here carries
// meaning a patient has to decode, and all of it is aria-hidden.
//
// The blue is the brand accent (#1a4d8f) with a little of the logo gold
// (#c8992f), the same two colours the tariffs particle field uses, so the two
// pages read as one system.
// ─────────────────────────────────────────────────────────────────────────────

import ParticleField from "@/components/graphic/ParticleField";
import { useGraphicMode } from "@/components/graphic/GraphicMode";

const ACCENT = "#1a4d8f";
const GOLD = "#c8992f";

/** Quiet: four fine-line waves, close to invisible. Static. */
function QuietWaves() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      fill="none"
    >
      {[0, 1, 2, 3].map((i) => {
        const y = 170 + i * 165;
        return (
          <path
            key={i}
            d={`M-40 ${y} C 200 ${y - 54}, 420 ${y + 52}, 640 ${y - 8} S 1020 ${y - 66}, 1240 ${y - 20}`}
            stroke={i === 2 ? GOLD : ACCENT}
            strokeWidth="1"
            opacity={i === 2 ? 0.07 : 0.09}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

/*
  Integrated: the five routes drawn as one connected thing.

  On a phone the cards run down the middle of a 375px column, so a vertical
  spine lands dead centre and reads as a seam or a print registration mark
  rather than as a route. Below sm the branching is dropped entirely and the
  connection is carried by horizontal threads that pass behind the stack, with
  a node where each card sits.
*/
function IntegratedMobile() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full sm:hidden"
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
      fill="none"
    >
      {[110, 268, 424, 580, 706].map((y, i) => (
        <g key={y}>
          <path
            d={`M-30 ${y} C 90 ${y - 26}, 200 ${y + 30}, 300 ${y - 6} S 400 ${y - 28}, 440 ${y - 14}`}
            stroke={i === 2 ? GOLD : ACCENT}
            strokeWidth="1"
            opacity={i === 2 ? 0.12 : 0.1}
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={i % 2 === 0 ? 44 : 356}
            cy={y - 10}
            r="2"
            fill={i === 2 ? GOLD : ACCENT}
            opacity="0.2"
          />
        </g>
      ))}
    </svg>
  );
}

/*
  From sm up there is room either side of the reading column, so the spine and
  its branches can do their job: one route, five ways onto it.

  The geometry is decorative rather than measured. It can't anchor to the real
  card boxes at every breakpoint, so it aims for the rhythm of the stack and
  stays faint enough that a few pixels of drift never reads as a mistake.
*/
function IntegratedBranches() {
  const branches = [
    { y: 120, dir: -1 },
    { y: 268, dir: 1 },
    { y: 416, dir: -1 },
    { y: 564, dir: 1 },
    { y: 700, dir: -1 },
  ];

  return (
    <svg
      aria-hidden
      className="absolute inset-0 hidden h-full w-full sm:block"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      fill="none"
    >
      {/* the spine */}
      <path
        d="M600 -20 C 592 160, 610 320, 598 460 S 606 660, 600 820"
        stroke={ACCENT}
        strokeWidth="1"
        opacity="0.16"
        vectorEffect="non-scaling-stroke"
      />

      {branches.map(({ y, dir }, i) => {
        const end = 600 + dir * 520;
        const mid = 600 + dir * 250;
        return (
          <g key={i}>
            <path
              d={`M600 ${y} C ${mid} ${y}, ${mid} ${y + dir * 34}, ${end} ${y + dir * 44}`}
              stroke={i === 2 ? GOLD : ACCENT}
              strokeWidth="1"
              opacity={i === 2 ? 0.15 : 0.13}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={end}
              cy={y + dir * 44}
              r="2.5"
              fill={i === 2 ? GOLD : ACCENT}
              opacity="0.22"
            />
          </g>
        );
      })}

      {/* a second, lighter pass so the field has some depth */}
      {[210, 500].map((y) => (
        <path
          key={y}
          d={`M-40 ${y} C 260 ${y - 40}, 520 ${y + 46}, 780 ${y - 12} S 1080 ${y - 50}, 1240 ${y - 6}`}
          stroke={ACCENT}
          strokeWidth="1"
          opacity="0.06"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export default function PathwayWaves({
  className = "",
}: {
  className?: string;
}) {
  const { mode } = useGraphicMode();

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {mode === "quiet" && <QuietWaves />}
      {mode === "integrated" && (
        <>
          <IntegratedMobile />
          <IntegratedBranches />
        </>
      )}
      {mode === "expressive" && (
        // The tariffs field, re-tuned: spread wide, softened, and pushed to the
        // middle of the block so the cards sit inside the flow rather than on
        // top of it. Its own reduced-motion handling still applies.
        <ParticleField
          className="absolute inset-0 h-full w-full"
          midYFrac={0.5}
          ampScale={1.5}
          layers={13}
          layerGap={34}
          repelRadius={150}
          repelForce={4}
          edgeFade="band"
        />
      )}
    </div>
  );
}
