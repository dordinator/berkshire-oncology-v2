#!/usr/bin/env node
/**
 * Mobile layout sweep — every route, at every phone width.
 *
 * This measures the things a phone gets wrong that a desktop never shows:
 * content running off the side, text colliding, boxes clipping their own
 * contents, type too small to read, and page gutters that disagree with each
 * other from one section to the next.
 *
 * Two principles, both learned from the a11y sweep next door:
 *
 * 1. Measure settled. Entrance animations must play out first, or the report
 *    fills with elements caught mid-transition.
 * 2. Prefer a quiet report to a loud one. Every check below is deliberately
 *    conservative — thresholds, visibility filters and scroller exclusions —
 *    because a report with fifty false positives does not get read, and the
 *    real defect in it never gets fixed.
 *
 *   npm run mobile
 *   node scripts/mobile-audit.mjs --base=http://localhost:3210
 */
import {
  LAUNCH, engineFor, parseArgs, startServer, routes, settle,
  ensureDir, PHONE_WIDTHS, TABLET_WIDTHS, ROOT,
} from "./lib/mobile.mjs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const args = parseArgs();

/** Below this, body text is too small to read comfortably on a phone. */
const MIN_BODY_PX = 14;
/** Below this it is a defect at any size or role. */
const MIN_ANY_PX = 12;
/** Two text boxes overlapping by more than this share of the smaller one. */
const OVERLAP_RATIO = 0.25;

/**
 * Everything below runs inside the page. It is one big function because
 * crossing the evaluate boundary repeatedly for fifty-five routes at five
 * widths costs more than it saves in tidiness.
 */
function collect({ MIN_BODY_PX, MIN_ANY_PX, OVERLAP_RATIO }) {
  const doc = document.documentElement;
  const vw = window.innerWidth;
  const out = { overflow: null, offscreen: [], overlaps: [], clipped: [],
                tinyText: [], images: [], collapsed: [], cutOff: [],
                typeScale: [], sections: [] };

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR"]);

  /**
   * The single most important helper here. An element's own bounding rect lies
   * about it constantly on this site: `sr-only` text sits in a 1px box, closed
   * `<details>` keep full-height children inside a zero-height clipper, and the
   * photo compositions crop `<image>` far outside an overflow-hidden frame.
   * Measuring those raw produced 87 findings on the home page, nearly all false.
   *
   * So every measurement below uses the rect *after* intersecting with every
   * clipping ancestor — what a reader can actually see.
   */
  function visible(el, maxClipLoss = 0.5) {
    if (SKIP_TAGS.has(el.tagName)) return null;
    if (typeof el.checkVisibility === "function" &&
        !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return null;

    const box = el.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return null;
    // DOMRect keeps its values on the prototype, so `{...box}` copies nothing
    // and every later spread would silently drop top/bottom to undefined.
    // Copy into a plain object once, up front.
    const own = { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
    const r = { ...own };
    let clippedBy = null;
    let worstLoss = 0;

    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n);
      const clipsX = s.overflowX === "hidden" || s.overflowX === "clip";
      const clipsY = s.overflowY === "hidden" || s.overflowY === "clip";
      if (!clipsX && !clipsY) continue;
      const nr = n.getBoundingClientRect();
      const before = (r.right - r.left) * (r.bottom - r.top);
      if (clipsX) {
        r.left = Math.max(r.left, nr.left);
        r.right = Math.min(r.right, nr.right);
      }
      if (clipsY) {
        r.top = Math.max(r.top, nr.top);
        r.bottom = Math.min(r.bottom, nr.bottom);
      }
      // Attribute the clipping to whichever ancestor actually took the most
      // area. Recording the first clipper instead blamed a carousel card for a
      // loss that <body>'s overflow-x: clip had caused.
      const after = Math.max(0, r.right - r.left) * Math.max(0, r.bottom - r.top);
      if (before - after > worstLoss) { worstLoss = before - after; clippedBy = n; }
    }

    const w = r.right - r.left, h = r.bottom - r.top;
    if (w <= 1 || h <= 1) return null;               // clipped away, or sr-only
    const ownArea = (own.right - own.left) * (own.bottom - own.top);
    // How much of this element its clipping ancestors remove. Decorative crops
    // want this ignored; text does not — losing half a sentence is the defect.
    const clipLoss = ownArea > 0 ? 1 - (w * h) / ownArea : 0;
    if (clipLoss > maxClipLoss) return null;

    return {
      el, clippedBy, clipLoss,
      // Clipped rect: what the reader can see. Used for visibility and overflow.
      left: r.left + scrollX, top: r.top + scrollY,
      right: r.right + scrollX, bottom: r.bottom + scrollY,
      width: w, height: h,
      vpRight: r.right, vpLeft: r.left,
      // True layout rect. Overlap must use this: inside a carousel every card
      // clips to the same visible box, which made all of them look like they
      // overlapped each other (1,425 false positives on the home page alone).
      rawLeft: own.left + scrollX, rawTop: own.top + scrollY,
      rawRight: own.right + scrollX, rawBottom: own.bottom + scrollY,
      rawWidth: own.right - own.left, rawHeight: own.bottom - own.top,
    };
  }

  const decorative = (el) => el.closest('[aria-hidden="true"]') !== null;

  /** An element inside a deliberate horizontal scroller is not overflowing. */
  const inScroller = (el) => {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };

  const all = [...document.body.querySelectorAll("*")];

  // ── Page-level horizontal overflow ────────────────────────────────────────
  if (doc.scrollWidth > doc.clientWidth + 1) {
    out.overflow = { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
  }

  // ── Elements visibly extending past the viewport ──────────────────────────
  for (const el of all) {
    if (decorative(el) || inScroller(el)) continue;
    const s = getComputedStyle(el);
    if (s.position === "fixed") continue;
    const v = visible(el);
    if (!v) continue;
    const over = Math.round(v.vpRight - vw);
    if (over > 1) out.offscreen.push({ sel: cssPath(el), over, width: Math.round(v.width) });
    else if (v.vpLeft < -1) out.offscreen.push({ sel: cssPath(el), over: Math.round(v.vpLeft), width: Math.round(v.width) });
  }

  // ── Text elements, gathered once and reused ───────────────────────────────
  const textEls = [];
  for (const el of all) {
    if (decorative(el)) continue;
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
    if (!own) continue;
    // Tolerance 1: text that is mostly clipped away is the finding, not noise,
    // so it must survive collection to be reported below.
    const v = visible(el, 1);
    if (!v) continue;
    const s = getComputedStyle(el);
    // Per-line rects, not just the union. An inline <a> that wraps across three
    // lines has a bounding rect spanning all three and the full column width,
    // which overlaps every neighbouring inline element on those lines. Comparing
    // unions reported ten such phantom collisions in the source lists on
    // /specialities/*; comparing line boxes reports none.
    const rects = [...el.getClientRects()].map((q) => ({
      left: q.left + scrollX, top: q.top + scrollY,
      right: q.right + scrollX, bottom: q.bottom + scrollY,
      area: q.width * q.height,
    }));
    textEls.push({ ...v, text: own, rects, size: parseFloat(s.fontSize),
                   weight: s.fontWeight, family: s.fontFamily.split(",")[0] });
  }

  // ── Text cut off the right-hand edge ──────────────────────────────────────
  // <body> sets `overflow-x: clip` deliberately (see globals.css — it keeps the
  // chapter-tint scroll timeline bound to the real scroller). The side effect
  // is that anything running past the right edge is silently sliced off: no
  // scrollbar, no symptom, just missing words. On a phone that is the single
  // most likely way to lose content, so it gets its own check measured from
  // the true layout rect rather than the clipped one.
  for (const el of all) {
    if (decorative(el) || inScroller(el)) continue;
    if (typeof el.checkVisibility === "function" &&
        !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    if (SKIP_TAGS.has(el.tagName)) continue;
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
    if (!own) continue;
    const s = getComputedStyle(el);
    if (s.position === "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    const past = Math.round(r.right - vw);
    if (past > 4) {
      out.cutOff.push({ sel: cssPath(el), past, sample: own.slice(0, 60) });
    }
  }

  // ── Type: too small, and the scale actually in use ────────────────────────
  const scale = new Map();
  for (const t of textEls) {
    const key = `${Math.round(t.size * 10) / 10}px/${t.weight}/${t.family.replace(/["']/g, "")}`;
    scale.set(key, (scale.get(key) || 0) + 1);
    const long = t.text.length > 40;
    if (t.size < MIN_ANY_PX || (long && t.size < MIN_BODY_PX)) {
      out.tinyText.push({ sel: cssPath(t.el), size: t.size, sample: t.text.slice(0, 60), long });
    }
  }
  out.typeScale = [...scale.entries()].map(([k, n]) => ({ style: k, count: n }))
    .sort((a, b) => b.count - a.count);

  // ── Text colliding with text ──────────────────────────────────────────────
  const bands = new Map();
  for (const t of textEls) {
    // What a scroller shows depends on its scroll offset, so its children are
    // not a collision question.
    if (inScroller(t.el)) continue;
    const b = Math.floor(t.rawTop / 200);
    for (const k of [b, b + 1]) {
      if (!bands.has(k)) bands.set(k, []);
      bands.get(k).push(t);
    }
  }
  const seen = new Set();
  for (const group of bands.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        // Worst intersection between any line box of A and any of B.
        let best = 0, smaller = 0;
        for (const ra of a.rects) {
          for (const rb of b.rects) {
            const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (ox <= 1 || oy <= 1) continue;
            const sm = Math.min(ra.area, rb.area);
            if (sm <= 0) continue;
            const ratio = (ox * oy) / sm;
            if (ratio > best) { best = ratio; smaller = sm; }
          }
        }
        if (!smaller || best < OVERLAP_RATIO) continue;
        const ox = best * smaller, oy = 1;
        const key = [cssPath(a.el), cssPath(b.el)].sort().join(" ~ ");
        if (seen.has(key)) continue;
        seen.add(key);
        out.overlaps.push({ a: cssPath(a.el), b: cssPath(b.el),
                            aText: a.text.slice(0, 40), bText: b.text.slice(0, 40),
                            overlap: Math.round(best * 100) });
      }
    }
  }

  // ── Text actually cut off by a clipping container ─────────────────────────
  // The obvious implementation — compare scrollHeight to clientHeight on every
  // overflow-hidden box — reports the site footer on all 55 routes. The footer
  // clips a decorative blur (`-bottom-40 h-[480px] w-[120%]`) on purpose, and
  // that inflates scrollHeight without a word of text being lost.
  //
  // So measure the text instead: a clipping container is only a defect when a
  // text element inside it is measurably cut.
  const clipSeen = new Set();
  for (const t of textEls) {
    if (t.clipLoss <= 0.05 || !t.clippedBy) continue;
    // A carousel card sitting off to the right is clipped by the viewport, but
    // the reader reaches it by scrolling the carousel. Content that can be
    // scrolled to has not been lost, so it is not a defect.
    if (inScroller(t.el)) continue;
    const cs = getComputedStyle(t.clippedBy);
    if (cs.webkitLineClamp && cs.webkitLineClamp !== "none") continue;  // deliberate
    if (cs.textOverflow === "ellipsis") continue;                        // deliberate
    const key = `${cs.length}|${t.text.slice(0, 40)}`;
    if (clipSeen.has(key)) continue;
    clipSeen.add(key);
    // Report both axes rather than guessing one. An absolutely-positioned
    // overlay can lose area on either, and attributing it to the wrong axis
    // produced rows reading "31% lost, 0px hidden".
    const hiddenX = Math.round(t.rawWidth - t.width);
    const hiddenY = Math.round(t.rawHeight - t.height);
    out.clipped.push({
      sel: cssPath(t.el),
      clipper: cssPath(t.clippedBy),
      axis: hiddenX > hiddenY ? "horizontal" : "vertical",
      lost: Math.round(t.clipLoss * 100),
      hiddenX, hiddenY,
      hidden: Math.max(hiddenX, hiddenY),
      sample: t.text.slice(0, 60),
    });
  }

  // ── Images: squashed, stretched or wider than the phone ───────────────────
  for (const img of document.images) {
    const v = visible(img);
    if (!v || !img.naturalWidth || !img.naturalHeight) continue;
    const r = img.getBoundingClientRect();
    const natural = img.naturalWidth / img.naturalHeight;
    const rendered = r.width / r.height;
    const fit = getComputedStyle(img).objectFit;
    const distorted = (fit === "fill" || fit === "none") &&
      Math.abs(natural - rendered) / natural > 0.08;
    // Full-bleed images legitimately reach (and slightly exceed) the edges, so
    // only a meaningfully overwide one is a finding.
    if (distorted || r.width > vw * 1.05) {
      out.images.push({ sel: cssPath(img), src: (img.currentSrc || img.src).split("/").pop(),
                        natural: +natural.toFixed(2), rendered: +rendered.toFixed(2),
                        width: Math.round(r.width), distorted, fit });
    }
  }

  // ── Containers that collapsed but still hold content ──────────────────────
  for (const el of all) {
    if (decorative(el) || SKIP_TAGS.has(el.tagName)) continue;
    if (typeof el.checkVisibility === "function" &&
        !el.checkVisibility({ checkVisibilityCSS: true })) continue;   // hidden on purpose
    const s = getComputedStyle(el);
    if (s.position === "absolute" || s.position === "fixed") continue;
    if (s.overflow !== "visible") continue;
    const r = el.getBoundingClientRect();
    if (r.height >= 1 || el.textContent.trim().length <= 10) continue;
    // A wrapper holding only absolutely-positioned children is *meant* to have
    // no height, and its content renders perfectly well. /treatments has one
    // (`div.relative.z-20` around a `-translate-y-[40%]` overlay) that is fine.
    const inFlow = [...el.children].some((c) => {
      const cs = getComputedStyle(c);
      return cs.position !== "absolute" && cs.position !== "fixed";
    });
    if (!inFlow) continue;
    out.collapsed.push({ sel: cssPath(el), sample: el.textContent.trim().slice(0, 50) });
  }

  // ── Page gutters and section rhythm ───────────────────────────────────────
  // Only direct children of <main>: nesting a section inside a section made
  // the gap between them read as a large negative number.
  //
  // The gap that matters is not between section boxes — spacing lives in their
  // padding, so those gaps are mostly zero — but between the last line of text
  // in one section and the first line in the next. That is the space a reader
  // actually perceives, and it is what should be consistent down the page.
  const tops = [...document.querySelectorAll("main > *")]
    .map((el) => ({ el, v: visible(el) }))
    .filter((x) => x.v && x.v.height > 40);

  let prev = null;
  for (const { el, v } of tops) {
    let leftMost = Infinity, firstTop = Infinity, lastBottom = -Infinity;
    for (const t of textEls) {
      if (!el.contains(t.el) || t.rawWidth < 8) continue;
      leftMost = Math.min(leftMost, Math.round(t.rawLeft));
      firstTop = Math.min(firstTop, t.rawTop);
      lastBottom = Math.max(lastBottom, t.rawBottom);
    }
    const hasText = Number.isFinite(firstTop);
    out.sections.push({
      sel: cssPath(el),
      top: Math.round(v.top), height: Math.round(v.height),
      textLeft: hasText ? leftMost : null,
      textRight: hasText ? Math.round(vw - Math.max(...textEls
        .filter((t) => el.contains(t.el) && t.rawWidth >= 8)
        .map((t) => t.rawRight))) : null,
      padTop: hasText ? Math.round(firstTop - v.top) : null,
      padBottom: hasText ? Math.round(v.top + v.height - lastBottom) : null,
      textGapAbove: prev && hasText ? Math.round(firstTop - prev) : null,
    });
    if (hasText) prev = lastBottom;
  }

  function cssPath(el) {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      let p = n.tagName.toLowerCase();
      if (n.id) { parts.unshift(`#${n.id}`); break; }
      const cls = (n.getAttribute("class") || "").trim().split(/\s+/)
        .filter((c) => c && !c.includes("[") && !c.includes(":")).slice(0, 2);
      if (cls.length) p += `.${cls.join(".")}`;
      parts.unshift(p);
    }
    return parts.join(" > ");
  }

  return out;
}

// ── Driver ───────────────────────────────────────────────────────────────────
const engineName = args.engine === "webkit" ? "webkit" : "chromium";
const server = await startServer(args.base);
const routeList = args.routes ? args.routes.split(",") : await routes(server.base);
// --widths=phone | tablet | 744,820 | 390
const KNOWN = [...PHONE_WIDTHS, ...TABLET_WIDTHS];
let widths = PHONE_WIDTHS;
if (args.widths === "tablet") widths = TABLET_WIDTHS;
else if (args.widths === "phone") widths = PHONE_WIDTHS;
else if (args.widths) {
  widths = args.widths.split(",").map((n) => {
    const hit = KNOWN.find((k) => k.name === n.trim());
    return hit || { name: n.trim(), width: Number(n), height: 900 };
  });
}

console.log(`→ ${routeList.length} routes × ${widths.length} widths, ${engineName}`);

// WebKit does not take Chromium's command-line flags.
const browser = await engineFor(engineName).launch(
  engineName === "webkit" ? {} : LAUNCH,
);
const findings = [];
const pageData = [];

try {
  for (const vp of widths) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();

    for (const route of routeList) {
      const url = `${server.base}${route === "/" ? "" : route}`;
      try {
        const res = await page.goto(url, { waitUntil: "commit", timeout: 45_000 });
        if ((res?.status() ?? 0) >= 400) {
          findings.push({ route, width: vp.name, kind: "http", detail: `HTTP ${res.status()}` });
          continue;
        }
        await settle(page);
        const r = await page.evaluate(collect, { MIN_BODY_PX, MIN_ANY_PX, OVERLAP_RATIO });
        pageData.push({ route, width: vp.name, ...r });
      } catch (err) {
        findings.push({ route, width: vp.name, kind: "error", detail: err.message.split("\n")[0] });
      }
    }
    await context.close();
    console.log(`  ${vp.name}px done`);
  }
} finally {
  await browser.close();
  server.stop();
}

const date = new Date().toISOString().slice(0, 10);
const outDir = path.join(ROOT, "docs", "mobile");
await ensureDir(outDir);
// A partial run must never overwrite a full sweep's data. Losing a 30-minute
// sweep to a six-route spot check is an easy and annoying mistake to make.
const partial = Boolean(args.routes) || widths.length < PHONE_WIDTHS.length;
const tablet = args.widths === "tablet";
const suffix = engineName === "webkit" ? "-webkit" : "";
const stem = (tablet ? `${date}-layout-tablet`
  : partial ? `${date}-layout-partial` : `${date}-layout`) + suffix;
await writeFile(path.join(outDir, `${stem}.json`),
  JSON.stringify({ date, widths: widths.map((w) => w.name), routes: routeList, findings, pageData }, null, 2));

console.log(`\n→ raw data: docs/mobile/${stem}.json`);

// A short console summary; the readable report is generated separately so the
// grouping can change without re-running an eight-minute sweep.
const counts = { overflow: 0, offscreen: 0, cutOff: 0, overlaps: 0, clipped: 0, tinyText: 0, images: 0, collapsed: 0 };
for (const p of pageData) {
  if (p.overflow) counts.overflow += 1;
  for (const k of ["offscreen", "cutOff", "overlaps", "clipped", "tinyText", "images", "collapsed"]) {
    counts[k] += p[k].length;
  }
}
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(10)} ${v}`);
const total = Object.values(counts).reduce((a, b) => a + b, 0) + findings.length;
console.log(`\n${total} findings across ${routeList.length} routes.`);
