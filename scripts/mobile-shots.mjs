#!/usr/bin/env node
/**
 * Full-page screenshots of every route, at a chosen set of widths.
 *
 * Two jobs, one script:
 *
 * 1. The mobile review surface — what the pages actually look like on a phone,
 *    which no automated check can judge for me.
 * 2. The desktop-frozen guard. The agreed constraint on this work is that
 *    desktop must render identically when it is finished, so `--frozen` shots
 *    are taken before any change and diffed against the same shots after.
 *    `--frozen` pauses animation and masks the four canvas graphics, which
 *    seed themselves randomly and would otherwise dominate every diff.
 *
 *   node scripts/mobile-shots.mjs --widths=desktop --frozen --out=<dir>
 *   node scripts/mobile-shots.mjs --widths=390 --out=<dir>
 */
import {
  LAUNCH, chromium, parseArgs, startServer, routes, settle,
  freezeMotion, unstableRegions, ensureDir, PHONE_WIDTHS, DESKTOP_WIDTHS,
} from "./lib/mobile.mjs";
import path from "node:path";

const args = parseArgs();
const OUT = args.out || path.join(process.cwd(), "shots");
const FROZEN = args.frozen === "true";

function resolveWidths(spec = "phone") {
  if (spec === "phone") return PHONE_WIDTHS;
  if (spec === "desktop") return DESKTOP_WIDTHS;
  if (spec === "all") return [...PHONE_WIDTHS, ...DESKTOP_WIDTHS];
  const known = [...PHONE_WIDTHS, ...DESKTOP_WIDTHS];
  return spec.split(",").map((w) => {
    const hit = known.find((k) => k.name === w.trim());
    return hit || { name: w.trim(), width: Number(w), height: 900 };
  });
}

/** "/" -> "home"; "/consultants/a-b" -> "consultants__a-b" */
export function slug(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "__");
}

const widths = resolveWidths(args.widths);
const server = await startServer(args.base);
const routeList = args.routes ? args.routes.split(",") : await routes(server.base);

console.log(
  `→ ${routeList.length} routes × ${widths.length} widths` +
    (FROZEN ? " (frozen: animation paused, canvases masked)" : ""),
);

const browser = await chromium.launch(LAUNCH);
const failures = [];
let taken = 0;

try {
  for (const vp of widths) {
    const dir = path.join(OUT, vp.name);
    await ensureDir(dir);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      // Frozen shots use reduced motion too: it removes a second source of
      // variation, and it is a supported configuration in its own right.
      reducedMotion: FROZEN ? "reduce" : "no-preference",
    });
    const page = await context.newPage();

    for (const route of routeList) {
      const url = `${server.base}${route === "/" ? "" : route}`;
      try {
        const res = await page.goto(url, { waitUntil: "commit", timeout: 45_000 });
        if ((res?.status() ?? 0) >= 400) {
          failures.push({ route, width: vp.name, reason: `HTTP ${res.status()}` });
          continue;
        }
        await settle(page);
        if (FROZEN) await freezeMotion(page);
        await page.screenshot({
          path: path.join(dir, `${slug(route)}.png`),
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          mask: FROZEN ? unstableRegions(page) : [],
        });
        taken += 1;
      } catch (err) {
        failures.push({ route, width: vp.name, reason: err.message.split("\n")[0] });
      }
    }
    await context.close();
    console.log(`  ${vp.name}px done`);
  }
} finally {
  await browser.close();
  server.stop();
}

console.log(`\n${taken} screenshots → ${OUT}`);
if (failures.length) {
  console.log(`\n${failures.length} failed:`);
  for (const f of failures) console.log(`  ${f.width}px ${f.route} — ${f.reason}`);
}
