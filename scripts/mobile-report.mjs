#!/usr/bin/env node
/**
 * Turn the raw sweep into something a person will actually read.
 *
 * Kept separate from the sweep on purpose: the grouping and thresholds below
 * will change as the audit proceeds, and re-deriving a report should not cost
 * another twenty-minute run over 275 page loads.
 *
 * The one rule that matters here is deduplication. The same defect measured at
 * five widths is one defect, not five, and a report that says otherwise
 * inflates its own findings by 5x and stops being trusted.
 *
 *   node scripts/mobile-report.mjs --in=docs/mobile/2026-09-07-layout.json
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, ROOT } from "./lib/mobile.mjs";

const args = parseArgs();
const inPath = path.resolve(ROOT, args.in || `docs/mobile/${new Date().toISOString().slice(0, 10)}-layout.json`);
const data = JSON.parse(await readFile(inPath, "utf8"));

/** Roll a per-width finding list up into one row per distinct defect. */
function dedupe(items, keyOf) {
  const map = new Map();
  for (const { width, item } of items) {
    const k = keyOf(item);
    if (!map.has(k)) map.set(k, { item, widths: new Set() });
    map.get(k).widths.add(width);
  }
  return [...map.values()]
    .map((v) => ({ ...v.item, widths: [...v.widths] }))
    .sort((a, b) => b.widths.length - a.widths.length);
}

const byRoute = new Map();
for (const p of data.pageData) {
  if (!byRoute.has(p.route)) byRoute.set(p.route, []);
  byRoute.get(p.route).push(p);
}

const KINDS = [
  ["cutOff",    "Text cut off the right edge",       (i) => `${i.sel}|${i.sample}`],
  ["overlaps",  "Text overlapping text",             (i) => `${i.a}~${i.b}`],
  ["clipped",   "Content clipped by its container",  (i) => `${i.sel}|${i.axis}`],
  ["offscreen", "Element past the viewport",         (i) => `${i.sel}`],
  ["tinyText",  "Text below the readable minimum",   (i) => `${i.sel}|${i.size}`],
  ["images",    "Image distorted or overwide",       (i) => `${i.sel}|${i.src}`],
  ["collapsed", "Container collapsed to zero height",(i) => `${i.sel}`],
];

const lines = [];
const summary = new Map();
const routeSections = [];

for (const [route, pages] of [...byRoute.entries()].sort()) {
  const blocks = [];

  // Page-level horizontal overflow.
  const overflowWidths = pages.filter((p) => p.overflow).map((p) => p.width);
  if (overflowWidths.length) {
    const w = pages.find((p) => p.overflow).overflow;
    blocks.push(`- **Page scrolls horizontally** — ${w.scrollWidth}px of content in a ${w.clientWidth}px viewport (${overflowWidths.join("/")}px)`);
    summary.set("overflow", (summary.get("overflow") || 0) + 1);
  }

  for (const [key, label, keyOf] of KINDS) {
    const all = pages.flatMap((p) => (p[key] || []).map((item) => ({ width: p.width, item })));
    if (!all.length) continue;
    const rows = dedupe(all, keyOf);
    summary.set(key, (summary.get(key) || 0) + rows.length);
    blocks.push(`- **${label}** — ${rows.length}`);
    for (const r of rows.slice(0, 8)) {
      const at = r.widths.length === data.widths.length ? "all widths" : `${r.widths.join("/")}px`;
      let detail;
      if (key === "cutOff") detail = `${r.past}px past the edge — "${r.sample}"`;
      else if (key === "overlaps") detail = `"${r.aText}" over "${r.bText}" (${r.overlap}%)`;
      else if (key === "clipped") detail = `${r.hidden}px hidden ${r.axis === "vertical" ? "below" : "to the right"} — "${r.sample}"`;
      else if (key === "tinyText") detail = `${r.size}px — "${r.sample}"`;
      else if (key === "images") detail = r.distorted ? `distorted: natural ${r.natural}, rendered ${r.rendered} (object-fit: ${r.fit})` : `${r.width}px wide`;
      else if (key === "offscreen") detail = `${r.over}px past the edge`;
      else detail = `"${r.sample}"`;
      blocks.push(`  - \`${(r.sel || r.a).slice(-70)}\` — ${detail} · ${at}`);
    }
    if (rows.length > 8) blocks.push(`  - …and ${rows.length - 8} more`);
  }

  // Gutters and rhythm, taken at the commonest phone width.
  const ref = pages.find((p) => p.width === "390") || pages[0];
  if (ref?.sections?.length) {
    const lefts = [...new Set(ref.sections.map((s) => s.textLeft).filter((v) => v !== null))];
    if (lefts.length > 1) {
      blocks.push(`- **Gutters disagree** — sections start at ${lefts.sort((a, b) => a - b).join(", ")}px from the left`);
      summary.set("gutters", (summary.get("gutters") || 0) + 1);
    }
    const gaps = ref.sections.map((s) => s.textGapAbove).filter((v) => v !== null && v >= 0);
    if (gaps.length > 1) {
      const min = Math.min(...gaps), max = Math.max(...gaps);
      if (max > min * 2.5 && max - min > 80) {
        blocks.push(`- **Section rhythm uneven** — gaps between sections range ${min}px to ${max}px (${gaps.join(", ")})`);
        summary.set("rhythm", (summary.get("rhythm") || 0) + 1);
      }
    }
    // Distinct sizes matter more than distinct styles. AGENTS.md asks that text
    // performing the same role share one size; varying weight within a size is
    // legitimate hierarchy, so counting size+weight+family together overstates
    // the problem.
    const sizes = [...new Set((ref.typeScale || []).map((t) => parseFloat(t.style)))]
      .sort((a, b) => a - b);
    if (sizes.length > 8) {
      const body = sizes.filter((n) => n >= 11 && n <= 20);
      blocks.push(
        `- **${sizes.length} distinct text sizes** on one page ` +
        `(${ref.typeScale.length} size/weight combinations) — ${sizes.join(", ")}px` +
        (body.length > 4 ? `; ${body.length} of them between 11 and 20px, where body copy lives` : ""));
      summary.set("typeScale", (summary.get("typeScale") || 0) + 1);
    }
  }

  if (blocks.length) routeSections.push({ route, blocks });
}

lines.push(`# Mobile layout sweep — ${data.date}`, "");
lines.push(
  `Chromium at ${data.widths.join(", ")}px (portrait, touch emulation on) over ` +
  `${data.routes.length} routes — ${data.routes.length * data.widths.length} page loads, each measured settled.`, "");
lines.push(
  "Findings are deduplicated across widths: one row is one defect, with the widths " +
  "it appears at. Checks are deliberately conservative — see the header comment in " +
  "`scripts/mobile-audit.mjs` for what is excluded and why.", "");

lines.push("## Summary", "");
if (!summary.size) {
  lines.push("No layout defects found.", "");
} else {
  lines.push("| Finding | Count |", "|---|---:|");
  const nice = { overflow: "Pages scrolling horizontally", cutOff: "Text cut off the right edge",
    overlaps: "Text overlapping text", clipped: "Content clipped by its container",
    offscreen: "Elements past the viewport", tinyText: "Text below the readable minimum",
    images: "Images distorted or overwide", collapsed: "Containers collapsed",
    gutters: "Routes with disagreeing gutters", rhythm: "Routes with uneven section rhythm",
    typeScale: "Routes with more than 10 text styles" };
  for (const [k, v] of [...summary.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${nice[k] || k} | ${v} |`);
  }
  lines.push("");
}

if (data.findings.length) {
  lines.push("## Routes that failed to load", "");
  for (const f of data.findings) lines.push(`- \`${f.route}\` at ${f.width}px — ${f.detail}`);
  lines.push("");
}

lines.push("## By route", "");
for (const { route, blocks } of routeSections) {
  lines.push(`### \`${route}\``, "", ...blocks, "");
}

const out = inPath.replace(/-layout\.json$/, "-layout.md");
await writeFile(out, lines.join("\n"));
console.log(`→ ${path.relative(ROOT, out)}`);
console.log(`  ${routeSections.length} of ${data.routes.length} routes have findings`);
