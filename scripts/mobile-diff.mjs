#!/usr/bin/env node
/**
 * The desktop-frozen guard.
 *
 * The agreed constraint on the mobile pass is that desktop must render exactly
 * as it did before. That is easy to claim and easy to get wrong, because a
 * Tailwind class with no breakpoint prefix is the *desktop* value too wherever
 * no larger-breakpoint override exists. So it is measured, not asserted:
 * screenshot every route before, screenshot it again after, compare pixels.
 *
 * Both sides must come from `mobile-shots.mjs --frozen`, which pauses animation
 * and masks the four canvas graphics. They seed themselves randomly and would
 * otherwise differ on every run regardless of what changed.
 *
 *   node scripts/mobile-diff.mjs --before=<dir> --after=<dir>
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/mobile.mjs";

const args = parseArgs();
if (!args.before || !args.after) {
  console.error("usage: node scripts/mobile-diff.mjs --before=<dir> --after=<dir> [--out=<dir>]");
  process.exit(2);
}

/** Ignore imperceptible per-channel noise from antialiasing. */
const CHANNEL_TOLERANCE = 8;
/** Below this share of differing pixels, treat a route as unchanged. */
const PIXEL_RATIO_TOLERANCE = 0.0001;

const outDir = args.out || null;
if (outDir) await mkdir(outDir, { recursive: true });

async function raw(file) {
  const img = sharp(file).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, info };
}

let compared = 0, changed = 0, sizeMismatch = 0, missing = 0;
const report = [];

for (const width of (await readdir(args.before)).sort()) {
  const beforeDir = path.join(args.before, width);
  const afterDir = path.join(args.after, width);
  if (!existsSync(afterDir)) { console.log(`  ${width}: no matching "after" directory`); continue; }

  for (const name of (await readdir(beforeDir)).sort()) {
    if (!name.endsWith(".png")) continue;
    const bFile = path.join(beforeDir, name), aFile = path.join(afterDir, name);
    if (!existsSync(aFile)) { missing += 1; report.push({ width, name, kind: "missing after" }); continue; }

    const [b, a] = await Promise.all([raw(bFile), raw(aFile)]);
    compared += 1;

    // A height change is itself a desktop change — report it rather than
    // trying to align two differently-sized pages.
    if (b.info.width !== a.info.width || b.info.height !== a.info.height) {
      sizeMismatch += 1;
      report.push({ width, name, kind: "size",
        detail: `${b.info.width}x${b.info.height} -> ${a.info.width}x${a.info.height}` });
      continue;
    }

    let diffPixels = 0, firstY = -1, lastY = -1, minX = Infinity, maxX = -1;
    const { width: W, channels } = b.info;
    for (let i = 0, px = 0; i < b.data.length; i += channels, px += 1) {
      let differs = false;
      for (let c = 0; c < channels; c += 1) {
        if (Math.abs(b.data[i + c] - a.data[i + c]) > CHANNEL_TOLERANCE) { differs = true; break; }
      }
      if (!differs) continue;
      diffPixels += 1;
      const y = Math.floor(px / W), x = px % W;
      if (firstY < 0) firstY = y;
      lastY = y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }

    const ratio = diffPixels / (b.info.width * b.info.height);
    if (ratio > PIXEL_RATIO_TOLERANCE) {
      changed += 1;
      report.push({ width, name, kind: "pixels", diffPixels,
        ratio: +(ratio * 100).toFixed(4),
        region: `y ${firstY}-${lastY}, x ${minX}-${maxX}` });
    }
  }
  console.log(`  ${width}px compared`);
}

console.log(`\n${compared} screenshots compared.`);
if (!report.length) {
  console.log("Desktop is unchanged: every route is pixel-identical.");
  process.exit(0);
}
console.log(`${changed} changed, ${sizeMismatch} changed size, ${missing} missing.\n`);
for (const r of report) {
  if (r.kind === "pixels") {
    console.log(`  ${r.width}px ${r.name} — ${r.diffPixels} px (${r.ratio}%) at ${r.region}`);
  } else if (r.kind === "size") {
    console.log(`  ${r.width}px ${r.name} — size changed ${r.detail}`);
  } else {
    console.log(`  ${r.width}px ${r.name} — ${r.kind}`);
  }
}
process.exit(1);
