import Link from "next/link";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// The button never moves. It used to be wrapped in <Magnetic>, which pulled it
// toward the cursor — on a medical practice's site that reads as a gimmick, and
// a control that shifts under the pointer is harder to hit, not easier.
//
// The hover affordance is a colour fill that wipes across from the left. The
// button box stays exactly where it is; only the fill and the arrow move.
// ─────────────────────────────────────────────────────────────────────────────

// `onPhoto` and `onPhotoGhost` are the hero pair. The solid hero button adds an
// inner paint layer so its local styles can uncover blue without a white rim.
type Variant =
  | "primary"
  | "ghost"
  | "light"
  | "onPhoto"
  | "onPhotoGhost"
  | "sage";

// Keyboard focus uses the same shaped side-fill as hover plus a visible outline.
const base =
  "site-button type-button group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-button px-7 py-3.5 transition-colors duration-300";

// A visible two-pixel border is present in both states, so the animated fill
// cannot paint over it and no dimensions change on hover or keyboard focus.
const variants: Record<Variant, string> = {
  primary:
    "border-2 border-ink bg-ink text-white hover:border-ink focus-visible:border-ink",
  ghost: "border-2 border-ink/60 text-ink hover:border-ink",
  light: "border-2 border-ink/60 bg-white text-ink shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
  onPhoto:
    "border-2 border-white bg-white text-ink shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] hover:border-accent hover:text-white focus-visible:border-accent focus-visible:text-white",
  onPhotoGhost:
    "border-2 border-white text-white hover:border-white",
  // Deep sage with white text.
  sage: "border-2 border-sage bg-sage text-white",
};

/** The colour that wipes in behind the label on hover. */
const fills: Record<Variant, string> = {
  primary: "bg-accent",
  ghost: "bg-ink/[0.05]",
  light: "bg-canvas-soft",
  onPhoto: "bg-accent",
  onPhotoGhost: "bg-white/15",
  sage: "bg-sage-deep",
};

export default function Button({
  children,
  href = "#book",
  variant = "primary",
  className = "",
  arrow = true,
  external = false,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {/* Match the outer border box, not the smaller padding box. Reusing the
          outer radius inside an inset box leaves crescent-shaped corner gaps.
          The button's overflow clips the fill beneath its two-pixel border. */}
      <span
        aria-hidden
        className={`absolute -inset-[2px] -z-10 rounded-[inherit] -translate-x-[101%] transition-transform duration-500 ease-[cubic-bezier(.65,0,.25,1)] group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none ${fills[variant]}`}
      >
        {/* The hero styles move this white complement over a fixed blue face. */}
        {variant === "onPhoto" && <span />}
      </span>
      <span className="relative">{children}</span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
      {arrow && (
        <svg
          className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          {external ? (
            <path
              d="M5 11 11 5M6 5h5v5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </Link>
  );
}
