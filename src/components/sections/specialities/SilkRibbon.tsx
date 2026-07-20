"use client";

/*
  SilkRibbon — the /links signature feature: a weightless champagne silk
  ribbon suspended in a single full-bleed band, slowly drifting, folding and
  undulating, occasionally catching the light. Raw WebGL1 (zero deps, zero
  extensions): one program, one static triangle-strip mesh; all geometry lives
  in the vertex shader, all fabric shading in the fragment shader.

  Why it doesn't read as "a sine wave": the centerline runs over a DOMAIN-
  WARPED arc parameter with an asymmetric per-mount amplitude envelope, and an
  independent TWIST field folds the ribbon front↔back — projected width
  narrows toward fold lines, colour flips to the deeper back-face gold, and
  the anisotropic sheen only fires where twist happens to align with a slowly
  wandering light angle AND two slow gates are open (dark most of the time).

  Why it never repeats: spatial frequencies are pairwise irrational; temporal
  speeds are incommensurate with MIXED SIGNS (the pattern morphs rather than
  translates); phases are per-mount seeded. JS keeps time in float64 and
  uploads pre-wrapped phases (speed·t + seed mod 2π) — the shader never sees
  raw time, so there is no float32 drift at any session length.

  Lifecycle: rAF only while on-screen and the tab is visible; the clock
  accumulates elapsed time only while running (pause freezes mid-drift,
  resume is seamless). Reduced motion renders exactly one curated frame.
  WebGL unavailable → the whole band collapses (renders null) — the page
  stays clean rather than showing a lesser approximation.
*/

import { useEffect, useRef, useState } from "react";

/* ── art direction ─────────────────────────────────────────────────────── */
// band-space units: y ∈ [-1, 1] spans the band height
const AMP = 0.44; // centerline excursion (× envelope)
const HALF_W = 0.29; // ribbon half-width → full width ≈ 29% of band height
const BASE_Y = -0.03; // baseline sits ~centred in the band
const OVERHANG = 1.24; // clip-space |x| at u=0/1 — ribbon is cut by the viewport
const T_STATIC = 41.3; // curated timestamp for the reduced-motion frame
const SEED_STATIC = 0.618; // deterministic seed for that frame

// per-oscillator speeds (rad/s) — pairwise incommensurate, mixed signs.
// (scaled up ~2.6× from the original tuning — same ratios, so the
// never-repeats guarantee is untouched — just visibly livelier drift.)
const SPEED_A = [0.231, -0.143, 0.088, -0.374]; // centerline terms
const SPEED_B = [0.122, -0.185, 0.075, 0.049]; // twist ×3 + domain warp
const SPEED_L = [0.068, -0.044, 0.260, 0.201]; // light wander ×2 + gates ×2

const TWO_PI = Math.PI * 2;

/* ── shaders ───────────────────────────────────────────────────────────── */
const VERT = `
attribute vec2 aUV;

uniform vec4 uPhA;      // centerline phases (pre-wrapped)
uniform vec4 uPhB;      // twist phases xyz + domain-warp phase w
uniform vec4 uPhL;      // light wander xy + sheen gates zw
uniform vec4 uSeed;     // per-mount constants (.w = envelope phase)
uniform float uAspect;  // canvas w/h
uniform float uPxHeight;// canvas height in device px

varying float vFace;  // cos(twist) — signed facing
varying float vSin;   // sin(twist) — with vFace, lets the fragment evaluate
                      // cos(θ − light) per pixel with no angle-wrapping seams
                      // and no mediump precision loss on large angles
varying float vU;
varying float vV;
varying float vWidthPx;
varying float vTwist;
varying float vGate;  // slow bloom gates (rare-moment hierarchy)
varying float vDrift; // tiny key-light drift
varying float vLus1;
varying float vLus2;

const float AMP = ${AMP.toFixed(3)};
const float HALF_W = ${HALF_W.toFixed(3)};
const float BASE_Y = ${BASE_Y.toFixed(3)};
const float OVERHANG = ${OVERHANG.toFixed(3)};

// centerline height at u — domain-warped incommensurate sum with an
// asymmetric per-mount envelope. The warp + envelope are what keep this from
// reading as a translating sine wave.
float centerY(float u) {
  float s = u * 7.3;
  float sw = s + 0.55 * sin(0.41 * s + uPhB.w);           // warped domain
  float env = 0.55 + 0.45 * sin(1.7 * u + uSeed.w);       // asymmetric weight
  return BASE_Y + env * AMP * (
      0.40 * sin(1.000 * sw + uPhA.x)
    + 0.26 * sin(1.618 * sw + uPhA.y)                      // φ
    + 0.15 * sin(2.414 * sw + uPhA.z)                      // 1+√2
    + 0.08 * sin(3.883 * sw + uPhA.w));                    // pairwise irrational
}

// twist angle at u — the fold field. A LINEAR RAMP guarantees the ribbon
// always winds through ~3 turns across the screen (total winding 1.25·7.3 ≈
// 2.9π, so ≥2 edge-on folds are certain even at the wobble's worst-case
// cancellation — the ribbon can never flatten out into a plain band). The
// wobble only modulates WHERE the folds sit and how they drift, and uSeed.x
// rotates the whole field per mount.
float twistAt(float u) {
  float s = u * 7.3;
  return 1.25 * s + uSeed.x
       + 0.60 * sin(0.947 * s + uPhB.x)
       + 0.38 * sin(1.531 * s + uPhB.y)
       + 0.22 * sin(2.647 * s + uPhB.z);
}

void main() {
  float u = aUV.x;
  float v = aUV.y;
  float du = 1.0 / 360.0;

  // centerline + tangent by finite difference, in an isotropic space where
  // x is aspect-scaled so normal offsets aren't squashed.
  float yc = centerY(u);
  float yc2 = centerY(u + du);
  float xc = mix(-OVERHANG, OVERHANG, u);
  float xc2 = mix(-OVERHANG, OVERHANG, u + du);
  vec2 P = vec2(xc * uAspect, yc);
  vec2 P2 = vec2(xc2 * uAspect, yc2);
  vec2 T = normalize(P2 - P);
  vec2 N = vec2(-T.y, T.x);

  // twist → projected half-width, floored so edge-on never collapses to a
  // shimmering zero-width line (the floor reads as the folded selvedge).
  float th = twistAt(u);
  float ct = cos(th);
  float halfW = HALF_W * sqrt(ct * ct + 0.006);

  // quadratic cross-bow: the sheet sags across its width — curved fabric,
  // not a flat tape.
  float s = u * 7.3;
  float bow = v * v * 0.05 * sin(0.9 * s + uPhB.y);

  vec2 pos = P + N * (v * halfW + bow);
  gl_Position = vec4(pos.x / uAspect, pos.y, 0.0, 1.0);

  vFace = ct;
  vSin = sin(th);
  vV = v;
  vU = u;
  vWidthPx = halfW * uPxHeight * 0.5;                      // half-width in device px
  vTwist = abs(twistAt(u + du) - th) / (du * 7.3);         // |dθ/ds|

  // material hierarchy gates: two independent slow oscillators whose product
  // is usually small (calm silk), sometimes mid (richer lustre) and rarely
  // ~1 (the exceptional bloom). The fragment squares it to sharpen the tiers.
  vGate = smoothstep(0.45, 0.80, 0.5 + 0.5 * sin(uPhL.z))
        * smoothstep(0.40, 0.75, 0.5 + 0.5 * sin(uPhL.w));
  vDrift = sin(uPhL.x);         // barely-moving key light (life, not motion)
  vLus1 = uPhL.y;               // slow phases for the watered-silk luster —
  vLus2 = uPhB.w;               // integer-coefficient use only (wrapped)
}
`;

const FRAG = `
precision mediump float;

varying float vFace;
varying float vSin;
varying float vU;
varying float vV;
varying float vWidthPx;
varying float vTwist;
varying float vGate;
varying float vDrift;
varying float vLus1;
varying float vLus2;

void main() {
  // ── palette: layered and muted (ivory → champagne → honey → gold →
  //    bronze). No brass, no orange — quiet luxury on a light page. ──
  vec3 ivory     = vec3(0.937, 0.902, 0.800);
  vec3 champagne = vec3(0.894, 0.796, 0.576);
  vec3 paleGold  = vec3(0.906, 0.808, 0.596);
  vec3 richGold  = vec3(0.839, 0.690, 0.427);
  vec3 honey     = vec3(0.800, 0.647, 0.398);
  vec3 bronze    = vec3(0.557, 0.443, 0.290);

  float curv = smoothstep(0.6, 2.6, vTwist);      // fold tightness
  float fold = exp(-6.0 * vFace * vFace);         // edge-on-ness
  float edgeZone = smoothstep(0.55, 0.95, abs(vV));

  // microscopic fibre structure: a smooth per-fibre phase — jitters the
  // anisotropy width and sheen amplitude so the highlight reads as
  // thousands of aligned threads, never as procedural noise.
  float fibre = sin(vV * 137.0 + 2.7 * sin(vV * 53.0 + vU * 11.0));

  // ── studio lighting: three fixed soft lights (warm key, broad cool-ivory
  //    fill, faint rim). Glints EMERGE from the fibre anisotropy as folds
  //    sweep through them — the light stands still, the silk moves. ──
  float keyAng = 0.85 + 0.12 * vDrift;
  float cosD = vFace * cos(keyAng) + vSin * sin(keyAng);   // cos(θ − key)
  // narrow anisotropic lobe as a gaussian in (1 − cosΔ): stable in mediump,
  // width tightens over tight folds (compressed highlights) and relaxes on
  // gentle bends (broad, soft ones), micro-varied per fibre.
  float key = exp(-2.0 * (1.0 - cosD) * mix(26.0, 120.0, curv)
                  * (1.0 + 0.14 * fibre));
  float fill = 0.5 + 0.5 * (vFace * cos(-1.9) + vSin * sin(-1.9));
  float cosR = vFace * cos(2.6) + vSin * sin(2.6);
  float rim = exp(-2.0 * (1.0 - max(cosR, 0.0)) * 14.0) * edgeZone
            * step(0.0, cosR);

  // material hierarchy: ~80% calm silk, ~15% richer lustre, rare blooms.
  float bloom = 0.30 + 1.5 * vGate * vGate;
  float s = key * bloom * (0.92 + 0.08 * fibre);
  s *= 0.55 + 0.45 * exp(-2.5 * pow(vV - 0.15 * vDrift, 2.0));
  s = min(s + 0.35 * rim, 1.2);

  // ── base fabric: front lifted toward ivory by the sky fill and its own
  //    roundness; the reverse runs honey → muted bronze in shadow. Wide
  //    soft ramp across the fold — no seam. ──
  vec3 front = mix(champagne, ivory, 0.35 * fill + 0.20 * (1.0 - vV * vV));
  vec3 back  = mix(honey, bronze, 0.55 - 0.35 * fill);
  vec3 col = mix(back, front, smoothstep(-0.35, 0.35, vFace));

  // volume: gentle inflation (soft cylindrical shading), a quiet edge
  // rolloff, and low-contrast self-shadowing that deepens around tight
  // folds only.
  col *= 0.940 + 0.085 * (1.0 - vV * vV);
  col *= 1.0 - 0.05 * edgeZone;
  col *= 1.0 - 0.10 * curv * exp(-3.0 * vFace * vFace);

  // subsurface softness: edge-on silk lets light bleed through — the crease
  // warms (transmitted light) rather than just darkening, and the fabric
  // reads denser; tight folds densify further.
  col = mix(col, vec3(0.788, 0.639, 0.376), 0.40 * fold);
  col *= mix(1.0, 0.86, fold);
  float alpha = 0.50 * (1.0 + 0.55 * fold + 0.25 * curv * fold);

  // (the discrete warp/weft thread lines were removed — the client read
  //  them as printed stripes; the silk's fabric character now comes only
  //  from the smooth fibre-level variation inside the lustre and the broad
  //  watered bands below, neither of which resolves into lines)
  float texFade = smoothstep(7.0, 26.0, vWidthPx);

  // watered-silk luster: broad, very quiet moiré bands drifting slowly.
  float luster = sin(vU * 21.3 + vLus1 + 2.2 * sin(vU * 6.1 + vLus2 + vV * 1.4));
  col *= 1.0 + 0.030 * luster * (0.4 + 0.6 * texFade);

  // ── the lustre: an optical colour progression (champagne → ivory → pale
  //    gold → rich gold) rather than one painted tint; different parts of a
  //    fold catch different tones because s varies along it. ──
  col = mix(col, ivory, smoothstep(0.04, 0.28, s) * 0.55);
  col = mix(col, paleGold, smoothstep(0.22, 0.60, s) * 0.65);
  col = mix(col, richGold, smoothstep(0.55, 0.95, s) * 0.60);
  alpha = min(alpha * (1.0 + 0.45 * min(s, 1.0)), 0.75);

  // edge treatment: a touch more translucent at the very edge (fabric edges
  // pass light), then the pixel-space feather for a clean silhouette.
  alpha *= 1.0 - 0.06 * edgeZone;
  float feather = clamp(2.4 / max(vWidthPx, 1.0), 0.02, 0.5);
  alpha *= smoothstep(1.0, 1.0 - feather, abs(vV));

  gl_FragColor = vec4(col * alpha, alpha);                 // premultiplied
}
`;

/* ── GL helpers ────────────────────────────────────────────────────────── */
function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("SilkRibbon shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function wrap(x: number) {
  return ((x % TWO_PI) + TWO_PI) % TWO_PI;
}

export default function SilkRibbon({
  className = "",
  seed,
}: {
  className?: string;
  seed?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrapEl || !canvas) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
    if (!gl) {
      setFailed(true); // no approximation — the band simply collapses
      return;
    }

    /* per-mount seeding (deterministic when reduced motion, so the single
       frozen frame is the curated composition, not a lucky draw) */
    const rand = (() => {
      let s =
        ((reduce ? SEED_STATIC : seed ?? Math.random()) * 2654435769) >>> 0 ||
        1;
      return () => {
        // xorshift32 — cheap deterministic stream from the one seed
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        s >>>= 0;
        return s / 4294967296;
      };
    })();
    const seedA = [0, 0, 0, 0].map(() => rand() * TWO_PI);
    const seedB = [0, 0, 0, 0].map(() => rand() * TWO_PI);
    const seedL = [0, 0, 0, 0].map(() => rand() * TWO_PI);
    const seedEnv = rand() * TWO_PI;
    const seedRot = rand() * TWO_PI; // per-mount rotation of the twist ramp

    /* program + static mesh (rebuilt on context restore) */
    let program: WebGLProgram | null = null;
    let loc: Record<string, WebGLUniformLocation | null> = {};
    let indexCount = 0;

    const NU = 360; // higher segment density = smoother silhouette curves
    const NV = 10;

    function setup(): boolean {
      if (!gl) return false;
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      if (!prog) return false;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("SilkRibbon link:", gl.getProgramInfoLog(prog));
        return false;
      }
      program = prog;
      gl.useProgram(prog);

      // mesh: (NU+1) × NV grid of aUV, indexed triangles
      const verts = new Float32Array((NU + 1) * NV * 2);
      let p = 0;
      for (let i = 0; i <= NU; i++) {
        for (let j = 0; j < NV; j++) {
          verts[p++] = i / NU; // u
          verts[p++] = (j / (NV - 1)) * 2 - 1; // v ∈ [-1, 1]
        }
      }
      const idx = new Uint16Array(NU * (NV - 1) * 6);
      let q = 0;
      for (let i = 0; i < NU; i++) {
        for (let j = 0; j < NV - 1; j++) {
          const a = i * NV + j;
          const b = (i + 1) * NV + j;
          idx[q++] = a;
          idx[q++] = b;
          idx[q++] = a + 1;
          idx[q++] = a + 1;
          idx[q++] = b;
          idx[q++] = b + 1;
        }
      }
      indexCount = idx.length;

      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      const ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

      const aUV = gl.getAttribLocation(prog, "aUV");
      gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

      loc = {};
      for (const name of [
        "uPhA",
        "uPhB",
        "uPhL",
        "uSeed",
        "uAspect",
        "uPxHeight",
      ]) {
        loc[name] = gl.getUniformLocation(prog, name);
      }
      gl.uniform4f(loc.uSeed, seedRot, 0, 0, seedEnv);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      return true;
    }

    /* sizing — floor at 2× so standard-density (dpr 1) monitors get a
       supersampled backing store that the browser downscales: free edge
       anti-aliasing where the silhouette used to stair-step. Retina stays
       native; ceiling 3 keeps the fill cost sane. */
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    function resize() {
      if (!gl || !canvas || !wrapEl || !program) return;
      const w = Math.max(1, Math.round(wrapEl.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrapEl.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform1f(loc.uAspect, w / h);
      gl.uniform1f(loc.uPxHeight, h);
    }

    /* the clock — float64, accumulates only while running */
    let tAccum = reduce ? T_STATIC : 0;
    let lastNow: number | null = null;
    let raf = 0;
    let onScreen = true;
    let visible = !document.hidden;
    let disposed = false;

    function draw() {
      if (!gl || !program) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      const t = tAccum;
      gl.uniform4f(
        loc.uPhA,
        wrap(SPEED_A[0] * t + seedA[0]),
        wrap(SPEED_A[1] * t + seedA[1]),
        wrap(SPEED_A[2] * t + seedA[2]),
        wrap(SPEED_A[3] * t + seedA[3])
      );
      gl.uniform4f(
        loc.uPhB,
        wrap(SPEED_B[0] * t + seedB[0]),
        wrap(SPEED_B[1] * t + seedB[1]),
        wrap(SPEED_B[2] * t + seedB[2]),
        wrap(SPEED_B[3] * t + seedB[3])
      );
      gl.uniform4f(
        loc.uPhL,
        wrap(SPEED_L[0] * t + seedL[0]),
        wrap(SPEED_L[1] * t + seedL[1]),
        wrap(SPEED_L[2] * t + seedL[2]),
        wrap(SPEED_L[3] * t + seedL[3])
      );
      gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    }

    function frame(now: number) {
      if (disposed) return;
      if (lastNow !== null) tAccum += (now - lastNow) / 1000; // real-world speed
      lastNow = now;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function updateRunning() {
      const shouldRun = !reduce && onScreen && visible && !disposed;
      if (shouldRun && !raf) {
        lastNow = null; // resume seamlessly — no time jump
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    /* boot */
    if (!setup()) {
      setFailed(true);
      return;
    }
    resize();
    if (reduce) {
      draw(); // exactly one curated frame
    } else {
      updateRunning();
    }

    /* observers & events */
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw();
    });
    ro.observe(wrapEl);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        updateRunning();
      },
      { rootMargin: "80px" }
    );
    io.observe(wrapEl);

    const onVis = () => {
      visible = !document.hidden;
      updateRunning();
    };
    document.addEventListener("visibilitychange", onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => {
      if (setup()) {
        resize();
        if (reduce) draw();
        else updateRunning();
      } else {
        setFailed(true);
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      // NOTE: no explicit WEBGL_lose_context.loseContext() here — React 18
      // StrictMode double-mounts effects in dev, and a re-mount would get the
      // SAME (now lost) context back from getContext() and fail every shader
      // compile. The context is released with the canvas element instead.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      // full-bleed centering (left-1/2 + w-screen + translate) is baked in;
      // the caller supplies the POSITION (`relative` for an in-flow band, or
      // `absolute …` to sit behind page content as a background layer).
      className={`left-1/2 h-[190px] w-screen -translate-x-1/2 md:h-[260px] ${className}`}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
