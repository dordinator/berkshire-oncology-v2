#!/usr/bin/env node
/**
 * What assistive technology is actually handed, on every route.
 *
 * The closest thing to a screen-reader pass that can be automated: dump the
 * accessibility tree and look for the defects a listener would hit — controls
 * with no accessible name, names that are pure punctuation or a bare URL,
 * heading levels that skip, and pages with no title.
 *
 * It also checks SC 1.3.2 Meaningful Sequence by comparing DOM order against
 * painted position, which is where absolute positioning quietly diverges.
 *
 *   node scripts/a11y-tree-audit.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LAUNCH = { args: ["--use-mock-keychain"] };
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const BASE = args.base || "http://localhost:3000";

async function routes() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  const xml = await res.text();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const appDir = path.join(ROOT, "src", "app");
  const fs = [];
  async function walk(dir, prefix) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === "api" || e.name.startsWith("_")) continue;
      const child = path.join(dir, e.name);
      const seg = e.name.startsWith("(") ? "" : `/${e.name}`;
      if (existsSync(path.join(child, "page.tsx")) && !e.name.includes("[")) fs.push(`${prefix}${seg}`);
      await walk(child, `${prefix}${seg}`);
    }
  }
  await walk(appDir, "");
  return [...new Set(["/", ...fs, ...fromSitemap])].sort();
}

/** Roles that must carry a name to be usable by a listener. */
const NEEDS_NAME = new Set([
  "button", "link", "checkbox", "radio", "textbox", "combobox", "listbox",
  "menuitem", "tab", "switch", "slider", "searchbox", "img",
]);

const browser = await chromium.launch(LAUNCH);
const findings = { unnamed: [], poorNames: [], headings: [], sequence: [], titles: [] };
/** Routes whose tree was genuinely read. An empty findings list means nothing
 *  unless the check actually ran, which is how the first version of this script
 *  reported a clean pass for 55 routes it had failed to audit at all. */
const audited = [];
const failed = [];
const all = await routes();

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Accessibility.enable");

for (const route of all) {
  try {
    await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 45_000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(500);

    const title = await page.title();
    if (!title || title.trim().length < 4) findings.titles.push({ route, title });

    // page.accessibility was removed from Playwright, so the tree comes over
    // CDP. Chrome computes the same names and roles it hands a screen reader.
    const { nodes } = await cdp.send("Accessibility.getFullAXTree");
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error("accessibility tree came back empty");
    }
    let named = 0;
    for (const n of nodes) {
      if (n.ignored) continue;
      const role = n.role?.value;
      const name = (n.name?.value || "").trim();
      if (!NEEDS_NAME.has(role)) continue;
      named += 1;
      if (!name) {
        findings.unnamed.push({ route, role });
      } else if (/^[^\p{L}\p{N}]+$/u.test(name) || /^https?:\/\//i.test(name) || name.length < 2) {
        findings.poorNames.push({ route, role, name: name.slice(0, 40) });
      }
    }
    // A page with no named controls at all means the tree did not populate.
    if (named === 0) throw new Error("no nameable controls found in the tree");
    audited.push(route);

    const structural = await page.evaluate(() => {
      const vis = (el) => {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden") return false;
        // An ancestor with display:none leaves the element itself reporting
        // display:block while collapsing it to a 0x0 box at the origin. Reading
        // its own style alone counted responsive duplicates — the same heading
        // rendered for another breakpoint — as real, and their top of 0 then
        // looked like a reversed reading order.
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        let o = 1;
        for (let x = el; x && x !== document.documentElement; x = x.parentElement) {
          o *= parseFloat(getComputedStyle(x).opacity || "1");
        }
        return o > 0.05;
      };
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis);
      const levels = hs.map((h) => ({
        level: +h.tagName[1],
        text: (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
      }));
      const skips = [];
      let prev = 0;
      for (const h of levels) {
        if (prev && h.level > prev + 1) skips.push({ from: prev, to: h.level, text: h.text });
        prev = h.level;
      }
      const boxes = hs.map((h) => {
        const r = h.getBoundingClientRect();
        return { top: Math.round(r.top + scrollY), text: (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 34) };
      });
      const reversed = [];
      for (let i = 1; i < boxes.length; i++) {
        if (boxes[i].top < boxes[i - 1].top - 120) {
          reversed.push({ after: boxes[i - 1].text, before: boxes[i].text, gap: boxes[i - 1].top - boxes[i].top });
        }
      }
      return { h1: levels.filter((l) => l.level === 1).length, skips, reversed };
    });

    if (structural.h1 !== 1) findings.headings.push({ route, issue: `${structural.h1} h1 elements` });
    for (const s of structural.skips) findings.headings.push({ route, issue: `h${s.from} to h${s.to}`, text: s.text });
    for (const r of structural.reversed) findings.sequence.push({ route, ...r });
  } catch (err) {
    failed.push({ route, error: String(err.message).slice(0, 70) });
  }
}
await ctx.close();
await browser.close();

const L = [`# Accessibility tree audit — ${new Date().toISOString().slice(0, 10)}`, "",
  `What assistive technology is handed on each of ${all.length} routes: every control's name and role, heading structure, page titles and reading order.`, "",
  "This is the automatable part of a screen-reader pass. It cannot judge whether an announcement makes sense — only whether one exists and is coherent.", ""];

L.push(`**Routes successfully audited: ${audited.length} of ${all.length}.**`, "");
if (failed.length) {
  L.push("", "> **This report is incomplete.** The routes below could not be read, so",
    "> nothing below covers them and no criterion can be claimed on their basis.", "");
  for (const f of failed) L.push(`- \`${f.route}\` — ${f.error}`);
  L.push("");
}

const complete = failed.length === 0;
const sec = (title, hits, empty, render) => {
  L.push(`## ${title}`, "");
  if (hits.length) render();
  else if (complete) L.push(empty);
  else L.push("No findings — but see the coverage note above; this is not a pass.");
  L.push("");
};

sec("Controls with no accessible name", findings.unnamed,
  "Every button, link, image and form control exposes a name.",
  () => {
    const g = {};
    for (const f of findings.unnamed) g[`${f.route}|${f.role}`] = (g[`${f.route}|${f.role}`] || 0) + 1;
    L.push("| Route | Role | Count |", "|---|---|---|");
    for (const [k, n] of Object.entries(g)) { const [r, role] = k.split("|"); L.push(`| \`${r}\` | ${role} | ${n} |`); }
  });

sec("Names that tell a listener nothing", findings.poorNames,
  "No control is named only by punctuation, a bare URL, or a single character.",
  () => {
    L.push("| Route | Role | Name |", "|---|---|---|");
    for (const f of findings.poorNames.slice(0, 30)) L.push(`| \`${f.route}\` | ${f.role} | ${f.name} |`);
  });

sec("Heading structure", findings.headings,
  "Every route has exactly one h1 and no skipped levels.",
  () => {
    L.push("| Route | Issue | Heading |", "|---|---|---|");
    for (const f of findings.headings) L.push(`| \`${f.route}\` | ${f.issue} | ${f.text ?? "—"} |`);
  });

sec("SC 1.3.2 Meaningful Sequence", findings.sequence,
  "Headings are painted in the order they appear in the DOM, so reading order matches visual order.",
  () => {
    L.push("| Route | Reads after | But appears above | By |", "|---|---|---|---|");
    for (const f of findings.sequence) L.push(`| \`${f.route}\` | ${f.after} | ${f.before} | ${f.gap}px |`);
  });

sec("SC 2.4.2 Page Titled", findings.titles,
  "Every route has a meaningful title.",
  () => { for (const f of findings.titles) L.push(`- \`${f.route}\` — ${f.title || "(empty)"}`); });

await mkdir(path.join(ROOT, "docs", "a11y"), { recursive: true });
const file = path.join(ROOT, "docs", "a11y", `${new Date().toISOString().slice(0, 10)}-tree-audit.md`);
await writeFile(file, L.join("\n"));
const total = Object.values(findings).reduce((n, a) => n + a.length, 0);
console.log(`audited ${audited.length}/${all.length} routes · failed ${failed.length}`);
console.log(`unnamed ${findings.unnamed.length} · poor names ${findings.poorNames.length} · headings ${findings.headings.length} · sequence ${findings.sequence.length} · titles ${findings.titles.length}`);
console.log(`report: ${path.relative(ROOT, file)}`);
// A run that could not read every route is a failure, whatever it found.
process.exitCode = total || failed.length ? 1 : 0;
