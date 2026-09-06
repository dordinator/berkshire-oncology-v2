#!/usr/bin/env node
/**
 * Accessibility sweep — axe-core over every reachable route, at five widths.
 *
 * This is the evidence behind the conformance claim in /accessibility, so it is
 * deliberately reproducible: it builds nothing, assumes a production server, and
 * writes a dated report that can be diffed against an earlier run.
 *
 *   npm run a11y            # build, start, sweep, write docs/a11y/<date>.md
 *   npm run a11y -- --base=http://localhost:3000   # sweep a server you started
 *
 * Two things this script has to get right, both learned the hard way:
 *
 * 1. Entrance animations must settle before axe measures. An earlier manual pass
 *    (commit 84597a1) produced ~27 false contrast failures, all of them the
 *    Reveal component's pre-settled `opacity: 0` being measured off-screen. So
 *    every page is scrolled end to end to trigger the IntersectionObservers,
 *    then returned to the top, and only then measured.
 *
 * 2. The sweep runs twice per width — once with the visitor's default motion
 *    settings and once with prefers-reduced-motion: reduce. Reduced motion is a
 *    supported configuration, not a fallback, so it has to conform too.
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import net from "node:net";

// --use-mock-keychain: without it, Chromium asks macOS for keychain access on
// every launch and the run blocks behind a system password dialog. These
// contexts are throwaway and store no credentials, so there is nothing for the
// real keychain to protect.
const LAUNCH = { args: ["--use-mock-keychain"] };

const ROOT = path.resolve(import.meta.dirname, "..");

// The conformance target. `best-practice` is deliberately excluded — it is not
// part of WCAG and mixing it in would overstate what the report proves.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const VIEWPORTS = [
  { name: "320", width: 320, height: 780 },   // SC 1.4.10 reflow floor
  { name: "375", width: 375, height: 812 },   // the commonest phone
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 }, // where /locations changes behaviour
  { name: "1440", width: 1440, height: 900 },
];

const MOTION = [
  { name: "default", reducedMotion: "no-preference" },
  { name: "reduced", reducedMotion: "reduce" },
];

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);

/** Static routes come from the filesystem; `[slug]` routes are filled in from
 *  the sitemap, which is already derived from navigation.ts. */
async function staticRoutes() {
  const appDir = path.join(ROOT, "src", "app");
  const found = [];
  async function walk(dir, prefix) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const name = entry.name;
      if (name === "api" || name.startsWith("_")) continue;
      const child = path.join(dir, name);
      // Route groups `(name)` do not contribute a path segment.
      const segment = name.startsWith("(") ? "" : `/${name}`;
      if (existsSync(path.join(child, "page.tsx"))) {
        if (!name.includes("[")) found.push(`${prefix}${segment}` || "/");
      }
      await walk(child, `${prefix}${segment}`);
    }
  }
  if (existsSync(path.join(appDir, "page.tsx"))) found.push("/");
  await walk(appDir, "");
  return found;
}

async function sitemapRoutes(base) {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .map((p) => (p.length > 1 ? p.replace(/\/$/, "") : p));
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitForServer(base, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(base, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`server at ${base} did not come up`);
}

/**
 * Bring the page to a settled state: every entrance animation played out, every
 * whileInView observer fired, scroll returned to the top. Without this the
 * report is dominated by false colour-contrast failures against elements that
 * are still at opacity 0.
 */
async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {});

  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.75);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = () =>
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );
    // Walk the page so IntersectionObservers fire for every revealed section.
    for (let y = 0; y < height(); y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(90);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(400);
  });

  // Let any in-flight Web Animations / transitions finish before measuring.
  await page
    .evaluate(async () => {
      const running = document
        .getAnimations()
        .filter((a) => a.playState === "running" && a.effect);
      await Promise.race([
        Promise.allSettled(
          running.map((a) => (a.effect?.getTiming().iterations === Infinity ? null : a.finished)),
        ),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    })
    .catch(() => {});

  await page.waitForTimeout(300);
}

async function main() {
  let serverProc = null;
  let base = args.base;

  if (!base) {
    const port = await freePort();
    base = `http://localhost:${port}`;
    console.log(`→ starting next start on ${port}`);
    serverProc = spawn("npx", ["next", "start", "-p", String(port)], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    });
    serverProc.stderr.on("data", (d) => process.stderr.write(`  [next] ${d}`));
    await waitForServer(base);
  }

  const routes = args.routes
    ? args.routes.split(",")
    : [...new Set([...(await staticRoutes()), ...(await sitemapRoutes(base))])].sort();

  console.log(`→ ${routes.length} routes × ${VIEWPORTS.length} widths × ${MOTION.length} motion settings`);

  const browser = await chromium.launch(LAUNCH);
  const results = [];
  let checked = 0;

  try {
    for (const motion of MOTION) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          reducedMotion: motion.reducedMotion,
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();

        for (const route of routes) {
          const url = `${base}${route === "/" ? "" : route}`;
          try {
            const response = await page.goto(url, {
              waitUntil: "commit",
              timeout: 45_000,
            });
            const status = response?.status() ?? 0;
            await settle(page);

            const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

            results.push({
              route,
              viewport: vp.name,
              motion: motion.name,
              status,
              violations: axe.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                helpUrl: v.helpUrl,
                tags: v.tags.filter((t) => t.startsWith("wcag")),
                nodes: v.nodes.map((n) => ({
                  target: n.target.join(" "),
                  html: n.html.slice(0, 220),
                  summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 400),
                })),
              })),
              incomplete: axe.incomplete.map((v) => ({
                id: v.id,
                help: v.help,
                count: v.nodes.length,
              })),
            });
          } catch (err) {
            results.push({
              route,
              viewport: vp.name,
              motion: motion.name,
              status: 0,
              error: String(err.message || err).slice(0, 300),
              violations: [],
              incomplete: [],
            });
          }
          checked += 1;
          process.stdout.write(
            `\r  ${checked}/${routes.length * VIEWPORTS.length * MOTION.length}  ${motion.name} ${vp.name}px ${route}`.padEnd(100),
          );
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    if (serverProc) serverProc.kill("SIGTERM");
  }
  process.stdout.write("\n");

  const outDir = path.join(ROOT, "docs", "a11y");
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const label = args.label ? `-${args.label}` : "";
  const jsonPath = path.join(outDir, `${stamp}${label}.json`);
  const mdPath = path.join(outDir, `${stamp}${label}.md`);

  await writeFile(
    jsonPath,
    JSON.stringify({ generated: new Date().toISOString(), base, tags: WCAG_TAGS, results }, null, 2),
  );
  await writeFile(mdPath, report(results, stamp, routes.length));

  const total = results.reduce((n, r) => n + r.violations.reduce((m, v) => m + v.nodes.length, 0), 0);
  const rules = new Set(results.flatMap((r) => r.violations.map((v) => v.id)));
  console.log(`\n${total} violating elements across ${rules.size} rules`);
  console.log(`report: ${path.relative(ROOT, mdPath)}`);
  process.exitCode = total > 0 ? 1 : 0;
}

function report(results, stamp, routeCount) {
  const byRule = new Map();
  for (const r of results) {
    for (const v of r.violations) {
      const entry = byRule.get(v.id) || { ...v, hits: [], elements: 0 };
      entry.elements += v.nodes.length;
      for (const n of v.nodes) {
        entry.hits.push({ route: r.route, viewport: r.viewport, motion: r.motion, ...n });
      }
      byRule.set(v.id, entry);
    }
  }
  const rules = [...byRule.values()].sort((a, b) => b.elements - a.elements);
  const errors = results.filter((r) => r.error);
  const badStatus = results.filter((r) => r.status && r.status >= 400);

  const lines = [];
  lines.push(`# Accessibility sweep — ${stamp}`);
  lines.push("");
  lines.push(
    `axe-core against \`${WCAG_TAGS.join("`, `")}\` over ${routeCount} routes, ` +
      `${VIEWPORTS.length} widths (${VIEWPORTS.map((v) => v.name).join(", ")}px) and ` +
      `${MOTION.length} motion settings — ${results.length} page loads, each measured in settled state.`,
  );
  lines.push("");
  const totalEls = rules.reduce((n, r) => n + r.elements, 0);
  lines.push(
    totalEls === 0
      ? "**No violations.**"
      : `**${totalEls} violating elements across ${rules.length} rules.**`,
  );
  lines.push("");

  if (rules.length) {
    lines.push("## Summary");
    lines.push("");
    lines.push("| Rule | Impact | Elements | Routes | Criterion |");
    lines.push("|---|---|---:|---:|---|");
    for (const r of rules) {
      const routes = new Set(r.hits.map((h) => h.route));
      const sc = r.tags.filter((t) => /^wcag\d{3}$/.test(t))
        .map((t) => t.replace(/^wcag/, "").split("").join("."))
        .join(", ");
      lines.push(`| \`${r.id}\` | ${r.impact ?? "—"} | ${r.elements} | ${routes.size} | ${sc || "—"} |`);
    }
    lines.push("");
    lines.push("## Detail");
    for (const r of rules) {
      lines.push("");
      lines.push(`### \`${r.id}\` — ${r.help}`);
      lines.push("");
      lines.push(`${r.helpUrl}`);
      lines.push("");
      // Collapse identical elements that recur across widths and motion settings.
      const grouped = new Map();
      for (const h of r.hits) {
        const key = `${h.route}|${h.target}`;
        const g = grouped.get(key) || { ...h, viewports: new Set(), motions: new Set() };
        g.viewports.add(h.viewport);
        g.motions.add(h.motion);
        grouped.set(key, g);
      }
      for (const g of grouped.values()) {
        lines.push(
          `- **${g.route}** \`${g.target}\` — ${[...g.viewports].join("/")}px, ${[...g.motions].join("/")} motion`,
        );
        if (g.summary) lines.push(`  - ${g.summary}`);
      }
    }
  }

  if (badStatus.length) {
    lines.push("");
    lines.push("## Non-200 responses");
    lines.push("");
    for (const r of [...new Set(badStatus.map((r) => `${r.route} → ${r.status}`))]) {
      lines.push(`- ${r}`);
    }
  }
  if (errors.length) {
    lines.push("");
    lines.push("## Load errors");
    lines.push("");
    for (const e of [...new Set(errors.map((r) => `${r.route} (${r.viewport}px, ${r.motion}) — ${r.error}`))]) {
      lines.push(`- ${e}`);
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "Automated testing detects roughly a third of WCAG issues. This report is one " +
      "input to the conformance claim, not the whole of it; the manual keyboard, " +
      "zoom, reflow and screen-reader passes are recorded separately in " +
      "`docs/accessibility-audit-2026-09.md`.",
  );
  lines.push("");
  return lines.join("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
