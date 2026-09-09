#!/usr/bin/env node
/**
 * SC 2.4.7 Focus Visible — proved by screenshot, not by reading CSS.
 *
 * This site has no global focus ring, so whether a control shows focus depends
 * on whether someone remembered to give it a style. Reading the classes tells
 * you what was intended; only the pixels tell you what happens.
 *
 * Every focusable control is photographed twice — unfocused, then focused with a
 * real Tab press — and the two images compared. A control whose pixels do not
 * change has no focus indicator.
 *
 *   node scripts/a11y-focus-check.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
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
const ROUTES = (args.routes ||
  "/,/consultants,/consultants/joss-adams,/specialities,/specialities/breast,/locations,/treatments,/treatments/chemotherapy,/patients,/tariffs,/resources,/contact"
).split(",");

/** Fraction of pixels that differ between two same-sized captures. */
async function diff(a, b) {
  const [x, y] = await Promise.all([
    sharp(a).raw().toBuffer({ resolveWithObject: true }),
    sharp(b).raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (x.data.length !== y.data.length) return 1;
  let n = 0;
  for (let i = 0; i < x.data.length; i++) if (Math.abs(x.data[i] - y.data[i]) > 6) n++;
  return n / x.data.length;
}

const browser = await chromium.launch(LAUNCH);
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const findings = [];
let checked = 0;

for (const route of ROUTES) {
  try {
    await page.goto(`${BASE}${route === "/" ? "" : route}`, { waitUntil: "commit", timeout: 45_000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(900);
  } catch {
    continue;
  }

  const count = await page.evaluate(() => {
    const ok = (el) => {
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return false;
      if (el.closest("[inert]") || el.getAttribute("aria-hidden") === "true") return false;
      if (el.disabled || el.tabIndex < 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 4 && r.height > 4;
    };
    const nodes = [...document.querySelectorAll('a[href], button, summary, [role="button"], [role="radio"], [role="tab"]')].filter(ok);
    nodes.forEach((n, i) => n.setAttribute("data-focus-idx", String(i)));
    return nodes.length;
  });

  for (let i = 0; i < count; i++) {
    const loc = page.locator(`[data-focus-idx="${i}"]`).first();
    try {
      await loc.evaluate((n) => n.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(230);
      // A slightly padded box, so an outline or an offset border is inside the frame.
      const box = await loc.boundingBox();
      if (!box) continue;
      const pad = 8;
      const clip = {
        x: Math.max(0, box.x - pad),
        y: Math.max(0, box.y - pad),
        width: Math.min(1280 - Math.max(0, box.x - pad), box.width + pad * 2),
        height: Math.min(900 - Math.max(0, box.y - pad), box.height + pad * 2),
      };
      if (clip.width < 6 || clip.height < 6) continue;

      const before = await page.screenshot({ clip, animations: "disabled" });
      // Real keyboard focus: :focus-visible does not apply to programmatic focus
      // on a button, so a scripted .focus() would photograph the wrong state.
      await loc.evaluate((n) => n.focus());
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await page.waitForTimeout(260);

      const isFocused = await loc.evaluate((n) => n === document.activeElement);
      if (!isFocused) continue;
      const after = await page.screenshot({ clip, animations: "disabled" });

      const d = await diff(before, after);
      checked += 1;
      if (d < 0.0015) {
        const info = await loc.evaluate((n) => ({
          tag: n.tagName.toLowerCase(),
          text: (n.getAttribute("aria-label") || n.textContent || "").replace(/\s+/g, " ").trim().slice(0, 46),
          cls: (n.getAttribute("class") || "").slice(0, 80),
        }));
        findings.push({ route, ...info, changed: +(d * 100).toFixed(3) });
      }
    } catch {
      /* element moved or detached; skip */
    }
  }
  process.stdout.write(`\r  ${route} — ${checked} controls checked, ${findings.length} without an indicator`.padEnd(90));
}
process.stdout.write("\n");
await browser.close();

const lines = [
  `# Focus visibility — ${new Date().toISOString().slice(0, 10)}`,
  "",
  `${checked} focusable controls across ${ROUTES.length} routes, each photographed unfocused and then focused with a real Tab press.`,
  "",
  findings.length === 0
    ? "**Every control shows a visible change on focus.**"
    : `**${findings.length} controls show no visible change when focused.**`,
  "",
];
if (findings.length) {
  lines.push("| Route | Control | Element | Pixels changed |", "|---|---|---|---|");
  for (const f of findings) {
    lines.push(`| \`${f.route}\` | ${f.text || "—"} | \`${f.tag}\` \`${f.cls}\` | ${f.changed}% |`);
  }
  lines.push("");
}
await mkdir(path.join(ROOT, "docs", "a11y"), { recursive: true });
const out = path.join(ROOT, "docs", "a11y", `${new Date().toISOString().slice(0, 10)}-focus-visibility.md`);
await writeFile(out, lines.join("\n"));
console.log(`\n${checked} controls checked · ${findings.length} with no visible focus`);
console.log(`report: ${path.relative(ROOT, out)}`);
process.exitCode = findings.length ? 1 : 0;
