"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import BrandLogo from "./site/BrandLogo";
import DesktopNav from "./nav/DesktopNav";
import MobileNav from "./nav/MobileNav";
import SearchBar from "./nav/SearchBar";

// ─────────────────────────────────────────────────────────────────────────────
// The floating navbar pill. It owns three pieces of state — whether the page
// has scrolled, whether the drawer is open and whether search is open — and
// hands them to the three navigation components.
//
// Breakpoints: the horizontal section bar appears at xl and the drawer covers
// everything below it, so exactly one navigation is visible at every width.
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  /** A desktop mega-menu panel is open — the page behind it dims. */
  const [megaOpen, setMegaOpen] = useState(false);
  /** Focus goes back here when the drawer is dismissed with Escape. */
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // The home hero is a dark photograph and the legal pages open on a navy
  // title band, and the transparent top state puts an ink wordmark and ink
  // icons straight onto them — invisible until you scroll. There the pill is
  // solid from the first pixel. The cancer-types hub has no hero at all —
  // its picker starts right under the bar, and a transparent bar sitting on
  // working content reads as unanchored — so it gets the solid pill too.
  // Everywhere else the transparent-until-scrolled behaviour is as it was.
  const pathname = usePathname();
  const solidFromTop =
    pathname === "/" ||
    pathname === "/contact" ||
    pathname === "/specialities" ||
    pathname === "/treatments" ||
    ["/privacy", "/website-privacy", "/cookies", "/terms", "/accessibility"].includes(
      pathname,
    );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // If the viewport grows past the drawer's breakpoint the drawer would be
  // hidden by CSS while still holding the page-scroll lock — close it instead.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Search takes over the bar, so the drawer has to give way to it.
  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  // ⌘K / Ctrl+K toggles search; "/" opens it unless the visitor is already
  // typing. These live here rather than in SearchBar so they keep working while
  // that component is unmounted.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => {
          if (!open) setMenuOpen(false);
          return !open;
        });
        return;
      }
      if (
        event.key === "/" &&
        !typing &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Closing hands focus back to whichever search button is on screen, so the
  // keyboard doesn't get dropped at the top of the document.
  const dismissSearch = useCallback(() => {
    setSearchOpen(false);
    requestAnimationFrame(() => {
      const triggers = Array.from(
        document.querySelectorAll<HTMLElement>("[data-search-trigger]"),
      );
      triggers.find((el) => el.offsetParent !== null)?.focus();
    });
  }, []);

  /** Either sheet is hanging off the pill, so it squares its bottom edge. */
  const sheetOpen = megaOpen || searchOpen;


  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
      >
        {/* Dims the page while a mega-menu is open. It sits inside the header
            but below the pill's `relative z-10`, so the navbar and the open
            panel stay at full strength while everything behind them recedes. */}
        <AnimatePresence>
          {sheetOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={searchOpen ? dismissSearch : undefined}
              aria-hidden
              className={`fixed inset-0 bg-ink/40 ${megaOpen && !searchOpen ? "hidden xl:block" : ""}`}
            />
          )}
        </AnimatePresence>

        {/* relative z-10 keeps the pill — and the hamburger that closes the
            drawer — above the drawer's backdrop. */}
        <nav
          aria-label="Primary"
          // Below sm the wordmark, the gap and the two 44px buttons have to fit
          // inside a 320px viewport, so the padding and gap step down with it.
          // A one-cell grid, not a flex row: the bar content and the search
          // field are stacked in the same cell so swapping between them is a
          // pure crossfade with nothing reflowing.
          // Only colour and shadow ease. The radius and the bottom border must
          // change on the same frame the sheet appears — easing them over half
          // a second left the pill still rounded underneath an already-square
          // sheet, which is the gap that showed during the transition.
          className={`relative z-10 grid w-full max-w-[1400px] grid-cols-1 grid-rows-1 items-center px-3 py-3 transition-[background-color,box-shadow,border-color] duration-500 sm:px-5 ${
            // With a panel or the search results open the pill squares off its
            // bottom edge and drops its bottom border so the sheet beneath
            // continues the same surface, and goes solid regardless of scroll —
            // a white sheet hanging off a transparent bar would look detached.
            sheetOpen
              ? "rounded-t-[2.25rem] rounded-b-none border border-b-0 border-black/[0.06] bg-white/95 backdrop-blur-xl"
              : scrolled || menuOpen || solidFromTop
                ? "rounded-full border border-black/[0.06] bg-white/70 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl"
                : "rounded-full border border-transparent bg-transparent"
          }`}
        >
          {/* Searching takes the whole bar over: the wordmark, the sections and
              the actions step aside so the field can run the full width. */}
          <SearchBar open={searchOpen} onClose={dismissSearch} />

          <AnimatePresence initial={false}>
            {!searchOpen && (
              <motion.div
                key="bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="col-start-1 row-start-1 flex min-w-0 items-center justify-between gap-2 sm:gap-4"
              >
                <Link
                  href="/"
                  aria-label="Berkshire Oncology Partnership — home"
                  className="shrink-0"
                  onClick={closeMenu}
                >
                  <BrandLogo context="nav" />
                </Link>

                <DesktopNav onOpenChange={setMegaOpen} />

          {/* Search sits with the contact CTA rather than at the end of the
              section list, and matches its 48px height so the two read as one
              cluster of actions. */}
          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search this site"
              data-search-trigger
              // No focus ring on this site, so keyboard focus is shown by the
              // control itself: the same fill as hover, with a stronger border
              // so it still reads as focus rather than as a stray hover.
              className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/60 text-ink transition-colors hover:border-black/20 hover:bg-white focus-visible:border-ink/45 focus-visible:bg-white"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <Button href="/contact" variant="primary" arrow>
              Contact us
            </Button>
          </div>

          <div className="flex shrink-0 items-center gap-2 xl:hidden">
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search this site"
              // Marks this as a place the search overlay can hand focus back to
              // when whatever opened it has since unmounted.
              data-search-trigger
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 text-ink transition-colors hover:bg-white focus-visible:border-ink/45 focus-visible:bg-white"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10.5 10.5L14 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 transition-colors focus-visible:border-ink/45 focus-visible:bg-white"
            >
              <span className="flex flex-col gap-1.5">
                <span
                  className={`h-0.5 w-5 bg-ink transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
                />
                <span
                  className={`h-0.5 w-5 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`}
                />
                <span
                  className={`h-0.5 w-5 bg-ink transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
                />
              </span>
            </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <MobileNav
          open={menuOpen}
          onClose={closeMenu}
          onOpenSearch={openSearch}
          triggerRef={menuButtonRef}
        />
      </motion.header>
    </>
  );
}
