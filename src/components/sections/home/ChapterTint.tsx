"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// The page's colour for the "Cancers we treat" chapter.
//
// The colour is a fixed, viewport-sized sheet behind every other element, not a
// block inside the section — so it fills the whole page while the chapter is on
// screen, exactly as the reference does, with no edge sliding past anything.
// The section still decides *when*; it just no longer owns the shape.
//
// That means two elements: an anchor that lives inside the section so the
// observer has something local to find the heading from, and the sheet itself,
// portalled to the body so it clears the section's box and stacking context.
//
// An IntersectionObserver rather than a scroll handler: Lenis preventDefaults
// the wheel and scrolls the document itself, so scroll-derived values lag its
// smoothing. The observer fires only at the boundaries and costs nothing per
// frame.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The chapter colours. Two of them, one per chapter, so the home page's two
 * washes read as different rooms rather than the same trick twice. Sage goes
 * to "Cancers we treat" and gold to "Patient feedback" — the cooler colour
 * under a list of diagnoses, the warmer one under people's own words.
 *
 * Both are light enough that navy ink on them clears WCAG AA for body text
 * several times over (gold ~11:1, sage ~9.5:1). Named here rather than typed
 * into each section so the two cannot drift apart.
 */
export const CHAPTER_GOLD = "#f3dca2";
/** Matches the patients hero panel and its closing band. */
export const CHAPTER_SAGE = "#c8d6cf";

export default function ChapterTint({ colour }: { colour: string }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [speed, setSpeed] = useState<string | null>(null);

  // Read after mount, not during render, so the server and first client render
  // agree. Nothing sets ?speed= in normal use — it is left in so the timing can
  // still be compared against the reference without a rebuild.
  useEffect(() => {
    setMounted(true);
    const q = new URLSearchParams(window.location.search).get("speed");
    if (q && /^\d+(\.\d+)?$/.test(q)) setSpeed(q);
  }, []);

  // Runs after `mounted` flips, so the portalled sheet exists by the time the
  // observer starts writing to it.
  useEffect(() => {
    const anchor = anchorRef.current;
    const sheet = sheetRef.current;
    if (!anchor || !sheet) return;

    const heading = anchor.parentElement?.querySelector("h2");
    if (!heading) return;

    // The heading owns both ends: the colour arrives when "Cancers we treat" is
    // on screen and leaves when it is not. No rootMargin, so visible means
    // visible rather than nearly.
    //
    // Note this behaves differently across the breakpoint, because the heading
    // does: on desktop it is sticky and holds in view for the whole chapter, so
    // the colour lasts as long as the cards do. On mobile it is static and
    // scrolls away with the text, so the colour starts draining once you are
    // past it and into the cards below.
    const io = new IntersectionObserver(
      ([entry]) => {
        sheet.dataset.lit = String(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    io.observe(heading);
    return () => io.disconnect();
  }, [mounted]);

  return (
    <>
      {/* Zero-height marker inside the section. Its only job is to give the
          observer a route to the section's heading. */}
      <div ref={anchorRef} aria-hidden className="hidden" />

      {mounted &&
        createPortal(
          // Fixed and behind everything: the colour fills the viewport for as
          // long as the chapter holds, rather than scrolling past as a band.
          // Negative z-index puts it under all content but still above the
          // canvas, so the page's own background shows through at opacity 0.
          <div
            ref={sheetRef}
            aria-hidden
            data-lit="false"
            className="chapter-tint fixed inset-0 -z-10"
            style={
              {
                backgroundColor: colour,
                ...(speed ? { "--tint-ms": `${speed}s` } : {}),
              } as React.CSSProperties
            }
          />,
          document.body,
        )}
    </>
  );
}
