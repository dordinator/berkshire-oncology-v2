"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Snap from "lenis/snap";
import { getLenis } from "@/components/SmoothScroll";
import { isOutline } from "@/content/pathways";
import type { LibrarySheet } from "@/content/resourceLibrary";
import WaveMark from "@/components/sections/resources/WaveMark";

/*
  The resource library: "Choose a topic, then keep scrolling."

  The reference comp, in the site's own materials: a bare index on the left
  (not a panel — Dan was specific), then two warm-paper panels: the sheet,
  which takes most of the screen, and a slim counter strip that always says
  what is next. Scrolling advances one sheet at a time; the index and
  counter stay with you.

  Mechanics notes, several the result of an adversarial review pass:
  - Nothing scrubs. Scroll only elects a discrete sheet; transitions are
    time-based (the sheet remounts and fades up ~300ms).
  - All geometry derives from ONE measurement: gapPx is computed from the
    track's real offsetHeight against the sticky stage's, so the CSS svh
    track and the JS snap points can never disagree.
  - The mandatory snap disengages a few px before the final lock's rest
    position, so the reader is never held at the last sheet — leaving
    downwards is free, and scrolling back up re-arms it.
  - A sheet that genuinely overflows its panel gets data-lenis-prevent and
    keyboard focusability at runtime; one that fits gets neither, so the
    wheel keeps driving the page.
  - If keyboard focus was inside the sheet when scroll elects a new one,
    focus moves to the new sheet instead of silently dropping to <body>.

  Below lg none of the stage machinery mounts: phones get the nine sheets
  stacked in order under their group headings.
*/

const GAP_FACTOR = 0.62; // viewport-heights of scroll per sheet

function LinkRow({ link }: { link: { label: string; href: string; external?: boolean } }) {
  const outline = !link.external && isOutline(link.href);
  const inner = (
    <>
      <span className="min-w-0 flex-1 leading-snug">
        {link.label}
        {outline && (
          <span className="ml-2 whitespace-nowrap rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10.5px] font-medium text-ink/60">
            Being written
          </span>
        )}
      </span>
      <span
        aria-hidden
        className="shrink-0 transition-transform duration-300 group-hover/link:translate-x-1"
      >
        {link.external ? "↗" : "→"}
      </span>
    </>
  );
  const cls =
    "group/link flex items-center gap-2 py-1 text-[13.5px] font-medium text-accent transition-colors hover:text-ink";
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={link.href} className={cls}>
      {inner}
    </Link>
  );
}

/** One topic sheet — the paper panel the whole device exists to present. */
function Sheet({ sheet, compact }: { sheet: LibrarySheet; compact?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Only a sheet that genuinely overflows becomes its own scroll context —
  // Lenis must keep the wheel for page-stepping everywhere else.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || compact) return;
    if (el.scrollHeight > el.clientHeight + 2) {
      el.setAttribute("data-lenis-prevent", "");
      el.tabIndex = 0;
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", `${sheet.title} — details (scrollable)`);
    }
  }, [sheet.title, compact]);

  return (
    <article
      tabIndex={-1}
      aria-labelledby={`lib-${sheet.id}-title${compact ? "-m" : ""}`}
      className={`flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.05] bg-[#f6f4ee] shadow-[0_1px_2px_rgba(6,28,70,0.04),0_18px_44px_-18px_rgba(6,28,70,0.14)] outline-none ${
        compact ? "p-6" : "p-8 xl:p-11"
      }`}
    >
      <h2
        id={`lib-${sheet.id}-title${compact ? "-m" : ""}`}
        className="font-display text-[clamp(1.6rem,2.4vw,2.5rem)] leading-tight text-ink"
        style={{ fontWeight: 500 }}
      >
        {sheet.title}
      </h2>
      <div aria-hidden className="mt-3 h-px w-10 bg-[#c8992f]" />
      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">
        {sheet.intro}
      </p>

      <div
        ref={scrollerRef}
        className={`mt-5 min-h-0 flex-1 ${compact ? "" : "overflow-y-auto overscroll-contain pr-1"}`}
      >
        <ul className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {sheet.rows.map((row) => (
            <li
              key={row.key}
              className="grid gap-x-10 gap-y-2 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
            >
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink/20 text-[11px] font-semibold text-ink"
                >
                  {row.key}
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold leading-snug text-ink">
                    {row.title}
                  </h3>
                  <p className="mt-1 max-w-md text-[13px] leading-relaxed text-ink-muted">
                    {row.blurb}
                  </p>
                </div>
              </div>
              <div className="pl-11 sm:pl-0 sm:pt-0.5">
                {row.links.map((l) => (
                  <LinkRow key={l.href + l.label} link={l} />
                ))}
              </div>
            </li>
          ))}
        </ul>

        {sheet.note && (
          <p className="mt-4 flex items-start gap-3 rounded-xl border border-ink/[0.12] px-4 py-2.5 text-[13px] leading-relaxed text-ink-soft">
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/25 text-[10px] font-semibold"
            >
              i
            </span>
            {sheet.note}
          </p>
        )}
      </div>

      {sheet.cta && (
        <div className="mt-6 shrink-0">
          <Link
            href={sheet.cta.href}
            className="group/cta inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-accent focus-visible:bg-accent"
          >
            {sheet.cta.label}
            {isOutline(sheet.cta.href) && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-medium text-white/80">
                Being written
              </span>
            )}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover/cta:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      )}
    </article>
  );
}

export default function ResourceLibrary({ sheets }: { sheets: LibrarySheet[] }) {
  const N = sheets.length;
  const LAST = N - 1;
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetZoneRef = useRef<HTMLDivElement>(null);
  const geomRef = useRef({ trackTop: 0, gapPx: 600 });
  const focusWasInSheetRef = useRef(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const groups: LibrarySheet["group"][] = ["Information and guidance", "Support"];

  /** Elect a sheet, remembering whether focus needs carrying across the
      remount. */
  const elect = (idx: number) => {
    if (idx === activeRef.current) return;
    focusWasInSheetRef.current =
      !!sheetZoneRef.current?.contains(document.activeElement);
    activeRef.current = idx;
    setActive(idx);
  };

  // If focus lived in the departed sheet, land it on the new one instead of
  // letting the remount drop it to <body>.
  useEffect(() => {
    if (focusWasInSheetRef.current) {
      focusWasInSheetRef.current = false;
      sheetZoneRef.current?.querySelector("article")?.focus({ preventScroll: true });
    }
  }, [active]);

  /** Jump straight to a sheet — the rail rows use it. */
  const jumpTo = (k: number) => {
    const { trackTop, gapPx } = geomRef.current;
    const target = trackTop + k * gapPx;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 0.9 });
    else window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  };

  // ── Desktop stage machinery: scroll elects a sheet; snap lands on one ──
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    let teardown: (() => void) | undefined;

    const setup = () => {
      if (!mql.matches || !trackRef.current) return;
      const el = trackRef.current;

      // One source of truth for the geometry: the track's real height
      // against the sticky stage's, so CSS svh and JS px cannot drift.
      const measure = () => {
        const stageH = stageRef.current?.offsetHeight ?? window.innerHeight;
        geomRef.current = {
          trackTop: el.getBoundingClientRect().top + window.scrollY,
          gapPx: Math.max(1, (el.offsetHeight - stageH) / LAST),
        };
      };
      measure();

      const onScroll = () => {
        const { trackTop, gapPx } = geomRef.current;
        const p = Math.min(
          Math.max((window.scrollY - trackTop) / gapPx, 0),
          LAST,
        );
        elect(Math.round(p));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      // Mandatory snap guarded to the stage. The window closes a few px
      // BEFORE the final lock's rest position: at the last sheet the snap
      // is disengaged, so scrolling on into the rest of the page is free —
      // and scrolling back up re-arms it.
      const lenis = getLenis();
      let snap: Snap | undefined;
      const stageEnd = () => geomRef.current.trackTop + LAST * geomRef.current.gapPx;
      const inStage = () =>
        window.scrollY > geomRef.current.trackTop - window.innerHeight * 0.4 &&
        window.scrollY < stageEnd() - 8;
      const guard = () => {
        if (!snap) return;
        if (inStage()) snap.start();
        else snap.stop();
      };
      const buildSnap = () => {
        snap?.stop();
        snap?.destroy();
        snap = undefined;
        if (!lenis) return;
        snap = new Snap(lenis, {
          type: "mandatory",
          duration: 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          debounce: 320,
        });
        const { trackTop, gapPx } = geomRef.current;
        for (let k = 0; k <= LAST; k++) snap.add(trackTop + k * gapPx);
        guard();
      };
      buildSnap();
      window.addEventListener("scroll", guard, { passive: true });

      let resizeTimer: ReturnType<typeof setTimeout> | undefined;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          measure();
          buildSnap();
          onScroll();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      teardown = () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scroll", guard);
        window.removeEventListener("resize", onResize);
        snap?.stop();
        snap?.destroy();
      };
    };

    const onChange = () => {
      teardown?.();
      teardown = undefined;
      setup();
    };
    setup();
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LAST]);

  const sheet = sheets[active];
  const next = sheets[Math.min(active + 1, LAST)];
  const atEnd = active === LAST;

  return (
    <section aria-label="Browse the resource library">
      {/* What just changed, for screen readers — scroll election is silent
          otherwise. */}
      <div aria-live="polite" className="sr-only lg:block hidden">
        {sheet.num} of {String(N).padStart(2, "0")}: {sheet.title}
      </div>

      {/* ── Desktop: the track and its sticky stage — bare index left, then
          the two paper panels: the big sheet and the slim counter. ───────── */}
      <div
        ref={trackRef}
        className="hidden lg:block"
        style={{ height: `calc(${LAST * GAP_FACTOR * 100}svh + 100svh)` }}
      >
        <div ref={stageRef} className="sticky top-0 flex h-svh items-center">
          <div className="grid w-full grid-cols-[218px_minmax(0,1fr)_118px] gap-6 px-5 xl:grid-cols-[240px_minmax(0,1fr)_130px] xl:gap-8 xl:px-8">
            {/* The index — bare on the page, not a panel. */}
            <div>
              <p className="label-tight uppercase tracking-[0.14em] text-ink-muted">
                Resources <span aria-hidden className="mx-1 text-ink/30">/</span>
                <span className="text-ink/60">{sheet.group}</span>
              </p>
              <h1
                className="mt-3 font-display text-[1.85rem] leading-[1.15] text-ink"
                style={{ fontWeight: 500 }}
              >
                Browse the resource library.
              </h1>
              <p className="mt-4 max-w-[24ch] text-[13.5px] leading-relaxed text-ink-muted">
                Choose a topic, then keep scrolling. The index stays with you.
              </p>

              <nav aria-label="Library topics" className="mt-7">
                {groups.map((g) => (
                  <div key={g} className="mt-5 first:mt-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                      {g}
                    </p>
                    <ul className="mt-2">
                      {sheets.map(
                        (s, k) =>
                          s.group === g && (
                            <li key={s.id}>
                              <button
                                type="button"
                                onClick={() => jumpTo(k)}
                                aria-current={k === active || undefined}
                                className={`group/row flex w-full items-baseline gap-3 py-[5px] text-left transition-colors focus-visible:text-ink focus-visible:underline focus-visible:underline-offset-4 ${
                                  k === active
                                    ? "text-ink"
                                    : "text-ink-muted/70 hover:text-ink"
                                }`}
                              >
                                <span
                                  aria-hidden
                                  className={`h-1 w-1 shrink-0 rounded-full transition-opacity ${
                                    k === active
                                      ? "bg-[#c8992f] opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                <span className="text-[12px] tabular-nums tracking-[0.08em]">
                                  {s.num}
                                </span>
                                <span className="text-[13.5px] leading-snug">
                                  {s.railLabel}
                                </span>
                              </button>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>

            {/* The sheet — the big panel. Remounts on change and fades up:
                a time-based entrance, never a scrubbed one. */}
            <div ref={sheetZoneRef} className="h-[min(80svh,800px)]">
              <motion.div
                key={sheet.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                className="h-full"
              >
                <Sheet sheet={sheet} />
              </motion.div>
            </div>

            {/* The counter — the slim strip: where you are, what's next,
                and the site's wave. */}
            <div className="flex h-[min(80svh,800px)] flex-col overflow-hidden rounded-[1.5rem] border border-black/[0.05] bg-[#efede5]">
              <p className="px-3 pt-4 text-center text-[11px] tabular-nums tracking-[0.12em] text-ink-muted">
                {sheet.num} / {String(N).padStart(2, "0")}
              </p>
              <div className="flex flex-1 flex-col items-center justify-center px-3 text-center">
                {!atEnd ? (
                  <motion.div
                    key={next.id}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.32 }}
                  >
                    <p
                      className="font-display text-3xl text-ink"
                      style={{ fontWeight: 500 }}
                    >
                      {next.num}
                    </p>
                    <p className="mt-2 text-[12px] leading-snug text-ink-soft">
                      {next.railLabel}
                    </p>
                    <div
                      aria-hidden
                      className="mx-auto mt-3 h-px w-7 bg-[#c8992f]"
                    />
                  </motion.div>
                ) : (
                  <p className="max-w-[12ch] text-[12px] leading-relaxed text-ink-soft">
                    That&rsquo;s the whole library.
                  </p>
                )}
              </div>
              <div aria-hidden className="h-24 opacity-70">
                <WaveMark
                  idPrefix="library-counter"
                  viewBox="1000 120 400 100"
                  opacityBase={0.14}
                  opacitySpan={0.2}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Below lg: the nine sheets in order under their group headings —
          a library to scroll, not an instrument to drive. ─────────────────── */}
      <div className="container-wide lg:hidden">
        <p className="label-tight uppercase tracking-[0.14em] text-ink-muted">
          Resources
        </p>
        <h1
          className="mt-3 font-display text-[2rem] leading-[1.12] text-ink"
          style={{ fontWeight: 500 }}
        >
          Browse the resource library.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          Nine areas, in two groups. Nothing has to be read in order.
        </p>

        {groups.map((g) => (
          <div key={g} className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {g}
            </h2>
            <div className="mt-4 space-y-5">
              {sheets.map(
                (s) =>
                  s.group === g && (
                    <div key={s.id}>
                      <p className="mb-1.5 text-[11px] tabular-nums tracking-[0.1em] text-ink-muted">
                        {s.num} / {String(N).padStart(2, "0")}
                      </p>
                      <Sheet sheet={s} compact />
                    </div>
                  ),
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
