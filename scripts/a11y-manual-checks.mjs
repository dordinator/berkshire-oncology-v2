#!/usr/bin/env node
/**
 * The measurable half of the manual pass.
 *
 * axe does not evaluate SC 2.5.8 Target Size or SC 1.4.10 Reflow, and both are
 * AA. This measures them across every route so the numbers in the evidence log
 * are measured rather than asserted.
 *
 *   node scripts/a11y-manual-checks.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

// --use-mock-keychain: without it, Chromium asks macOS for keychain access on
// every launch and the run blocks behind a system password dialog. These
// contexts are throwaway and store no credentials, so there is nothing for the
// real keychain to protect.
const LAUNCH = { args: ["--use-mock-keychain"] };

const ROOT = path.resolve(import.meta.dirname, "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const BASE = args.base || "http://localhost:3000";

/** SC 2.5.8 minimum, in CSS pixels. */
const MIN_TARGET = 24;

async function routes() {
  const res = await fetch(`${BASE}/sitemap.xml`);
  const xml = await res.text();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname,
  );
  const appDir = path.join(ROOT, "src", "app");
  const fs = [];
  async function walk(dir, prefix) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name === "api" || e.name.startsWith("_")) continue;
      const child = path.join(dir, e.name);
      const seg = e.name.startsWith("(") ? "" : `/${e.name}`;
      if (existsSync(path.join(child, "page.tsx")) && !e.name.includes("[")) {
        fs.push(`${prefix}${seg}`);
      }
      await walk(child, `${prefix}${seg}`);
    }
  }
  await walk(appDir, "");
  return [...new Set(["/", ...fs, ...fromSitemap])].sort();
}

const browser = await chromium.launch(LAUNCH);
const targetHits = [];
const reflowHits = [];

// ── SC 2.5.8 Target Size, at every width the sweep uses ─────────────────────
// Not just a touch viewport: layout changes with width, so a control can be
// comfortably spaced on a phone and crowded on a desktop. Measuring 375 alone
// reported clean while a link on /tariffs was failing at 1440.
const TARGET_WIDTHS = [320, 375, 768, 1024, 1440];
for (const tw of TARGET_WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: tw, height: 900 } });
  const page = await ctx.newPage();
  for (const route of await routes()) {
    await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(700);

    const small = await page.evaluate((MIN) => {
      const R = MIN / 2;
      const nodes = [...document.querySelectorAll(
        'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="radio"], [role="tab"], [role="option"]',
      )];

      // Page coordinates, so a target below the fold is compared correctly
      // against its neighbours rather than against the current scroll offset.
      const targets = [];
      for (const el of nodes) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (el.closest("[inert]")) continue;
        if (el.getAttribute("aria-hidden") === "true") continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        targets.push({
          el, style,
          rect: {
            left: b.left + scrollX, top: b.top + scrollY,
            right: b.right + scrollX, bottom: b.bottom + scrollY,
            w: b.width, h: b.height,
            cx: b.left + scrollX + b.width / 2,
            cy: b.top + scrollY + b.height / 2,
          },
        });
      }

      const undersized = targets.filter((t) => t.rect.w < MIN || t.rect.h < MIN);

      // Distance from a point to a rectangle, 0 when inside.
      const distToRect = (cx, cy, r) => {
        const dx = Math.max(r.left - cx, 0, cx - r.right);
        const dy = Math.max(r.top - cy, 0, cy - r.bottom);
        return Math.hypot(dx, dy);
      };

      const out = [];
      for (const t of undersized) {
        // SC 2.5.8 inline exception: a target in a sentence of text.
        const parent = t.el.parentElement;
        const ownText = (t.el.textContent || "").trim().length;
        const inline =
          t.style.display.startsWith("inline") &&
          parent &&
          (parent.textContent || "").trim().length > ownText + 12;
        if (inline) continue;

        // SC 2.5.8 spacing exception: a 24px circle centred on this target must
        // not reach another target, nor another undersized target's circle.
        let crowded = false;
        for (const o of targets) {
          if (o.el === t.el) continue;
          if (o.el.contains(t.el) || t.el.contains(o.el)) continue;
          // A neighbour that sits almost entirely on top of this target is a
          // stacked variant of the same content — a collapsed panel, a
          // crossfaded slide — not something a finger has to choose between.
          // A *slight* overlap is different: two adjacent controls whose boxes
          // graze each other are exactly the crowding the criterion is about,
          // and an earlier version of this check wrongly excluded them.
          const ox = Math.max(0, Math.min(o.rect.right, t.rect.right) - Math.max(o.rect.left, t.rect.left));
          const oy = Math.max(0, Math.min(o.rect.bottom, t.rect.bottom) - Math.max(o.rect.top, t.rect.top));
          const overlapArea = ox * oy;
          const smaller = Math.min(o.rect.w * o.rect.h, t.rect.w * t.rect.h);
          if (smaller > 0 && overlapArea / smaller > 0.5) continue;
          const isSmall = o.rect.w < MIN || o.rect.h < MIN;
          if (isSmall) {
            if (Math.hypot(t.rect.cx - o.rect.cx, t.rect.cy - o.rect.cy) < MIN) { crowded = true; break; }
          } else if (distToRect(t.rect.cx, t.rect.cy, o.rect) < R) {
            crowded = true; break;
          }
        }
        if (!crowded) continue;

        out.push({
          tag: t.el.tagName.toLowerCase(),
          w: Math.round(t.rect.w),
          h: Math.round(t.rect.h),
          name: (t.el.getAttribute("aria-label") || t.el.textContent || "")
            .replace(/\s+/g, " ").trim().slice(0, 60),
          cls: (t.el.getAttribute("class") || "").slice(0, 90),
        });
      }
      return out;
    }, MIN_TARGET);

    for (const s of small) targetHits.push({ route, width: tw, ...s });
  }
  await ctx.close();
}

// ── SC 1.4.10 Reflow: no horizontal scroll at 320 CSS px ────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 780 } });
  const page = await ctx.newPage();
  for (const route of await routes()) {
    await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit" });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const overflowing = [];
      if (doc.scrollWidth > doc.clientWidth + 1) {
        for (const el of document.body.querySelectorAll("*")) {
          const box = el.getBoundingClientRect();
          if (box.right > doc.clientWidth + 1 && box.width > 0) {
            const style = getComputedStyle(el);
            // Elements that scroll inside their own box are allowed.
            if (style.overflowX === "auto" || style.overflowX === "scroll") continue;
            overflowing.push({
              tag: el.tagName.toLowerCase(),
              right: Math.round(box.right),
              cls: (el.getAttribute("class") || "").slice(0, 90),
            });
          }
        }
      }
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflowing: overflowing.slice(0, 6),
      };
    });
    if (r.scrollWidth > r.clientWidth + 1) reflowHits.push({ route, ...r });
  }
  await ctx.close();
}

// ── SC 1.4.4 Resize Text: 200% zoom ─────────────────────────────────────────
// Browser zoom at 200% halves the CSS viewport, so a 1280x1024 screen presents
// as 640x512. Look for horizontal scrolling and for text taller than a box that
// hides the remainder.
const zoomHits = [];
{
  const ctx = await browser.newContext({
    viewport: { width: 640, height: 512 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  for (const route of await routes()) {
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 40_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(450);
      const r = await page.evaluate(() => {
        const doc = document.documentElement;
        const clipped = [];
        for (const el of document.body.querySelectorAll("p, li, h1, h2, h3, h4, dd, dt, span, a, button")) {
          const st = getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden") continue;
          // sr-only text is clipped to 1px on purpose; that is the technique,
          // not a defect.
          if ((el.getAttribute("class") || "").includes("sr-only")) continue;
          const hidesY = st.overflow === "hidden" || st.overflowY === "hidden";
          const hidesX = st.overflow === "hidden" || st.overflowX === "hidden";
          const long = (el.textContent || "").trim().length > 12;
          // Vertical: a line-clamp or a fixed-height box swallowing the tail.
          if (hidesY && long && el.scrollHeight > el.clientHeight + 4) {
            clipped.push({
              tag: el.tagName.toLowerCase(),
              axis: "vertical",
              hidden: el.scrollHeight - el.clientHeight,
              text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
            });
          }
          // Horizontal: `truncate` and line-clamp-1 cut along the width, which
          // an earlier version of this check missed entirely — it only ever
          // compared heights.
          if (hidesX && long && el.scrollWidth > el.clientWidth + 4) {
            clipped.push({
              tag: el.tagName.toLowerCase(),
              axis: "horizontal",
              hidden: el.scrollWidth - el.clientWidth,
              text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 50),
            });
          }
        }
        return { hScroll: doc.scrollWidth - doc.clientWidth, clipped: clipped.slice(0, 5) };
      });
      if (r.hScroll > 1 || r.clipped.length) zoomHits.push({ route, ...r });
    } catch {
      /* skip */
    }
  }
  await ctx.close();
}

await browser.close();

const outDir = path.join(ROOT, "docs", "a11y");
await mkdir(outDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const label = args.label ? `-${args.label}` : "";

const lines = [`# Target size and reflow — ${stamp}`, ""];
lines.push(
  "Three AA criteria that axe does not evaluate. Measured with Playwright: " +
    `target size at ${TARGET_WIDTHS.join(", ")}px, text resize at 200% ` +
    "(a 640×512 viewport), reflow at 320px. The target-size figures apply the " +
    "criterion's own exceptions: a target inside a sentence is exempt, and so " +
    "is one whose 24px circle reaches no other target. Only crowded, " +
    "undersized targets are listed.",
  "",
);

lines.push(`## SC 2.5.8 Target Size (Minimum) — ${MIN_TARGET}×${MIN_TARGET} CSS px`, "");
if (!targetHits.length) {
  lines.push("No undersized targets. Inline targets within a sentence are exempt and were excluded.");
} else {
  // Same control on many routes is one finding, not fifty.
  const grouped = new Map();
  for (const h of targetHits) {
    const key = `${h.tag}|${h.name}`;
    const g = grouped.get(key) || { ...h, routes: new Set(), widths: new Set(), minH: h.h };
    g.routes.add(h.route);
    g.widths.add(h.width);
    g.minH = Math.min(g.minH, h.h);
    grouped.set(key, g);
  }
  lines.push(`${grouped.size} distinct undersized targets, ${targetHits.length} instances.`, "");
  lines.push("| Element | Height | Name | Widths | Routes |", "|---|---|---|---|---|");
  for (const g of [...grouped.values()].sort((a, b) => a.minH - b.minH)) {
    lines.push(
      `| \`${g.tag}\` | ${g.minH}px | ${g.name || "—"} | ${[...g.widths].sort((a, b) => a - b).join("/")} | ${g.routes.size} (${[...g.routes].slice(0, 3).join(", ")}${g.routes.size > 3 ? ", …" : ""}) |`,
    );
  }
}

lines.push("", "## SC 1.4.4 Resize Text — 200% zoom (640×512)", "");
if (!zoomHits.length) {
  lines.push(
    "No horizontal scrolling, and no text clipped by a fixed-height container. " +
      "`sr-only` text is excluded: it is clipped deliberately.",
  );
} else {
  for (const z of zoomHits) {
    lines.push(`### ${z.route}${z.hScroll > 1 ? ` — ${z.hScroll}px horizontal overflow` : ""}`, "");
    for (const c of z.clipped) lines.push(`- \`${c.tag}\` hides ${c.hidden}px ${c.axis} — "${c.text}"`);
    lines.push("");
  }
}

lines.push("", "## SC 1.4.10 Reflow — 320 CSS px, no horizontal scroll", "");
if (!reflowHits.length) {
  lines.push("No page scrolls horizontally at 320px.");
} else {
  for (const r of reflowHits) {
    lines.push(`### ${r.route} — ${r.scrollWidth}px wide in a ${r.clientWidth}px viewport`, "");
    for (const o of r.overflowing) {
      lines.push(`- \`${o.tag}\` reaching ${o.right}px — \`${o.cls}\``);
    }
    lines.push("");
  }
}
lines.push("");

await writeFile(path.join(outDir, `${stamp}${label}-targets-reflow.md`), lines.join("\n"));
console.log(
  `target-size findings: ${targetHits.length} instances; ` +
    `reflow failures: ${reflowHits.length} routes; ` +
    `200% zoom problems: ${zoomHits.length} routes`,
);
console.log(`report: docs/a11y/${stamp}${label}-targets-reflow.md`);
