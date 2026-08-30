"use client";

import { useEffect, useRef, useState } from "react";
import { hospitals } from "@/content/hospitals";

// ─────────────────────────────────────────────────────────────────────────────
// A still map of the region with a pin on every site whose location is known.
//
// Not the Google embed used on /contact: that one is keyless, and a keyless
// embed takes exactly one marker. Plotting five would mean either the Static
// Maps API (a Google Cloud key and billing) or a query like "hospitals near
// Reading", which returns whatever Google thinks is nearby — on a page about
// where this partnership practises, showing hospitals it does not practise at
// is not an option.
//
// So: OpenStreetMap raster tiles laid out by hand and pins projected onto them.
// No key, no billing, no client JavaScript, and every pin is where the data
// says it is.
//
// It is an <svg> rather than a grid of positioned <img>s so that it scales.
// A tile mosaic is intrinsically a fixed pixel size, and making that fluid in
// CSS means knowing the container's width — which means JavaScript. A viewBox
// does the same job in one attribute, at any container size, on the server.
//
// Tile policy: OpenStreetMap's public tiles are fine for a site at this volume
// with the attribution below, which is required and must stay. If traffic ever
// makes that inappropriate, TILE_URL is the only line that needs to change —
// MapTiler and Mapbox both serve the same z/x/y scheme.
// ─────────────────────────────────────────────────────────────────────────────

const TILE_URL = (z: number, x: number, y: number) =>
  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

const TILE = 256;

/** The drawing's pixel box. Only a ratio — the viewBox scales it to fit. */
const W = 640;
const H = 420;

/** Keeps pins off the edges when the zoom is chosen. */
const PAD = 56;

/** Web Mercator, in world pixels at the given zoom. */
function project(lat: number, lng: number, z: number) {
  const scale = TILE * 2 ** z;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y:
      (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

export default function RegionMap({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "320px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const points = hospitals
    .filter((h) => h.geo)
    .map((h) => ({ name: h.name, ...h.geo! }));

  if (points.length === 0) return null;

  // The largest zoom at which every pin still fits inside the padded box. A
  // single pin has no extent, so it falls through to the cap and simply centres.
  let zoom = 6;
  for (let z = 16; z >= 6; z--) {
    const xs = points.map((p) => project(p.lat, p.lng, z).x);
    const ys = points.map((p) => project(p.lat, p.lng, z).y);
    const spanX = Math.max(...xs) - Math.min(...xs);
    const spanY = Math.max(...ys) - Math.min(...ys);
    if (spanX <= W - PAD * 2 && spanY <= H - PAD * 2) {
      zoom = z;
      break;
    }
  }

  const projected = points.map((p) => ({ ...p, ...project(p.lat, p.lng, zoom) }));
  const midX = (Math.max(...projected.map((p) => p.x)) + Math.min(...projected.map((p) => p.x))) / 2;
  const midY = (Math.max(...projected.map((p) => p.y)) + Math.min(...projected.map((p) => p.y))) / 2;

  // Top-left of the visible window, in world pixels.
  const originX = midX - W / 2;
  const originY = midY - H / 2;

  const tiles: { key: string; href: string; x: number; y: number }[] = [];
  const max = 2 ** zoom;
  for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + W) / TILE); tx++) {
    for (let ty = Math.floor(originY / TILE); ty <= Math.floor((originY + H) / TILE); ty++) {
      // Wrap in x (the world repeats), clamp in y (it does not).
      if (ty < 0 || ty >= max) continue;
      const wrapped = ((tx % max) + max) % max;
      tiles.push({
        key: `${tx}-${ty}`,
        href: TILE_URL(zoom, wrapped, ty),
        x: tx * TILE - originX,
        y: ty * TILE - originY,
      });
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden bg-accent-mist ${className}`}
    >
      {ready ? (
        <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`Map of Berkshire and Oxfordshire showing ${projected
          .map((p) => p.name)
          .join(", ")}`}
        >
          {tiles.map((t) => (
            <image
              key={t.key}
              href={t.href}
              x={t.x}
              y={t.y}
              width={TILE}
              height={TILE}
            />
          ))}

          {projected.map((p) => {
            const x = Math.round((p.x - originX) * 10) / 10;
            const y = Math.round((p.y - originY) * 10) / 10;
            return (
              <g key={`${p.name}-${p.lat}`} transform={`translate(${x} ${y})`}>
                {/* Drawn rather than an emoji or an image so it inherits the
                    site's ink colour and stays crisp at any scale. */}
                <path
                  d="M0 2 C -7 -8, -11 -13, -11 -19 a 11 11 0 1 1 22 0 c 0 6, -4 11, -11 21 Z"
                  fill="var(--brand-ink)"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <circle cx={0} cy={-19} r={4} fill="#ffffff" />
              </g>
            );
          })}
        </svg>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_72%_58%,rgba(26,77,143,0.12),transparent_24%)]"
        />
      )}

      {/* Required by the tile licence. Do not remove. */}
      {ready && (
        <p className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-ink/45">
          © OpenStreetMap contributors
        </p>
      )}
    </div>
  );
}
