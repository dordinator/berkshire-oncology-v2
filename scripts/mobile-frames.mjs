#!/usr/bin/env node
/**
 * Capture each route the way a person meets it: viewport by viewport, scrolling.
 *
 * Why this exists alongside `mobile-shots.mjs`, which already takes full-page
 * screenshots: a full-page screenshot cannot represent a scroll-driven page.
 * Several routes here stack their panels in one box and crossfade them by
 * scroll progress, so at scroll-top every panel but the first is absent. A
 * full-page capture of `/locations` shows one screen of content and then seven
 * screens of white — which looks like a serious layout defect and is in fact
 * six hospital panels waiting for a scroll position.
 *
 * So: step down the page a viewport at a time, let the scroll-linked animation
 * settle on each value, and capture what is actually on screen. The frames are
 * then laid out as a filmstrip so a whole route can be judged at once.
 *
 *   node scripts/mobile-frames.mjs --routes=/locations,/specialities --out=<dir>
 *   node scripts/mobile-frames.mjs --width=390 --out=<dir>       # every route
 */
import {
  LAUNCH, chromium, parseArgs, startServer, routes, settle, waitForImages, ensureDir,
} from "./lib/mobile.mjs";
import { createRequire } from "node:module";
import path from "node:path";

const require_ = createRequire(path.join(import.meta.dirname, "..", "package.json"));
const sharp = require_("sharp");

const args = parseArgs();
const W = Number(args.width || 390);
const H = Number(args.height || 844);
const OUT = args.out || path.join(process.cwd(), "frames");
const MAX_FRAMES = Number(args.max || 14);
const SCALE = Number(args.scale || 0.34);

const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/\//g, "__"));

const server = await startServer(args.base);
const routeList = args.routes ? args.routes.split(",") : await routes(server.base);
await ensureDir(OUT);

const browser = await chromium.launch(LAUNCH);
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  isMobile: W < 700, hasTouch: W < 700, deviceScaleFactor: 1,
});
const page = await ctx.newPage();

const GAP = 6;
const tw = Math.round(W * SCALE);
const th = Math.round(H * SCALE);

for (const route of routeList) {
  try {
    await page.goto(`${server.base}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 45_000 });
    await settle(page);

    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const steps = Math.max(1, Math.min(MAX_FRAMES, Math.ceil(total / H)));
    const buffers = [];

    for (let i = 0; i < steps; i += 1) {
      const y = steps === 1 ? 0 : Math.round((i * (total - H)) / (steps - 1));
      // Lenis owns the scroller, so ask it directly where one is present;
      // window.scrollTo alone is swallowed and every frame comes back identical.
      await page.evaluate((top) => {
        if (window.lenis?.scrollTo) window.lenis.scrollTo(top, { immediate: true });
        else window.scrollTo({ top, behavior: "instant" });
      }, y);
      await page.waitForTimeout(700);
      await waitForImages(page);
      buffers.push(await page.screenshot({ animations: "disabled", caret: "hide" }));
    }

    const tiles = await Promise.all(buffers.map(async (buf, i) => ({
      input: await sharp(buf).resize({ width: tw, height: th, fit: "fill" }).toBuffer(),
      left: i * (tw + GAP), top: 0,
    })));
    await sharp({
      create: { width: buffers.length * (tw + GAP), height: th, channels: 3,
                background: { r: 200, g: 205, b: 212 } },
    }).composite(tiles).png().toFile(path.join(OUT, `${slug(route)}.png`));

    console.log(`  ${route} — ${total}px, ${buffers.length} frames`);
  } catch (err) {
    console.log(`  ${route} — FAILED: ${err.message.split("\n")[0]}`);
  }
}

await browser.close();
server.stop();
console.log(`\nfilmstrips -> ${OUT}`);
