"use client";

/*
  MarbleVines — the bundle of gold marble "vines" on the cream side of the
  speciality hero (see /specialities/[slug]). A family of meandering strands
  that gather toward the top-right and spread at the base, all flowing
  bottom-left → top-right and kept clear of the orbit (viewBox x ≥ ~476).

  Each strand gently `vein-breathe`s (opacity, staggered per line) and the two
  main vines carry a soft `vein-shimmer` light (keyframes in globals.css). On
  pointer move each vine ALSO drifts on its own — every line has its own mx/my
  factor, so the thin tendrils travel further than the heavy main vines and the
  bundle sways line-by-line rather than as one block. Movement eases via a rAF
  lerp and is disabled for reduced-motion.
*/

import { useEffect, useRef } from "react";

const GOLD = "#b98a2e";
const SHIMMER = "#e7c579";

type Vine = {
  d: string;
  opacity: number;
  width: number;
  kind: "vein-breathe" | "vein-shimmer";
  stroke: string;
  dash?: boolean;
  delay?: string; // animation-delay (breathe phase / shimmer offset)
  dur?: string; // animation-duration (shimmer)
  mx: number; // horizontal drift factor toward the cursor
  my: number; // vertical drift factor toward the cursor
};

// main vines (heavier → drift less); order matters only for stacking
const VINES: Vine[] = [
  {
    d: "M 500 806 C 560 686 602 660 588 552 C 574 452 648 420 660 314 C 669 236 634 166 700 76",
    opacity: 0.22,
    width: 2.4,
    kind: "vein-breathe",
    stroke: GOLD,
    mx: 0.6,
    my: 0.75,
  },
  {
    d: "M 548 806 C 602 700 650 662 640 560 C 630 476 692 448 686 352 C 683 300 700 272 700 244",
    opacity: 0.18,
    width: 1.9,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-1.5s",
    mx: 0.85,
    my: 0.5,
  },
  {
    d: "M 520 806 C 574 704 622 674 610 582 C 599 498 664 468 682 380 C 693 330 672 296 700 258",
    opacity: 0.14,
    width: 1.5,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-3s",
    mx: 1.0,
    my: 0.95,
  },
  {
    d: "M 592 806 C 636 700 678 660 672 562 C 667 492 700 468 700 424",
    opacity: 0.14,
    width: 1.4,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-4.5s",
    mx: 0.7,
    my: 1.1,
  },
  // finer vines & tendrils (lighter → drift further, some counter-sway)
  {
    d: "M 476 806 C 542 704 512 632 576 566 C 628 512 596 452 658 398 C 688 372 672 338 700 302",
    opacity: 0.12,
    width: 1.1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-2.2s",
    mx: 1.5,
    my: 1.2,
  },
  {
    d: "M 620 806 C 656 710 692 672 686 586 C 682 540 700 520 700 484",
    opacity: 0.11,
    width: 1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-3.8s",
    mx: 1.25,
    my: -1.5, // sways opposite for a natural, non-uniform feel
  },
  {
    d: "M 586 556 C 620 508 588 466 636 424 C 662 400 652 362 700 326",
    opacity: 0.1,
    width: 1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-5.4s",
    mx: 1.7,
    my: 1.0,
  },
  {
    d: "M 660 314 C 682 300 690 284 700 264",
    opacity: 0.11,
    width: 1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-1s",
    mx: 1.9,
    my: 1.35,
  },
  {
    d: "M 640 560 C 664 546 676 548 700 532",
    opacity: 0.1,
    width: 1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-6s",
    mx: -1.4, // counter-sway on x
    my: 1.7,
  },
  {
    d: "M 610 582 C 636 566 650 568 676 552",
    opacity: 0.1,
    width: 1,
    kind: "vein-breathe",
    stroke: GOLD,
    delay: "-2.8s",
    mx: 1.8,
    my: 1.25,
  },
  // shimmer overlays — share the drift of the vine they trace so the light
  // stays on the line
  {
    d: "M 500 806 C 560 686 602 660 588 552 C 574 452 648 420 660 314 C 669 236 634 166 700 76",
    opacity: 0.55,
    width: 2.2,
    kind: "vein-shimmer",
    stroke: SHIMMER,
    dash: true,
    mx: 0.6,
    my: 0.75,
  },
  {
    d: "M 548 806 C 602 700 650 662 640 560 C 630 476 692 448 686 352 C 683 300 700 272 700 244",
    opacity: 0.5,
    width: 1.7,
    kind: "vein-shimmer",
    stroke: SHIMMER,
    dash: true,
    delay: "-5.5s",
    dur: "13s",
    mx: 0.85,
    my: 0.5,
  },
];

const MAX = 6; // base drift (user units); each vine scales this by mx/my

export default function MarbleVines() {
  const refs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = ((e.clientX / window.innerWidth) * 2 - 1) * MAX;
      ty = ((e.clientY / window.innerHeight) * 2 - 1) * MAX;
    };

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      for (let i = 0; i < VINES.length; i++) {
        const el = refs.current[i];
        if (!el) continue;
        const v = VINES[i];
        el.style.transform = `translate(${(cx * v.mx).toFixed(2)}px, ${(cy * v.my).toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      aria-hidden
      className="absolute inset-y-0 right-0 h-full w-[62%]"
      viewBox="0 0 700 800"
      fill="none"
      preserveAspectRatio="none"
    >
      {VINES.map((v, i) => (
        <path
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={v.kind}
          d={v.d}
          stroke={v.stroke}
          strokeOpacity={v.opacity}
          strokeWidth={v.width}
          strokeLinecap="round"
          strokeDasharray={v.dash ? "3 340" : undefined}
          style={{
            willChange: "transform",
            animationDelay: v.delay,
            animationDuration: v.dur,
          }}
        />
      ))}
    </svg>
  );
}
