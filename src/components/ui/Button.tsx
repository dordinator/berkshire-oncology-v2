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

type Variant = "primary" | "ghost" | "light";

const base =
  "group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white",
  ghost: "border border-ink/15 text-ink hover:border-ink/40",
  light: "bg-white text-ink shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)]",
};

/** The colour that wipes in behind the label on hover. */
const fills: Record<Variant, string> = {
  primary: "bg-accent",
  ghost: "bg-ink/[0.05]",
  light: "bg-canvas-soft",
};

export default function Button({
  children,
  href = "#book",
  variant = "primary",
  className = "",
  arrow = true,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-smooth group-hover:scale-x-100 motion-reduce:transition-none ${fills[variant]}`}
      />
      <span className="relative">{children}</span>
      {arrow && (
        <svg
          className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Link>
  );
}
