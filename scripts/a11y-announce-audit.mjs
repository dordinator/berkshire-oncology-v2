#!/usr/bin/env node
/**
 * What a screen reader would say, step by step, while the widgets are used.
 *
 * The tree audit reads every route at rest. This one drives the interactive
 * parts and captures what a listener is handed *after each action*: the name,
 * role and state of whatever holds focus, the text of every live region that
 * changed, and — for the combobox — the name of the option `aria-activedescendant`
 * is pointing at, which is the thing VoiceOver actually speaks as you arrow
 * through results.
 *
 * The defects it exists to catch are the ones that only appear mid-interaction:
 * focus dropped to <body> when a sheet closes, a live region that updates
 * silently or announces nothing, `aria-activedescendant` aimed at an id that
 * isn't rendered, an expanded/collapsed state that never changes, and names
 * that run two words together — "OncologistGMC 4259509" was real, and this is
 * where it would be caught next time.
 *
 * It models a screen reader; it is not one. Announcement order and verbosity
 * differ per AT, and nothing here judges whether the wording is *good*. Pair it
 * with scripts/a11y-voiceover.mjs, which drives real VoiceOver, and with a
 * human listening.
 *
 *   node scripts/a11y-announce-audit.mjs --base=http://localhost:3000
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
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

const findings = {
  focusLost: [],
  silentRegion: [],
  danglingActive: [],
  stateStuck: [],
  runTogether: [],
  unnamedStop: [],
};
/** Journeys that actually ran. A journey whose widget was never found proves
 *  nothing, so it is recorded as a failure rather than an empty pass — the
 *  same trap the contrast verifier fell into. */
const ran = [];
const skipped = [];

/* ---------- the announcement model ---------- */

/** Properties a listener hears as state, in the order most AT reads them. */
const STATE_KEYS = ["expanded", "selected", "checked", "pressed", "disabled", "required", "invalid"];

/** Roles whose name is spoken but which carry no useful state. */
const NEEDS_NAME = new Set([
  "button", "link", "textbox", "combobox", "option", "checkbox", "radio",
  "menuitem", "tab", "switch", "searchbox",
]);

/** Approximate one AX node as a spoken string: name, role, then state. */
function speak(node) {
  if (!node) return "(nothing)";
  const role = node.role?.value ?? "";
  const name = (node.name?.value ?? "").trim();
  const props = Object.fromEntries(
    (node.properties ?? []).map((p) => [p.name, p.value?.value]),
  );
  const bits = [];
  if (name) bits.push(name);
  if (role && role !== "generic" && role !== "none") bits.push(role);
  for (const k of STATE_KEYS) {
    if (props[k] === true) bits.push(k);
    else if (k === "expanded" && props[k] === false) bits.push("collapsed");
  }
  return bits.join(", ") || "(unnamed)";
}

/** Two words fused by a missing separator — "ReadingNHS", "OncologistGMC".
 *  A lowercase letter immediately followed by an uppercase one, outside the
 *  handful of places that is legitimately how the word is spelled. */
const CAMEL_OK = /\b(?:McK|MacD|iPhone|iPad|eLearning|NHSt)/;
function runsTogether(name) {
  if (!name || CAMEL_OK.test(name)) return false;
  return /[a-z][A-Z]/.test(name);
}

/* ---------- capture ---------- */

/** The AX node for whatever the expression evaluates to. */
async function axNodeFor(cdp, expression) {
  const { result } = await cdp.send("Runtime.evaluate", { expression, objectGroup: "a11y-announce" });
  if (!result?.objectId) return null;
  const { node } = await cdp.send("DOM.describeNode", { objectId: result.objectId });
  const { nodes } = await cdp.send("Accessibility.getPartialAXTree", {
    backendNodeId: node.backendNodeId,
    fetchRelatives: false,
  });
  return { ax: nodes?.[0] ?? null, tag: node.localName };
}

const focusedNode = (cdp) => axNodeFor(cdp, "document.activeElement");

/** The accessible name of the option activedescendant points at.
 *
 *  Deliberately not textContent. Adjacent elements run together in the text —
 *  "Breast CancerConsultants, treatments…" — while name computation inserts the
 *  separator and yields "Breast Cancer Consultants, treatments…". Printing the
 *  raw text in a report sends the reader hunting a defect that isn't there,
 *  which is a worse failure for an audit tool than missing one. */
async function activeOptionName(cdp) {
  const node = await axNodeFor(
    cdp,
    "(() => { const a = document.activeElement; const id = a && a.getAttribute && a.getAttribute('aria-activedescendant'); return id ? document.getElementById(id) : null; })()",
  ).catch(() => null);
  return (node?.ax?.name?.value ?? "").trim() || null;
}

/** Every live region's current text, plus what activedescendant resolves to. */
function readPageState() {
  const regions = [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')];
  const active = document.activeElement;
  const adId = active?.getAttribute?.("aria-activedescendant") || null;
  const adEl = adId ? document.getElementById(adId) : null;
  return {
    regions: regions.map((r) => ({
      selector: r.id ? `#${r.id}` : (r.getAttribute("role") || "aria-live"),
      text: (r.textContent || "").trim().replace(/\s+/g, " "),
      politeness: r.getAttribute("aria-live") || r.getAttribute("role") || "",
    })),
    activeDescendant: adId
      ? { id: adId, resolved: !!adEl, name: (adEl?.textContent || "").trim().replace(/\s+/g, " ") }
      : null,
    focusTag: active?.tagName?.toLowerCase() ?? null,
    focusIsBody: active === document.body || active === null,
  };
}

/** One step of a journey: do the thing, then write down what was announced. */
async function step(ctx, label, action) {
  const { page, cdp, journey, transcript } = ctx;
  const before = await page.evaluate(readPageState);
  if (action) await action();
  await page.waitForTimeout(220); // live regions settle a frame or two after
  const after = await page.evaluate(readPageState);
  const focus = await focusedNode(cdp);
  const spoken = speak(focus?.ax);

  const changed = after.regions.filter((r, i) => r.text !== (before.regions[i]?.text ?? null));
  // What the combobox actually speaks while you arrow: focus stays on the
  // input, so the option name only reaches the listener through this.
  const active = after.activeDescendant?.resolved ? await activeOptionName(cdp) : null;
  transcript.push({
    label, spoken, active,
    announced: changed.map((c) => c.text).filter(Boolean),
  });

  // Focus fell off the page. After an action that should move or restore it,
  // landing on <body> means the listener is dumped at the top with no context.
  if (after.focusIsBody && action) {
    findings.focusLost.push({ journey, step: label });
  }
  // Note: a region going from text to empty is not a defect — clearing a status
  // on teardown is correct, and AT does not announce a removal. The real defect
  // is a region that never says anything at all, which is checked per journey
  // once every step has run.
  // activedescendant is what the combobox actually speaks. Pointing at an id
  // that isn't rendered is silence with no visible symptom.
  if (after.activeDescendant && !after.activeDescendant.resolved) {
    findings.danglingActive.push({ journey, step: label, id: after.activeDescendant.id });
  }
  // Anything focusable that a listener reaches must say what it is.
  const role = focus?.ax?.role?.value;
  const name = (focus?.ax?.name?.value ?? "").trim();
  if (role && NEEDS_NAME.has(role) && !name) {
    findings.unnamedStop.push({ journey, step: label, role });
  }
  if (runsTogether(name)) {
    findings.runTogether.push({ journey, step: label, name });
  }
  // The option name is spoken but never focused, so nothing else looks at it.
  if (active && runsTogether(active)) {
    findings.runTogether.push({ journey, step: label, name: active });
  }
  return { spoken, after };
}

/* ---------- journeys ---------- */

/** The site search: a combobox with a listbox, on every page. */
async function journeySearch(ctx) {
  const { page } = ctx;
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const trigger = page.locator('button[aria-label*="earch"], button:has-text("Search")').first();
  if (!(await trigger.count())) return false;

  await step(ctx, "open search", () => trigger.click());
  const input = page.locator('[role="combobox"]').first();
  if (!(await input.count())) return false;

  await step(ctx, "focus lands in the field", () => input.focus());
  await step(ctx, 'type "breast"', () => input.fill("breast"));
  await step(ctx, "arrow to first result", () => input.press("ArrowDown"));
  await step(ctx, "arrow to second result", () => input.press("ArrowDown"));
  await step(ctx, "escape closes", () => input.press("Escape"));
  return true;
}

/** A disclosure: the state must actually flip, and the control must be named.
 *  Scoped to main — the navbar's search toggle also carries aria-expanded and
 *  is first in the DOM on every page, so an unscoped selector tests the header
 *  four times and the page never. */
async function journeyDisclosure(ctx, route) {
  const { page, cdp } = ctx;
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  // Start from a *collapsed* control. A tab in a tablist is also a button with
  // aria-expanded, and the selected one is already true — activating it
  // correctly does not collapse it, which reads as a stuck state if you test
  // whichever control happens to come first.
  // Pinned to one element. A locator re-resolves on every call, so once the
  // control expands, `[aria-expanded="false"]` matches the *next* collapsed
  // control and the state is read off the wrong button.
  // `:visible` matters: the responsive layouts render both variants and hide
  // one at 0x0. Focusing the hidden twin silently does nothing, focus stays
  // wherever it was, and the step reads as a defect in an unrelated control.
  const btn = await page
    .locator('main button[aria-expanded="false"]:visible')
    .first()
    .elementHandle({ timeout: 5000 })
    .catch(() => null);
  if (!btn) return false;

  await step(ctx, "focus the control", () => btn.focus());
  // Confirm focus actually landed on the control we intend to test. Some pages
  // re-render on scroll and drop focus, and headless holds it somewhere else
  // entirely; driving on regardless produces a finding about a control that was
  // never activated. If we could not focus it, the journey did not happen.
  const landed = await page.evaluate((el) => el === document.activeElement, btn).catch(() => false);
  if (!landed) throw new Error("could not move focus to the control (page re-rendered or focus is held elsewhere)");

  const named = await focusedNode(cdp);
  const label = (named?.ax?.name?.value ?? "").trim().slice(0, 40);
  await step(ctx, "activate it", () => btn.press("Enter"));
  const after = await btn.getAttribute("aria-expanded");
  // It began collapsed, so activation must expand it. The name comes from the
  // AX tree, not textContent — decorative numbering is in the text and not in
  // the name, and a finding that quotes the wrong string sends you hunting.
  if (after !== "true") {
    findings.stateStuck.push({ journey: ctx.journey, control: label, state: after });
  }
  await step(ctx, "activate again", () => btn.press("Enter"));
  return true;
}

/** The mobile sheet: focus must go in, and come back out to the trigger. */
async function journeyMobileNav(ctx) {
  const { page } = ctx;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  // Prefer the labelled menu control; the search toggle also has aria-expanded.
  const open = page.locator("button[aria-label*='enu'], header button[aria-expanded]").first();
  if (!(await open.count())) { await page.setViewportSize({ width: 1280, height: 900 }); return false; }

  await step(ctx, "open the menu", () => open.click());
  await step(ctx, "escape closes it", () => page.keyboard.press("Escape"));
  await page.setViewportSize({ width: 1280, height: 900 });
  return true;
}

/* ---------- run ---------- */

const browser = await chromium.launch(LAUNCH);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
await cdp.send("Accessibility.enable");
await cdp.send("DOM.enable");

const transcripts = [];
const JOURNEYS = [
  ["site search", (c) => journeySearch(c)],
  ["fees disclosure", (c) => journeyDisclosure(c, "/tariffs")],
  ["treatments disclosure", (c) => journeyDisclosure(c, "/treatments")],
  ["mobile navigation", (c) => journeyMobileNav(c)],
];

for (const [name, fn] of JOURNEYS) {
  const transcript = [];
  const ctx = { page, cdp, journey: name, transcript };
  let ok = false;
  try {
    ok = await fn(ctx);
  } catch (err) {
    skipped.push({ journey: name, why: err.message.split("\n")[0].slice(0, 120) });
    transcripts.push({ name, transcript });
    continue;
  }
  if (ok) {
    ran.push(name);
    transcripts.push({ name, transcript });
    // A live region that sat silent through an entire journey is either wired
    // to nothing or updating a node AT never sees. Either way the listener got
    // no feedback for work the sighted user watched happen.
    const saidSomething = transcript.some((s) => s.announced.length);
    const hasRegion = transcript.length > 0;
    if (hasRegion && !saidSomething && /search|finder/i.test(name)) {
      findings.silentRegion.push({ journey: name, step: "(whole journey)", region: "no live region spoke" });
    }
  } else skipped.push({ journey: name, why: "widget not found on the page" });
}

await browser.close();

/* ---------- report ---------- */

const L = [];
L.push("# What a screen reader is handed, mid-interaction", "");
L.push(`Base: \`${BASE}\``, "");
L.push("The tree audit reads each route at rest. This drives the interactive parts");
L.push("and records what is announced after every action.", "");
L.push("**This models a screen reader; it is not one.** Real AT differs in order and");
L.push("verbosity, and nothing here judges whether the wording is *good*. It catches");
L.push("regressions, not bad design.", "");

L.push("| | |", "|---|---:|");
L.push(`| Journeys run | ${ran.length} |`);
L.push(`| Journeys skipped | ${skipped.length} |`);
const total = Object.values(findings).reduce((n, a) => n + a.length, 0);
L.push(`| **Findings** | **${total}** |`, "");

if (skipped.length) {
  L.push("## Skipped", "");
  L.push("A journey that never found its widget proves nothing. These did not run:", "");
  for (const s of skipped) L.push(`- **${s.journey}** — ${s.why}`);
  L.push("");
}

const sec = (title, rows, clean, render) => {
  L.push(`## ${title}`, "");
  if (!rows.length) { L.push(clean, ""); return; }
  render();
  L.push("");
};

sec("Focus lost to the page body", findings.focusLost,
  "Focus stayed on a real control through every step.",
  () => { for (const f of findings.focusLost) L.push(`- **${f.journey}** — after "${f.step}"`); });

sec("Live regions that announced nothing", findings.silentRegion,
  "Every live-region update carried text.",
  () => { for (const f of findings.silentRegion) L.push(`- **${f.journey}** — "${f.step}", region \`${f.region}\``); });

sec("aria-activedescendant pointing nowhere", findings.danglingActive,
  "Every activedescendant resolved to a rendered element.",
  () => { for (const f of findings.danglingActive) L.push(`- **${f.journey}** — "${f.step}", id \`${f.id}\``); });

sec("Disclosure state that never changed", findings.stateStuck,
  "Every disclosure flipped aria-expanded when activated.",
  () => { for (const f of findings.stateStuck) L.push(`- **${f.journey}** — "${f.control}" stayed \`${f.state}\``); });

sec("Names with two words run together", findings.runTogether,
  "No accessible name fused two words.",
  () => { for (const f of findings.runTogether) L.push(`- **${f.journey}** — "${f.step}": \`${f.name}\``); });

sec("Focus stops with no name", findings.unnamedStop,
  "Every focus stop announced what it was.",
  () => { for (const f of findings.unnamedStop) L.push(`- **${f.journey}** — "${f.step}", role \`${f.role}\``); });

L.push("## Transcripts", "");
L.push("What a listener would hear, step by step.", "");
for (const t of transcripts) {
  L.push(`### ${t.name}`, "");
  if (!t.transcript.length) { L.push("_did not run_", ""); continue; }
  L.push("| Step | Focus announces | Active option | Live region says |", "|---|---|---|---|");
  for (const s of t.transcript) {
    L.push(`| ${s.label} | ${s.spoken} | ${s.active || "—"} | ${s.announced.join(" · ") || "—"} |`);
  }
  L.push("");
}

await mkdir(path.join(ROOT, "docs", "a11y"), { recursive: true });
const file = path.join(ROOT, "docs", "a11y", `${new Date().toISOString().slice(0, 10)}-announce-audit.md`);
await writeFile(file, L.join("\n"));

console.log(`journeys ran ${ran.length} · skipped ${skipped.length}`);
console.log(
  `focus lost ${findings.focusLost.length} · silent regions ${findings.silentRegion.length} · ` +
  `dangling activedescendant ${findings.danglingActive.length} · stuck state ${findings.stateStuck.length} · ` +
  `run-together ${findings.runTogether.length} · unnamed stops ${findings.unnamedStop.length}`,
);
console.log(`report: ${path.relative(ROOT, file)}`);
// A journey that could not run is a failure, whatever the others found.
process.exitCode = total || skipped.length ? 1 : 0;
