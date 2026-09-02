"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isSectionActive, navSections } from "@/content/navigation";
import { getLenis } from "@/components/SmoothScroll";
import { site } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────
// The drawer. Around nine in ten visitors arrive on a phone, so this is the
// primary navigation for the site, not a fallback for the desktop bar.
//
// Keep the compact menu flat: every primary section is a direct link. Detailed
// section navigation belongs on the destination page, where it has enough
// context and space to be useful.
//
// The toggle button itself lives in Navbar, inside the floating pill; this
// component owns the panel and everything in it.
// ─────────────────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

export default function MobileNav({
  open,
  onClose,
  onOpenSearch,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  /** The hamburger that opened the drawer, so Escape can hand focus back. */
  triggerRef?: RefObject<HTMLButtonElement>;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Kept in a ref so the route-change and Escape effects never need onClose in
  // their dependency lists (a new identity each render would re-fire them).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const triggerRefRef = useRef(triggerRef);
  triggerRefRef.current = triggerRef;

  // Close on route change.
  useEffect(() => {
    onCloseRef.current();
  }, [pathname]);

  // Close on Escape, and hand focus back to the hamburger — otherwise focus
  // resets to <body> and the next Tab restarts from the top of the document.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onCloseRef.current();
      triggerRefRef.current?.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock the page behind the drawer. Two things are needed: the class stops
  // native scrolling, and stopping Lenis stops the programmatic kind — with
  // smoothWheel on, Lenis preventDefaults the wheel event and scrolls the
  // document itself, which `overflow: hidden` does nothing about. Phones scroll
  // natively (syncTouch is off) but anything with a trackpad under 1280px —
  // an iPad, a narrowed laptop window — would scroll the page behind the open
  // drawer. The drawer's own scroller is data-lenis-prevent, below.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add("overflow-hidden");
    getLenis()?.stop();
    return () => {
      root.classList.remove("overflow-hidden");
      getLenis()?.start();
    };
  }, [open]);

  /** Keep Tab inside the drawer while it is open. */
  function onPanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href]:not([tabindex="-1"]), button:not([disabled])',
      ),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Tapping outside a drawer is the near-universal way to dismiss one.
              Without a scrim the tap fell through to whatever link sat behind
              it and navigated instead. */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-0 bg-ink/25 xl:hidden"
          />

          <motion.div
            key="panel"
            ref={panelRef}
            onKeyDown={onPanelKeyDown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            id="site-mobile-menu"
            data-lenis-prevent
            // top-[5.5rem] clears the pill, whose bottom edge sits at 86px
            // (16 top padding + 1 border + 12 + 44 + 12 + 1).
            //
            // The height is measured in svh, not vh: on mobile Safari and
            // Chrome `100vh` is the *large* viewport with the toolbars
            // retracted, so an 80vh panel ran past the bottom of the visible
            // screen and its last rows — Contact us and the phone number —
            // could never be scrolled into view.
            className="absolute inset-x-4 top-[5.5rem] z-20 max-h-[calc(100svh_-_7rem)] overflow-y-auto overscroll-contain rounded-3xl border border-black/[0.06] bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_28px_80px_-24px_rgba(6,28,70,0.3)] backdrop-blur-xl xl:hidden"
          >
          <nav aria-label="Site menu">
            <button
              type="button"
              onClick={onOpenSearch}
              className="mb-2 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-black/[0.07] bg-canvas-soft/70 px-4 text-left text-[15px] text-ink-muted transition-colors hover:border-black/15"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Search consultants, cancers, treatments
            </button>

            <ul className="mt-1">
              {navSections.map((section) => {
                const sectionActive = isSectionActive(section, pathname);

                return (
                  <li key={section.id} className="border-t border-black/[0.05]">
                    <Link
                      href={section.href}
                      onClick={onClose}
                      aria-current={pathname === section.href ? "page" : undefined}
                      className={`flex min-h-[52px] items-center rounded-2xl px-4 text-[15px] font-medium transition-colors hover:bg-ink/[0.04] ${
                        sectionActive ? "text-accent" : "text-ink"
                      }`}
                    >
                      {section.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 border-t border-black/[0.05] pt-3">
              <Link
                href="/contact"
                onClick={onClose}
                className="ink-cta flex min-h-[52px] items-center justify-center rounded-full px-4 text-[15px] font-medium"
              >
                Contact us
              </Link>
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="mt-2 flex min-h-[48px] items-center justify-center rounded-full border border-black/[0.08] px-4 text-[15px] text-ink transition-colors hover:bg-ink/[0.03]"
              >
                Call {site.contact.phone}
              </a>
            </div>
          </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
