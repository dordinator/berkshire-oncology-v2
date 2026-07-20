/*
  HeroSketch — a fine-line sketch of the clinic building at 13 Bath Road,
  Reading (the Victorian villa that houses the consulting rooms): a central
  decorative gable with an attic light over the entrance porch, tall chimney
  stacks, a two-storey canted bay window, sash windows and a framing tree —
  traced from a photo.

  Soft blue-grey ink at low opacity so the drawing sits quietly beside the
  hero copy. Each path draws itself in stroke by stroke on load
  (pathLength=1 + stroke-dash, staggered via --i), then the whole drawing
  floats gently. prefers-reduced-motion renders the finished drawing, static.
*/

type Stroke = {
  d: string;
  i: number; // stagger index (draw order)
  w?: number; // stroke width
  faint?: boolean; // secondary detail
};

const STROKES: Stroke[] = [
  // ── ground ──
  { d: "M 280 818 L 1180 818", i: 0, w: 1.1 },

  // ── main facade ──
  { d: "M 520 818 L 520 400", i: 2, w: 1.25 },
  { d: "M 1080 818 L 1080 400", i: 2, w: 1.25 },
  { d: "M 508 400 L 1092 400", i: 3, w: 1.2 },
  // cornice / eaves shadow line
  { d: "M 512 412 L 1088 412", i: 4, w: 0.9, faint: true },

  // ── hipped roof (ridge broken around the gable) ──
  { d: "M 508 400 L 572 338", i: 3, w: 1.2 },
  { d: "M 1092 400 L 1028 338", i: 3, w: 1.2 },
  { d: "M 572 338 L 698 338", i: 4, w: 1.15 },
  { d: "M 902 338 L 1028 338", i: 4, w: 1.15 },

  // ── central gable + attic light ──
  { d: "M 698 400 L 800 232 L 902 400", i: 5, w: 1.35 },
  { d: "M 714 392 L 800 252 L 886 392", i: 6, w: 0.95, faint: true },
  // gable finial
  { d: "M 800 232 L 800 208", i: 7, w: 1 },
  { d: "M 795 203 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0", i: 8, w: 0.95 },
  // arched attic light (no oculus — kept clear of the gable peak)
  { d: "M 768 372 L 768 318 C 768 300 832 300 832 318 L 832 372 Z", i: 9, w: 0.95, faint: true },
  { d: "M 800 310 L 800 372 M 768 344 L 832 344", i: 10, w: 0.85, faint: true },

  // ── left chimney stack (taller, clearer caps) ──
  { d: "M 588 338 L 588 148 M 640 338 L 640 148", i: 6, w: 1.2 },
  { d: "M 576 148 L 652 148", i: 7, w: 1.1 },
  { d: "M 570 136 L 658 136", i: 8, w: 1.05 },
  { d: "M 582 136 L 582 122 M 646 136 L 646 122", i: 9, w: 0.9, faint: true },
  { d: "M 574 122 L 654 122", i: 9, w: 0.95, faint: true },

  // ── right chimney stack ──
  { d: "M 960 338 L 960 162 M 1012 338 L 1012 162", i: 7, w: 1.2 },
  { d: "M 948 162 L 1024 162", i: 8, w: 1.1 },
  { d: "M 942 150 L 1030 150", i: 9, w: 1.05 },
  { d: "M 954 150 L 954 136 M 1018 150 L 1018 136", i: 10, w: 0.9, faint: true },
  { d: "M 946 136 L 1026 136", i: 10, w: 0.95, faint: true },

  // ── entrance porch (centred, pediment + arched door + steps)
  //    kept below the first-floor window sill (y=520) with a clear gap ──
  { d: "M 756 818 L 756 560 L 844 560 L 844 818", i: 5, w: 1.2 },
  { d: "M 746 560 L 800 538 L 854 560", i: 7, w: 1.1 },
  { d: "M 752 560 L 800 544 L 848 560", i: 8, w: 0.85, faint: true },
  { d: "M 774 818 L 774 618 C 774 594 826 594 826 618 L 826 818", i: 8, w: 1.1 },
  { d: "M 800 622 L 800 800", i: 10, w: 0.9, faint: true },
  { d: "M 738 818 L 862 818 M 746 806 L 854 806 M 754 794 L 846 794", i: 9, w: 0.9, faint: true },

  // ── first-floor window above the entrance ──
  { d: "M 770 436 L 770 520 L 830 520 L 830 436 Z", i: 10, w: 1 },
  { d: "M 770 478 L 830 478 M 800 436 L 800 520", i: 11, w: 0.85, faint: true },
  { d: "M 764 430 L 836 430", i: 11, w: 0.8, faint: true },

  // ── left two-storey canted bay window ──
  { d: "M 540 818 L 540 448 L 568 426 L 678 426 L 706 448 L 706 818", i: 5, w: 1.2 },
  { d: "M 540 448 L 568 426 L 678 426 L 706 448", i: 6, w: 1, faint: true },
  { d: "M 584 426 L 584 818 M 662 426 L 662 818", i: 9, w: 0.9, faint: true },
  { d: "M 540 560 L 706 560 M 540 688 L 706 688", i: 9, w: 0.9, faint: true },
  // bay sash muntins
  { d: "M 552 470 L 552 540 M 694 470 L 694 540", i: 10, w: 0.75, faint: true },
  { d: "M 552 600 L 552 670 M 694 600 L 694 670", i: 11, w: 0.75, faint: true },
  { d: "M 552 720 L 552 800 M 694 720 L 694 800", i: 11, w: 0.75, faint: true },

  // ── right stacked sash windows (upper) ──
  { d: "M 920 440 L 920 554 L 1018 554 L 1018 440 Z", i: 9, w: 1 },
  { d: "M 920 497 L 1018 497 M 969 440 L 969 554", i: 10, w: 0.85, faint: true },
  { d: "M 914 434 L 1024 434", i: 10, w: 0.8, faint: true },
  // right stacked sash windows (lower)
  { d: "M 920 640 L 920 770 L 1018 770 L 1018 640 Z", i: 10, w: 1 },
  { d: "M 920 705 L 1018 705 M 969 640 L 969 770", i: 11, w: 0.85, faint: true },
  { d: "M 914 634 L 1024 634", i: 11, w: 0.8, faint: true },

  // ── framing tree — tall elevation-style silhouette, clear of the bay (x≈520) ──
  // trunk (slight taper, soft lean)
  { d: "M 352 818 C 350 760 348 710 350 668", i: 11, w: 1.1 },
  { d: "M 372 818 C 374 760 376 710 374 668", i: 11, w: 1.1 },
  // crown rises from the trunk as one continuous outline (not a cloud blob)
  {
    d: "M 350 668 C 318 650 278 610 272 555 C 266 500 292 445 330 415 C 350 380 395 368 430 392 C 462 380 488 415 478 458 C 492 500 478 555 445 590 C 420 620 390 645 374 668 C 368 672 356 672 350 668 Z",
    i: 12,
    w: 1.15,
  },
  // soft inner mass — one quiet contour for depth
  {
    d: "M 330 600 C 310 560 318 505 350 475 C 375 450 420 455 435 495 C 448 530 430 575 395 595 C 370 615 345 620 330 600 Z",
    i: 13,
    w: 0.85,
    faint: true,
  },
  // two light foliage strokes (kept sparse)
  { d: "M 300 520 C 315 490 350 475 385 485", i: 14, w: 0.75, faint: true },
  { d: "M 360 545 C 380 520 415 515 445 535", i: 14, w: 0.75, faint: true },
];

export default function HeroSketch() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 text-[#7a92b0]"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
      >
        {/* nudged right so the drawing sits beside the hero copy, not behind it */}
        <g transform="translate(380, 20) scale(1.02)">
          {STROKES.map((s, idx) => (
            <path
              key={idx}
              d={s.d}
              pathLength={1}
              className="sketch-path"
              style={{ "--i": s.i } as React.CSSProperties}
              stroke="currentColor"
              strokeOpacity={s.faint ? 0.32 : 0.52}
              strokeWidth={s.w ?? 1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
