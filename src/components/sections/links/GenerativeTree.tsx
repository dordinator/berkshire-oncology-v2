"use client";

/*
  GenerativeTree — the /links signature feature: an L-system-inspired branching
  tree that grows from the base, holds, fades and regrows in a continuous
  cycle, with warm-gold painterly branches, drifting embers, wind-sway and a
  click-to-shake. Sits in a full-bleed dark-navy band on the otherwise light
  page.

  Adapted from "Generative Branching Tree" in Paul Bakaus's Radiant collection
  (https://github.com/pbakaus/radiant), used under the MIT licence:

    MIT License — Copyright (c) 2025 Paul Bakaus
    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

  Changes from the source: re-skinned to the brand navy backdrop (#061c46);
  runs in its own element (ResizeObserver) rather than the full window, with
  device-pixel-ratio scaling for crisp retina rendering; pauses when off-screen
  or the tab is hidden; renders one fully-grown static tree under reduced
  motion; pointer wind/shake use element-local coordinates and no longer
  preventDefault touch moves (so the page still scrolls on mobile).
*/

import { useEffect, useRef, useState } from "react";

export default function GenerativeTree({
  className = "",
}: {
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // pre-rendered soft gold dot for the tip "leaves" (bloom) — cheap
    // drawImage per tip instead of a per-frame radial gradient
    const tipSprite = document.createElement("canvas");
    tipSprite.width = 32;
    tipSprite.height = 32;
    {
      const p = tipSprite.getContext("2d")!;
      const g = p.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(230, 190, 116, 1)");
      g.addColorStop(0.5, "rgba(208, 168, 98, 0.42)");
      g.addColorStop(1, "rgba(208, 168, 98, 0)");
      p.fillStyle = g;
      p.fillRect(0, 0, 32, 32);
    }

    let W = 0;
    let H = 0;

    // --- Utilities ---
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rand = (lo: number, hi: number) => Math.random() * (hi - lo) + lo;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const smoothstep = (a: number, b: number, t: number) => {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    // --- Configuration ---
    let MAX_DEPTH = 9;
    const MAX_BRANCHES = 1150; // perf safety cap on total branch count
    let GROWTH_SPEED_BASE = 0.014; // faster growth

    function resize() {
      W = wrap!.clientWidth || 1;
      H = wrap!.clientHeight || 1;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px, crisp on retina
    }

    // --- Color palette (brand navy trunk → warm gold at the tips) so the
    //     tree reads on the LIGHT page: mostly navy, only the outermost
    //     branches warm through to gold. ---
    const PALETTE = [
      { r: 10, g: 32, b: 70 }, // deep navy (trunk)
      { r: 14, g: 44, b: 90 }, // navy
      { r: 22, g: 58, b: 112 }, // accent blue
      { r: 40, g: 74, b: 120 }, // lighter accent
      { r: 150, g: 128, b: 84 }, // warming toward gold
      { r: 205, g: 165, b: 96 }, // warm gold tips
    ];

    function colorForDepth(depth: number, hueShift?: number) {
      const t = depth / MAX_DEPTH;
      const idx = t * (PALETTE.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(PALETTE.length - 1, i0 + 1);
      const f = idx - i0;
      let r = lerp(PALETTE[i0].r, PALETTE[i1].r, f);
      let g = lerp(PALETTE[i0].g, PALETTE[i1].g, f);
      let b = lerp(PALETTE[i0].b, PALETTE[i1].b, f);

      if (hueShift !== undefined) {
        const strength = t * t * 22;
        r += hueShift * strength * 1.0;
        g += hueShift * strength * -0.5;
        b += hueShift * strength * -0.15;
      }
      return { r, g, b };
    }

    // --- Branch data ---
    type Branch = {
      x0: number;
      y0: number;
      angle: number;
      length: number;
      thickness: number;
      depth: number;
      growthProgress: number;
      growthSpeed: number;
      children: Branch[];
      spawned: boolean;
      swayPhase: number;
      swayAmp: number;
      curvature: number;
      colorShift: number;
      hueShift: number;
      parent: Branch | null;
      strokeSeeds: number[];
      tipDots: { ox: number; oy: number; size: number; alpha: number }[];
    };

    let allBranches: Branch[] = [];
    let treeAlpha = 1;
    let treeState: "growing" | "holding" | "fading" | "waiting" = "growing";
    let holdTimer = 0;
    let fadeTimer = 0;
    let waitTimer = 0;

    function createTree() {
      allBranches = [];

      const trunkLen = H * rand(0.27, 0.32); // taller tree
      const trunkThick = Math.max(10, W * 0.019); // thicker trunk
      // anchored at the bottom-LEFT and leaning right, so the tree rises up
      // the left side and fans into the page — leaving the centred title and
      // cards clear
      const trunkAngle = -Math.PI / 2 + rand(0.12, 0.2);

      allBranches.push({
        x0: W * rand(0.06, 0.12),
        y0: H + trunkThick * 0.5,
        angle: trunkAngle,
        length: trunkLen,
        thickness: trunkThick,
        depth: 0,
        growthProgress: 0,
        growthSpeed: GROWTH_SPEED_BASE * rand(0.9, 1.1),
        children: [],
        spawned: false,
        swayPhase: rand(0, Math.PI * 2),
        swayAmp: 0.0008,
        curvature: rand(-0.015, 0.015),
        colorShift: rand(-8, 8),
        hueShift: 0,
        parent: null,
        strokeSeeds: [rand(-1, 1), rand(-1, 1), rand(-1, 1), rand(-1, 1), rand(-1, 1)],
        tipDots: [],
      });

      treeState = "growing";
      holdTimer = fadeTimer = waitTimer = 0;
      treeAlpha = 1;
    }

    function spawnChildren(parent: Branch) {
      if (parent.depth >= MAX_DEPTH) return;
      if (allBranches.length >= MAX_BRANCHES) return;

      let numChildren: number;
      if (parent.depth < 1) numChildren = 2 + (Math.random() < 0.5 ? 1 : 0);
      else if (parent.depth < 3) numChildren = 2 + (Math.random() < 0.55 ? 1 : 0);
      else numChildren = Math.random() < 0.5 ? 3 : 2;

      // Light pruning only at the very outer depths — keeps the crown full
      // and broad rather than airy.
      const pruneChance =
        parent.depth <= 4
          ? 0
          : parent.depth <= 6
          ? 0.05
          : parent.depth <= 8
          ? 0.12
          : 0.2;
      if (Math.random() < pruneChance) numChildren = Math.max(1, numChildren - 1);

      // Wider fan, especially at the outer depths, so the crown spreads broad
      // across the top.
      const spread = parent.depth < 2 ? rand(0.42, 0.6) : rand(0.54, 0.84);

      for (let i = 0; i < numChildren; i++) {
        let angleOffset: number;
        if (numChildren === 1) {
          angleOffset = rand(-0.25, 0.25);
        } else if (numChildren === 2) {
          angleOffset = (i === 0 ? -1 : 1) * rand(0.18, spread);
        } else {
          angleOffset = (i - 1) * spread + rand(-0.1, 0.1);
        }

        const childAngle = parent.angle + angleOffset;
        const lengthFactor = rand(0.58, 0.76);
        const thickFactor = rand(0.48, 0.67);

        const ep = getBranchEnd(parent, 1, 0);

        // tips ("leaves") are assigned after growth completes, to every leaf
        // (see bloomLeaves) — so the bloom is full & consistent regardless of
        // where the branch cap truncates the random tree
        const tipDots: Branch["tipDots"] = [];

        const child: Branch = {
          x0: ep.x,
          y0: ep.y,
          angle: childAngle,
          length: parent.length * lengthFactor,
          thickness: Math.max(0.8, parent.thickness * thickFactor),
          depth: parent.depth + 1,
          growthProgress: 0,
          growthSpeed:
            GROWTH_SPEED_BASE * rand(1.0, 1.5) * (1 + parent.depth * 0.1),
          children: [],
          spawned: false,
          swayPhase: rand(0, Math.PI * 2),
          swayAmp: 0.0018 * (parent.depth + 1) * rand(0.7, 1.3),
          curvature: rand(-0.04, 0.04) * (1 + parent.depth * 0.12),
          colorShift: rand(-12, 12),
          hueShift: Math.max(
            -1,
            Math.min(1, parent.hueShift + rand(-0.35, 0.35))
          ),
          parent: parent,
          strokeSeeds: [rand(-1, 1), rand(-1, 1), rand(-1, 1), rand(-1, 1), rand(-1, 1)],
          tipDots: tipDots,
        };

        parent.children.push(child);
        allBranches.push(child);
      }
    }

    // --- Sway (multi-frequency wind + mouse wind + shake) ---
    function getSwayAngle(branch: Branch, time: number) {
      let total = 0;
      let b: Branch | null = branch;
      let depth = 0;
      while (b) {
        const a = b.swayAmp;
        total += Math.sin(time * 0.0005 + b.swayPhase) * a;
        total += Math.sin(time * 0.0003 + b.swayPhase * 1.7) * a * 0.6;
        total += Math.sin(time * 0.00012 + b.swayPhase * 0.4) * a * 0.35;
        depth++;
        b = b.parent;
      }
      total += windForce * 0.024 * depth; // cursor wind-bend (eases to 0)
      if (shakeAmount > 0.01) {
        total +=
          Math.sin(time * 0.015 + branch.swayPhase * 3) * shakeAmount * 0.06 * depth;
      }
      return total;
    }

    function getBranchEnd(branch: Branch, progress: number, time: number) {
      const sway = getSwayAngle(branch, time);
      const angle = branch.angle + sway;
      const len = branch.length * progress;
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const curveOff = branch.curvature * len;
      return {
        x: branch.x0 + Math.cos(angle) * len + perpX * curveOff,
        y: branch.y0 + Math.sin(angle) * len + perpY * curveOff,
      };
    }

    function recalcPositions(time: number) {
      for (const b of allBranches) {
        if (b.parent) {
          const pe = getBranchEnd(b.parent, 1, time);
          b.x0 = pe.x;
          b.y0 = pe.y;
        }
      }
    }

    function updateBranches(time: number) {
      let allDone = true;
      for (const b of allBranches) {
        if (b.growthProgress < 1) {
          b.growthProgress = Math.min(1, b.growthProgress + b.growthSpeed);
          allDone = false;
        }
        if (b.growthProgress >= 0.65 && !b.spawned) {
          b.spawned = true;
          spawnChildren(b);
        }
      }
      return allDone;
    }

    // once grown, gild every leaf (a branch with no children — the canopy
    // tips, including any cut short by the branch cap) so the gold bloom is
    // full and the same density on every load
    function bloomLeaves() {
      for (const b of allBranches) {
        if (b.children.length === 0 && b.tipDots.length === 0 && b.depth >= 3) {
          const count = Math.random() < 0.6 ? 2 : 1;
          for (let d = 0; d < count; d++) {
            b.tipDots.push({
              ox: rand(-2, 2),
              oy: rand(-2, 2),
              size: rand(0.8, 1.6), // original tip size
              alpha: rand(0.26, 0.46),
            });
          }
        }
      }
    }

    // --- Branch drawing (multi-stroke painterly) ---
    function drawBranch(drawCtx: CanvasRenderingContext2D, b: Branch, time: number) {
      if (b.growthProgress <= 0) return;

      const sway = getSwayAngle(b, time);
      const angle = b.angle + sway;
      const progress = easeOutCubic(b.growthProgress);
      const len = b.length * progress;

      const x1 = b.x0;
      const y1 = b.y0;

      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      const curveOff = b.curvature * len * 1.4;
      const cpx1 = x1 + Math.cos(angle) * len * 0.33 + perpX * curveOff * 0.4;
      const cpy1 = y1 + Math.sin(angle) * len * 0.33 + perpY * curveOff * 0.4;
      const cpx2 = x1 + Math.cos(angle) * len * 0.66 + perpX * curveOff * 0.85;
      const cpy2 = y1 + Math.sin(angle) * len * 0.66 + perpY * curveOff * 0.85;
      const x2 = x1 + Math.cos(angle) * len + perpX * curveOff * 0.7;
      const y2 = y1 + Math.sin(angle) * len + perpY * curveOff * 0.7;

      const col = colorForDepth(b.depth, b.hueShift);
      const depthT = b.depth / MAX_DEPTH;
      // gentler falloff than the source so the canopy stays present rather
      // than fading to faint twigs (outer branches held at ~0.62, not 0.35)
      const baseAlpha =
        b.depth <= 1
          ? 0.95
          : b.depth <= 5
          ? lerp(0.95, 0.85, depthT)
          : lerp(0.85, 0.62, (depthT - 0.5) * 2);

      const strokeCount = b.depth < 3 ? 5 : b.depth < 6 ? 3 : 2;
      const thickBase = b.thickness;
      const thickTaper = lerp(thickBase, thickBase * 0.45, progress); // keep tips fuller

      for (let s = 0; s < strokeCount; s++) {
        const seed = b.strokeSeeds[s] || 0;
        const normalizedS = strokeCount > 1 ? s / (strokeCount - 1) - 0.5 : 0;

        const offsetAmt = normalizedS * thickBase * 0.35 + seed * thickBase * 0.08;
        const ox = perpX * offsetAmt;
        const oy = perpY * offsetAmt;

        const shift = normalizedS * 22 + b.colorShift * 0.3;
        const r = Math.max(0, Math.min(255, col.r + shift));
        const g = Math.max(0, Math.min(255, col.g + shift * 0.65));
        const bb = Math.max(0, Math.min(255, col.b + shift * 0.4));

        const isCore = s === Math.floor(strokeCount / 2);
        const alpha = baseAlpha * (isCore ? 1.0 : 0.5);
        const thick = thickTaper * (isCore ? 1.0 : lerp(0.65, 0.45, Math.abs(normalizedS)));

        drawCtx.beginPath();
        drawCtx.moveTo(x1 + ox, y1 + oy);
        drawCtx.bezierCurveTo(cpx1 + ox, cpy1 + oy, cpx2 + ox, cpy2 + oy, x2 + ox, y2 + oy);
        drawCtx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${bb | 0}, ${alpha})`;
        drawCtx.lineWidth = thick;
        drawCtx.lineCap = "round";
        drawCtx.stroke();
      }

      // luminous gold tips ("leaves") — cheap sprite blit, alpha keeps the
      // page-level treeAlpha fade
      if (b.tipDots.length > 0 && b.growthProgress > 0.92) {
        const tipFade = smoothstep(0.92, 1.0, b.growthProgress);
        for (const dot of b.tipDots) {
          const dx = x2 + dot.ox;
          const dy = y2 + dot.oy;
          // cursor bloom: blossoms near the pointer brighten & grow
          const near =
            bloomK * Math.max(0, 1 - Math.hypot(dx - cbx, dy - cby) / 180);
          const da = tipFade * dot.alpha * (3.0 + near * 5.5);
          const ds = dot.size * (2 + near * 2.6);
          drawCtx.globalAlpha = Math.min(1, da) * treeAlpha;
          drawCtx.drawImage(tipSprite, dx - ds, dy - ds, ds * 2, ds * 2);
        }
        drawCtx.globalAlpha = treeAlpha;
      }
    }

    // --- Scene ---
    function drawScene(time: number) {
      // transparent canvas — the light page background shows through so the
      // tree reads as an ambient backdrop, no dark fill / glow / vignette
      ctx!.clearRect(0, 0, W, H);

      recalcPositions(time);

      ctx!.save();
      ctx!.globalAlpha = treeAlpha;
      for (const b of allBranches) {
        drawBranch(ctx!, b, time);
      }
      ctx!.restore();
    }

    // --- cursor interaction ---
    // Tracked on the WINDOW so the tree (a pointer-events-none background)
    // reacts to the cursor anywhere on the page without stealing clicks from
    // the links. windForce → a gentle wind-bend (deeper branches lean more);
    // (cbx,cby) → the smoothed cursor in canvas px, driving the bloom glow.
    // All values are eased each frame so nothing snaps.
    let mouseActive = false;
    let windForce = 0; // smoothed −1..1 horizontal lean
    let shakeAmount = 0; // dormant (kept for the sway formula)
    let ptrClientX = 0;
    let ptrClientY = 0;
    let cbx = -9999;
    let cby = -9999;
    let bloomK = 0; // 0..1 how engaged the cursor bloom glow is
    const onWinMove = (e: MouseEvent) => {
      ptrClientX = e.clientX;
      ptrClientY = e.clientY;
      mouseActive = true;
    };
    const onWinLeave = () => {
      mouseActive = false;
    };

    // --- loop / lifecycle ---
    let raf = 0;
    let onScreen = true;
    let visible = !document.hidden;
    let disposed = false;

    function frame(time: number) {
      if (disposed) return;
      if (shakeAmount > 0.01) shakeAmount *= 0.95;
      else shakeAmount = 0;

      // ease the cursor interaction each frame (smooth, never snaps)
      let targetWind = 0;
      let lx = cbx;
      let ly = cby;
      if (mouseActive) {
        const rect = canvas!.getBoundingClientRect();
        lx = ptrClientX - rect.left;
        ly = ptrClientY - rect.top;
        targetWind = Math.max(-1, Math.min(1, (lx - W / 2) / (W / 2)));
      }
      windForce += (targetWind - windForce) * 0.05;
      cbx += (lx - cbx) * 0.12;
      cby += (ly - cby) * 0.12;
      bloomK += ((mouseActive ? 1 : 0) - bloomK) * 0.08;

      switch (treeState) {
        case "growing": {
          const done = updateBranches(time);
          drawScene(time);
          if (done) {
            bloomLeaves(); // the one-time bloom, then hold
            treeState = "holding";
          }
          break;
        }
        case "holding": {
          // the growth animation runs ONCE — then hold the fully-grown,
          // bloomed tree indefinitely (gentle sway only, no fade / regrow)
          drawScene(time);
          break;
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function updateRunning() {
      const shouldRun = !reduce && onScreen && visible && !disposed;
      if (shouldRun && !raf) {
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    // reduced motion: grow one full tree, draw it once, no loop
    function buildStatic() {
      createTree();
      let guard = 0;
      while (!updateBranches(16) && guard++ < 6000) {
        /* advance growth until the whole tree has spawned + grown */
      }
      for (const b of allBranches) b.growthProgress = 1;
      bloomLeaves();
      treeState = "holding";
      drawScene(16);
    }

    // --- boot ---
    resize();
    if (reduce) {
      buildStatic();
    } else {
      createTree();
      updateRunning();
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) buildStatic();
      else createTree(); // restart cleanly at the new size
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        updateRunning();
      },
      { rootMargin: "120px" }
    );
    io.observe(wrap);

    const onVis = () => {
      visible = !document.hidden;
      updateRunning();
    };
    document.addEventListener("visibilitychange", onVis);

    if (!reduce) {
      window.addEventListener("mousemove", onWinMove);
      document.addEventListener("mouseleave", onWinLeave);
    }

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onWinMove);
      document.removeEventListener("mouseleave", onWinLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;

  return (
    <div ref={wrapRef} aria-hidden className={`overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
