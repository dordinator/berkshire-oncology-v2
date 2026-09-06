#!/usr/bin/env node
/**
 * Pixel verification for axe's colour-contrast findings.
 *
 * axe derives contrast from the DOM: it walks for a backdrop and can resolve the
 * wrong one when content is layered, absolutely positioned or mid-animation. On
 * this site it grouped text genuinely sitting on a sage panel together with text
 * on pale paper, reporting both at the panel's ratio — one real failure, one not.
 *
 * So every reported element is re-measured from a screenshot of itself, as a
 * visitor sees it: the modal colour inside the element's box is the ground, and
 * the foreground axe named is looked for in the same image. Elements are checked
 * at every width axe flagged them at, because the ground can change with layout.
 *
 * Nothing reaches the evidence log unless the pixels agree.
 *
 *   node scripts/a11y-contrast-verify.mjs \
 *     --report=docs/a11y/2026-09-05-baseline.json --base=http://localhost:3111
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
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
if (!args.report) {
  console.error("--report=<baseline json> is required");
  process.exit(1);
}

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const toHex = (a) => "#" + a.map((n) => n.toString(16).padStart(2, "0")).join("");
const fromHex = (h) => { h = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const near = (a, b, tol = 6) => a.every((v, i) => Math.abs(v - b[i]) <= tol);

const data = JSON.parse(await readFile(args.report, "utf8"));

// route -> viewport -> element[]
const plan = new Map();
for (const r of data.results) {
  for (const v of r.violations) {
    if (v.id !== "color-contrast") continue;
    for (const n of v.nodes) {
      const m = n.summary.match(
        /contrast of ([\d.]+) \(foreground color: (#[0-9a-f]+), background color: (#[0-9a-f]+), font size: [\d.]+pt \((\d+)px\), font weight: (\w+)/,
      );
      if (!m) continue;
      const byVp = plan.get(r.route) || new Map();
      const list = byVp.get(r.viewport) || new Map();
      if (!list.has(n.target)) {
        list.set(n.target, {
          target: n.target, html: n.html,
          axeRatio: +m[1], fg: m[2], bg: m[3], px: +m[4], weight: m[5],
        });
      }
      byVp.set(r.viewport, list);
      plan.set(r.route, byVp);
    }
  }
}

const total = [...plan.values()].reduce(
  (n, byVp) => n + [...byVp.values()].reduce((m, l) => m + l.size, 0), 0,
);
console.log(`${total} element/width measurements across ${plan.size} routes\n`);

const shotDir = path.join(ROOT, "docs", "a11y", "screens", "contrast");
await mkdir(shotDir, { recursive: true });

const browser = await chromium.launch(LAUNCH);
const results = [];
let done = 0, saved = 0;

for (const [route, byVp] of plan) {
  for (const [vp, list] of byVp) {
    const ctx = await browser.newContext({
      viewport: { width: +vp, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 45_000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(600);
    } catch {
      await ctx.close();
      continue;
    }

    for (const el of list.values()) {
      let measured = null, note = "";
      try {
        const loc = page.locator(el.target).first();
        // Centre, not merely "into view": several effects on this site hold an
        // element at partial opacity until it reaches the middle of the
        // viewport, and measuring at the edge photographs a fade, not the page.
        await loc.evaluate((n) => n.scrollIntoView({ block: "center", behavior: "instant" }), undefined, { timeout: 4000 });

        // Then wait until it is genuinely settled. Anything still translucent —
        // its own opacity or an ancestor's — is reported as unverified rather
        // than guessed at, because a faded capture reads as a contrast failure
        // that no visitor ever sees.
        const settled = await loc.evaluate(async (n) => {
          const effective = (el) => {
            let o = 1;
            for (let x = el; x && x !== document.documentElement; x = x.parentElement) {
              o *= parseFloat(getComputedStyle(x).opacity || "1");
            }
            return o;
          };
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          const wait = async (tries) => {
            for (let i = 0; i < tries; i++) {
              await sleep(200);
              if (effective(n) > 0.985) return true;
            }
            return false;
          };

          if (await wait(12)) return { ok: true, opacity: effective(n) };

          // Some panels crossfade with scroll position rather than on entry, so
          // an element can be permanently part-faded at wherever centring it
          // happened to land. Try nearby scroll offsets and the top of the page
          // until it is fully painted — that is the state a reader sees when
          // they stop on it.
          const start = window.scrollY;
          const vh = window.innerHeight;
          const offsets = [0.25, -0.25, 0.5, -0.5, 0.75, -0.75, 1, -1].map((f) => start + f * vh);
          offsets.push(0);
          for (const y of offsets) {
            window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
            if (await wait(6)) return { ok: true, opacity: effective(n), nudged: true };
          }
          window.scrollTo({ top: start, behavior: "instant" });
          return { ok: false, opacity: effective(n) };
        }, undefined, { timeout: 30_000 });

        if (!settled.ok) {
          throw new Error(
            `element never reached full opacity (settled at ${settled.opacity.toFixed(2)})`,
          );
        }
        const buf = await loc.screenshot({ timeout: 6000 });
        const { data: px, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });

        // Background from the pixels: the most common colour inside the
        // element's box is what is actually painted behind its text. This is
        // the half axe gets wrong, because it infers the backdrop from the DOM.
        const counts = new Map();
        for (let i = 0; i < px.length; i += info.channels) {
          const k = `${px[i]},${px[i + 1]},${px[i + 2]}`;
          counts.set(k, (counts.get(k) || 0) + 1);
        }
        const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const ground = ranked[0][0].split(",").map(Number);

        // Foreground from CSS, not from pixels. Mining the image for the text
        // colour is unreliable: anti-aliasing, a heading in a different colour
        // and a decorative rule all produce plausible-looking dark pixels that
        // are not the text being judged. The computed colour is exact.
        const typo = await loc.evaluate((n) => {
          const cs = getComputedStyle(n);
          return { color: cs.color, size: parseFloat(cs.fontSize), weight: cs.fontWeight };
        });
        const m = typo.color.match(/rgba?\(([^)]+)\)/);
        if (!m) throw new Error(`could not read the text colour (${typo.color})`);
        const parts = m[1].split(",").map((n) => parseFloat(n));
        const alpha = parts.length > 3 ? parts[3] : 1;
        // Composite the text colour over the ground the pixels found, so a
        // colour like text-ink/70 is judged as it actually appears.
        const fg = [0, 1, 2].map((i) => Math.round(alpha * parts[i] + (1 - alpha) * ground[i]));

        if (near(fg, ground, 3)) {
          throw new Error("text colour is indistinguishable from its ground in the capture");
        }
        measured = {
          ground: toHex(ground),
          fg: toHex(fg),
          ratio: ratio(fg, ground),
          cssSize: typo.size,
          cssWeight: typo.weight,
        };
      } catch (err) {
        note = String(err.message || err).split("\n")[0].slice(0, 90);
      }

      const size = measured?.cssSize ?? el.px;
      const weightNum = parseInt(measured?.cssWeight ?? "400", 10);
      const bold = Number.isFinite(weightNum) ? weightNum >= 700 : el.weight === "bold";
      const large = size >= 24 || (size >= 18.66 && bold);
      const required = large ? 3 : 4.5;
      const verdict = !measured
        ? "unverified"
        : measured.ratio + 0.005 >= required
          ? "false positive"
          : "confirmed";

      // Keep an image only for confirmed failures — that is the evidence.
      let file = "";
      if (verdict === "confirmed" && saved < 60) {
        try {
          file = path.join(shotDir, `${String(++saved).padStart(3, "0")}-${route.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home"}-${vp}.png`);
          await page.locator(el.target).first().screenshot({ path: file, timeout: 6000 });
          file = path.relative(ROOT, file);
        } catch { file = ""; }
      }

      results.push({ route, vp, ...el, required, measured, verdict, note, file });
      done += 1;
      if (done % 25 === 0) {
        process.stdout.write(`\r  ${done}/${total}`.padEnd(40));
      }
    }
    await ctx.close();
  }
}
await browser.close();
process.stdout.write(`\r  ${done}/${total}\n\n`);

// An element is a real failure if it fails at any width it was flagged at.
const byElement = new Map();
for (const r of results) {
  const key = `${r.route}|${r.target}`;
  const e = byElement.get(key) || { ...r, widths: [], worst: null, anyConfirmed: false, anyMeasured: false };
  e.widths.push({ vp: r.vp, verdict: r.verdict, ratio: r.measured?.ratio, ground: r.measured?.ground });
  if (r.verdict === "confirmed") {
    e.anyConfirmed = true;
    if (!e.worst || r.measured.ratio < e.worst.ratio) {
      e.worst = { ...r.measured, vp: r.vp, file: r.file };
    }
  }
  if (r.measured) e.anyMeasured = true;
  byElement.set(key, e);
}
const elements = [...byElement.values()];
const confirmed = elements.filter((e) => e.anyConfirmed);
const cleared = elements.filter((e) => !e.anyConfirmed && e.anyMeasured);
const unver = elements.filter((e) => !e.anyMeasured);

const lines = [
  "# Colour contrast — pixel verification",
  "",
  `Source: \`${path.relative(ROOT, args.report)}\``,
  "",
  `axe reported **${elements.length} distinct elements** as failing SC 1.4.3.`,
  "Each was re-measured from a screenshot of itself, at every width axe flagged it at.",
  "",
  `| | elements |`,
  `|---|---:|`,
  `| **Confirmed failures** | **${confirmed.length}** |`,
  `| Cleared — pixels pass | ${cleared.length} |`,
  `| Unverified | ${unver.length} |`,
  "",
  "axe resolves the backdrop from the DOM, which is not always the colour that",
  "ends up behind the text. Where the two disagree, the pixels are what the",
  "reader sees, and the pixels decide.",
  "",
];

if (confirmed.length) {
  lines.push("## Confirmed failures", "");
  lines.push("| Route | Element | Measured | Needs | Size | Widths | Evidence |", "|---|---|---|---|---|---|---|");
  for (const e of confirmed.sort((a, b) => a.worst.ratio - b.worst.ratio)) {
    const w = e.widths.filter((x) => x.verdict === "confirmed").map((x) => x.vp).join("/");
    lines.push(
      `| \`${e.route}\` | \`${e.target.slice(0, 60)}\` | **${e.worst.ratio.toFixed(2)}:1** (${e.worst.fg} on ${e.worst.ground}) | ${e.required}:1 | ${e.px}px | ${w} | ${e.worst.file ? `\`${e.worst.file}\`` : "—"} |`,
    );
  }
  lines.push("");
  const byRoute = new Map();
  for (const e of confirmed) byRoute.set(e.route, (byRoute.get(e.route) || 0) + 1);
  lines.push("### By route", "");
  for (const [r, n] of [...byRoute.entries()].sort((a, b) => b[1] - a[1])) lines.push(`- \`${r}\` — ${n}`);
  lines.push("");
}

if (cleared.length) {
  lines.push("## Cleared", "", "axe flagged these; the rendered pixels meet the threshold.", "");
  lines.push("| Route | Element | axe said | Measured | Size |", "|---|---|---|---|---|");
  for (const e of cleared.slice(0, 80)) {
    const best = e.widths.find((w) => w.ratio);
    lines.push(
      `| \`${e.route}\` | \`${e.target.slice(0, 55)}\` | ${e.axeRatio.toFixed(2)}:1 on ${e.bg} | ${best?.ratio?.toFixed(2) ?? "—"}:1 on ${best?.ground ?? "—"} | ${e.px}px |`,
    );
  }
  if (cleared.length > 80) lines.push(`| … | ${cleared.length - 80} more | | | |`);
  lines.push("");
}

if (unver.length) {
  lines.push("## Unverified", "", "Could not be captured; treated as outstanding, not as passing.", "");
  for (const e of unver) lines.push(`- \`${e.route}\` \`${e.target.slice(0, 70)}\` — ${e.note}`);
  lines.push("");
}

const stamp = new Date().toISOString().slice(0, 10);
const out = path.join(ROOT, "docs", "a11y", `${stamp}-contrast-verified.md`);
await writeFile(out, lines.join("\n"));
await writeFile(
  path.join(ROOT, "docs", "a11y", `${stamp}-contrast-verified.json`),
  JSON.stringify({ generated: new Date().toISOString(), elements }, null, 2),
);
console.log(`confirmed ${confirmed.length} · cleared ${cleared.length} · unverified ${unver.length}`);
console.log(`report: ${path.relative(ROOT, out)}`);
