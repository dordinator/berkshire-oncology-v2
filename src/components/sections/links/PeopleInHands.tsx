"use client";

/*
  PeopleInHands — the "support" illustration for the Useful Links page: three
  figures held in two open, cupped hands beneath a dotted arc.

  Each hand is a proper silhouette (wrist → outer edge → fingertips → inner
  edge), with a thumb crossing the palm and three finger-separator lines, so it
  unmistakably reads as hands rather than a bowl. Staged draw-on (hands →
  figures → arc), then the figures gently breathe. Reduced-motion → static.
  All coordinates are static literals, so SSR and hydration always match.
*/

import { motion, useReducedMotion, type Variants } from "framer-motion";

const NAVY = "#1a4d8f";
const GOLD = "#c79a3e";
const EASE = [0.22, 1, 0.36, 1] as const;

// dotted arc sheltering the figures
const ARC = [
  [56, 112],
  [60, 92],
  [68, 74],
  [81, 59],
  [97, 49],
  [113, 43],
  [130, 41],
  [147, 43],
  [163, 49],
  [179, 59],
  [192, 74],
  [200, 92],
  [204, 112],
] as const;

// The hands form a shallow open basin BENEATH the figures: two palm edges
// sweeping down to meet at bottom-centre, wrists trailing off, four narrow-U
// fingers per hand curling up the outer sides, and a thumb tucked in front.
// Right-hand geometry mirrors the left around x=130.
const PALMS = [
  "M 50 178 C 62 198 94 208 130 208", // left basin edge
  "M 210 178 C 198 198 166 208 130 208", // right basin edge
];
const WRISTS = [
  "M 50 178 C 44 188 42 200 44 212",
  "M 210 178 C 216 188 218 200 216 212",
];
// back rim of the basin, behind the figures
const RIM = "M 76 172 C 102 180 158 180 184 172";
const FINGERS = [
  // left hand: pinky → index, tips curling inward
  "M 46 178 C 43 167 45 157 51 153 C 54 151 57 153 57 157 C 56 166 55 172 56 178",
  "M 58 172 C 56 159 59 148 66 144 C 69 142 72 144 72 149 C 70 158 69 165 69 172",
  "M 71 167 C 70 153 74 142 81 138 C 84 136 87 139 86 144 C 84 153 82 161 82 167",
  "M 84 163 C 84 151 88 142 94 139 C 97 137 100 140 99 145 C 97 153 95 159 95 164",
  // right hand
  "M 214 178 C 217 167 215 157 209 153 C 206 151 203 153 203 157 C 204 166 205 172 204 178",
  "M 202 172 C 204 159 201 148 194 144 C 191 142 188 144 188 149 C 190 158 191 165 191 172",
  "M 189 167 C 190 153 186 142 179 138 C 176 136 173 139 174 144 C 176 153 178 161 178 167",
  "M 176 163 C 176 151 172 142 166 139 C 163 137 160 140 161 145 C 163 153 165 159 165 164",
];
const THUMBS = [
  "M 108 198 C 110 186 114 175 118 166 C 120 162 124 163 124 167 C 123 175 121 186 118 196",
  "M 152 198 C 150 186 146 175 142 166 C 140 162 136 163 136 167 C 137 175 139 186 142 196",
];

// figures — centre tallest, sides tucked in, seated just above the basin
const BODIES = [
  { d: "M 82 158 C 82 132 118 132 118 158", w: 2.2 },
  { d: "M 108 156 C 108 120 152 120 152 156", w: 2.4 },
  { d: "M 142 158 C 142 132 178 132 178 158", w: 2.2 },
];
const HEADS = [
  { cx: 100, cy: 110, r: 11.5, c: NAVY, w: 2.2 },
  { cx: 130, cy: 91, r: 15, c: NAVY, w: 2.4 },
  { cx: 160, cy: 110, r: 11.5, c: GOLD, w: 2.2 },
];

export default function PeopleInHands({
  className = "",
}: {
  className?: string;
}) {
  const reduce = useReducedMotion();

  const draw = (i: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: reduce ? 0 : 1.15,
          ease: EASE,
          delay: reduce ? 0 : 0.1 + i * 0.3,
        },
        opacity: { duration: reduce ? 0 : 0.2, delay: reduce ? 0 : 0.1 + i * 0.3 },
      },
    },
  });
  const dotV = (idx: number): Variants => ({
    hidden: { scale: 0, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: reduce ? 0 : 0.4,
        ease: EASE,
        delay: reduce ? 0 : 1.15 + idx * 0.045,
      },
    },
  });

  const s = {
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 260 240"
        className="h-auto w-full max-w-[320px]"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        aria-hidden
      >
        {/* dotted arc */}
        {ARC.map(([x, y], idx) => (
          <motion.circle
            key={idx}
            cx={x}
            cy={y}
            r={idx === 6 ? 2.9 : 2.2}
            fill={idx % 2 === 0 ? NAVY : GOLD}
            opacity={0.75}
            variants={dotV(idx)}
          />
        ))}

        {/* hands — basin, wrists, rim, then fingers and thumbs */}
        {[...PALMS, ...WRISTS].map((d, i) => (
          <motion.path key={`palm-${i}`} d={d} stroke={GOLD} strokeWidth={2.3} variants={draw(0)} {...s} />
        ))}
        <motion.path
          d={RIM}
          stroke={GOLD}
          strokeWidth={1.4}
          opacity={0.7}
          variants={draw(1)}
          {...s}
        />
        {FINGERS.map((d, i) => (
          <motion.path key={`f-${i}`} d={d} stroke={GOLD} strokeWidth={1.9} variants={draw(1)} {...s} />
        ))}
        {THUMBS.map((d, i) => (
          <motion.path key={`t-${i}`} d={d} stroke={GOLD} strokeWidth={1.9} variants={draw(1)} {...s} />
        ))}

        {/* figures (gently breathe) */}
        <g className={reduce ? undefined : "people-lift"}>
          {BODIES.map((b, i) => (
            <motion.path key={`b-${i}`} d={b.d} stroke={NAVY} strokeWidth={b.w} variants={draw(2)} {...s} />
          ))}
          {HEADS.map((h, i) => (
            <motion.circle
              key={`h-${i}`}
              cx={h.cx}
              cy={h.cy}
              r={h.r}
              stroke={h.c}
              strokeWidth={h.w}
              variants={draw(3)}
              {...s}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}
