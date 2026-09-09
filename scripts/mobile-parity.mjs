#!/usr/bin/env node
/**
 * Content parity — is anything only available on a desktop?
 *
 * This codebase gates behaviour on `hover: hover` and `pointer: fine` in
 * seventeen places, and several sections have separate desktop and mobile
 * compositions. Most of that is deliberate. The failure it hides is content
 * that exists only in the desktop composition, so a phone visitor simply never
 * sees it — and nothing in a layout sweep can detect that, because the mobile
 * page is perfectly well laid out without it.
 *
 * So: read every route twice, once as a phone and once as a desktop, and diff
 * the visible text and the reachable controls.
 *
 * The output is a review list, not a defect list. A deliberate mobile
 * alternative and a piece of lost content look identical to a script; telling
 * them apart is a judgement call and stays with a person.
 *
 *   node scripts/mobile-parity.mjs --base=http://localhost:3210
 */
import { LAUNCH, chromium, parseArgs, startServer, routes, settle, ensureDir, ROOT } from "./lib/mobile.mjs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const args = parseArgs();

/** Visible text, plus the accessible name of everything you can operate. */
function harvest() {
  const seen = new Set();
  const text = [];
  const controls = [];

  const visible = (el) => {
    if (typeof el.checkVisibility === "function" &&
        !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  const norm = (s) => s.replace(/\s+/g, " ").trim();

  for (const el of document.body.querySelectorAll("*")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    if (!visible(el)) continue;
    const own = norm([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" "));
    if (own.length > 2 && !seen.has(own)) { seen.add(own); text.push(own); }
  }

  // Links are compared by destination, not by accessible name. The same link
  // often carries different surrounding text in the phone and desktop
  // compositions ("01Macmillan Cancer SupportPractical, financial…" versus
  // "Macmillan Cancer Support"), which made ninety-odd reachable links look
  // lost. What matters is whether a phone visitor can still get there.
  const destinations = [];
  for (const el of document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="link"]',
  )) {
    if (!visible(el)) continue;
    const href = el.getAttribute("href");
    if (href && !href.startsWith("javascript:")) {
      try { destinations.push(new URL(href, location.href).pathname + new URL(href, location.href).hash); }
      catch { destinations.push(href); }
      continue;
    }
    const name = norm(el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || "");
    if (name) controls.push(name);
  }
  return { text, controls: [...new Set(controls)], destinations: [...new Set(destinations)] };
}

const server = await startServer(args.base);
const routeList = args.routes ? args.routes.split(",") : await routes(server.base);
const browser = await chromium.launch(LAUNCH);

const phone = await browser.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
});
const desk = await browser.newContext({
  viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1,
});
const pPage = await phone.newPage();
const dPage = await desk.newPage();

// Confirm the phone context really does report a coarse pointer and no hover,
// since the whole check rests on the hover-gated CSS actually being inactive.
await pPage.goto(server.base, { waitUntil: "commit" });
const media = await pPage.evaluate(() => ({
  hover: matchMedia("(hover: hover)").matches,
  fine: matchMedia("(pointer: fine)").matches,
  coarse: matchMedia("(pointer: coarse)").matches,
}));
console.log(`-> phone context media: hover=${media.hover} pointer:fine=${media.fine} pointer:coarse=${media.coarse}`);
if (media.hover || media.fine) {
  console.log("  WARNING: phone context still reports hover/fine - hover-gated content will NOT be tested correctly");
}

const report = [];
for (const route of routeList) {
  const url = `${server.base}${route === "/" ? "" : route}`;
  try {
    await pPage.goto(url, { waitUntil: "commit", timeout: 45_000 });
    await settle(pPage);
    const m = await pPage.evaluate(harvest);

    await dPage.goto(url, { waitUntil: "commit", timeout: 45_000 });
    await settle(dPage);
    const d = await dPage.evaluate(harvest);

    const mobileBlob = m.text.join("  ").toLowerCase();
    const deskBlob = d.text.join("  ").toLowerCase();

    // Desktop text with no trace anywhere in the mobile page.
    const lostText = d.text.filter((t) => t.length > 12 && !mobileBlob.includes(t.toLowerCase()));
    const lostControls = d.controls.filter((c) => !m.controls.some((x) => x.toLowerCase() === c.toLowerCase()));
    const lostDestinations = d.destinations.filter((x) => !m.destinations.includes(x));
    const mobileOnly = m.text.filter((t) => t.length > 12 && !deskBlob.includes(t.toLowerCase()));

    if (lostText.length || lostControls.length || lostDestinations.length) {
      report.push({ route, lostText, lostControls, lostDestinations, mobileOnly,
                    counts: { mobile: m.text.length, desktop: d.text.length } });
    }
    process.stdout.write(".");
  } catch (err) {
    report.push({ route, error: err.message.split("\n")[0] });
    process.stdout.write("!");
  }
}
console.log();

await browser.close();
server.stop();

const date = new Date().toISOString().slice(0, 10);
const outDir = path.join(ROOT, "docs", "mobile");
await ensureDir(outDir);

const lines = [
  `# Mobile content parity — ${date}`, "",
  "Every route read twice: as a phone (390px, touch, no hover) and as a desktop",
  "(1440px). Listed below is text and are controls present on the desktop page",
  "with no trace anywhere in the mobile one.", "",
  "**This is a review list, not a defect list.** A deliberate mobile alternative",
  "and genuinely lost content look the same to a script. Each entry needs a",
  "human decision.", "",
  `${report.length} of ${routeList.length} routes differ.`, "",
];
for (const r of report) {
  lines.push(`## \`${r.route}\``, "");
  if (r.error) { lines.push(`Failed: ${r.error}`, ""); continue; }
  lines.push(`Mobile shows ${r.counts.mobile} text blocks, desktop ${r.counts.desktop}.`, "");
  if (r.lostDestinations.length) {
    lines.push(`**Destinations not linked from mobile (${r.lostDestinations.length}):**`, "");
    for (const c of r.lostDestinations.slice(0, 15)) lines.push(`- \`${c.slice(0, 90)}\``);
    if (r.lostDestinations.length > 15) lines.push(`- ...and ${r.lostDestinations.length - 15} more`);
    lines.push("");
  }
  if (r.lostControls.length) {
    lines.push(`**Non-link controls not on mobile (${r.lostControls.length}):**`, "");
    for (const c of r.lostControls.slice(0, 15)) lines.push(`- \`${c.slice(0, 90)}\``);
    if (r.lostControls.length > 15) lines.push(`- ...and ${r.lostControls.length - 15} more`);
    lines.push("");
  }
  if (r.lostText.length) {
    lines.push(`**Text not present on mobile (${r.lostText.length}):**`, "");
    for (const t of r.lostText.slice(0, 15)) lines.push(`- "${t.slice(0, 130)}"`);
    if (r.lostText.length > 15) lines.push(`- ...and ${r.lostText.length - 15} more`);
    lines.push("");
  }
  if (r.mobileOnly.length) {
    lines.push(`<details><summary>Mobile-only text (${r.mobileOnly.length}) — usually the deliberate alternative</summary>`, "");
    for (const t of r.mobileOnly.slice(0, 10)) lines.push(`- "${t.slice(0, 130)}"`);
    lines.push("", "</details>", "");
  }
}
await writeFile(path.join(outDir, `${date}-parity.md`), lines.join("\n"));
await writeFile(path.join(outDir, `${date}-parity.json`), JSON.stringify({ date, report }, null, 2));
console.log(`-> docs/mobile/${date}-parity.md — ${report.length} of ${routeList.length} routes differ`);
