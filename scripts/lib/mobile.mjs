/**
 * Shared plumbing for the mobile audit scripts.
 *
 * Deliberately does NOT import from the a11y scripts. Those are the evidence
 * behind the conformance claim in /accessibility; refactoring them to share
 * code with a new audit would put that evidence chain at risk for the sake of
 * eighty lines. The duplication is the cheaper mistake.
 */
import { chromium, webkit } from "playwright";
import { spawn } from "node:child_process";
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import net from "node:net";

// --use-mock-keychain: without it Chromium asks macOS for keychain access on
// every launch and the run blocks behind a system password dialog.
export const LAUNCH = { args: ["--use-mock-keychain"] };

export const ROOT = path.resolve(import.meta.dirname, "..", "..");

/** The phone widths this audit covers. Agreed scope is phones only, 320-430. */
export const PHONE_WIDTHS = [
  { name: "320", width: 320, height: 780 },  // SC 1.4.10 reflow floor
  { name: "360", width: 360, height: 800 },  // commonest Android
  { name: "375", width: 375, height: 812 },  // iPhone SE / 13 mini
  { name: "390", width: 390, height: 844 },  // iPhone 14/15/16
  { name: "430", width: 430, height: 932 },  // iPhone Pro Max
];

/**
 * iPad widths, in CSS pixels. Tablets straddle three breakpoints here — md at
 * 768, lg at 1024 — and the navigation does not switch to its desktop form
 * until xl (1280), so every size below is served the phone-shaped nav.
 */
export const TABLET_WIDTHS = [
  { name: "744", width: 744, height: 1133 },   // iPad mini, portrait
  { name: "820", width: 820, height: 1180 },   // iPad / iPad Air, portrait
  { name: "1024", width: 1024, height: 1366 }, // iPad Pro 13", portrait
  { name: "1180", width: 1180, height: 820 },  // iPad / Air, landscape
  { name: "1366", width: 1366, height: 1024 }, // iPad Pro 13", landscape
];

/** Desktop widths, captured only to prove they did not move. */
export const DESKTOP_WIDTHS = [
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
];

export function parseArgs() {
  return Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v = "true"] = a.replace(/^--/, "").split("=");
      return [k, v];
    }),
  );
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

/** Use an existing server if one was passed, otherwise start our own. */
export async function startServer(existingBase) {
  if (existingBase) {
    await waitForServer(existingBase, 10_000);
    return { base: existingBase, stop() {} };
  }
  const port = await freePort();
  const base = `http://localhost:${port}`;
  console.log(`→ starting next start on ${port}`);
  const proc = spawn("npx", ["next", "start", "-p", String(port)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  proc.stderr.on("data", (d) => process.stderr.write(`  [next] ${d}`));
  await waitForServer(base);
  return { base, stop: () => proc.kill() };
}

/** Static routes from the filesystem, dynamic ones from the sitemap. */
export async function routes(base) {
  const appDir = path.join(ROOT, "src", "app");
  const found = [];
  async function walk(dir, prefix) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const { name } = entry;
      if (name === "api" || name.startsWith("_")) continue;
      const child = path.join(dir, name);
      const segment = name.startsWith("(") ? "" : `/${name}`;
      if (existsSync(path.join(child, "page.tsx")) && !name.includes("[")) {
        found.push(`${prefix}${segment}` || "/");
      }
      await walk(child, `${prefix}${segment}`);
    }
  }
  if (existsSync(path.join(appDir, "page.tsx"))) found.push("/");
  await walk(appDir, "");

  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .map((p) => (p.length > 1 ? p.replace(/\/$/, "") : p));

  return [...new Set([...found, ...fromSitemap])].sort();
}

/**
 * Bring the page to a settled state: entrance animations played out, every
 * whileInView observer fired, scroll returned to the top. Lifted wholesale
 * from the a11y sweep, where an earlier pass produced ~27 false failures by
 * measuring the Reveal component before it had settled.
 */
export async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {});

  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.75);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = () =>
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    for (let y = 0; y < height(); y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(90);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await sleep(400);
  });

  await page
    .evaluate(async () => {
      const running = document
        .getAnimations()
        .filter((a) => a.playState === "running" && a.effect);
      await Promise.race([
        Promise.allSettled(
          running.map((a) =>
            a.effect?.getTiming().iterations === Infinity ? null : a.finished,
          ),
        ),
        new Promise((r) => setTimeout(r, 2500)),
      ]);
    })
    .catch(() => {});

  await waitForImages(page);
  await page.waitForTimeout(300);
}

/**
 * Wait until every <img> has actually decoded.
 *
 * `networkidle` is not enough. The region maps load their tiles lazily as the
 * page is scrolled, so a screenshot taken straight afterwards can catch one
 * half-drawn — which showed up as a grey rectangle and made an unrelated
 * desktop screenshot differ between two runs of the same build. A capture that
 * is not deterministic cannot prove anything, so this waits for decode.
 */
export async function waitForImages(page, timeoutMs = 8000) {
  await page
    .evaluate(async (limit) => {
      const deadline = Date.now() + limit;
      const pending = () =>
        [...document.images].filter((img) => {
          if (!img.checkVisibility?.({ checkVisibilityCSS: true })) return false;
          return !img.complete || img.naturalWidth === 0;
        });
      while (pending().length && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 100));
      }
      // decode() resolves only once the bitmap is ready to paint.
      await Promise.allSettled(
        [...document.images]
          .filter((img) => img.complete && img.naturalWidth > 0)
          .map((img) => (img.decode ? img.decode() : null)),
      );
    }, timeoutMs)
    .catch(() => {});
}

/**
 * Kill every source of frame-to-frame variation, so two screenshots of an
 * unchanged page are byte-identical. Without this the desktop-frozen diff is
 * dominated by the four canvas graphics, which seed themselves randomly.
 */
export async function freezeMotion(page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-play-state: paused !important;
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      transition-duration: 1ms !important;
      transition-delay: -1ms !important;
      caret-color: transparent !important;
      scroll-behavior: auto !important;
    }`,
  });
  await page.waitForTimeout(120);
}

/** Canvases and media are masked out of diffs; they are never pixel-stable. */
export function unstableRegions(page) {
  return [page.locator("canvas"), page.locator("video"), page.locator("iframe")];
}

export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

/**
 * Chromium by default; WebKit is the same engine family as Safari, so it is
 * what an iPhone or iPad actually renders with. It cannot reproduce iOS scroll
 * physics or the collapsing address bar, but it does catch genuine engine
 * differences in layout.
 */
export function engineFor(name) {
  return name === "webkit" ? webkit : chromium;
}

export { chromium, webkit };
