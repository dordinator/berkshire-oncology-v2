"use client";

import { useEffect, useRef, useState } from "react";

type SpacingPreset = "compact" | "balanced" | "spacious";

const STORAGE_KEY = "bop:consultant-section-spacing";
const DEFAULT_PRESET: SpacingPreset = "balanced";

const PRESETS: { value: SpacingPreset; label: string; note: string }[] = [
  { value: "compact", label: "Compact", note: "Tighter transitions" },
  { value: "balanced", label: "Balanced", note: "Recommended rhythm" },
  { value: "spacious", label: "Spacious", note: "More breathing room" },
];

function isSpacingPreset(value: string | null): value is SpacingPreset {
  return PRESETS.some((preset) => preset.value === value);
}

export default function ConsultantSpacingControl() {
  const controlRef = useRef<HTMLFieldSetElement>(null);
  const [preset, setPreset] = useState<SpacingPreset>(DEFAULT_PRESET);

  function updateProfile(nextPreset: SpacingPreset) {
    const profile = controlRef.current?.closest<HTMLElement>(
      "[data-consultant-profile]",
    );
    if (profile) profile.dataset.sectionSpacing = nextPreset;
  }

  useEffect(() => {
    try {
      const storedPreset = window.localStorage.getItem(STORAGE_KEY);
      if (isSpacingPreset(storedPreset)) {
        setPreset(storedPreset);
        updateProfile(storedPreset);
      }
    } catch {
      // The review control still works when storage is unavailable.
    }
  }, []);

  function choosePreset(nextPreset: SpacingPreset) {
    setPreset(nextPreset);
    updateProfile(nextPreset);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextPreset);
    } catch {
      // Keep the in-page choice even when storage is unavailable.
    }
  }

  const current = PRESETS.find((option) => option.value === preset);

  return (
    <fieldset
      ref={controlRef}
      data-copy-editor-ignore
      className="fixed bottom-3 left-3 z-[200] rounded-2xl border border-ink/10 bg-white/90 p-2 text-ink shadow-[0_12px_38px_-14px_rgba(6,28,70,0.4)] backdrop-blur-md md:bottom-5 md:left-5 md:p-3"
    >
      <legend className="px-1 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        Section spacing
      </legend>
      <div className="mt-1 flex gap-1 md:mt-1.5">
        {PRESETS.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name="consultant-section-spacing"
              value={option.value}
              aria-label={option.label}
              checked={preset === option.value}
              onChange={() => choosePreset(option.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-8 min-w-8 items-center justify-center rounded-lg bg-ink/[0.06] px-2 text-[12px] font-medium transition-colors hover:bg-ink/[0.12] peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 md:px-2.5">
              <span className="md:hidden">{option.label.slice(0, 1)}</span>
              <span className="hidden md:inline">{option.label}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 hidden px-1 text-[11px] leading-none text-ink-muted md:block">
        {current?.note}
      </p>
    </fieldset>
  );
}
