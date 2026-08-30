"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  kindLabels,
  kindOrder,
  popularEntries,
  search,
  type SearchEntry,
  type SearchKind,
} from "@/content/searchIndex";
import {
  followHomepageLinkFromKeyboard,
  HOME_RETURN_UI_EVENT,
  type HomeReturnUiEventDetail,
  type HomeUiSnapshot,
} from "@/components/site/HomepageReturnState";

// ─────────────────────────────────────────────────────────────────────────────
// Site search, as an extension of the navbar rather than a dialog over it.
//
// The field expands along the bar from where the search button was, and the
// results continue downward on the same surface as the mega-menu panels. There
// is no modal, no backdrop of its own and no focus trap: the page is still
// there, just dimmed, and clicking it closes the search.
//
// Rendered only while open. The ⌘K / "/" shortcuts live in Navbar so they keep
// working when this component is unmounted.
// ─────────────────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;
const RESULT_LIMIT = 12;

interface ResultGroup {
  label: string;
  entries: SearchEntry[];
}

function groupResults(query: string, results: SearchEntry[]): ResultGroup[] {
  if (!query) return [{ label: "Popular", entries: results }];

  const byKind = new Map<SearchKind, SearchEntry[]>();
  for (const entry of results) {
    const bucket = byKind.get(entry.kind);
    if (bucket) bucket.push(entry);
    else byKind.set(entry.kind, [entry]);
  }
  return kindOrder
    .filter((kind) => byKind.has(kind))
    .map((kind) => ({ label: kindLabels[kind], entries: byKind.get(kind) ?? [] }));
}

// The component stays mounted and animates on `open`. It cannot be swapped in
// and out by a parent <AnimatePresence>, because it renders two siblings — the
// field inside the pill and the sheet below it — and AnimatePresence can only
// track a single keyed motion child per branch.
export default function SearchBar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRestoreRef = useRef<HomeUiSnapshot | null>(null);
  const applyingRestoreRef = useRef(false);

  // The full placeholder needs 357px and a 375px phone leaves the field 221px,
  // so it was being clipped mid-word ("…cancer ty") — which reads as a broken
  // render rather than as truncation. text-overflow can't fix it: Chrome doesn't
  // apply it to ::placeholder. So the hint is shortened where it doesn't fit;
  // the Popular list directly below already shows the full breadth of what's
  // searchable. Measured, not guessed: the short form is 159px, clear even at
  // 320px.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const update = () => setCompact(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const trimmed = query.trim();
  const groups = useMemo(
    () => groupResults(trimmed, trimmed ? search(trimmed, RESULT_LIMIT) : popularEntries),
    [trimmed],
  );
  /** Flattened in render order, so ↑/↓ follow what the eye sees. */
  const flat = useMemo(() => groups.flatMap((group) => group.entries), [groups]);
  /** Each group's starting position in the flat list, so a row can name its own
   *  index without counting during render. */
  const groupOffsets = useMemo(() => {
    let offset = 0;
    return groups.map((group) => {
      const start = offset;
      offset += group.entries.length;
      return start;
    });
  }, [groups]);

  // Focus the field, and normally start from a clean query. A Back restoration
  // supplies the saved query and highlighted result instead.
  useEffect(() => {
    if (!open) return;
    const restored = pendingRestoreRef.current;
    if (restored) {
      applyingRestoreRef.current = true;
      pendingRestoreRef.current = null;
      setQuery(restored.searchQuery);
      setActiveIndex(restored.searchActiveIndex);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
      applyingRestoreRef.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    const onRestore = (event: Event) => {
      const { ui, viewportMatches } = (
        event as CustomEvent<HomeReturnUiEventDetail>
      ).detail;
      const restored = viewportMatches && ui.searchOpen ? ui : null;
      pendingRestoreRef.current = restored;
      if (restored && open) {
        applyingRestoreRef.current = true;
        pendingRestoreRef.current = null;
        setQuery(restored.searchQuery);
        setActiveIndex(restored.searchActiveIndex);
        requestAnimationFrame(() => {
          applyingRestoreRef.current = false;
        });
      }
    };
    window.addEventListener(HOME_RETURN_UI_EVENT, onRestore);
    return () => window.removeEventListener(HOME_RETURN_UI_EVENT, onRestore);
  }, [open]);

  // Close on route change, including after Enter navigates.
  useEffect(() => {
    onCloseRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // A new query means a new list — highlight its first row.
  useEffect(() => {
    if (applyingRestoreRef.current) return;
    setActiveIndex(0);
  }, [trimmed]);

  // Keep the highlighted row visible.
  useEffect(() => {
    document.getElementById(`search-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flat]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (flat.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter") {
      const entry = flat[activeIndex];
      if (!entry) return;
      event.preventDefault();
      const result = document.getElementById(
        `search-option-${activeIndex}`,
      ) as HTMLAnchorElement | null;
      if (result) followHomepageLinkFromKeyboard(result, inputRef.current);
    }
  }

  return (
    <>
      {/* The field, expanding along the bar from the search button's position. */}
      <AnimatePresence initial={false}>
        {open && (
      <motion.div
        key="field"
        // Opacity only. Animating max-width made the browser re-lay-out the
        // whole bar on every frame, which is what made this stutter; the field
        // and the bar content share one grid cell instead, so the swap is a
        // crossfade with no reflow at all.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: EASE }}
        className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 pl-2"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-5 w-5 shrink-0 text-ink-muted"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        <label htmlFor="site-search-input" className="sr-only">
          Search the site
        </label>
        <input
          ref={inputRef}
          id="site-search-input"
          type="text"
          role="combobox"
          // Tracks whether the popup is on screen, not whether it found
          // anything. These used to be driven by flat.length, so with no
          // matches a screen reader was told the combobox was collapsed and
          // aria-controls pointed at an id that wasn't rendered — while the
          // panel was visibly open saying "No matches for …".
          aria-expanded={open}
          aria-controls={flat.length ? "site-search-results" : undefined}
          aria-autocomplete="list"
          aria-activedescendant={flat.length ? `search-option-${activeIndex}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder={
            compact
              ? "Search consultants…"
              : "Search consultants, cancer types, treatments…"
          }
          // 16px keeps iOS from zooming the page on focus. The placeholder runs
          // at full ink-muted — it is the only instruction on screen.
          className="min-w-0 flex-1 bg-transparent py-1 text-[16px] text-ink outline-none placeholder:text-ink-muted"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.05] hover:text-ink focus-visible:bg-ink/[0.08] focus-visible:text-ink"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Results continue the pill downward — same surface as a mega-menu panel. */}
      <AnimatePresence initial={false}>
        {open && (
      <motion.div
        key="sheet"
        // Grows down out of the pill, matching the mega-menu panels — a spring
        // so it settles rather than arriving at a machined constant rate.
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0, transition: { duration: 0.16, ease: EASE } }}
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 0.9 }}
        className="absolute -left-px -right-px top-full z-50 overflow-hidden"
      >
        <div
          data-lenis-prevent
          data-home-return-overlay-scroll="search-results"
          className="max-h-[calc(100svh_-_9rem)] w-full overflow-y-auto overscroll-contain rounded-b-[2.25rem] border border-t-0 border-black/[0.06] bg-white/95 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_28px_80px_-24px_rgba(6,28,70,0.28)] backdrop-blur-xl sm:px-6"
        >
          <div className="mx-auto w-full max-w-3xl">
            {flat.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <p className="text-[15px] text-ink">No matches for &ldquo;{trimmed}&rdquo;.</p>
                <p className="mt-2 text-sm text-ink-muted">
                  Try a cancer type, a treatment or a consultant&rsquo;s name. You can also ask us
                  directly.
                </p>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-ink"
                >
                  Contact the practice
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            ) : (
              <div id="site-search-results" role="listbox" aria-label="Search results">
                {groups.map((group, groupIndex) => (
                  <div
                    key={group.label}
                    role="group"
                    aria-label={group.label}
                    className="mb-1 last:mb-0"
                  >
                    <p
                      aria-hidden="true"
                      className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted"
                    >
                      {group.label}
                    </p>
                    {group.entries.map((entry, entryIndex) => {
                      const index = groupOffsets[groupIndex] + entryIndex;
                      const isActive = index === activeIndex;
                      return (
                        <Link
                          key={entry.id}
                          id={`search-option-${index}`}
                          role="option"
                          aria-selected={isActive}
                          tabIndex={-1}
                          href={entry.href}
                          onClick={onClose}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`block rounded-2xl px-3 py-2.5 transition-colors ${
                            isActive ? "bg-accent/[0.08]" : ""
                          }`}
                        >
                          <span
                            className={`block text-[15px] font-medium ${
                              isActive ? "text-accent" : "text-ink"
                            }`}
                          >
                            {entry.title}
                          </span>
                          {entry.subtitle && (
                            <span className="mt-0.5 line-clamp-1 block text-xs text-ink-muted">
                              {entry.subtitle}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 hidden items-center gap-4 border-t border-black/[0.05] px-3 pt-3 text-[11px] text-ink-muted sm:flex">
              <span>
                <kbd className="rounded border border-black/10 px-1 py-0.5 font-sans">↑</kbd>{" "}
                <kbd className="rounded border border-black/10 px-1 py-0.5 font-sans">↓</kbd> to
                move
              </span>
              <span>
                <kbd className="rounded border border-black/10 px-1 py-0.5 font-sans">Enter</kbd>{" "}
                to open
              </span>
              <span>
                <kbd className="rounded border border-black/10 px-1 py-0.5 font-sans">Esc</kbd> to
                close
              </span>
            </div>
          </div>
        </div>
      </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
