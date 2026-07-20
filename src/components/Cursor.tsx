"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/*
  Responsive brand cursor.
    • Inner dot tracks the pointer 1:1 (no spring) so it feels locked & instant.
    • Outer ring follows on a light spring and clearly reacts to state:
        – over a link/button  → expands into a soft silver→gold halo
        – on press            → snaps smaller (tactile click feedback)
    • No mix-blend-difference / no text label — the old version's two sources of
      "what is this doing" confusion are gone.
*/
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  // dot = raw pointer position (instant); ring = gentle spring off the same.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor-active");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest(
        "a, button, [data-cursor], input, textarea, select",
      );
      setHovering(!!el);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [x, y]);

  if (!enabled) return null;

  const ringSize = hovering ? 46 : 30;

  return (
    <>
      {/* soft brand halo — grows on hover, gives the ring a "lit" quality */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          x: ringX,
          y: ringY,
          background:
            "radial-gradient(circle, rgba(30,79,146,0.22), rgba(120,150,195,0.16) 45%, transparent 70%)",
        }}
        animate={{
          width: hovering ? 84 : 40,
          height: hovering ? 84 : 40,
          opacity: hovering ? 1 : 0.55,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      />

      {/* ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ x: ringX, y: ringY }}
        animate={{
          width: pressed ? ringSize - 8 : ringSize,
          height: pressed ? ringSize - 8 : ringSize,
          borderColor: hovering ? "rgba(26,77,143,0.9)" : "rgba(6,28,70,0.35)",
          borderWidth: hovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {/* dot — locked to the pointer */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
        style={{ x, y }}
        animate={{ scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
