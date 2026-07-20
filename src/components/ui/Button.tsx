"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Magnetic from "./Magnetic";

type Variant = "primary" | "ghost" | "light";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-colors duration-300 will-change-transform";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-accent",
  ghost:
    "border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  light:
    "bg-white text-ink shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_-8px_rgba(91,91,245,0.3)]",
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
    <Magnetic strength={0.3} className="inline-block">
      <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
        <span className="relative z-10">{children}</span>
        {arrow && (
          <svg
            className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 16 16"
            fill="none"
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
    </Magnetic>
  );
}
