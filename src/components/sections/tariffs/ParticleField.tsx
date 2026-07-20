"use client";

/*
  ParticleField — a flowing field of dots arranged into layered waves, drawn on
  a canvas behind the tariffs hero. The dots gently drift, and scatter away from
  the pointer (particle repulsion) before easing back to their home positions.

  Pointer tracking lives on window so the canvas can stay pointer-events-none
  (the heading/links above it stay fully interactive). prefers-reduced-motion
  renders a single static frame with no drift or repulsion.
*/

import { useEffect, useRef } from "react";

const BLUES = ["#1a4d8f", "#3f6fb0", "#20549a", "#6f8fc0", "#9fb9dc"];
const GOLDS = ["#c8992f", "#d9b04a", "#a9791a"];

type P = {
  bx: number; // home x
  by: number; // home y
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number; // alpha
  color: string;
  phase: number;
  bob: number; // drift amplitude
  speed: number;
};

const FADE = {
  // large hero band: soft top/bottom + subtle left/right
  band:
    "linear-gradient(to bottom, transparent, #000 16%, #000 78%, transparent), linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)",
  // inside a card: dots emerge low, solid at the bottom, soft on the sides
  card:
    "linear-gradient(to bottom, transparent 6%, #000 52%, #000 100%), linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
  // closing feature: fades in from the top, runs solid to the very bottom edge
  // (so the dots sit flush against the footer), soft on the sides
  footer:
    "linear-gradient(to bottom, transparent, #000 38%, #000 100%), linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)",
} as const;

export default function ParticleField({
  className = "",
  midYFrac = 0.55,
  ampScale = 1,
  layers = 10,
  layerGap = 14,
  repelRadius = 130,
  repelForce = 5.5,
  edgeFade = "band",
}: {
  className?: string;
  midYFrac?: number;
  ampScale?: number;
  layers?: number;
  layerGap?: number;
  repelRadius?: number;
  repelForce?: number;
  edgeFade?: keyof typeof FADE;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let particles: P[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      particles = [];
      // dot spacing scales a little with width; keeps count sane on big screens
      const dx = Math.max(4.5, width / 330);
      const LAYERS = layers;
      const midY = height * midYFrac;

      for (let l = 0; l < LAYERS; l++) {
        // each layer is a copy of a compound wave, offset vertically
        const off = (l - (LAYERS - 1) / 2) * layerGap;
        const amp1 = height * 0.13 * ampScale + off * 0.15;
        const amp2 = height * 0.05 * ampScale;
        const ph1 = l * 0.18;
        const ph2 = l * 0.32 + 1;
        // fade the outermost layers so the band has soft top/bottom edges
        const edge = 1 - Math.abs(l - (LAYERS - 1) / 2) / ((LAYERS - 1) / 2);
        const layerAlpha = 0.35 + 0.65 * edge;

        for (let x = 0; x <= width; x += dx) {
          const t = x / width;
          const y =
            midY +
            off -
            amp1 * Math.cos(2 * Math.PI * 1.0 * t + ph1) -
            amp2 * Math.sin(2 * Math.PI * 2.3 * t + ph2);
          // thin the dots a touch, randomly, so rows don't look like solid lines
          if (Math.random() > 0.93) continue;
          const jitterY = (Math.random() - 0.5) * 6;
          const gold = Math.random() < 0.16;
          const palette = gold ? GOLDS : BLUES;
          particles.push({
            bx: x + (Math.random() - 0.5) * 3,
            by: y + jitterY,
            x: x,
            y: y + jitterY,
            vx: 0,
            vy: 0,
            r: (gold ? 1.1 : 0.9) + Math.random() * 0.9,
            a: layerAlpha * (0.5 + Math.random() * 0.5),
            color: palette[(Math.random() * palette.length) | 0],
            phase: Math.random() * Math.PI * 2,
            bob: 2 + Math.random() * 4,
            speed: 0.4 + Math.random() * 0.6,
          });
        }
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduce) draw(0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const homeY = reduce ? p.by : p.by + Math.sin(t * p.speed + p.phase) * p.bob;
        let ax = (p.bx - p.x) * 0.055;
        let ay = (homeY - p.y) * 0.055;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repelRadius * repelRadius) {
            const d = Math.sqrt(d2) || 0.001;
            const f = (1 - d / repelRadius) * repelForce;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }

        p.vx = (p.vx + ax) * 0.82;
        p.vy = (p.vy + ay) * 0.82;
        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let start = 0;
    const loop = (ts: number) => {
      if (!start) start = ts;
      draw((ts - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.x = x;
      mouse.y = y;
      mouse.active =
        x > -40 && x < width + 40 && y > -40 && y < height + 40;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
    // config props are constant per mount; this is a mount-once canvas setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        WebkitMaskImage: FADE[edgeFade],
        maskImage: FADE[edgeFade],
        WebkitMaskComposite: "source-in",
        maskComposite: "intersect",
      }}
    />
  );
}
