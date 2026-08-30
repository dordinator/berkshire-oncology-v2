"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { mapLabels } from "@/content/mapLabels";
import { palette } from "@/lib/designTokens";
import {
  BOX,
  ROAD_STYLE,
  buildFrames,
  cameraAt,
  layerAlphas,
  project,
  railDash,
  type LayerAlphas,
  type MapStop,
} from "./mapCamera";

export type { MapStop };

// ─────────────────────────────────────────────────────────────────────────────
// The journey's map, drawn to a canvas. Same camera as JourneyMap.tsx — the
// maths is imported, not re-derived — and the same drawing, layer for layer,
// so the two can be swapped without the picture changing.
//
// What canvas buys is the ~3,700 paths. The SVG keeps every one of them as a
// live DOM node the compositor must re-rasterise whenever the camera group's
// transform changes; here they are parsed once into seventeen Path2D objects
// and the camera is a matrix on the context. A layer that has faded below a
// hundredth of an opacity is not drawn at all, which is where the real saving
// lives: at the UK-wide hero the roads, rails, grounds and street names are
// skipped entirely rather than painted at opacity zero.
//
// What canvas costs is the document: an SVG map renders on the server and
// scales to any zoom, this one is a bitmap that exists only once the client
// has run. Hence role="img" plus the same label the SVG carries — the drawing
// was never in the accessibility tree either way.
//
// Two coordinate conventions meet here and it is worth being exact about them,
// because everything that could look subtly wrong hangs off it. The composed
// transform maps world units to DEVICE pixels, which is the SVG's viewBox unit
// times viewScale times the pixel ratio. So anything the SVG expressed in
// viewBox units (type sizes, the pins, the rail dash rhythm) needs no
// correction at all; only the widths that were non-scaling-stroke — CSS
// pixels, immune to the camera — carry an explicit dpr.
// ─────────────────────────────────────────────────────────────────────────────

/** Canvas has no currentColor to inherit, so it uses the shared JS palette. */
const ACCENT = palette.accent;
const INK = palette.ink;
const INK_MUTED = palette.inkMuted;
/** fill-accent/70 on the river names. */
const RIVER_INK = "rgba(26, 77, 143, 0.7)";
/** The canvas colour, painted behind the type as a halo (paint-order: stroke). */
const HALO = palette.canvas;

/** Below this a layer is skipped rather than painted — the level-of-detail win.
 *  At 1/100th of an opacity a hairline is already invisible against #fafbfc. */
const MIN_ALPHA = 0.01;

/** Same drawn pin as the SVG renderer and RegionMap. */
const PIN_D =
  "M0 2 C -7 -8, -11 -13, -11 -19 a 11 11 0 1 1 22 0 c 0 6, -4 11, -11 21 Z";

type RoadClass = keyof typeof ROAD_STYLE;

interface MapPaths {
  outline: Path2D;
  counties: Path2D;
  rivers: Path2D;
  railways: Path2D;
  roadsLocal: Path2D;
  roadsMajor: { cls: RoadClass; path: Path2D }[];
  /** One per site, kept apart because the active stop's grounds paint stronger. */
  sites: { slug: string; path: Path2D }[];
  pin: Path2D;
  pinDot: Path2D;
}

type MapPathSource = typeof import("@/content/mapPaths.generated");

/** Every path string in the generated data, merged down to one Path2D per
 *  class — seventeen objects for ~3,700 paths.
 *
 *  Merging is not only cheaper to draw. A group opacity in SVG composites the
 *  whole layer once, so two county lines crossing at 0.14 stay 0.14; separate
 *  canvas strokes would blend and darken the crossing. One stroke() of one
 *  merged path behaves as the group did. */
function buildPaths(source: MapPathSource): MapPaths {
  const merge = (ds: string[]) => {
    const merged = new Path2D();
    for (const d of ds) merged.addPath(new Path2D(d));
    return merged;
  };

  const pinDot = new Path2D();
  pinDot.arc(0, -19, 4, 0, Math.PI * 2);

  return {
    outline: merge(source.ukOutline),
    counties: merge(source.counties.map((c) => c.d)),
    rivers: merge(source.rivers.map((r) => r.d)),
    railways: merge(source.railways),
    roadsLocal: merge(source.roadsLocal),
    // Grouped by class rather than left in data order, since each class carries
    // its own weight and strength and wants a single stroke.
    roadsMajor: (Object.keys(ROAD_STYLE) as RoadClass[]).map((cls) => ({
      cls,
      path: merge(
        source.roadsMajor.filter((r) => r.cls === cls).map((r) => r.d),
      ),
    })),
    sites: source.sitePolys.map((p) => ({
      slug: p.slug,
      path: new Path2D(p.d),
    })),
    pin: new Path2D(PIN_D),
    pinDot,
  };
}

/** Label positions are pure projection, so they are safe at module scope —
 *  unlike Path2D, which does not exist on the server. */
const LABELS = mapLabels.map((l) => ({ ...l, ...project(l.lat, l.lng) }));

interface Fonts {
  sans: string;
  display: string;
}

/** ctx.letterSpacing is a recent addition and not in every engine's typings;
 *  where it is missing the tracking is dropped rather than faked glyph by
 *  glyph, which would cost the halo its continuity. */
function setTracking(ctx: CanvasRenderingContext2D, px: number) {
  const styles = ctx as unknown as { letterSpacing?: string };
  if (styles.letterSpacing !== undefined) styles.letterSpacing = `${px}px`;
}

/** Labels counter-scale like the pins and keep their set angle. After the
 *  counter-scale the local unit is one viewBox unit, so these sizes are the
 *  SVG's own — 11px there and 11 here mean the same thing on screen. */
function drawLabels(
  ctx: CanvasRenderingContext2D,
  s: number,
  alpha: LayerAlphas,
  fonts: Fonts,
) {
  for (const label of LABELS) {
    const a =
      label.kind === "town"
        ? alpha.townLabels
        : label.kind === "river"
          ? alpha.riverLabels
          : alpha.streetLabels;
    if (a < MIN_ALPHA) continue;

    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(label.x, label.y);
    ctx.scale(1 / s, 1 / s);
    ctx.rotate((label.angle * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round";
    ctx.strokeStyle = HALO;
    ctx.lineWidth = 3;

    let text = label.text;
    if (label.kind === "town") {
      ctx.font = `500 11px ${fonts.sans}`;
      setTracking(ctx, 0.22 * 11);
      ctx.fillStyle = INK_MUTED;
      text = text.toUpperCase();
    } else if (label.kind === "river") {
      // .font-display carries font-weight 600 from globals.css, so the river
      // names are italic 600 rather than italic 400.
      ctx.font = `italic 600 11px ${fonts.display}`;
      setTracking(ctx, 0);
      ctx.fillStyle = RIVER_INK;
    } else {
      ctx.font = `500 9.5px ${fonts.sans}`;
      setTracking(ctx, 0.04 * 9.5);
      ctx.fillStyle = INK_MUTED;
    }

    // paint-order: stroke — the halo first, the glyph over it.
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
}

/** Last, and over everything: the pins are markers of the map, not features
 *  on it, so they counter-scale to a constant size at every zoom. */
function drawPins(
  ctx: CanvasRenderingContext2D,
  s: number,
  pins: { x: number; y: number }[],
  active: number,
  paths: MapPaths,
) {
  for (let i = 0; i < pins.length; i++) {
    const isActive = i === active;
    ctx.save();
    // Before the journey starts every pin stands at full strength — the hero's
    // cluster in the south-east is the point of the wide shot.
    ctx.globalAlpha = active >= 0 && !isActive ? 0.38 : 1;
    ctx.translate(pins[i].x, pins[i].y);
    ctx.scale(1 / s, 1 / s);
    if (isActive) ctx.scale(1.18, 1.18);

    ctx.fillStyle = isActive ? ACCENT : INK;
    ctx.fill(paths.pin);
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = palette.white;
    ctx.stroke(paths.pin);
    ctx.fillStyle = palette.white;
    ctx.fill(paths.pinDot);
    ctx.restore();
  }
}

export default function JourneyMapCanvas({
  stops,
  active,
  progress,
  className = "",
}: {
  stops: MapStop[];
  /** −1 during the hero, otherwise an index into stops — pin emphasis only. */
  active: number;
  /** The scrub: 0 = UK-wide hero frame, k = stop k−1 settled. */
  progress: MotionValue<number>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const fontsRef = useRef<Fonts>({
    sans: "system-ui, sans-serif",
    display: "Georgia, serif",
  });
  // `active` is read by the draw rather than closed over, so a stop change
  // costs a redraw and not a new subscription.
  const activeRef = useRef(active);
  const rafRef = useRef<number | null>(null);
  const [paths, setPaths] = useState<MapPaths | null>(null);

  const frames = useMemo(() => buildFrames(stops), [stops]);
  const pins = useMemo(
    () => stops.map((s) => ({ ...s, ...project(s.lat, s.lng) })),
    [stops],
  );
  // The generated map geometry is the site's largest JavaScript asset. It is
  // visual enhancement rather than page content, so load and parse it only
  // after the route has painted. This keeps first-time visits to locations,
  // cancer types and consultant profiles from waiting on ~3,700 path strings.
  useEffect(() => {
    let cancelled = false;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    const loadPaths = () => {
      void import("@/content/mapPaths.generated").then((source) => {
        if (cancelled || typeof Path2D === "undefined") return;

        const prepare = () => {
          if (!cancelled) setPaths(buildPaths(source));
        };

        if ("requestIdleCallback" in window) {
          idleId = window.requestIdleCallback(prepare, { timeout: 1200 });
        } else {
          timerId = globalThis.setTimeout(prepare, 0);
        }
      });
    };

    const canvas = canvasRef.current;
    if (canvas && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          loadPaths();
        },
        { rootMargin: "320px" },
      );
      observer.observe(canvas);
    } else {
      loadPaths();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, []);

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const { w, h, dpr } = sizeRef.current;
    if (!ctx || !paths || w === 0 || h === 0) return;

    const cam = cameraAt(frames, progress.get());
    const alpha = layerAlphas(cam.l);
    const at = activeRef.current;

    // viewBox="0 0 1000 1000" with preserveAspectRatio="xMidYMid slice": the
    // box fills the longer edge and the shorter one crops evenly either side.
    const viewScale = Math.max(w, h) / BOX;
    // World units → device pixels, the SVG's translate(500 500) scale(s)
    // translate(−x −y) folded into the viewBox fit.
    const k = cam.s * viewScale;
    // vector-effect="non-scaling-stroke", run backwards: the width a stroke
    // needs in world units to land at a fixed size on screen. dpr appears
    // because k counts device pixels and the SVG's widths were CSS pixels.
    const hair = dpr / k;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(k, 0, 0, k, w / 2, h / 2);
    ctx.translate(-cam.x, -cam.y);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = ACCENT;

    const line = (path: Path2D, a: number, px: number) => {
      if (a < MIN_ALPHA) return;
      ctx.globalAlpha = a;
      ctx.lineWidth = px * hair;
      ctx.stroke(path);
    };

    // Country outline a shade firmer than the county lines beneath it, both
    // one hairline wide at every zoom, both present at every altitude.
    line(paths.outline, 0.34, 1);
    line(paths.counties, 0.14, 1);

    // The hospital grounds — the destination as a shape rather than an
    // abstract point, with the active stop's a touch stronger. Under the
    // roads, as a fill should be.
    if (alpha.polys >= MIN_ALPHA) {
      ctx.fillStyle = ACCENT;
      for (const site of paths.sites) {
        const isActive = at >= 0 && stops[at]?.slug === site.slug;
        ctx.globalAlpha = (isActive ? 0.16 : 0.07) * alpha.polys;
        ctx.fill(site.path, "evenodd");
        ctx.globalAlpha = (isActive ? 0.42 : 0.28) * alpha.polys;
        ctx.lineWidth = hair;
        ctx.stroke(site.path);
      }
    }

    // The road network, weighted by class so the M4 reads heavier than a
    // Windsor side street.
    for (const { cls, path } of paths.roadsMajor) {
      line(path, ROAD_STYLE[cls].o * alpha.roadsMajor, ROAD_STYLE[cls].w);
    }
    line(paths.roadsLocal, 0.15 * alpha.roadsLocal, 0.8);

    // Dashed in the cartographic manner. The dash is in world units, so it
    // zooms with the map where the stroke width does not — railDash holds the
    // ~5px/3.5px rhythm against the camera.
    if (alpha.rails >= MIN_ALPHA) {
      ctx.setLineDash(railDash(cam.s));
      line(paths.railways, 0.26 * alpha.rails, 1);
      ctx.setLineDash([]);
    }

    // The Thames and the Kennet — every one of the six sites stands on one or
    // the other, which is why "Thames Valley" is not a flourish.
    line(paths.rivers, 0.38 * alpha.rivers, 1);

    drawLabels(ctx, cam.s, alpha, fontsRef.current);
    drawPins(ctx, cam.s, pins, at, paths);
    ctx.globalAlpha = 1;
  }, [frames, paths, pins, progress, stops]);

  /** One draw per frame, however many changes arrive between them — the scrub
   *  fires far more often than the compositor can use. */
  const schedule = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");

    // Canvas takes a font string, not a class, so the page's faces have to be
    // read off the custom properties Tailwind's utilities resolve to.
    const root = getComputedStyle(document.documentElement);
    const sans = root.getPropertyValue("--font-sans").trim();
    const display = root.getPropertyValue("--font-display").trim();
    fontsRef.current = {
      sans: sans ? `${sans}, system-ui, sans-serif` : "system-ui, sans-serif",
      display: display ? `${display}, Georgia, serif` : "Georgia, serif",
    };
    // Metrics change when the webfonts land. SVG text reflows itself; a
    // bitmap has to be told.
    void document.fonts?.ready.then(schedule);

    const resize = () => {
      // Beyond 2× the extra samples are past what the eye resolves and cost
      // fill rate the flight cannot spare on a phone.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === sizeRef.current.w && h === sizeRef.current.h) return;
      sizeRef.current = { w, h, dpr };
      // Sizing the bitmap clears it and resets the context state, so this is
      // always followed by a full redraw.
      canvas.width = w;
      canvas.height = h;
      schedule();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    // Unconditionally, not only via resize(): on a remount (StrictMode's
    // double-mount, or the renderer toggle) sizeRef already holds the right
    // numbers, so resize() early-returns without ever requesting a frame —
    // and a canvas that is never drawn once stays blank forever.
    schedule();
    return () => ro.disconnect();
  }, [schedule]);

  useEffect(() => progress.on("change", schedule), [progress, schedule]);

  // Covers the first paint, every stop change, and any rebuild of the draw.
  useEffect(() => {
    activeRef.current = active;
    schedule();
  }, [active, schedule]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        // Null it, or the guard in schedule() treats the cancelled id as a
        // pending frame and never requests another — after StrictMode's
        // simulated remount that jammed every draw for the component's life.
        rafRef.current = null;
      }
    },
    [],
  );

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Map of the United Kingdom marking ${stops
        .map((s) => s.name)
        .join(", ")}`}
      className={`block h-full w-full ${className}`}
    />
  );
}
