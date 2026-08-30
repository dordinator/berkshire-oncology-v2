"use client";

import { palette } from "@/lib/designTokens";

// Quiet mode: one gentle wave and a few hairline ticks. Nothing animates beyond
// a slow, barely-there drift — this is the mode for someone who does not want a
// website performing at them today.

export default function QuietWave({
  className = "",
  ticks = true,
}: {
  className?: string;
  ticks?: boolean;
}) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="qw-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0" />
            <stop offset="18%" stopColor={palette.accent} stopOpacity="0.45" />
            <stop offset="72%" stopColor={palette.accentSoft} stopOpacity="0.4" />
            <stop offset="100%" stopColor={palette.gold} stopOpacity="0.22" />
          </linearGradient>
        </defs>

        {/* the single wave */}
        <path
          d="M0 74 C 150 74, 210 34, 340 34 S 520 78, 660 78 S 880 40, 1010 40 S 1140 66, 1200 66"
          stroke="url(#qw-line)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* its echo, fainter and offset — gives depth without adding noise */}
        <path
          d="M0 84 C 160 84, 220 48, 350 48 S 530 90, 668 90 S 884 54, 1014 54 S 1142 78, 1200 78"
          stroke={palette.inkMuted}
          strokeOpacity="0.14"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {ticks && (
          <g stroke={palette.accent} strokeOpacity="0.22" strokeWidth="1">
            <path d="M232 30v10M232 96v-8" />
            <path d="M560 34v10M560 100v-8" />
            <path d="M888 30v10M888 96v-8" />
          </g>
        )}
      </svg>
    </div>
  );
}
