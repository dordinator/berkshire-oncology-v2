"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Makes every Framer Motion animation (reveals, hovers, the nav dropdown, etc.)
// respect the visitor's "reduce motion" OS setting. CSS handles the rest, and
// the GSAP work in src/lib/gsap.ts handles its own via gsap.matchMedia() —
// MotionConfig only reaches components that render through this library.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
