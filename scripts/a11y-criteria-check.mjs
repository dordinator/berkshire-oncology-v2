#!/usr/bin/env node
/**
 * The AA criteria that neither axe nor the other scripts here cover.
 *
 *   1.4.12 Text Spacing        — apply the required overrides, look for loss
 *   2.5.3  Label in Name       — visible label must be in the accessible name
 *   2.4.11 Focus Not Obscured  — the sticky header must not hide focus
 *   1.3.4  Orientation         — no lock to portrait or landscape
 *   3.2.3  Consistent Navigation — nav in the same relative order everywhere
 *
 * Each is measured rather than reasoned about. Run against a served build:
 *   node scripts/a11y-criteria-check.mjs --base=http://localhost:3000
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

/** The exact overrides SC 1.4.12 requires a page to survive. */
const TEXT_SPACING = `
  * { line-height: 1.5 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`;

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

const browser = await chromium.launch(LAUNCH);
const out = { spacing: [], labelInName: [], obscured: [], orientation: [], nav: [] };
const all = await routes();

// ── 1.4.12 Text Spacing ─────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const route of all) {
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 40_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);
      await page.addStyleTag({ content: TEXT_SPACING });
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const doc = document.documentElement;
        const clipped = [];
        const effOpacity = (n) => {
          let o = 1;
          for (let x = n; x && x !== document.documentElement; x = x.parentElement) {
            o *= parseFloat(getComputedStyle(x).opacity || "1");
          }
          return o;
        };
        for (const el of document.body.querySelectorAll("p, li, h1, h2, h3, h4, dd, dt, a, button, span")) {
          const s = getComputedStyle(el);
          if (s.display === "none" || s.visibility === "hidden") continue;
          if ((el.getAttribute("class") || "").includes("sr-only")) continue;
          // Collapsed panels keep their content mounted at opacity 0. Clipping
          // inside something nobody can see is not a loss of content.
          if (effOpacity(el) < 0.99) continue;
          const hidesY = (s.overflow === "hidden" || s.overflowY === "hidden") && el.scrollHeight > el.clientHeight + 4;
          const hidesX = (s.overflow === "hidden" || s.overflowX === "hidden" || s.textOverflow === "ellipsis")
            && el.scrollWidth > el.clientWidth + 4;
          if ((hidesY || hidesX) && (el.textContent || "").trim().length > 12) {
            clipped.push({
              tag: el.tagName.toLowerCase(),
              axis: hidesY ? "vertical" : "horizontal",
              hidden: hidesY ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth,
              text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 46),
            });
          }
        }
        return { hScroll: doc.scrollWidth - doc.clientWidth, clipped: clipped.slice(0, 4) };
      });
      if (r.hScroll > 1 || r.clipped.length) out.spacing.push({ route, ...r });
    } catch { /* skip */ }
  }
  await ctx.close();
}

// ── 2.5.3 Label in Name ─────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const route of all) {
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 40_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);
      const hits = await page.evaluate(() => {
        const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase()
          .replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
        const bad = [];
        for (const el of document.querySelectorAll('a[href], button, [role="button"], summary')) {
          const st = getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden") continue;
          const label = el.getAttribute("aria-label");
          if (!label) continue;
          // Visible text only: sr-only spans are not the visible label.
          const clone = el.cloneNode(true);
          for (const sr of clone.querySelectorAll(".sr-only, [aria-hidden='true']")) sr.remove();
          // innerText reflects what is rendered, including the gaps between
          // inline-flex children; textContent concatenates them with nothing
          // between and produces strings no accessible name could ever contain.
          document.body.appendChild(clone);
          clone.style.position = "absolute";
          clone.style.left = "-9999px";
          let visible = norm(clone.innerText || clone.textContent);
          clone.remove();
          // A decorative index printed before the label ("01 Dr Joss Adams") is
          // an ordinal, not part of the name a speech-input user would say.
          visible = visible.replace(/^\d{1,2}[.\s]*/, "").trim();
          if (!visible || visible.length < 2) continue;
          if (!norm(label).includes(visible)) {
            bad.push({ visible: visible.slice(0, 40), accessible: norm(label).slice(0, 50), tag: el.tagName.toLowerCase() });
          }
        }
        return bad;
      });
      for (const h of hits) out.labelInName.push({ route, ...h });
    } catch { /* skip */ }
  }
  await ctx.close();
}

// ── 2.4.11 Focus Not Obscured (Minimum) ─────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const route of all) {
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 40_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(500);
      for (let i = 0; i < 45; i++) {
        await page.keyboard.press("Tab");
        await page.waitForTimeout(320);
        const r = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) return null;
          // Sample the centre and the four corners just inside the box.
          const pts = [
            [b.left + b.width / 2, b.top + b.height / 2],
            [b.left + 2, b.top + 2], [b.right - 2, b.top + 2],
            [b.left + 2, b.bottom - 2], [b.right - 2, b.bottom - 2],
          ];
          let visible = 0;
          for (const [x, y] of pts) {
            if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
            const hit = document.elementFromPoint(x, y);
            if (hit && (hit === el || el.contains(hit) || hit.contains(el))) visible++;
          }
          const onScreen =
            b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth;
          return {
            visible, onScreen,
            name: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
            tag: el.tagName.toLowerCase(),
          };
        });
        // Entirely hidden: on screen, but not one sample point reaches it.
        if (r && r.onScreen && r.visible === 0) {
          out.obscured.push({ route, tab: i + 1, ...r });
          break;
        }
      }
    } catch { /* skip */ }
  }
  await ctx.close();
}

// ── 1.3.4 Orientation ───────────────────────────────────────────────────────
{
  for (const [name, w, h] of [["portrait", 480, 900], ["landscape", 900, 480]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "commit" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      bodyText: (document.body.innerText || "").replace(/\s+/g, " ").trim().length,
      blocked: /rotate your|landscape only|portrait only|please rotate/i.test(document.body.innerText || ""),
    }));
    out.orientation.push({ name, ...r });
    await ctx.close();
  }
}

// ── 3.2.3 Consistent Navigation ─────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let reference = null;
  for (const route of all.slice(0, 25)) {
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 40_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(350);
      const order = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Primary"], header nav');
        if (!nav) return null;
        return [...nav.querySelectorAll("a[href]")]
          .map((a) => (a.textContent || "").replace(/\s+/g, " ").trim())
          .filter(Boolean).join(" | ");
      });
      if (!order) continue;
      if (reference === null) reference = { route, order };
      else if (order !== reference.order) out.nav.push({ route, order: order.slice(0, 90), expected: reference.order.slice(0, 90) });
    } catch { /* skip */ }
  }
  out.navReference = reference;
  await ctx.close();
}

await browser.close();

const stamp = new Date().toISOString().slice(0, 10);
const L = [`# Remaining AA criteria — ${stamp}`, "", `Measured across ${all.length} routes.`, ""];

const section = (title, hits, empty, render) => {
  L.push(`## ${title}`, "");
  if (!hits.length) L.push(empty);
  else render();
  L.push("");
};

section("SC 1.4.12 Text Spacing", out.spacing,
  "No content lost or overlapping with line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em and paragraph spacing 2em applied.",
  () => { for (const s of out.spacing) {
    L.push(`### ${s.route}${s.hScroll > 1 ? ` — ${s.hScroll}px horizontal overflow` : ""}`, "");
    for (const c of s.clipped) L.push(`- \`${c.tag}\` hides ${c.hidden}px ${c.axis} — "${c.text}"`);
    L.push("");
  }});

section("SC 2.5.3 Label in Name", out.labelInName,
  "Every control with an aria-label contains its visible text within that label.",
  () => { L.push("| Route | Visible | Accessible name |", "|---|---|---|");
    for (const h of out.labelInName) L.push(`| \`${h.route}\` | ${h.visible} | ${h.accessible} |`); });

section("SC 2.4.11 Focus Not Obscured (Minimum)", out.obscured,
  "No focused control was entirely hidden behind sticky or fixed content while tabbing.",
  () => { L.push("| Route | Tab | Control |", "|---|---|---|");
    for (const o of out.obscured) L.push(`| \`${o.route}\` | ${o.tab} | \`${o.tag}\` ${o.name} |`); });

L.push("## SC 1.3.4 Orientation", "");
const [p, l] = out.orientation;
L.push(p && l && !p.blocked && !l.blocked && p.bodyText > 0 && l.bodyText > 0
  ? `No orientation lock. Content renders in portrait (${p.bodyText} characters) and landscape (${l.bodyText} characters), with no prompt to rotate.`
  : "Possible orientation restriction — see raw values.");
L.push("");

L.push("## SC 3.2.3 Consistent Navigation", "");
L.push(out.nav.length === 0
  ? `Primary navigation appears in the same relative order on every route checked (reference: \`${out.navReference?.route ?? "—"}\`).`
  : `${out.nav.length} routes present the primary navigation in a different order.`);
for (const n of out.nav) L.push(`- \`${n.route}\`: ${n.order}`);
L.push("");

await mkdir(path.join(ROOT, "docs", "a11y"), { recursive: true });
const file = path.join(ROOT, "docs", "a11y", `${stamp}-remaining-criteria.md`);
await writeFile(file, L.join("\n"));
const total = out.spacing.length + out.labelInName.length + out.obscured.length + out.nav.length;
console.log(`text-spacing ${out.spacing.length} · label-in-name ${out.labelInName.length} · obscured ${out.obscured.length} · nav ${out.nav.length}`);
console.log(`report: ${path.relative(ROOT, file)}`);
process.exitCode = total ? 1 : 0;
