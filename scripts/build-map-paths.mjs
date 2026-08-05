#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-map-paths.mjs
//
// Turns ONS boundary GeoJSON into a small TypeScript module of SVG path data,
// so a component can draw a faint vector map of the UK — country outlines plus
// county / unitary-authority lines, the Thames and Kennet through the Thames
// Valley, the road and rail network around it, and the footprint of each site —
// with no runtime fetch, no map library and no tile server.
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
// ── Four tolerance tiers ─────────────────────────────────────────────────────
// Douglas–Peucker, run in projected world units so the tolerance means the same
// thing everywhere on screen:
//
//   coarse — country outlines and every county outside the Thames Valley. Sized
//            to be sub-pixel at a whole-UK view (the UK is ~1900 world units
//            wide, so a 600 px render puts one unit at about a third of a pixel).
//   medium — major roads and railways. Sized for a regional view of the Thames
//            Valley (z ~ 10–11): a motorway sweep stays a sweep, but a slip-road
//            wiggle nobody can see at that zoom costs nothing.
//   fine   — counties whose bounding box meets the Thames Valley box below,
//            every river, and the local streets around each site. Sized to stay
//            clean zoomed to roughly town level (z ~ 12–13), where one world
//            unit is 16–32 px.
//   site   — the six site footprints, at the output quantum. A hospital block is
//            40–80 m across, so anything coarser would round it to a triangle.
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
//
// ── Roads, railways and sites ────────────────────────────────────────────────
// Four more Overpass queries, cached separately and — bar the site footprints —
// shaped exactly like the rivers: stitch the ways back into long polylines,
// project, simplify, clip, drop the stubs, encode. Five requests in total, one
// per data class, and never more than one in flight.
//
//   roadsMajor — highway=motorway / trunk / primary / secondary across the
//                Thames Valley box. Link roads (motorway_link and friends) are
//                excluded by anchoring the regex: at this zoom a slip road is a
//                blob on the junction, not a road. Ways are bucketed by class
//                *before* stitching, so a chain never straddles two classes and
//                the class survives into the output for per-class styling.
//   roadsLocal — highway=tertiary / unclassified / residential / living_street /
//                pedestrian within LOCAL_RADIUS of any site. Overpass's `around`
//                hands back whole ways, so a lane that merely brushes the radius
//                arrives with its full length attached; each polyline is clipped
//                back to the union of the discs so the export means what it says.
//   railways   — railway=rail without a service tag, so the running lines survive
//                and the sidings, spurs, yards and crossovers do not.
//
// Roads and railways are open polylines too, and are stroked the same way.
//
// Site footprints are the odd one out: closed rings, taken from the hospital
// grounds / healthcare / building polygon that contains each site coordinate,
// falling back to the largest polygon within SITE_RADIUS when nothing contains
// it. Where both a grounds polygon (amenity=hospital or healthcare=*) and a
// single block contain the point, the grounds win — the map wants the site, not
// one ward of it. Multipolygon relations contribute their outer ring(s) only;
// courtyards would need a fill-rule the caller has no reason to want.
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

/**
 * One world unit is EARTH_CIRCUMFERENCE * cos(lat) / WORLD metres on the ground:
 * 381 m at the latitude of Reading. Every threshold below is written in world
 * units, with the metres it works out to at that latitude in the comment.
 */
const EARTH_CIRCUMFERENCE = 40075016.686;
const metresPerUnit = (lat) => (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / WORLD;

/** Douglas–Peucker tolerance, in world units at WORLD. */
const TOL_COARSE = 1.6; // ~0.5 px at a whole-UK view
const TOL_ROADS = 0.15; // ~57 m — ~0.6 px at z 10, ~2.3 px at z 12
const TOL_FINE = 0.09; // ~1.5 px at z 12, ~3 px at z 13
const TOL_SITE = 0.01; // ~4 m — the 2dp output quantum, i.e. lossless once rounded

/** Rings smaller than this (longest bbox side, world units) are dropped. */
const MIN_SPAN_COARSE = 3.2; // ~1.2 km — islets that would render as specks
const MIN_SPAN_FINE = 0.5; // ~200 m

/** Polylines shorter than this along their length (world units) are dropped. */
const MIN_RIVER_LENGTH = 0.8; // ~300 m — clipping stubs and orphaned side channels
const MIN_ROAD_MAJOR_LENGTH = 1.05; // ~400 m — junction fragments left by the clip
const MIN_ROAD_LOCAL_LENGTH = 0.32; // ~120 m — cul-de-sac stubs and disc-edge slivers
const MIN_RAIL_LENGTH = 1.3; // ~500 m — platform loops and chords

/** Thames Valley: Reading, Windsor, Oxford and their neighbours get the fine tier. */
const THAMES_VALLEY = { minLat: 51.2, maxLat: 51.95, minLng: -1.55, maxLng: -0.3 };

/**
 * The six places the practice works out of, in the order the site lists them.
 * `slug` is the key the component joins on, so it has to stay stable.
 */
const SITES = [
  { slug: "practice", lat: 51.449959, lng: -0.985037 },
  { slug: "spire-dunedin-reading", lat: 51.450499, lng: -0.986018 },
  { slug: "royal-berkshire-hospital", lat: 51.449176, lng: -0.958114 },
  { slug: "princess-margaret-windsor", lat: 51.47484, lng: -0.609968 },
  { slug: "genesiscare-windsor", lat: 51.47786, lng: -0.616878 },
  { slug: "genesiscare-oxford", lat: 51.723559, lng: -1.215733 },
];

/** Local streets are kept within this of a site; site polygons are sought within this. */
const LOCAL_RADIUS = 2500; // metres
const SITE_RADIUS = 150; // metres

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

// OpenStreetMap, via four Overpass queries: the named waterway=river ways inside
// the Thames Valley box, the major roads and railways across the same box, the
// local streets around the sites, and the site footprints. Overpass is a free,
// volunteer-funded service: ask once, cache each answer separately, and identify
// the caller.

const OVERPASS = "https://overpass-api.de/api/interpreter";

const USER_AGENT =
  "berkshire-oncology-partnership/build-map-paths.mjs (one-off static map build)";

/**
 * Overpass's own server-side budget, in seconds. Generous because the major-road
 * query sweeps 7,000 km² and comes back with a fifth of a million nodes; the
 * others finish in seconds and the budget costs them nothing.
 */
const OVERPASS_TIMEOUT = 600;

/** Overpass bbox order is S,W,N,E — the opposite way round from a GeoJSON bbox. */
const bboxOf = (box) => `${box.minLat},${box.minLng},${box.maxLat},${box.maxLng}`;

/** `^(...)$` so highway=motorway matches and highway=motorway_link does not. */
const exactly = (values) => `^(${values.join("|")})$`;

const RIVERS = {
  file: "thames_valley_rivers_osm.json",
  label: "rivers",
  names: ["River Thames", "River Kennet"],
  box: THAMES_VALLEY,
  get query() {
    const clauses = this.names
      .map((name) => `  way["waterway"="river"]["name"="${name}"](${bboxOf(this.box)});`)
      .join("\n");
    return `[out:json][timeout:${OVERPASS_TIMEOUT}];\n(\n${clauses}\n);\nout geom;`;
  },
};

const ROADS_MAJOR = {
  file: "thames_valley_roads_major_osm.json",
  label: "major roads",
  classes: ["motorway", "trunk", "primary", "secondary"],
  box: THAMES_VALLEY,
  get query() {
    return (
      `[out:json][timeout:${OVERPASS_TIMEOUT}];\n(\n` +
      `  way["highway"~"${exactly(this.classes)}"](${bboxOf(this.box)});\n` +
      `);\nout geom;`
    );
  },
};

const RAILWAYS = {
  file: "thames_valley_railways_osm.json",
  label: "railways",
  box: THAMES_VALLEY,
  get query() {
    return (
      `[out:json][timeout:${OVERPASS_TIMEOUT}];\n(\n` +
      `  way["railway"="rail"][!"service"](${bboxOf(this.box)});\n` +
      `);\nout geom;`
    );
  },
};

const ROADS_LOCAL = {
  file: "sites_roads_local_osm.json",
  label: "local streets",
  classes: ["tertiary", "unclassified", "residential", "living_street", "pedestrian"],
  radius: LOCAL_RADIUS,
  get query() {
    const clauses = SITES.map(
      (s) =>
        `  way["highway"~"${exactly(this.classes)}"](around:${this.radius},${s.lat},${s.lng});`,
    ).join("\n");
    return `[out:json][timeout:${OVERPASS_TIMEOUT}];\n(\n${clauses}\n);\nout geom;`;
  },
};

const SITE_POLYS = {
  file: "sites_polygons_osm.json",
  label: "site footprints",
  radius: SITE_RADIUS,
  // Grounds, healthcare buildings and plain buildings all in one net; which of
  // them wins per site is decided geometrically in buildSitePolys().
  selectors: ['["amenity"="hospital"]', '["healthcare"]', '["building"]'],
  get query() {
    const clauses = SITES.flatMap((s) =>
      this.selectors.flatMap((sel) =>
        ["way", "relation"].map(
          (kind) => `  ${kind}${sel}(around:${this.radius},${s.lat},${s.lng});`,
        ),
      ),
    ).join("\n");
    return `[out:json][timeout:${OVERPASS_TIMEOUT}];\n(\n${clauses}\n);\nout geom;`;
  },
};

const SOURCE_NOTE =
  "ONS Open Geography Portal: Countries (December 2025) Boundaries UK BUC; " +
  "Counties and Unitary Authorities (December 2025) Boundaries UK BGC. " +
  "Rivers from OpenStreetMap via the Overpass API: waterway=river ways named " +
  "River Thames or River Kennet within the Thames Valley box. " +
  "Also from OpenStreetMap via the Overpass API: highway=" +
  ROADS_MAJOR.classes.join("/") +
  " ways and railway=rail ways without a service tag within the same box; highway=" +
  ROADS_LOCAL.classes.join("/") +
  ` ways within ${LOCAL_RADIUS} m of a site; and the amenity=hospital, healthcare ` +
  `and building ways and multipolygon relations within ${SITE_RADIUS} m of a site. ` +
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
const ATTRIBUTION = `${ONS_ATTRIBUTION} River, road, rail and site data © OpenStreetMap contributors.`;

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

/**
 * Cached Overpass download, one file per data class. One request per class,
 * ever, unless the cache is cleared — so a rebuild after a tolerance tweak
 * costs the Overpass volunteers nothing.
 */
async function loadOverpass(spec) {
  const path = join(CACHE_DIR, spec.file);
  if (await exists(path)) {
    return JSON.parse(await readFile(path, "utf8"));
  }

  await mkdir(CACHE_DIR, { recursive: true });
  process.stderr.write(`fetching ${spec.label} from Overpass\n`);

  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": USER_AGENT,
      "accept-encoding": "gzip",
    },
    body: new URLSearchParams({ data: spec.query }),
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

/**
 * The sites as discs in projected world units. Mercator stretches with latitude,
 * so a radius in metres is a different number of world units at Oxford than at
 * Reading; each disc is sized at its own site's latitude.
 */
function siteDiscs(radiusMetres) {
  return SITES.map((site) => {
    const [x, y] = project(site.lat, site.lng);
    return { x, y, r: radiusMetres / metresPerUnit(site.lat) };
  });
}

/**
 * The stretches of a→b that lie inside at least one disc, as [t0, t1] pairs in
 * ascending order with overlaps merged. Solves |a + t·d − c|² = r² per disc,
 * clamped to the segment. The discs around Reading and around Windsor overlap in
 * pairs, which is exactly why the spans have to be merged rather than emitted.
 */
function segmentInDiscs(a, b, discs) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const qa = dx * dx + dy * dy;
  const spans = [];
  for (const disc of discs) {
    const fx = a[0] - disc.x;
    const fy = a[1] - disc.y;
    const qc = fx * fx + fy * fy - disc.r * disc.r;
    if (qa === 0) {
      if (qc <= 0) spans.push([0, 1]); // a zero-length segment, sitting inside
      continue;
    }
    const qb = 2 * (fx * dx + fy * dy);
    const discriminant = qb * qb - 4 * qa * qc;
    if (discriminant < 0) continue; // the line misses the circle entirely
    const root = Math.sqrt(discriminant);
    const t0 = Math.max(0, (-qb - root) / (2 * qa));
    const t1 = Math.min(1, (-qb + root) / (2 * qa));
    if (t1 > t0) spans.push([t0, t1]);
  }
  if (spans.length < 2) return spans;

  spans.sort((p, q) => p[0] - q[0]);
  const merged = [spans[0]];
  for (let i = 1; i < spans.length; i++) {
    const last = merged[merged.length - 1];
    if (spans[i][0] <= last[1]) last[1] = Math.max(last[1], spans[i][1]);
    else merged.push(spans[i]);
  }
  return merged;
}

/**
 * Clip a polyline to the union of the discs, splitting it wherever it leaves and
 * re-enters. The counterpart of clipPolyline for a round boundary; the same
 * run-continuity test joins consecutive segments back up.
 */
function clipPolylineToDiscs(points, discs) {
  const along = (a, b, t) => [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  const out = [];
  let run = null;
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i];
    const b = points[i + 1];
    const spans = segmentInDiscs(a, b, discs);
    if (!spans.length) {
      if (run) out.push(run);
      run = null;
      continue;
    }
    for (const [t0, t1] of spans) {
      const p = along(a, b, t0);
      const q = along(a, b, t1);
      if (run) {
        const last = run[run.length - 1];
        // Continuous with what came before? Otherwise the line left the discs.
        if (Math.abs(last[0] - p[0]) < 1e-9 && Math.abs(last[1] - p[1]) < 1e-9) {
          run.push(q);
          continue;
        }
        out.push(run);
      }
      run = [p, q];
    }
    // Stopping short of the far end means the line left the discs mid-segment.
    if (spans[spans.length - 1][1] < 1) {
      out.push(run);
      run = null;
    }
  }
  if (run) out.push(run);
  return out;
}

// ── Polygons ─────────────────────────────────────────────────────────────────

/**
 * Twice the signed area of a projected ring. Sign is winding, so take |·|.
 *
 * The shoelace terms are worked out relative to the ring's first vertex, which
 * matters more than it looks: world coordinates here are ~3 × 10⁴, so each raw
 * cross product is ~7 × 10⁸, while a 14 m-square building spans 0.0026 world
 * units². Subtracting the big numbers first keeps eleven digits of signal that
 * the naive form throws away.
 */
function ringArea2(ring, origin = ring[0]) {
  let total = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xj = ring[j][0] - origin[0];
    const yj = ring[j][1] - origin[1];
    const xi = ring[i][0] - origin[0];
    const yi = ring[i][1] - origin[1];
    total += xj * yi - xi * yj;
  }
  return total;
}

/** Ray casting, on projected coordinates. Points on the edge may go either way. */
function ringContains(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > point[1] !== yj > point[1]) {
      if (point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

/** Shortest distance from a point to a ring's edge, in world units. */
function ringDistance(point, ring) {
  let best = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const d = segDistSq(point, ring[j], ring[i]);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

/** Lexicographic "a beats b" over a fixed-length rank tuple, higher wins. */
function outranks(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return false;
}

/** Area-weighted centroid of a set of rings, in world units. */
function ringsCentroid(rings) {
  // Relative to one shared origin, for the reason ringArea2 spells out — and
  // more urgently here, because the centroid moments carry another factor of
  // ~6 × 10⁴ before the division puts them back on the ground.
  const origin = rings[0][0];
  let cx = 0;
  let cy = 0;
  let total = 0;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xj = ring[j][0] - origin[0];
      const yj = ring[j][1] - origin[1];
      const xi = ring[i][0] - origin[0];
      const yi = ring[i][1] - origin[1];
      const cross = xj * yi - xi * yj;
      cx += (xj + xi) * cross;
      cy += (yj + yi) * cross;
      total += cross;
    }
  }
  if (total === 0) return origin; // a degenerate sliver; its first vertex will do
  return [origin[0] + cx / (3 * total), origin[1] + cy / (3 * total)];
}

/**
 * The closed outer ring(s) of an OSM polygon, in [lng, lat]. A way counts only
 * if it closes on itself. A multipolygon relation's outer boundary can arrive
 * split across several member ways, so those are stitched exactly as a river is;
 * inner members — courtyards, lightwells — are dropped.
 */
function outerRings(element) {
  if (element.type === "way") {
    const g = element.geometry;
    if (!g || g.length < 4) return [];
    if (g[0].lat !== g[g.length - 1].lat || g[0].lon !== g[g.length - 1].lon) return [];
    return [g.map((p) => [p.lon, p.lat])];
  }
  const outers = (element.members || []).filter((m) => m.role === "outer" && m.geometry);
  return stitch(outers).filter((ring) => ring.length >= 4);
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

/**
 * Stitch, project, simplify, clip, drop stubs. Returns the surviving polylines
 * longest first, so the main channel or the trunk run is the first entry.
 *
 * Every open-polyline class goes through this: rivers, both road tiers and the
 * railways. Only three things differ between them — the tolerance, the stub
 * floor, and whether `clip` is the Thames Valley box or the union of the site
 * discs. Ways must already be bucketed by whatever attribute the caller wants
 * to keep, because stitching happily welds a primary to a secondary otherwise.
 */
function buildPolylines(ways, tolerance, minLength, clip) {
  const pieces = [];
  for (const chain of stitch(ways)) {
    const projected = chain.map(([lng, lat]) => project(lat, lng));
    for (const piece of clip(simplify(projected, tolerance))) {
      const length = polylineLength(piece);
      if (length < minLength) continue;
      pieces.push({ length, piece });
    }
  }
  pieces.sort((a, b) => b.length - a.length);
  return pieces.map((entry) => entry.piece);
}

/** One entry per river polyline, the Thames first and then the Kennet. */
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
    const pieces = buildPolylines(byName.get(name), TOL_FINE, MIN_RIVER_LENGTH, (points) =>
      clipPolyline(points, box),
    );
    for (const piece of pieces) {
      const d = pointsToSubpath(piece, bounds, false);
      if (d) out.push({ name, d });
    }
  }
  return out;
}

/**
 * Motorways, then trunk, then primary, then secondary — bucketed before the
 * stitch so a chain is all one class and the class survives into the output.
 */
function buildRoadsMajor(overpass, bounds) {
  const box = clipBox(ROADS_MAJOR.box);
  const byClass = new Map(ROADS_MAJOR.classes.map((cls) => [cls, []]));
  for (const el of overpass.elements) {
    if (el.type !== "way") continue;
    const bucket = byClass.get(el.tags && el.tags.highway);
    if (bucket) bucket.push(el);
  }

  const out = [];
  for (const cls of ROADS_MAJOR.classes) {
    const pieces = buildPolylines(
      byClass.get(cls),
      TOL_ROADS,
      MIN_ROAD_MAJOR_LENGTH,
      (points) => clipPolyline(points, box),
    );
    for (const piece of pieces) {
      const d = pointsToSubpath(piece, bounds, false);
      if (d) out.push({ cls, d });
    }
  }
  return out;
}

/**
 * The streets immediately around each site. One pool, no class kept: at this
 * zoom a residential road and an unclassified lane are the same grey hairline.
 * Clipped back to the discs the query asked for, since `around` returns whole
 * ways and a tertiary road can run for miles past the edge of one.
 */
function buildRoadsLocal(overpass, bounds) {
  const discs = siteDiscs(ROADS_LOCAL.radius);
  const ways = overpass.elements.filter((el) => el.type === "way");

  const out = [];
  const pieces = buildPolylines(ways, TOL_FINE, MIN_ROAD_LOCAL_LENGTH, (points) =>
    clipPolylineToDiscs(points, discs),
  );
  for (const piece of pieces) {
    const d = pointsToSubpath(piece, bounds, false);
    if (d) out.push(d);
  }
  return out;
}

/**
 * Running lines only. The query already excludes anything with a service tag —
 * sidings, spurs, yards, crossovers — and this repeats the test so a cache file
 * fetched under an older query cannot quietly reintroduce a goods yard.
 */
function buildRailways(overpass, bounds) {
  const box = clipBox(RAILWAYS.box);
  const ways = overpass.elements.filter(
    (el) => el.type === "way" && !(el.tags && el.tags.service),
  );

  const out = [];
  const pieces = buildPolylines(ways, TOL_ROADS, MIN_RAIL_LENGTH, (points) =>
    clipPolyline(points, box),
  );
  for (const piece of pieces) {
    const d = pointsToSubpath(piece, bounds, false);
    if (d) out.push(d);
  }
  return out;
}

/**
 * One closed outline per site. Every returned polygon is scored against every
 * site coordinate and the best one wins, ranked on:
 *
 *   1. containing the point beats merely being near it;
 *   2. a grounds polygon (amenity=hospital or healthcare=*) beats a single
 *      block — the map wants the site, not one of its wards;
 *   3. failing both, the largest.
 *
 * So the practice takes its own building (Dunedin House, OSM way 97524252)
 * while the Royal Berkshire takes the whole hospital site rather than the
 * Centre Block that happens to sit under the pin. Returns the paths plus a
 * per-site report for the build summary.
 */
function buildSitePolys(overpass, bounds) {
  const candidates = [];
  for (const element of overpass.elements) {
    const rings = outerRings(element).map((ring) =>
      ring.map(([lng, lat]) => project(lat, lng)),
    );
    if (!rings.length) continue;
    const tags = element.tags || {};
    candidates.push({
      id: `${element.type}/${element.id}`,
      name: tags.name || tags["addr:housename"] || "",
      grounds: tags.amenity === "hospital" || tags.healthcare !== undefined,
      area2: Math.abs(rings.reduce((total, ring) => total + ringArea2(ring, rings[0][0]), 0)),
      rings,
    });
  }

  const out = [];
  const report = [];
  for (const site of SITES) {
    const point = project(site.lat, site.lng);
    const perUnit = metresPerUnit(site.lat);
    const radius = SITE_POLYS.radius / perUnit;

    let best = null;
    let bestRank = null;
    for (const candidate of candidates) {
      const contains = candidate.rings.some((ring) => ringContains(point, ring));
      if (!contains) {
        const distance = Math.min(...candidate.rings.map((ring) => ringDistance(point, ring)));
        if (distance > radius) continue;
      }
      const rank = [contains ? 1 : 0, candidate.grounds ? 1 : 0, candidate.area2];
      if (bestRank && !outranks(rank, bestRank)) continue;
      best = { ...candidate, contains };
      bestRank = rank;
    }

    if (!best) {
      report.push({ slug: site.slug, missing: true });
      continue;
    }

    const d = best.rings
      .map((ring) => pointsToSubpath(simplify(ring, TOL_SITE), bounds, true))
      .filter(Boolean)
      .join("");
    if (!d) {
      report.push({ slug: site.slug, missing: true });
      continue;
    }

    const centroid = ringsCentroid(best.rings);
    report.push({
      slug: site.slug,
      id: best.id,
      name: best.name,
      contains: best.contains,
      areaM2: Math.round((best.area2 / 2) * perUnit * perUnit),
      offsetM: Math.round(Math.hypot(centroid[0] - point[0], centroid[1] - point[1]) * perUnit),
      rings: best.rings.length,
    });
    out.push({ slug: site.slug, d });
  }
  return { polys: out, report };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [countries, counties] = await Promise.all([load(COUNTRIES), load(COUNTIES)]);
  // Sequential, not Promise.all: Overpass runs two slots per IP and firing all
  // five at once earns a 429. Each is cached, so this is a one-off cost anyway.
  const riversRaw = await loadOverpass(RIVERS);
  const roadsMajorRaw = await loadOverpass(ROADS_MAJOR);
  const roadsLocalRaw = await loadOverpass(ROADS_LOCAL);
  const railwaysRaw = await loadOverpass(RAILWAYS);
  const sitePolysRaw = await loadOverpass(SITE_POLYS);

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
  const roadsMajorOut = buildRoadsMajor(roadsMajorRaw, bounds);
  const roadsLocalOut = buildRoadsLocal(roadsLocalRaw, bounds);
  const railwayOut = buildRailways(railwaysRaw, bounds);
  const { polys: sitePolyOut, report: siteReport } = buildSitePolys(sitePolysRaw, bounds);

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
  lines.push("// unitary-authority lines, Thames Valley rivers, the roads and railways");
  lines.push("// around it and the footprint of each site, already projected to Web");
  lines.push("// Mercator.");
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
  lines.push("// `roadsMajor`, `roadsLocal` and `railways` are open in exactly the same way.");
  lines.push("//");
  lines.push("// `sitePolys` are the odd ones out: CLOSED rings, one entry per site, keyed");
  lines.push("// by the same slug the site list uses. Fill or stroke them as you like.");
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
  lines.push("/** The road classes kept, coarsest first. */");
  lines.push(
    `export type RoadClass = ${ROADS_MAJOR.classes.map((c) => `"${c}"`).join(" | ")};`,
  );
  lines.push("");
  lines.push("// Built through road() rather than written out as object literals. An array");
  lines.push("// literal this long makes TypeScript union all of its element types together");
  lines.push('// and then give up — "Expression produces a union type that is too complex to');
  lines.push('// represent" (TS2590). A function call gives every element the identical');
  lines.push("// type, so the union is one wide and the check is instant. Same data, same");
  lines.push("// shape at runtime; do not inline it back.");
  lines.push("const road = (cls: RoadClass, d: string) => ({ cls, d });");
  lines.push("");
  lines.push("/**");
  lines.push(" * Motorways, trunk, primary and secondary roads across the Thames Valley,");
  lines.push(" * grouped by class and longest first within each. Open polylines — stroke only.");
  lines.push(" */");
  lines.push("export const roadsMajor: { cls: RoadClass; d: string }[] = [");
  for (const r of roadsMajorOut) {
    lines.push(`  road("${r.cls}", "${esc(r.d)}"),`);
  }
  lines.push("];");
  lines.push("");
  lines.push(
    `/** Streets within ${LOCAL_RADIUS} m of a site, longest first. Open polylines — stroke only. */`,
  );
  lines.push("export const roadsLocal: string[] = [");
  for (const d of roadsLocalOut) lines.push(`  "${esc(d)}",`);
  lines.push("];");
  lines.push("");
  lines.push("/** Railway running lines, longest first. Open polylines — stroke only. */");
  lines.push("export const railways: string[] = [");
  for (const d of railwayOut) lines.push(`  "${esc(d)}",`);
  lines.push("];");
  lines.push("");
  lines.push("/** The footprint of each site. Closed rings — safe to fill. */");
  lines.push("export const sitePolys: { slug: string; d: string }[] = [");
  for (const s of sitePolyOut) {
    lines.push(`  { slug: "${s.slug}", d: "${esc(s.d)}" },`);
  }
  lines.push("];");
  lines.push("");
  lines.push("/** Where the geometry came from. */");
  lines.push(`export const source = "${esc(SOURCE_NOTE)}";`);
  lines.push("");
  lines.push("/** Required by the licence. Must be displayed wherever this map is drawn. */");
  lines.push(`export const attribution = "${esc(ATTRIBUTION)}";`);
  lines.push("");
  lines.push("const mapPaths = {");
  lines.push("  world,");
  lines.push("  bounds,");
  lines.push("  ukOutline,");
  lines.push("  counties,");
  lines.push("  rivers,");
  lines.push("  roadsMajor,");
  lines.push("  roadsLocal,");
  lines.push("  railways,");
  lines.push("  sitePolys,");
  lines.push("  source,");
  lines.push("  attribution,");
  lines.push("};");
  lines.push("export default mapPaths;");
  lines.push("");

  const text = lines.join("\n");
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, text);

  const bytes = Buffer.byteLength(text);
  const chars = (list, pick = (d) => d) => list.reduce((n, e) => n + pick(e).length, 0);
  process.stdout.write(
    [
      `wrote ${OUT}`,
      `  ${(bytes / 1024).toFixed(1)} KB (${bytes} bytes)`,
      `  ukOutline:  ${ukOutline.length} paths, ${chars(ukOutline)} chars`,
      `  counties:   ${countyOut.length} of ${counties.features.length} (${fineCount} fine tier)`,
      `  rivers:     ${riverOut.length} polylines, ${chars(riverOut, (r) => r.d)} chars` +
        ` (${RIVERS.names.map((n) => `${n}: ${riverOut.filter((r) => r.name === n).length}`).join(", ")})`,
      `  roadsMajor: ${roadsMajorOut.length} polylines, ${chars(roadsMajorOut, (r) => r.d)} chars` +
        ` (${ROADS_MAJOR.classes.map((c) => `${c}: ${roadsMajorOut.filter((r) => r.cls === c).length}`).join(", ")})`,
      `  roadsLocal: ${roadsLocalOut.length} polylines, ${chars(roadsLocalOut)} chars`,
      `  railways:   ${railwayOut.length} polylines, ${chars(railwayOut)} chars`,
      `  sitePolys:  ${sitePolyOut.length} of ${SITES.length}, ${chars(sitePolyOut, (s) => s.d)} chars`,
      ...siteReport.map((s) =>
        s.missing
          ? `    ${s.slug.padEnd(26)} NO POLYGON within ${SITE_POLYS.radius} m`
          : `    ${s.slug.padEnd(26)} ${s.id.padEnd(18)} ${s.contains ? "contains" : "  nearby"}` +
            ` ${String(s.areaM2).padStart(6)} m2, centroid ${s.offsetM} m off` +
            `${s.rings > 1 ? `, ${s.rings} rings` : ""}${s.name ? `  ${s.name}` : ""}`,
      ),
      `  bounds:     x ${box.minX}..${box.maxX}  y ${box.minY}..${box.maxY}`,
      `  tolerance:  coarse ${TOL_COARSE}, roads ${TOL_ROADS}, fine ${TOL_FINE}, site ${TOL_SITE}` +
        ` world units at ${WORLD} (1 unit ~ ${metresPerUnit(SITES[0].lat).toFixed(0)} m)`,
      "",
    ].join("\n"),
  );
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
