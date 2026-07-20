"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Makes every Framer Motion animation (reveals, hovers, the nav dropdown, etc.)
// respect the visitor's "reduce motion" OS setting. CSS handles the rest.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
