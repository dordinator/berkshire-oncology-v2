"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// The consultant focus strip — ten portraits sharing one band, the one under
// your pointer coming into focus while the rest compress into slivers.
//
// The mechanic is a single animatable property: every panel is flex-basis 0
// and the camera work is flex-grow, which transitions smoothly and keeps the
// row exactly filling its track at every moment. The open panel's card sits
// at a fixed width inside the growing box, so its text never reflows during
// the move. The details remain bounded by the opening panel, wrapping safely
// as it grows before they fade fully into view.
//
// On wide screens, a short hover-intent delay prevents the wall twitching as
// the pointer crosses it; click and keyboard focus remain immediate. Tablets
// use a stable selector-and-detail composition, and phones use a compact
// accordion with no item expanded on arrival.
// ─────────────────────────────────────────────────────────────────────────────

export interface FocusConsultant {
  slug: string;
  name: string;
  shortRole: string;
  photo: string;
  /** Extended-headroom portrait (800×1680) — desktop strip only, where the
      sliver crop must keep the whole face in frame. */
  photoTall: string;
  cancerTypes: string[];
  treatments: string[];
  sites: string[];
}

/** The site's established gold — the pathway waves and tariffs field use it. */
const GOLD = "#c8992f";

/** The desktop portrait is sized from the same viewport-height range as its
 * strip, preserving the source image's natural 800:1700 proportion. The open
 * panel then reserves a further 29rem for the details and their padding. This
 * keeps the content inside the panel at every desktop height instead of
 * guessing its width from the viewport alone. */
const DESKTOP_PORTRAIT_WIDTH = "clamp(14.75rem, 25.5svh, 17.125rem)";
const ACTIVE_PANEL_WIDTH = "clamp(45rem, calc(25.5svh + 29rem), 48rem)";
const CLOSED_PANEL_WIDTH = "3rem";

function Card({
  c,
  interactive = true,
}: {
  c: FocusConsultant;
  interactive?: boolean;
}) {
  return (
    <div className="w-full max-w-[320px]">
      <h3 className="font-display text-2xl font-semibold leading-tight text-ink xl:text-[2rem]">
        {c.name}
      </h3>
      <p className="mt-1.5 text-[15px] text-ink-muted">{c.shortRole}</p>
      <div aria-hidden className="mt-3.5 h-px w-10" style={{ backgroundColor: GOLD }} />

      <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {c.cancerTypes.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Cancer types
            </dt>
            <dd className="mt-1 break-words text-sm leading-snug text-ink-muted">
              {c.cancerTypes.join(" · ")}
            </dd>
          </div>
        )}
        {c.treatments.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Treatments
            </dt>
            <dd className="mt-1 break-words text-sm leading-snug text-ink-muted">
              {c.treatments.join(" · ")}
            </dd>
          </div>
        )}
        {c.sites.length > 0 && (
          <div className="py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
              Locations
            </dt>
            <dd className="mt-1 break-words text-sm leading-snug text-ink-muted">
              {c.sites.join(" · ")}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-col items-start gap-2">
        <Link
          href={`/consultants/${c.slug}`}
          tabIndex={interactive ? undefined : -1}
          className="inline-flex max-w-full items-center justify-center rounded-full border border-ink/20 bg-white/70 px-4 py-1.5 text-center text-sm font-medium leading-tight text-ink transition-colors hover:border-ink/45 hover:bg-white focus-visible:border-ink/45 focus-visible:bg-white"
        >
          Read full profile
        </Link>
        <Link
          href="/contact#consultation"
          tabIndex={interactive ? undefined : -1}
          className="group/cta inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-1.5 text-center text-sm font-medium leading-tight text-white transition-colors hover:bg-accent focus-visible:bg-accent"
        >
          Arrange a consultation
          <span
            aria-hidden
            className="transition-transform group-hover/cta:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function ConsultantFocusStrip({
  consultants,
}: {
  consultants: FocusConsultant[];
}) {
  const [active, setActive] = useState(3);
  const [desktopReady, setDesktopReady] = useState(3);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabletTabs = useRef<Array<HTMLButtonElement | null>>([]);

  const cancelHover = () => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const scheduleHover = (index: number) => {
    cancelHover();
    hoverTimer.current = setTimeout(() => {
      setActive(index);
      hoverTimer.current = null;
    }, 150);
  };

  const moveTabletSelection = (from: number, direction: -1 | 1) => {
    const next = (from + direction + consultants.length) % consultants.length;
    setActive(next);
    tabletTabs.current[next]?.focus();
  };

  useEffect(
    () => () => {
      if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDesktopReady(active), 300);
    return () => clearTimeout(timer);
  }, [active]);

  const selected = consultants[active];

  return (
    <div>
      {/* ── Wide desktop: the original horizontal portrait wall. Height is
          ~half the
          viewport so headline + strip + rail compose one full screen, and
          the slivers stay wide enough that the extended-headroom portraits
          keep the whole face in frame. ─────────────────────────────────── */}
      <div className="hidden xl:block">
        <div className="flex h-[clamp(500px,54svh,580px)] gap-[3px] border-y border-ink/[0.08]">
          {consultants.map((c, i) => {
            const open = i === active;
            return (
              <div
                key={c.slug}
                id={`consultant-desktop-panel-${c.slug}`}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") scheduleHover(i);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") cancelHover();
                }}
                className="group relative overflow-hidden bg-canvas-soft transition-[flex-basis,flex-grow,min-width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{
                  flexGrow: open ? 0 : 1,
                  flexShrink: open ? 0 : 1,
                  flexBasis: open ? ACTIVE_PANEL_WIDTH : 0,
                  minWidth: open ? ACTIVE_PANEL_WIDTH : CLOSED_PANEL_WIDTH,
                }}
              >
                {/* One persistent portrait per panel — the same element in
                    both states, so opening never swaps or reloads the image.
                    Collapsed it sits centred (the sliver is a window onto its
                    middle); open it slides to the panel's left edge, riding
                    the same easing as the grow. */}
                <div
                  className="absolute top-0 h-full transition-[left,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                  style={{
                    width: DESKTOP_PORTRAIT_WIDTH,
                    left: open ? "0%" : "50%",
                    transform: open ? "translateX(0%)" : "translateX(-50%)",
                  }}
                >
                  <Image
                    src={c.photoTall}
                    alt={open ? `${c.name}, ${c.shortRole}` : ""}
                    fill
                    sizes="16vw"
                    className={`object-cover transition-[filter] duration-300 ${
                      open
                        ? ""
                        : "brightness-[0.94] saturate-[0.82] group-hover:brightness-100 group-hover:saturate-100"
                    }`}
                  />
                </div>

                {/* The details are a sibling constrained by the panel's
                    right edge, rather than a fixed box hanging off the image.
                    It therefore wraps during the grow instead of being cut
                    off. The short delay keeps partial copy hidden until the
                    panel has enough room to present it cleanly. */}
                <div
                  aria-hidden={!open || desktopReady !== i}
                  className={`absolute inset-y-0 right-0 flex min-w-0 items-center overflow-hidden px-6 transition-opacity duration-300 motion-reduce:delay-0 motion-reduce:transition-none xl:px-9 ${
                    open ? "opacity-100 delay-300" : "pointer-events-none opacity-0"
                  }`}
                  style={{ left: DESKTOP_PORTRAIT_WIDTH }}
                >
                  <Card c={c} interactive={open && desktopReady === i} />
                </div>

                {/* Keyboard and screen-reader surface for the collapsed
                    state; hover's equivalent for focus. */}
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`absolute inset-0 h-full w-full focus-visible:shadow-[inset_0_0_0_3px_#c8992f] ${
                    open ? "pointer-events-none" : ""
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* The numbered rail. Cells share the panels' grow values and the
            same easing, so each number rides with its portrait; the open
            cell carries the name and the gold underline. */}
        <div className="mt-4 flex gap-[3px]">
          {consultants.map((c, i) => {
            const open = i === active;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActive(i)}
                aria-label={c.name}
                aria-current={open || undefined}
                aria-expanded={open}
                aria-controls={`consultant-desktop-panel-${c.slug}`}
                className="text-center transition-[flex-basis,flex-grow,min-width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{
                  flexGrow: open ? 0 : 1,
                  flexShrink: open ? 0 : 1,
                  flexBasis: open ? ACTIVE_PANEL_WIDTH : 0,
                  minWidth: open ? ACTIVE_PANEL_WIDTH : CLOSED_PANEL_WIDTH,
                }}
              >
                <span
                  className="text-[11px] tabular-nums tracking-[0.14em]"
                  style={{ color: open ? GOLD : "#5a6884" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mx-auto block overflow-hidden whitespace-nowrap text-[13px] text-ink transition-opacity duration-300 ${
                    open ? "opacity-100" : "h-0 opacity-0"
                  }`}
                >
                  {c.name}
                  <span
                    aria-hidden
                    className="mx-auto mt-1 block h-px w-16"
                    style={{ backgroundColor: GOLD }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tablet and small laptop: all ten consultants remain visible in a
          stable selector, with a separate detail panel. Nothing moves under
          the pointer, and the arrow keys walk the tablist. ──────────────── */}
      {selected && (
        <div className="container-wide hidden md:block xl:hidden">
          <div
            role="tablist"
            aria-label="Choose a consultant"
            className="grid grid-cols-5 gap-2"
          >
            {consultants.map((c, i) => {
              const selectedTab = i === active;
              const nameParts = c.name.replace(/^Dr\s+/, "").split(" ");
              const surname = nameParts[nameParts.length - 1];
              return (
                <button
                  key={c.slug}
                  ref={(node) => {
                    tabletTabs.current[i] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`consultant-tablet-tab-${c.slug}`}
                  aria-selected={selectedTab}
                  aria-controls="consultant-tablet-detail"
                  tabIndex={selectedTab ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                      event.preventDefault();
                      moveTabletSelection(i, -1);
                    }
                    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                      event.preventDefault();
                      moveTabletSelection(i, 1);
                    }
                    if (event.key === "Home") {
                      event.preventDefault();
                      setActive(0);
                      tabletTabs.current[0]?.focus();
                    }
                    if (event.key === "End") {
                      event.preventDefault();
                      const last = consultants.length - 1;
                      setActive(last);
                      tabletTabs.current[last]?.focus();
                    }
                  }}
                  className={`group flex min-w-0 items-center gap-2 border px-2 py-2 text-left transition-colors ${
                    selectedTab
                      ? "border-[#c8992f]/55 bg-white text-ink"
                      : "border-transparent bg-canvas-soft text-ink-muted hover:border-ink/15 hover:bg-white"
                  }`}
                >
                  <span className="relative hidden h-10 w-10 shrink-0 overflow-hidden lg:block">
                    <Image
                      src={c.photo}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover object-[50%_22%]"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] tabular-nums tracking-[0.12em] text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="block whitespace-nowrap text-[clamp(0.625rem,1.1vw,0.875rem)] font-medium text-current">
                      {surname}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="consultant-tablet-detail"
            role="tabpanel"
            aria-labelledby={`consultant-tablet-tab-${selected.slug}`}
            className="mt-3 grid min-h-[460px] overflow-hidden border-y border-ink/10 bg-canvas-soft md:grid-cols-[minmax(220px,0.88fr)_minmax(0,1.12fr)]"
          >
            <div className="relative min-h-[460px] overflow-hidden bg-white">
              {consultants.map((c, i) => {
                const visible = i === active;
                return (
                  <Image
                    key={c.photoTall}
                    src={c.photoTall}
                    alt={visible ? `${c.name}, ${c.shortRole}` : ""}
                    aria-hidden={!visible}
                    fill
                    sizes="45vw"
                    className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
                      visible ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex min-w-0 items-center p-6 lg:p-9">
              <Card c={selected} />
            </div>
          </div>
        </div>
      )}

      {/* ── Phones: a compact accordion. It begins closed so all ten people
          are easy to scan; tapping the open row again collapses it. ─────── */}
      <div className="space-y-2 px-4 sm:px-6 md:hidden">
        {consultants.map((c, i) => {
          const open = i === mobileOpen;
          return (
            <div key={c.slug} className="overflow-hidden bg-canvas-soft">
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setMobileOpen(open ? null : i);
                }}
                aria-expanded={open}
                aria-controls={`consultant-mobile-${c.slug}`}
                className="flex w-full items-center gap-4 p-2.5 text-left"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden">
                  <Image
                    src={c.photo}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover object-[50%_22%]"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold leading-tight text-ink">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-muted">
                    {c.shortRole}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`mr-2 text-lg text-ink-muted transition-transform duration-300 ${
                    open ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              <div
                id={`consultant-mobile-${c.slug}`}
                aria-hidden={!open}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="relative aspect-[5/4] max-h-[360px] w-full">
                    <Image
                      src={c.photo}
                      alt={`${c.name}, ${c.shortRole}`}
                      fill
                      sizes="100vw"
                      className="object-cover object-[50%_22%]"
                    />
                  </div>
                  <div className="p-5">
                    <Card c={c} interactive={open} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
