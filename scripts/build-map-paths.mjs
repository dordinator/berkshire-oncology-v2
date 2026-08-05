#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-map-paths.mjs
//
// Turns ONS boundary GeoJSON into a small TypeScript module of SVG path data,
// so a component can draw a faint vector map of the UK — country outlines plus
// county / unitary-authority lines, and the Thames and Kennet through the
// Thames Valley — with no runtime fetch, no map library and no tile server.
//
//   node scripts/build-map-paths.mjs
//
// Writes src/content/mapPaths.generated.ts. Nothing else in the repo is touched.
// Raw downloads are cached outside the repo (see CACHE_DIR) so a rebuild is
// cheap and the source GeoJSON never lands in git.
//
// ── Projection ───────────────────────────────────────────────────────────────
// Web Mercator, byte-for-byte the same formula as project() in
// src/components/site/RegionMap.tsx:
//
//   scale  = 256 * 2 ** zoom
//   x      = ((lng + 180) / 360) * scale
//   y      = (0.5 - log((1 + sin φ) / (1 - sin φ)) / (4π)) * scale
//
// The only difference is the world size. RegionMap projects at whatever zoom it
// picked; this file bakes coordinates at a fixed world of 256 * 2 ** 8 = 65536
// px — i.e. exactly project(lat, lng, 8). A consumer converts to any zoom with
//
//   px = value * (256 * 2 ** z) / WORLD      // === value * 2 ** (z - 8)
//
// so the paths and RegionMap's pins land in the same coordinate space. 65536 is
// chosen because two decimal places on that grid is ~4 m on the ground: fine
// enough to stay smooth zoomed to a town, while keeping the numbers short.
//
// ── Two tolerance tiers ──────────────────────────────────────────────────────
// Douglas–Peucker, run in projected world units so the tolerance means the same
// thing everywhere on screen:
//
//   coarse — country outlines and every county outside the Thames Valley. Sized
//            to be sub-pixel at a whole-UK view (the UK is ~1900 world units
//            wide, so a 600 px render puts one unit at about a third of a pixel).
//   fine   — counties whose bounding box meets the Thames Valley box below, and
//            every river. Sized to stay clean zoomed to roughly town level
//            (z ~ 12–13), where one world unit is 16–32 px.
//
// Output coordinates are rounded to 2dp and written as one absolute moveto plus
// relative linetos. The deltas are differences of already-rounded integers, so
// rounding cannot accumulate along a ring — the redrawn outline is exactly the
// rounded outline, not a drifting approximation of it.
//
// ── Rivers ───────────────────────────────────────────────────────────────────
// The Thames and the Kennet come from OpenStreetMap via one Overpass query for
// waterway=river ways inside the Thames Valley box. OSM splits a river into many
// short ways, so the ways are stitched back into long polylines wherever their
// endpoints coincide; at a braided channel the join is ambiguous, and the
// leftover branch simply becomes another polyline. Each polyline is then clipped
// to the box and dropped if less than ~300 m of channel survives.
//
// Rivers are *open* polylines — no closing Z — so they must be stroked, never
// filled. Everything else about them (projection, tolerance, encoding) is
// identical to the boundaries.
// ─────────────────────────────────────────────────────────────────────────────

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "content", "mapPaths.generated.ts");

/** Raw GeoJSON cache. Outside the repo on purpose; override with MAP_DATA_DIR. */
const CACHE_DIR = process.env.MAP_DATA_DIR || join(tmpdir(), "boh-mapdata");

// ── Tunables ─────────────────────────────────────────────────────────────────

/** World size in pixels. 256 * 2 ** 8 — see the projection note above. */
const WORLD = 65536;

/** Douglas–Peucker tolerance, in world units at WORLD. */
const TOL_COARSE = 1.6; // ~0.5 px at a whole-UK view
const TOL_FINE = 0.09; // ~1.5 px at z 12, ~3 px at z 13

/** Rings smaller than this (longest bbox side, world units) are dropped. */
const MIN_SPAN_COARSE = 3.2; // ~1.2 km — islets that would render as specks
const MIN_SPAN_FINE = 0.5; // ~200 m

/** River polylines shorter than this along their length (world units) are dropped. */
const MIN_RIVER_LENGTH = 0.8; // ~300 m — clipping stubs and orphaned side channels

/** Thames Valley: Reading, Windsor, Oxford and their neighbours get the fine tier. */
const THAMES_VALLEY = { minLat: 51.2, maxLat: 51.95, minLng: -1.55, maxLng: -0.3 };

/** Decimal places kept in the output. */
const DP = 2;
const Q = 10 ** DP;

// ── Sources ──────────────────────────────────────────────────────────────────
// ONS Open Geography Portal, ArcGIS FeatureServer, asked for GeoJSON in EPSG:4326.
// BUC = ultra generalised (500 m), BGC = generalised (20 m); both are clipped to
// the coastline, which is what a map like this wants — the full-extent versions
// run out to mean low water and look wrong inland.

const ARCGIS = "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services";

const COUNTRIES = {
  service: "Countries_December_2025_Boundaries_UK_BUC",
  file: "ctry_buc_2025.geojson",
  fields: "CTRY25CD,CTRY25NM",
  nameField: "CTRY25NM",
  codeField: "CTRY25CD",
};

const COUNTIES = {
  service: "Counties_and_Unitary_Authorities_December_2025_Boundaries_UK_BGC",
  file: "ctyua_bgc_2025.geojson",
  fields: "CTYUA25CD,CTYUA25NM",
  nameField: "CTYUA25NM",
  codeField: "CTYUA25CD",
  page: 20, // the layer caps a response at 2000 features but chokes on big geometry
};

// OpenStreetMap, via one Overpass query for the named waterway=river ways inside
// the Thames Valley box. Overpass is a free, volunteer-funded service: ask once,
// cache the answer, and identify the caller.

const OVERPASS = "https://overpass-api.de/api/interpreter";

const USER_AGENT =
  "berkshire-oncology-partnership/build-map-paths.mjs (one-off static map build)";

const RIVERS = {
  file: "thames_valley_rivers_osm.json",
  names: ["River Thames", "River Kennet"],
  box: THAMES_VALLEY,
};

const SOURCE_NOTE =
  "ONS Open Geography Portal: Countries (December 2025) Boundaries UK BUC; " +
  "Counties and Unitary Authorities (December 2025) Boundaries UK BGC. " +
  "Rivers from OpenStreetMap via the Overpass API: waterway=river ways named " +
  "River Thames or River Kennet within the Thames Valley box. " +
  "Web Mercator, world 65536 px (= zoom 8).";

// The exact statement ONS requires for digital boundary products, verbatim from
// https://www.ons.gov.uk/methodology/geography/licences — "You must use the
// following copyright statements when you reproduce or use this material".
// Both lines are mandatory and must be visible wherever the map is drawn.
// [year] is the vintage of the boundaries above; bump it if you re-fetch a
// later release. (The Royal Mail and GeoPlace lines on that page apply to
// postcode and UPRN products, not to boundaries, so they are correctly absent.)
const BOUNDARY_YEAR = 2025;
const ONS_ATTRIBUTION =
  "Source: Office for National Statistics licensed under the Open Government Licence v.3.0. " +
  `Contains OS data © Crown copyright and database right ${BOUNDARY_YEAR}.`;

// OpenStreetMap is ODbL: any produced work must credit "© OpenStreetMap
// contributors". The site credits OSM for its map tiles elsewhere, but this
// string is the one shown beside *this* map, so it has to carry the credit too.
const ATTRIBUTION = `${ONS_ATTRIBUTION} River data © OpenStreetMap contributors.`;

// ── Fetching ─────────────────────────────────────────────────────────────────

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

function queryUrl(service, fields, offset, count) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: fields,
    returnGeometry: "true",
    geometryPrecision: "5", // ~1 m in degrees; well inside what we keep
    outSR: "4326",
    f: "geojson",
  });
  if (offset != null) {
    params.set("orderByFields", "FID");
    params.set("resultOffset", String(offset));
    params.set("resultRecordCount", String(count));
  }
  return `${ARCGIS}/${service}/FeatureServer/0/query?${params}`;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "accept-encoding": "gzip" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const body = await res.json();
  if (body.error) throw new Error(`ArcGIS: ${JSON.stringify(body.error)}`);
  return body;
}

async function countFeatures(service) {
  const params = new URLSearchParams({ where: "1=1", returnCountOnly: "true", f: "json" });
  const body = await getJson(`${ARCGIS}/${service}/FeatureServer/0/query?${params}`);
  return body.count;
}

/** Cached download. Pages when `page` is set, because BGC geometry is heavy. */
async function load(spec) {
  const path = join(CACHE_DIR, spec.file);
  if (await exists(path)) {
    return JSON.parse(await readFile(path, "utf8"));
  }

  await mkdir(CACHE_DIR, { recursive: true });
  process.stderr.write(`fetching ${spec.service}\n`);

  let features;
  if (spec.page) {
    const total = await countFeatures(spec.service);
    features = [];
    for (let off = 0; off < total; off += spec.page) {
      const body = await getJson(queryUrl(spec.service, spec.fields, off, spec.page));
      features.push(...(body.features || []));
      process.stderr.write(`  ${features.length}/${total}\r`);
    }
    process.stderr.write("\n");
    const seen = new Set();
    features = features.filter((f) => {
      const key = f.properties[spec.codeField];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } else {
    features = (await getJson(queryUrl(spec.service, spec.fields))).features || [];
  }

  const fc = { type: "FeatureCollection", features };
  await writeFile(path, JSON.stringify(fc));
  return fc;
}

/** Overpass QL: every named river way that meets the box, geometry included. */
function overpassQuery(spec) {
  const { minLat, minLng, maxLat, maxLng } = spec.box;
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`; // Overpass order: S,W,N,E
  const clauses = spec.names
    .map((name) => `  way["waterway"="river"]["name"="${name}"](${bbox});`)
    .join("\n");
  return `[out:json][timeout:180];\n(\n${clauses}\n);\nout geom;`;
}

/** Cached Overpass download. One request, ever, unless the cache is cleared. */
async function loadRivers(spec) {
  const path = join(CACHE_DIR, spec.file);
  if (await exists(path)) {
    return JSON.parse(await readFile(path, "utf8"));
  }

  await mkdir(CACHE_DIR, { recursive: true });
  process.stderr.write(`fetching ${spec.names.join(", ")} from Overpass\n`);

  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": USER_AGENT,
      "accept-encoding": "gzip",
    },
    body: new URLSearchParams({ data: overpassQuery(spec) }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${OVERPASS}`);
  const body = await res.json();
  // Overpass reports timeouts and quota refusals in `remark`, with HTTP 200.
  if (body.remark) throw new Error(`Overpass: ${body.remark}`);
  if (!Array.isArray(body.elements)) throw new Error("Overpass: no elements in response");

  await writeFile(path, JSON.stringify(body));
  return body;
}

// ── Geometry ─────────────────────────────────────────────────────────────────

/** Web Mercator. Same formula as RegionMap's project(), at world size WORLD. */
function project(lat, lng) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return [
    ((lng + 180) / 360) * WORLD,
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * WORLD,
  ];
}

/** Every ring of a Polygon or MultiPolygon, outers and holes alike. */
function rings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

/** Perpendicular distance from p to the segment a→b, squared. */
function segDistSq(p, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

/**
 * Douglas–Peucker, iterative so a 40,000-point coastline cannot blow the stack.
 * The ring is treated as an open polyline whose ends coincide, which is safe
 * here: segDistSq falls back to point distance when a === b.
 */
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const tolSq = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = segDistSq(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (index !== -1 && maxDist > tolSq) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  const out = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out;
}

// ── River polylines ──────────────────────────────────────────────────────────

/**
 * Endpoint identity, snapped to 1e-6° (~0.1 m). Ways that share an OSM node
 * carry byte-identical coordinates, so this only has to forgive float noise.
 */
function endKey([lng, lat]) {
  return `${Math.round(lat * 1e6)},${Math.round(lng * 1e6)}`;
}

/**
 * Greedily chain ways into long polylines, joining wherever an end meets an end.
 * Where three ways meet — a braided channel, a weir stream — the first free
 * branch wins and the rest start polylines of their own. That is deliberate: a
 * river is a graph, and forcing it into one line would invent geometry.
 */
function stitch(ways) {
  const lines = [];
  for (const way of ways) {
    if (!way.geometry || way.geometry.length < 2) continue;
    lines.push(way.geometry.map((p) => [p.lon, p.lat]));
  }

  const ends = new Map();
  lines.forEach((pts, i) => {
    for (const key of [endKey(pts[0]), endKey(pts[pts.length - 1])]) {
      const list = ends.get(key);
      if (list) list.push(i);
      else ends.set(key, [i]);
    }
  });

  const used = new Uint8Array(lines.length);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    let chain = lines[i].slice();

    // Grow off the tail, flip, grow off what was the head, flip back.
    for (let pass = 0; pass < 2; pass++) {
      for (;;) {
        const tailKey = endKey(chain[chain.length - 1]);
        const next = (ends.get(tailKey) || []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = 1;
        const pts = lines[next];
        const seq = endKey(pts[0]) === tailKey ? pts : [...pts].reverse();
        for (let k = 1; k < seq.length; k++) chain.push(seq[k]);
      }
      chain.reverse();
    }

    out.push(chain);
  }
  return out;
}

/** The Thames Valley box in projected world units. Mercator keeps it a box. */
function clipBox(box) {
  const [minX, maxY] = project(box.minLat, box.minLng);
  const [maxX, minY] = project(box.maxLat, box.maxLng);
  return { minX, minY, maxX, maxY };
}

/** Liang–Barsky. Returns the part of a→b inside the box, or null. */
function clipSegment(a, b, box) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  let t0 = 0;
  let t1 = 1;
  const edges = [
    [-dx, a[0] - box.minX],
    [dx, box.maxX - a[0]],
    [-dy, a[1] - box.minY],
    [dy, box.maxY - a[1]],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return null; // parallel to this edge and outside it
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  return [
    [a[0] + t0 * dx, a[1] + t0 * dy],
    [a[0] + t1 * dx, a[1] + t1 * dy],
  ];
}

/** Clip a polyline to the box, splitting it wherever it leaves and re-enters. */
function clipPolyline(points, box) {
  const out = [];
  let run = null;
  for (let i = 0; i + 1 < points.length; i++) {
    const seg = clipSegment(points[i], points[i + 1], box);
    if (!seg) {
      if (run) out.push(run);
      run = null;
      continue;
    }
    const [a, b] = seg;
    if (run) {
      const last = run[run.length - 1];
      // Continuous with the previous segment? Otherwise the line left the box.
      if (Math.abs(last[0] - a[0]) < 1e-9 && Math.abs(last[1] - a[1]) < 1e-9) {
        run.push(b);
        continue;
      }
      out.push(run);
    }
    run = [a, b];
  }
  if (run) out.push(run);
  return out;
}

/** Length along a polyline, in world units. */
function polylineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return total;
}

// ── Path emission ────────────────────────────────────────────────────────────

/** Integer hundredths → the shortest legal SVG number. 44 → ".44", -300 → "-3". */
function num(hundredths) {
  const sign = hundredths < 0 ? "-" : "";
  const abs = Math.abs(hundredths);
  const whole = Math.floor(abs / Q);
  const frac = abs % Q;
  if (frac === 0) return sign + whole;
  const head = whole === 0 ? "" : String(whole);
  const tail = frac % 10 === 0 ? String(frac / 10) : String(frac).padStart(DP, "0");
  return `${sign}${head}.${tail}`;
}

/** Tokens joined with a space, except before a minus sign where it is redundant. */
function joinTokens(tokens) {
  let out = "";
  for (const t of tokens) {
    if (out && !t.startsWith("-")) out += " ";
    out += t;
  }
  return out;
}

/**
 * One subpath: absolute M, then relative l, then Z when `close` is set.
 * Coordinates are quantised to 2dp *before* the deltas are taken, so the deltas
 * are exact differences of the rounded values and nothing drifts.
 *
 * Rings close (Z, ≥3 distinct points). Rivers do not — an open polyline is
 * stroked end to end, and a Z would draw a phantom channel back to the source.
 */
function pointsToSubpath(points, bounds, close) {
  const qs = [];
  let px = null;
  let py = null;
  for (const [x, y] of points) {
    const qx = Math.round(x * Q);
    const qy = Math.round(y * Q);
    if (qx === px && qy === py) continue; // collapsed by rounding
    qs.push([qx, qy]);
    px = qx;
    py = qy;
  }
  if (close) {
    // Drop a duplicated closing vertex — Z closes the ring for us.
    if (qs.length > 1) {
      const a = qs[0];
      const b = qs[qs.length - 1];
      if (a[0] === b[0] && a[1] === b[1]) qs.pop();
    }
    if (qs.length < 3) return null;
  } else if (qs.length < 2) {
    return null;
  }

  const tokens = [`M${num(qs[0][0])}`, num(qs[0][1]), "l"];
  for (let i = 1; i < qs.length; i++) {
    tokens.push(num(qs[i][0] - qs[i - 1][0]), num(qs[i][1] - qs[i - 1][1]));
  }

  for (const [qx, qy] of qs) {
    const x = qx / Q;
    const y = qy / Q;
    if (x < bounds.minX) bounds.minX = x;
    if (x > bounds.maxX) bounds.maxX = x;
    if (y < bounds.minY) bounds.minY = y;
    if (y > bounds.maxY) bounds.maxY = y;
  }

  return close ? joinTokens(tokens) + "Z" : joinTokens(tokens);
}

/** Project, drop specks, simplify, emit. Returns "" when nothing survives. */
function featureToPath(feature, tolerance, minSpan, bounds) {
  const subpaths = [];
  for (const ring of rings(feature.geometry)) {
    if (ring.length < 4) continue;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const projected = new Array(ring.length);
    for (let i = 0; i < ring.length; i++) {
      const p = project(ring[i][1], ring[i][0]);
      projected[i] = p;
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }
    if (Math.max(maxX - minX, maxY - minY) < minSpan) continue;

    const sub = pointsToSubpath(simplify(projected, tolerance), bounds, true);
    if (sub) subpaths.push(sub);
  }
  return subpaths.join("");
}

/** Does this feature's lat/lng extent meet the Thames Valley box? */
function inThamesValley(feature) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const ring of rings(feature.geometry)) {
    for (const [lng, lat] of ring) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }
  return (
    minLat <= THAMES_VALLEY.maxLat &&
    maxLat >= THAMES_VALLEY.minLat &&
    minLng <= THAMES_VALLEY.maxLng &&
    maxLng >= THAMES_VALLEY.minLng
  );
}

/** Stitch, project, simplify, clip, drop stubs, encode. One entry per polyline. */
function buildRivers(overpass, bounds) {
  const box = clipBox(RIVERS.box);
  const byName = new Map(RIVERS.names.map((name) => [name, []]));
  for (const el of overpass.elements) {
    if (el.type !== "way") continue;
    const bucket = byName.get(el.tags && el.tags.name);
    if (bucket) bucket.push(el);
  }

  const out = [];
  for (const name of RIVERS.names) {
    const pieces = [];
    for (const chain of stitch(byName.get(name))) {
      const projected = chain.map(([lng, lat]) => project(lat, lng));
      for (const piece of clipPolyline(simplify(projected, TOL_FINE), box)) {
        const length = polylineLength(piece);
        if (length < MIN_RIVER_LENGTH) continue;
        pieces.push({ length, piece });
      }
    }
    // Longest first, so a river's main channel is its first polyline.
    pieces.sort((a, b) => b.length - a.length);
    for (const { piece } of pieces) {
      const d = pointsToSubpath(piece, bounds, false);
      if (d) out.push({ name, d });
    }
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [countries, counties] = await Promise.all([load(COUNTRIES), load(COUNTIES)]);
  const riversRaw = await loadRivers(RIVERS);

  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  const ukOutline = [];
  const outlineOrder = ["England", "Scotland", "Wales", "Northern Ireland"];
  const sortedCountries = [...countries.features].sort(
    (a, b) =>
      outlineOrder.indexOf(a.properties[COUNTRIES.nameField]) -
      outlineOrder.indexOf(b.properties[COUNTRIES.nameField]),
  );
  for (const f of sortedCountries) {
    const d = featureToPath(f, TOL_COARSE, MIN_SPAN_COARSE, bounds);
    if (d) ukOutline.push(d);
  }

  const countyOut = [];
  let fineCount = 0;
  for (const f of counties.features) {
    const detailed = inThamesValley(f);
    if (detailed) fineCount++;
    const d = featureToPath(
      f,
      detailed ? TOL_FINE : TOL_COARSE,
      detailed ? MIN_SPAN_FINE : MIN_SPAN_COARSE,
      bounds,
    );
    if (!d) continue;
    countyOut.push({
      name: f.properties[COUNTIES.nameField],
      code: f.properties[COUNTIES.codeField],
      detailed,
      d,
    });
  }
  countyOut.sort((a, b) => a.name.localeCompare(b.name));

  const riverOut = buildRivers(riversRaw, bounds);

  const round = (v) => Math.round(v * Q) / Q;
  const box = {
    minX: round(bounds.minX),
    minY: round(bounds.minY),
    maxX: round(bounds.maxX),
    maxY: round(bounds.maxY),
  };

  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const lines = [];
  lines.push("// GENERATED FILE — do not edit by hand.");
  lines.push("// Rebuild with: node scripts/build-map-paths.mjs");
  lines.push("//");
  lines.push("// SVG path data for a faint vector map of the UK: country outlines, county /");
  lines.push("// unitary-authority lines and Thames Valley rivers, already projected to");
  lines.push("// Web Mercator.");
  lines.push("//");
  lines.push("// Coordinates are Web Mercator world pixels at a world size of `world`");
  lines.push("// (65536 = 256 * 2 ** 8), from exactly the formula RegionMap.tsx uses:");
  lines.push("//");
  lines.push("//   x = ((lng + 180) / 360) * world");
  lines.push("//   y = (0.5 - log((1 + sin lat) / (1 - sin lat)) / (4 * PI)) * world");
  lines.push("//");
  lines.push("// To draw at zoom z (matching RegionMap's project(lat, lng, z)):");
  lines.push("//");
  lines.push("//   px = value * (256 * 2 ** z) / world");
  lines.push("//");
  lines.push("// or feed `bounds` straight to a viewBox for a fit-to-extent render.");
  lines.push("// Every ukOutline / counties path is a run of closed subpaths, so a filled");
  lines.push('// render wants fill-rule="evenodd" for the holes (cities carved out of');
  lines.push("// counties).");
  lines.push("//");
  lines.push("// `detailed` marks the counties simplified at the fine tolerance tier —");
  lines.push("// those meeting the Thames Valley box, which stay clean zoomed to a town.");
  lines.push("//");
  lines.push("// `rivers` are OPEN polylines — a single subpath with no closing Z. Stroke");
  lines.push('// them (fill="none"); filling would close each one back to its source.');
  lines.push("");
  lines.push("/** Web Mercator world size, in pixels, that these coordinates are baked at. */");
  lines.push(`export const world = ${WORLD};`);
  lines.push("");
  lines.push("/** Extent of every path below, in the same world pixels. */");
  lines.push(
    `export const bounds = { minX: ${box.minX}, minY: ${box.minY}, maxX: ${box.maxX}, maxY: ${box.maxY} };`,
  );
  lines.push("");
  lines.push("/** One path per country: England, Scotland, Wales, Northern Ireland. */");
  lines.push("export const ukOutline: string[] = [");
  for (const d of ukOutline) lines.push(`  "${esc(d)}",`);
  lines.push("];");
  lines.push("");
  lines.push("/** Counties and unitary authorities of the UK. */");
  lines.push(
    "export const counties: { name: string; code: string; detailed: boolean; d: string }[] = [",
  );
  for (const c of countyOut) {
    lines.push(
      `  { name: "${esc(c.name)}", code: "${c.code}", detailed: ${c.detailed}, d: "${esc(c.d)}" },`,
    );
  }
  lines.push("];");
  lines.push("");
  lines.push("/** River centrelines through the Thames Valley. Open polylines — stroke only. */");
  lines.push("export const rivers: { name: string; d: string }[] = [");
  for (const r of riverOut) {
    lines.push(`  { name: "${esc(r.name)}", d: "${esc(r.d)}" },`);
  }
  lines.push("];");
  lines.push("");
  lines.push("/** Where the geometry came from. */");
  lines.push(`export const source = "${esc(SOURCE_NOTE)}";`);
  lines.push("");
  lines.push("/** Required by the licence. Must be displayed wherever this map is drawn. */");
  lines.push(`export const attribution = "${esc(ATTRIBUTION)}";`);
  lines.push("");
  lines.push(
    "const mapPaths = { world, bounds, ukOutline, counties, rivers, source, attribution };",
  );
  lines.push("export default mapPaths;");
  lines.push("");

  const text = lines.join("\n");
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, text);

  const bytes = Buffer.byteLength(text);
  process.stdout.write(
    [
      `wrote ${OUT}`,
      `  ${(bytes / 1024).toFixed(1)} KB (${bytes} bytes)`,
      `  ukOutline: ${ukOutline.length} paths, ${ukOutline.reduce((n, d) => n + d.length, 0)} chars`,
      `  counties:  ${countyOut.length} of ${counties.features.length} (${fineCount} fine tier)`,
      `  rivers:    ${riverOut.length} polylines, ${riverOut.reduce((n, r) => n + r.d.length, 0)} chars` +
        ` (${RIVERS.names.map((n) => `${n}: ${riverOut.filter((r) => r.name === n).length}`).join(", ")})`,
      `  bounds:    x ${box.minX}..${box.maxX}  y ${box.minY}..${box.maxY}`,
      `  tolerance: coarse ${TOL_COARSE}, fine ${TOL_FINE} world units at ${WORLD}`,
      "",
    ].join("\n"),
  );
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
