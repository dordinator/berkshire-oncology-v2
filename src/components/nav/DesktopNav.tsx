"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isSectionActive, navSections, type NavSection } from "@/content/navigation";
import {
  HOME_RETURN_UI_EVENT,
  type HomeReturnUiEventDetail,
} from "@/components/site/HomepageReturnState";

// ─────────────────────────────────────────────────────────────────────────────
// The horizontal section bar and its mega-menu panels.
//
// Shown from xl (1280px) up only — eight sections plus search plus the contact
// CTA cannot sit honestly next to the wordmark at 1024px. Below xl the drawer in
// MobileNav takes over, and the two breakpoints meet exactly so there is never a
// width where neither navigation is visible.
// ─────────────────────────────────────────────────────────────────────────────

/** Bar labels are shortened to fit; the full label is the accessible name and
 *  is repeated in the panel header, so nothing is lost. */
const shortLabels: Record<string, string> = {
  patients: "Patients",
  fees: "Fees",
  about: "About",
};

const EASE = [0.22, 1, 0.36, 1] as const;
/** Enough delay to cross the gap between a trigger and its panel diagonally. */
const CLOSE_DELAY = 120;
/** There is one sheet for all sections, so one id for every aria-controls. */
const PANEL_ID = "nav-panel";

// ── Opening motion ───────────────────────────────────────────────────────────
// The sheet is tucked up inside the pill, hidden behind it, and travels down
// into place — so it originates from within the bar rather than from the seam
// beneath it. It arrives with a confident deceleration and no bounce, and
// drains back the same way, faster than it opened.
//
// Height is never animated on open. Animating height clips a fully-formed
// rectangle into view, which is what reads as "a block being added"; the height
// is set in a single frame while the layer inside does the entrance on the
// compositor. Height still animates when moving between two open sections,
// which is the resize worth seeing.
const OPEN_EASE = [0.16, 1, 0.3, 1] as const;
const OPEN_DURATION = 0.34;
const CLOSE_DURATION = 0.18;

/** useLayoutEffect on the client, useEffect during SSR, so measuring the sheet
 *  before paint doesn't warn on the server render. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Column count for a panel: three for the long cancer-type grid and for any
 *  section with three groups, two otherwise. */
function columnsFor(section: NavSection): number {
  if (section.size === "lg") return 3;
  return section.groups.length >= 3 ? 3 : 2;
}

// The panel surface spans the whole navbar; this is the measure of the content
// inside it. Sized to the longest label rather than to a wrapped description —
// wide enough that "What to expect at your first appointment" stays on one
// line, tight enough that short lists don't sit in a half-empty box.
function contentWidthFor(section: NavSection): string {
  const cols = columnsFor(section);
  if (section.size === "lg") return "w-[min(92vw,940px)]";
  return cols === 3 ? "w-[min(92vw,940px)]" : "w-[min(92vw,800px)]";
}

export default function DesktopNav({
  onOpenChange,
}: {
  /** Fires whenever a panel opens or closes, so the header can dim the page. */
  onOpenChange?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // xl is 1280px, so an iPad Pro in landscape (1366px) gets this bar. On touch,
  // iOS fires mouseenter before click: the hover handler opens the panel, then
  // the click handler sees it open and closes it again, so a tap does nothing
  // visible. Only wire hover up for a real pointer.
  const [hoverCapable, setHoverCapable] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverCapable(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY);
  }, [cancelClose]);

  const openSection = useCallback(
    (id: string) => {
      cancelClose();
      setOpenId(id);
    },
    [cancelClose],
  );

  /** Close and hand focus back to the trigger that opened the panel. */
  const closeAndRestoreFocus = useCallback(() => {
    cancelClose();
    setOpenId((current) => {
      if (current) triggerRefs.current[current]?.focus();
      return null;
    });
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  // Report open/closed upward. Kept in a ref so a new callback identity on the
  // parent's render doesn't re-fire this.
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  useEffect(() => {
    onOpenChangeRef.current?.(openId !== null);
  }, [openId]);

  // Close on route change.
  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  // Back to the homepage recreates the panel the visitor followed a link from.
  // This runs after the route-change reset above, via the delayed restore event.
  useEffect(() => {
    const onRestore = (event: Event) => {
      const { ui, viewportMatches } = (
        event as CustomEvent<HomeReturnUiEventDetail>
      ).detail;
      setOpenId(
        viewportMatches && ui.viewport === "desktop" && !ui.searchOpen
          ? ui.desktopNavId
          : null,
      );
    };
    window.addEventListener(HOME_RETURN_UI_EVENT, onRestore);
    return () => window.removeEventListener(HOME_RETURN_UI_EVENT, onRestore);
  }, []);

  // Close on a click anywhere outside the nav.
  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId]);

  const active = openId ? navSections.find((s) => s.id === openId) : undefined;

  // The sheet animates to an explicit height, so it can travel from one
  // section's height to the next instead of collapsing in between. The content
  // is measured rather than assumed — panels differ by hundreds of pixels, and
  // a wrong guess would clip links or leave a gap under them.
  // Height animates only when travelling between two already-open sections.
  // Opening sets it in a single frame so the entrance belongs entirely to the
  // reveal layer; closing eases it back down alongside the layer retracting.
  //
  // The decision comes from the last measured height held in a ref, not from a
  // "was open" flag set in an effect: React flushes pending effects before the
  // re-render that follows the measurement, so the flag had already flipped by
  // the time the height was applied and every first open animated.
  const lastHeightRef = useRef(0);
  const [animateHeight, setAnimateHeight] = useState(false);

  const measureRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

  // The sheet has to clear its own full height to sit tucked behind the pill.
  // A percentage would be measured against the collapsed layer — only the
  // padding, with the content unmounted — so it would barely move. Offset by
  // the measured height instead.
  const closedTarget = { y: -(sheetHeight || 480) };
  const openTarget = { y: 0 };
  // Layout effect, not effect: the height has to be known in the same frame the
  // content mounts. Measuring after paint left the first open animating from
  // zero to the measured value — the very "block growing" this was meant to end.
  useIsomorphicLayoutEffect(() => {
    if (!active) {
      // Reset, so the next open is treated as an open and not as a resize.
      lastHeightRef.current = 0;
      setAnimateHeight(false);
      return;
    }
    const el = measureRef.current;
    if (!el) return;
    const update = () => {
      const height = el.offsetHeight;
      // A height already on screen means this is a move between sections, which
      // is the one case that should travel rather than snap.
      setAnimateHeight(lastHeightRef.current > 0);
      lastHeightRef.current = height;
      setSheetHeight(height);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);

  return (
    <>
    <div
      ref={containerRef}
      // Deliberately unpositioned: the panels below are absolute, and with no
      // positioned ancestor here they resolve against the navbar pill itself,
      // which is what makes them span its full width and sit flush beneath it.
      className="hidden shrink-0 items-center xl:flex"
      onMouseLeave={hoverCapable ? scheduleClose : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openId) {
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      }}
      // Focus leaving the whole cluster (tabbing past the last panel link) closes it.
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          scheduleClose();
        }
      }}
    >
      {navSections.map((section) => {
        const isOpen = openId === section.id;
        const sectionActive = isSectionActive(section, pathname);

        return (
          // The section name is the link to the section. Hover or focus opens
          // the panel; clicking goes to the landing page, which is why the panel
          // no longer needs an "All of …" row of its own.
          <Link
            key={section.id}
            ref={(el) => {
              triggerRefs.current[section.id] = el;
            }}
            href={section.href}
            id={`nav-trigger-${section.id}`}
            aria-expanded={isOpen}
            aria-controls={PANEL_ID}
            // No aria-haspopup: it is a synonym for "menu", which promises
            // arrow-key menu semantics these panels don't implement.
            // aria-expanded + aria-controls is the disclosure pattern.
            aria-label={section.label}
            aria-current={pathname === section.href ? "page" : undefined}
            onMouseEnter={hoverCapable ? () => openSection(section.id) : undefined}
            onFocus={() => openSection(section.id)}
            onClick={(event) => {
              // With no hover there is nothing to open the panel, so the first
              // tap opens it and a second tap follows the link. On a real
              // pointer the click always navigates.
              if (!hoverCapable && !isOpen) {
                event.preventDefault();
                openSection(section.id);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                openSection(section.id);
                // Let the panel's content mount before reaching into it.
                requestAnimationFrame(() => {
                  document.getElementById(PANEL_ID)?.querySelector<HTMLAnchorElement>("a")?.focus();
                });
              }
            }}
            className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[15px] font-semibold transition-colors 2xl:px-4 2xl:text-base ${
              sectionActive || isOpen ? "text-ink" : "text-ink/75 hover:text-ink"
            } ${isOpen ? "bg-ink/[0.05]" : "hover:bg-ink/[0.04]"}`}
          >
            {shortLabels[section.id] ?? section.label}
          </Link>
        );
      })}

      {/* One sheet, not one per section. Moving from a section to its neighbour
          resizes this single surface and crossfades its contents, instead of
          collapsing to nothing and growing again from zero.
          -left-px/-right-px, not inset-x-0: an absolute child resolves against
          the padding box, so inset-x-0 would sit a pixel inside the pill's
          borders and leave a visible step where the two surfaces meet. */}
      <motion.div
        initial={false}
        animate={{ height: active ? sheetHeight : 0 }}
        transition={{
          height: {
            duration: !active ? CLOSE_DURATION : animateHeight ? 0.3 : 0,
            ease: OPEN_EASE,
          },
        }}
        className={`absolute -left-px -right-px top-full z-50 overflow-hidden ${
          active ? "" : "pointer-events-none"
        }`}
        onMouseEnter={cancelClose}
      >
        <div ref={measureRef}>
          <motion.div
            id={PANEL_ID}
            role="group"
            aria-hidden={!active}
            aria-labelledby={active ? `nav-trigger-${active.id}` : undefined}
            // The origin sits above this element's own top edge — inside the
            // pill — so anything that scales appears to start from the middle
            // of the bar rather than unfolding from the seam.
            style={{ willChange: "transform" }}
            initial={false}
            animate={active ? openTarget : closedTarget}
            transition={{
              duration: active ? OPEN_DURATION : CLOSE_DURATION,
              ease: OPEN_EASE,
            }}
            // No top border and no top radius — the pill above squares off its
            // bottom edge to meet this, forming a single shape.
            className="max-h-[calc(100vh-8rem)] w-full overflow-y-auto rounded-b-[2.25rem] border border-t-0 border-black/[0.06] bg-white/95 px-7 pb-7 pt-5 shadow-[0_28px_80px_-24px_rgba(6,28,70,0.28)] backdrop-blur-xl"
            data-lenis-prevent
            data-home-return-overlay-scroll="desktop-nav"
          >
            {/* popLayout takes the outgoing section out of flow, so the height
                we measure is the incoming one's from the first frame. */}
            <AnimatePresence initial={false} mode="popLayout">
              {active && (
                <motion.div
                  key={active.id}
                  // The links settle downward into place as the surface opens,
                  // so the content arrives with the sheet instead of sitting
                  // finished behind it waiting to be uncovered.
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE } }}
                  transition={{ duration: 0.32, ease: EASE, delay: 0.04 }}
                  // The surface is full width; the content inside it keeps the
                  // measure that was tuned so no label wraps.
                  className={`mx-auto ${contentWidthFor(active)}`}
                >
                  <div
                    className={
                      active.size === "lg"
                        ? // Eighteen cancer types: CSS columns so the A–Z reads
                          // down each column rather than across the rows.
                          "columns-3 gap-6"
                        : `grid gap-x-8 gap-y-6 ${
                            columnsFor(active) === 3 ? "grid-cols-3" : "grid-cols-2"
                          }`
                    }
                  >
                    {active.size === "lg"
                      ? // The single ungrouped run of cancer types.
                        active.groups[0].links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            aria-current={pathname === link.href ? "page" : undefined}
                            className={`block break-inside-avoid rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-accent/[0.06] hover:text-ink ${
                              pathname === link.href ? "text-accent" : "text-ink/75"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))
                      : active.groups.map((group, index) => (
                          <div key={group.title ?? index}>
                            {group.title && (
                              <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                                {group.title}
                              </p>
                            )}
                            <div className="flex flex-col">
                              {group.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  aria-current={pathname === link.href ? "page" : undefined}
                                  className={`block rounded-xl px-3 py-2 text-[15px] font-semibold transition-colors hover:bg-accent/[0.06] hover:text-ink ${
                                    pathname === link.href ? "text-accent" : "text-ink/75"
                                  }`}
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
    </>
  );
}
