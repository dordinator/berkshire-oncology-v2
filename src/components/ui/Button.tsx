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

// `onPhoto` and `onPhotoGhost` are the pair used over the home hero. They are
// here rather than local to the hero so the wipe is one implementation: the
// fill, timing and easing are shared with every other button on the site.
type Variant =
  | "primary"
  | "ghost"
  | "light"
  | "onPhoto"
  | "onPhotoGhost"
  | "sage";

// There is no focus ring on this site, so keyboard focus has to come from the
// button itself. focus-visible runs the same fill that hover wipes in — the
// difference being it arrives at once rather than wiping across, which reads as
// "landed here" rather than "pointer passing over".
const base =
  "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300";

// Blue-fill hover states use the button's own two-pixel border. Keeping the
// border transparent in the resting state prevents movement when its active
// colour appears, and the animated fill cannot paint over it.
const variants: Record<Variant, string> = {
  primary:
    "border-2 border-transparent bg-ink text-white hover:border-ink focus-visible:border-ink",
  ghost: "border border-ink/15 text-ink hover:border-ink/40",
  light: "bg-white text-ink shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
  onPhoto:
    "border-2 border-transparent bg-white text-ink shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] hover:border-white hover:text-white focus-visible:border-white",
  onPhotoGhost:
    "border border-white/45 text-white hover:border-white/80",
  // The cancer-types sheet's pill: deep sage, AA against white numerals.
  sage: "bg-[#5c7767] text-white",
};

/** The colour that wipes in behind the label on hover. */
const fills: Record<Variant, string> = {
  primary: "bg-accent",
  ghost: "bg-ink/[0.05]",
  light: "bg-canvas-soft",
  onPhoto: "bg-accent",
  onPhotoGhost: "bg-white/15",
  sage: "bg-[#4d6659]",
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
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-smooth group-hover:scale-x-100 group-focus-visible:scale-x-100 group-focus-visible:duration-150 motion-reduce:transition-none ${fills[variant]}`}
      />
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
