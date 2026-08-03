"use client";

/*
  The visual-density control for the treatment section.

  A three-way segmented control, implemented as a radiogroup so arrow keys move
  between options the way a native radio group does. The sliding indicator is a
  single absolutely-positioned pill rather than a per-button background, so the
  movement reads as one object travelling rather than three lights switching.

  Deliberately understated: this changes decoration, not content, so it should
  not look like a primary action on a page about cancer treatment.
*/

import { useRef } from "react";
import {
  TREATMENT_MODES,
  useTreatmentMode,
  type TreatmentMode,
} from "./TreatmentMode";

const LABELS: Record<TreatmentMode, { label: string; hint: string }> = {
  quiet: { label: "Quiet", hint: "Text and hairline detail only" },
  integrated: { label: "Integrated", hint: "Adds the care pathway diagram" },
  expressive: { label: "Expressive", hint: "Adds a flowing particle field" },
};

export default function ModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode, ready } = useTreatmentMode();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = TREATMENT_MODES.indexOf(mode);

  function onKeyDown(e: React.KeyboardEvent) {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next =
      (index + delta + TREATMENT_MODES.length) % TREATMENT_MODES.length;
    setMode(TREATMENT_MODES[next]);
    refs.current[next]?.focus();
  }

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <span
        id="treatment-mode-label"
        className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted"
      >
        Visual detail
      </span>

      <div
        role="radiogroup"
        aria-labelledby="treatment-mode-label"
        onKeyDown={onKeyDown}
        // Three equal columns, not flex: the labels differ in length, and with
        // flex the sliding indicator (sized at exactly one third) would drift
        // out of alignment with the segment it is meant to sit under.
        className="relative grid grid-cols-3 rounded-full border border-black/[0.07] bg-white/70 p-1 backdrop-blur-sm"
      >
        {/* sliding indicator */}
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full bg-accent/[0.09] ring-1 ring-inset ring-accent/20 transition-transform duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${TREATMENT_MODES.length})`,
            transform: `translateX(${index * 100}%)`,
            // Before hydration the stored mode isn't known yet; fading the
            // indicator in avoids it visibly jumping to the right segment.
            opacity: ready ? 1 : 0,
          }}
        />

        {TREATMENT_MODES.map((m, i) => {
          const active = m === mode;
          return (
            <button
              key={m}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              title={LABELS[m].hint}
              onClick={() => setMode(m)}
              className={`relative z-10 min-h-[36px] whitespace-nowrap rounded-full px-2 text-[13px] font-medium transition-colors duration-200 sm:px-4 ${
                active ? "text-accent" : "text-ink-muted hover:text-ink"
              }`}
            >
              {LABELS[m].label}
            </button>
          );
        })}
      </div>

      <span className="sr-only" aria-live="polite">
        {LABELS[mode].hint}
      </span>
    </div>
  );
}
