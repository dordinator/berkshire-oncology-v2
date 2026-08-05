"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  search,
  searchIndex,
  kindLabels,
  type SearchEntry,
  type SearchKind,
} from "@/content/searchIndex";

// ─────────────────────────────────────────────────────────────────────────────
// Find a specific resource — the page's one navy interlude, styled for ink.
//
// Wired to the SITE-WIDE index rather than to the nine /resources pages, which
// is the decision that stops this section being a second pass over the same
// list. The pathways above answer "what is my situation"; this answers "I know
// the word I'm looking for" — a cancer type, a drug, a consultant's name, a
// hospital. Different questions, different machinery.
//
// No results are shown until something is typed or a chip is pressed. An
// unprompted list of everything is not a search result, it is another index,
// and the page already has one above.
// ─────────────────────────────────────────────────────────────────────────────

const CHIPS: { kind: SearchKind; label: string }[] = [
  { kind: "cancer", label: "Cancer types" },
  { kind: "treatment", label: "Treatments" },
  { kind: "consultant", label: "Consultants" },
  { kind: "location", label: "Where we see you" },
];

export default function ResourceSearch() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | null>(null);

  const results = useMemo<SearchEntry[]>(() => {
    const trimmed = query.trim();
    if (!trimmed && !kind) return [];
    const pool = trimmed ? search(trimmed, 40) : searchIndex;
    const filtered = kind ? pool.filter((e) => e.kind === kind) : pool;
    return filtered.slice(0, 12);
  }, [query, kind]);

  const active = query.trim().length > 0 || kind !== null;

  return (
    <div className="container-wide">
      <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
        <div>
          <span className="eyebrow text-[#c8992f]">Find a specific resource</span>
          <h2 className="display-section mt-6 text-white">
            Or search for the thing you already know the name of.
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/65">
            A cancer type, a treatment, a consultant, or one of the hospitals we
            work from.
          </p>
        </div>

        <div>
          <label htmlFor="resource-search-field" className="sr-only">
            Search the site
          </label>
          <input
            id="resource-search-field"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “prostate”, “radiotherapy”, “Windsor”…"
            className="w-full border-b border-white/30 bg-transparent pb-3 text-[19px] text-white outline-none transition-colors placeholder:text-white/45 focus:border-[#c8992f]"
          />

          <div className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((chip) => {
              const on = kind === chip.kind;
              return (
                <button
                  key={chip.kind}
                  type="button"
                  onClick={() => setKind(on ? null : chip.kind)}
                  aria-pressed={on}
                  className={`min-h-[40px] rounded-full px-4 text-[14px] font-medium transition-colors ${
                    on
                      ? "bg-white text-ink"
                      : "bg-white/[0.08] text-white/80 hover:bg-white/[0.16]"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Only announced once there is something to announce. aria-live on a
              permanently-rendered count would read out on every keystroke. */}
          <div aria-live="polite" className="sr-only">
            {active ? `${results.length} results` : ""}
          </div>

          {active && (
            <ul className="mt-8">
              {results.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    className="group flex min-h-[56px] items-center gap-4 border-b border-white/10 py-3"
                  >
                    <span className="flex-1">
                      <span className="block text-[16px] leading-snug text-white transition-colors group-hover:text-[#e8c983]">
                        {entry.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-white/50">
                        {kindLabels[entry.kind]}
                        {entry.subtitle ? ` · ${entry.subtitle}` : ""}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 text-white/50 transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
              {results.length === 0 && (
                <li className="py-4 text-[15px] leading-relaxed text-white/70">
                  Nothing matched that. The practice team can point you to the
                  right place —{" "}
                  <Link
                    href="/contact"
                    className="text-[#e8c983] underline-offset-2 hover:underline"
                  >
                    contact us
                  </Link>
                  .
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
