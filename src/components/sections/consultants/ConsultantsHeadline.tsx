"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// The band above the focus strip: one big statement, a hairline, and a quiet
// steer. Three candidate headlines behind a review toggle — the choice is
// about the words earning the width they are set at, so each is judged in
// place at full size. Delete the toggle and hard-code the winner once picked.
//
// Every candidate is factual: ten consultants and eighteen cancer types are
// counts from the content data, and the third line paraphrases the home
// page's own "start from your own diagnosis" copy.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = "bop-consultants-copy";

const VARIANTS = [
  {
    id: "a",
    label: "A",
    heading: "Ten consultants. Different expertise. One partnership.",
  },
  {
    id: "b",
    label: "B",
    heading: "Ten consultants. Eighteen cancer types. One partnership.",
  },
  {
    id: "c",
    label: "C",
    heading: "Begin with your diagnosis — it points to the consultants who treat it.",
  },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

export default function ConsultantsHeadline() {
  const [variant, setVariant] = useState<VariantId>("a");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "a" || saved === "b" || saved === "c") setVariant(saved);
  }, []);

  const pick = (id: VariantId) => {
    setVariant(id);
    window.localStorage.setItem(KEY, id);
  };

  const current = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
      <h1 className="max-w-3xl font-display text-[clamp(2.6rem,4.6vw,4.8rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
        {current.heading}
      </h1>

      <div className="lg:border-l lg:border-[#c8992f]/50 lg:pl-8">
        <p className="max-w-sm text-base leading-relaxed text-ink-muted lg:pb-2">
          Browse the partnership, or begin with the cancer type or treatment
          you already know.
        </p>

        {/* Copy review toggle — remove once a headline is chosen. */}
        <div className="mt-4 inline-flex overflow-hidden rounded-full border border-ink/10 bg-white/80 text-[10px] font-medium uppercase tracking-[0.1em]">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => pick(v.id)}
              aria-pressed={variant === v.id}
              className={`px-2.5 py-1 transition-colors ${
                variant === v.id
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Copy {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
