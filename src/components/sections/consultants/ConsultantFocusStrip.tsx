"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
      <h3 className="type-card-title text-ink">
        {c.name}
      </h3>
      <p className="type-body mt-1.5 text-ink-muted">{c.shortRole}</p>
      <div aria-hidden className="mt-3.5 h-px w-10 bg-gold" />

      <dl className="mt-4 divide-y divide-ink/10 border-t border-ink/10">
        {c.cancerTypes.length > 0 && (
          <div className="py-2.5">
            <dt className="type-label text-ink">
              Cancer types
            </dt>
            <dd className="type-supporting mt-1 break-words leading-snug text-ink-muted">
              {c.cancerTypes.join(" · ")}
            </dd>
          </div>
        )}
        {c.treatments.length > 0 && (
          <div className="py-2.5">
            <dt className="type-label text-ink">
              Treatments
            </dt>
            <dd className="type-supporting mt-1 break-words leading-snug text-ink-muted">
              {c.treatments.join(" · ")}
            </dd>
          </div>
        )}
        {c.sites.length > 0 && (
          <div className="py-2.5">
            <dt className="type-label text-ink">
              Locations
            </dt>
            <dd className="type-supporting mt-1 break-words leading-snug text-ink-muted">
              {c.sites.join(" · ")}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-col items-start gap-2">
        <Link
          href={`/consultants/${c.slug}`}
          tabIndex={interactive ? undefined : -1}
          className="type-button inline-flex max-w-full items-center justify-center rounded-full border border-ink/20 bg-white/70 px-4 py-1.5 text-center leading-tight text-ink transition-colors hover:border-ink/45 hover:bg-white focus-visible:border-ink/45 focus-visible:bg-white"
        >
          Read full profile
        </Link>
        <Link
          href="/contact#consultation"
          tabIndex={interactive ? undefined : -1}
          className="ink-cta type-button group/cta inline-flex max-w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-center leading-tight"
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

type DesktopVersion = "current" | "indexed";

function DesktopVersionToggle({
  version,
  onChange,
}: {
  version: DesktopVersion;
  onChange: (version: DesktopVersion) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Compare consultant directory layouts"
      className="inline-flex rounded-full border border-ink/10 bg-white p-1 shadow-[0_10px_30px_rgba(6,28,70,0.08)]"
    >
      {(
        [
          ["current", "Current"],
          ["indexed", "Indexed"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={version === value}
          onClick={() => onChange(value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            version === value
              ? "bg-ink text-white"
              : "text-ink-muted hover:bg-ink/[0.06] hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ConsultantIndex({
  consultants,
  active,
  onSelect,
}: {
  consultants: FocusConsultant[];
  active: number | null;
  onSelect: (index: number | null) => void;
}) {
  return (
    <div className="container-wide mb-4">
      <div className="mb-3 flex items-center justify-between gap-5">
        <p className="type-label text-ink-muted">Choose a consultant</p>
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => onSelect(null)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            active === null
              ? "border-ink bg-ink text-white"
              : "border-ink/15 bg-white text-ink hover:border-ink/35"
          }`}
        >
          All consultants
        </button>
      </div>

      <div className="grid grid-cols-5 border-l border-t border-ink/10 bg-white">
        {consultants.map((consultant, index) => {
          const selected = active === index;
          return (
            <button
              key={consultant.slug}
              type="button"
              aria-pressed={selected}
              aria-controls={`consultant-desktop-panel-${consultant.slug}`}
              onClick={() => onSelect(index)}
              className={`min-h-[4.75rem] border-b border-r border-ink/10 px-4 py-3 text-left transition-colors ${
                selected
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-canvas-soft"
              }`}
            >
              <span className="block font-display text-[0.95rem] font-semibold leading-tight">
                {consultant.name}
              </span>
              <span
                className={`type-label mt-1 block leading-tight ${
                  selected ? "text-white/70" : "text-ink-muted"
                }`}
              >
                {consultant.shortRole.replace("Consultant ", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesktopPortraitWall({
  consultants,
  active,
  onSelect,
  showRail,
}: {
  consultants: FocusConsultant[];
  active: number | null;
  onSelect: (index: number) => void;
  showRail: boolean;
}) {
  const [ready, setReady] = useState<number | null>(active);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHover = () => {
    if (hoverTimer.current !== null) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const scheduleHover = (index: number) => {
    cancelHover();
    hoverTimer.current = setTimeout(() => {
      onSelect(index);
      hoverTimer.current = null;
    }, 150);
  };

  useEffect(
    () => () => {
      if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
    },
  );

  useEffect(() => {
    if (active === null) {
      setReady(null);
      return;
    }
    const timer = setTimeout(() => setReady(active), 300);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <>
      <div className="flex h-[clamp(500px,54svh,580px)] gap-[3px] border-y border-ink/[0.08]">
        {consultants.map((consultant, index) => {
          const open = index === active;
          return (
            <div
              key={consultant.slug}
              id={`consultant-desktop-panel-${consultant.slug}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") scheduleHover(index);
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
              <div
                className="absolute top-0 h-full transition-[left,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{
                  width: DESKTOP_PORTRAIT_WIDTH,
                  left: open ? "0%" : "50%",
                  transform: open ? "translateX(0%)" : "translateX(-50%)",
                }}
              >
                <Image
                  src={consultant.photoTall}
                  alt={open ? `${consultant.name}, ${consultant.shortRole}` : ""}
                  fill
                  sizes="16vw"
                  className={`object-cover transition-[filter] duration-300 ${
                    open
                      ? ""
                      : "brightness-[0.94] saturate-[0.82] group-hover:brightness-100 group-hover:saturate-100"
                  }`}
                />
              </div>

              <div
                aria-hidden={!open || ready !== index}
                className={`absolute inset-y-0 right-0 flex min-w-0 items-center overflow-hidden px-6 transition-opacity duration-300 motion-reduce:delay-0 motion-reduce:transition-none xl:px-9 ${
                  open
                    ? "opacity-100 delay-300"
                    : "pointer-events-none opacity-0"
                }`}
                style={{ left: DESKTOP_PORTRAIT_WIDTH }}
              >
                <Card c={consultant} interactive={open && ready === index} />
              </div>

              <button
                type="button"
                onClick={() => onSelect(index)}
                tabIndex={-1}
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-gold ${
                  open ? "pointer-events-none" : ""
                }`}
              />
            </div>
          );
        })}
      </div>

      {showRail && (
        <div className="mt-4 flex gap-[3px]">
          {consultants.map((consultant, index) => {
            const open = index === active;
            return (
              <button
                key={consultant.slug}
                type="button"
                onClick={() => onSelect(index)}
                aria-label={consultant.name}
                aria-current={open || undefined}
                aria-expanded={open}
                aria-controls={`consultant-desktop-panel-${consultant.slug}`}
                className="text-center transition-[flex-basis,flex-grow,min-width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                style={{
                  flexGrow: open ? 0 : 1,
                  flexShrink: open ? 0 : 1,
                  flexBasis: open ? ACTIVE_PANEL_WIDTH : 0,
                  minWidth: open ? ACTIVE_PANEL_WIDTH : CLOSED_PANEL_WIDTH,
                }}
              >
                <span
                  className={`type-label tabular-nums ${
                    open ? "text-gold" : "text-ink-muted"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`type-supporting mx-auto block overflow-hidden whitespace-nowrap text-ink transition-opacity duration-300 ${
                    open ? "opacity-100" : "h-0 opacity-0"
                  }`}
                >
                  {consultant.name}
                  <span
                    aria-hidden
                    className="mx-auto mt-1 block h-px w-16 bg-gold"
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function ConsultantFocusStrip({
  consultants,
}: {
  consultants: FocusConsultant[];
}) {
  const [active, setActive] = useState(3);
  const [desktopVersion, setDesktopVersion] =
    useState<DesktopVersion>("indexed");
  const [indexedActive, setIndexedActive] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const tabletTabs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveTabletSelection = (from: number, direction: -1 | 1) => {
    const next = (from + direction + consultants.length) % consultants.length;
    setActive(next);
    tabletTabs.current[next]?.focus();
  };

  const selected = consultants[active];

  return (
    <div>
      {/* ── Wide desktop comparison. The current option preserves the
          original numbered wall exactly; Indexed adds a neutral overview and
          persistent names while driving the same portrait interaction. ── */}
      <div className="hidden xl:block">
        <div className="container-wide mb-4 flex justify-end">
          <DesktopVersionToggle
            version={desktopVersion}
            onChange={setDesktopVersion}
          />
        </div>

        {desktopVersion === "indexed" && (
          <ConsultantIndex
            consultants={consultants}
            active={indexedActive}
            onSelect={setIndexedActive}
          />
        )}

        <DesktopPortraitWall
          consultants={consultants}
          active={desktopVersion === "current" ? active : indexedActive}
          onSelect={
            desktopVersion === "current" ? setActive : setIndexedActive
          }
          showRail={desktopVersion === "current"}
        />
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
                      ? "border-gold/55 bg-white text-ink"
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
                    <span className="type-label block tabular-nums text-ink-muted">
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
              <AnimatePresence initial={false}>
                <motion.div
                  key={selected.photoTall}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                >
                  <Image
                    src={selected.photoTall}
                    alt={`${selected.name}, ${selected.shortRole}`}
                    fill
                    sizes="45vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
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
                  <span className="type-compact-title block text-ink">
                    {c.name}
                  </span>
                  <span className="type-supporting mt-0.5 block text-ink-muted">
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
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.div
                          key={`${c.slug}-mobile-portrait`}
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.3 }}
                        >
                          <Image
                            src={c.photo}
                            alt={`${c.name}, ${c.shortRole}`}
                            fill
                            sizes="100vw"
                            className="object-cover object-[50%_22%]"
                          />
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
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
