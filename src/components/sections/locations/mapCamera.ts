import { world, rivers } from "@/content/mapPaths.generated";

// ─────────────────────────────────────────────────────────────────────────────
// The journey camera, as pure maths — shared by the SVG and canvas renderers
// so a toggle between them can never change where the camera looks.
//
// A "frame" is a centre and a log₂ zoom. The scrub takes a continuous progress
// value p (0 = the UK-wide hero, k = stop k−1 settled) and returns the camera
// between frames ⌊p⌋ and ⌈p⌉:
//
//   • the pan runs on a smoothstep, so the camera is essentially still near a
//     lock (small scroll wobble moves it barely at all) and does its moving in
//     the middle of the gap;
//   • the zoom takes the panned line and bends it through a dip — the flight
//     pulls OUT until the frame would contain both endpoints, then dives back
//     IN. Short hops (the practice to Spire is 91 m) need no dip and get
//     none; Reading to Windsor rises to see both towns. The classic
//     flight-arc, driven entirely by the scroll.
//
// Layer visibility is a function of altitude (log₂ zoom), not of stop number,
// so during a flight the streets genuinely fade out as the camera rises and
// return as it lands — level-of-detail and cinematography are the same code.
// ─────────────────────────────────────────────────────────────────────────────

export interface MapStop {
  name: string;
  lat: number;
  lng: number;
  /** Minimum framed diameter at this stop, in metres on the ground. */
  spanM: number;
  nhs?: boolean;
  /** Matches sitePolys in the generated data, for grounds highlighting. */
  slug?: string;
}

/** The drawing's coordinate box. Square, so slice-cropping trims evenly. */
export const BOX = 1000;

/** Stroke weight and strength per road class. */
export const ROAD_STYLE = {
  motorway: { w: 1.6, o: 0.3 },
  trunk: { w: 1.3, o: 0.26 },
  primary: { w: 1, o: 0.22 },
  secondary: { w: 0.8, o: 0.18 },
} as const;

/** Web Mercator into the generated module's world units — same formula as
 *  RegionMap and scripts/build-map-paths.mjs. */
export function project(lat: number, lng: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * world,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * world,
  };
}

/** Ground metres per world unit of x at a given latitude. */
export function metresPerUnit(lat: number) {
  return (40075017 / world) * Math.cos((lat * Math.PI) / 180);
}

export interface Frame {
  cx: number;
  cy: number;
  /** log₂ of the drawing scale. */
  lz: number;
}

/** Rough box around the UK, for the opening frame. */
const UK = { north: 58.7, south: 49.9, west: -8.2, east: 1.8 };

function ukFrame(): Frame {
  const a = project(UK.north, UK.west);
  const b = project(UK.south, UK.east);
  const half = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) / 2;
  return {
    cx: (a.x + b.x) / 2,
    cy: (a.y + b.y) / 2,
    lz: Math.log2(BOX / 2 / (half * 1.12)),
  };
}

/** Every river vertex, decoded once — the generated encoding is strictly
 *  `M x y` then runs of relative `l` pairs, no Z. */
function riverVertices(): [number, number][] {
  const pts: [number, number][] = [];
  for (const r of rivers) {
    const toks = r.d.match(/[Ml]|-?\d*\.?\d+/g);
    if (!toks) continue;
    let x = 0;
    let y = 0;
    let absolute = false;
    for (let i = 0; i < toks.length; ) {
      const t = toks[i];
      if (t === "M") {
        absolute = true;
        i++;
        continue;
      }
      if (t === "l") {
        absolute = false;
        i++;
        continue;
      }
      const a = parseFloat(toks[i++]);
      const b = parseFloat(toks[i++]);
      if (absolute) {
        x = a;
        y = b;
        absolute = false;
      } else {
        x += a;
        y += b;
      }
      pts.push([x, y]);
    }
  }
  return pts;
}

/** River-aware stop framing: centre 35% of the way to the nearest water and
 *  open the zoom until it sits at ~57% of the half-frame (~68% of the visible
 *  half once the worst slice-crop axis has eaten its share). */
function stopFrame(stop: MapStop, riverPts: [number, number][]): Frame {
  const { x, y } = project(stop.lat, stop.lng);
  const baseHalf = (stop.spanM * 1.35) / 2 / metresPerUnit(stop.lat);

  let nearest: [number, number] | null = null;
  let best = Infinity;
  for (const [rx, ry] of riverPts) {
    const d2 = (rx - x) ** 2 + (ry - y) ** 2;
    if (d2 < best) {
      best = d2;
      nearest = [rx, ry];
    }
  }
  if (!nearest) return { cx: x, cy: y, lz: Math.log2(BOX / 2 / baseHalf) };

  const d = Math.sqrt(best);
  const half = Math.max(baseHalf, d * 1.15);
  return {
    cx: x + (nearest[0] - x) * 0.35,
    cy: y + (nearest[1] - y) * 0.35,
    lz: Math.log2(BOX / 2 / half),
  };
}

/** Frame 0 is the UK; frame k is stop k−1. */
export function buildFrames(stops: MapStop[]): Frame[] {
  const riverPts = riverVertices();
  return [ukFrame(), ...stops.map((s) => stopFrame(s, riverPts))];
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export interface Camera {
  x: number;
  y: number;
  /** Drawing scale — world units to viewBox units. */
  s: number;
  /** log₂(s), the altitude every layer fade keys off. */
  l: number;
}

/** The scrub: continuous progress → camera, with the flight-arc dip. */
export function cameraAt(frames: Frame[], p: number): Camera {
  const clamped = Math.min(Math.max(p, 0), frames.length - 1);
  const k = Math.min(Math.floor(clamped), frames.length - 2);
  const t = clamped - k;
  const a = frames[k];
  const b = frames[k + 1];

  const e = smoothstep(t);
  const x = a.cx + (b.cx - a.cx) * e;
  const y = a.cy + (b.cy - a.cy) * e;

  // The dip: mid-flight, the frame should contain both endpoint frames plus
  // the ground between them. If the straight lerp already does (short hops),
  // the dip is zero — never zoom-in mid-flight, and never wider than the
  // wider endpoint by more than a breath.
  const dist = Math.hypot(b.cx - a.cx, b.cy - a.cy);
  const halfA = BOX / 2 / 2 ** a.lz;
  const halfB = BOX / 2 / 2 ** b.lz;
  const halfNeeded = (dist / 2) * 1.3 + Math.max(halfA, halfB);
  const midTarget = Math.log2(BOX / 2 / halfNeeded);
  const lzLin = a.lz + (b.lz - a.lz) * e;
  const dip = Math.min(0, midTarget - (a.lz + b.lz) / 2);
  const lz = Math.max(
    lzLin + dip * Math.sin(Math.PI * t),
    Math.min(a.lz, b.lz) - 0.25,
  );

  const s = 2 ** lz;
  return { x, y, s, l: lz };
}

const ramp = (l: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (l - a) / (b - a)));

export interface LayerAlphas {
  rivers: number;
  roadsMajor: number;
  rails: number;
  roadsLocal: number;
  polys: number;
  townLabels: number;
  riverLabels: number;
  streetLabels: number;
}

/** Every layer's opacity at a given altitude — one source of truth for both
 *  renderers, so toggling them can never change what is visible. */
export function layerAlphas(l: number): LayerAlphas {
  return {
    rivers: ramp(l, 3, 5.3),
    roadsMajor: ramp(l, 3.2, 4.8),
    rails: ramp(l, 3.8, 5.2),
    roadsLocal: ramp(l, 5.8, 7),
    polys: ramp(l, 5.5, 6.8),
    townLabels: ramp(l, 1, 2) * (1 - ramp(l, 6.8, 7.6)),
    riverLabels: ramp(l, 4.5, 5.5),
    streetLabels: ramp(l, 6.3, 7),
  };
}

/** Rail dash rhythm in user units, holding ~5px/3.5px on screen. */
export function railDash(s: number): [number, number] {
  return [5 / s, 3.5 / s];
}
