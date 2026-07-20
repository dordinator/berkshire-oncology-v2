"use client";

/*
  ConsultantsExplorer — the consultants page shell: a sticky left sidebar
  (heading + "filter by cancer type" + help card) beside the winding
  ConsultantTrail on the right. Selecting cancer types rebuilds the trail to
  just the consultants who treat them (multi-select, OR).
*/

import { useState } from "react";
import Link from "next/link";
import ConsultantTrail, { type TrailConsultant } from "./ConsultantTrail";
import { site } from "@/content/site";

export type FilterOption = {
  slug: string;
  name: string;
  title: string;
  count: number;
};

const VISIBLE = 8; // filters shown before "View all cancer types"

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConsultantsExplorer({
  consultants,
  filters,
}: {
  consultants: TrailConsultant[];
  filters: FilterOption[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const filtered =
    selected.size === 0
      ? consultants
      : consultants.filter((c) =>
          c.specialities.some((s) => selected.has(s.slug))
        );

  const toggle = (slug: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const shown = showAll ? filters : filters.slice(0, VISIBLE);

  return (
    <div className="grid gap-12 xl:grid-cols-[330px_1fr] xl:gap-16">
      {/* ── sidebar ── */}
      <aside className="xl:sticky xl:top-28 xl:self-start">
        <span className="eyebrow">
          <span className="h-px w-8 bg-ink-muted" /> Our consultants
        </span>
        <h1 className="heading-lg mt-5">
          Meet our <span className="text-gradient">consultants.</span>
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-muted">
          Filter by cancer type to find the consultant who specialises in your
          diagnosis.
        </p>

        {/* filter */}
        <div className="mt-8 border-t border-black/[0.08] pt-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-ink"
              aria-expanded={open}
            >
              Filter by cancer type
              <svg
                className={`h-4 w-4 text-ink-muted transition-transform duration-300 ${
                  open ? "" : "-rotate-90"
                }`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {selected.size > 0 && (
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs font-medium text-accent hover:underline"
              >
                Clear ({selected.size})
              </button>
            )}
          </div>

          {open && (
            <>
              <ul className="mt-4 space-y-1">
                {shown.map((f) => {
                  const active = selected.has(f.slug);
                  return (
                    <li key={f.slug}>
                      <button
                        type="button"
                        onClick={() => toggle(f.slug)}
                        aria-pressed={active}
                        className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "border-accent/40 bg-accent/[0.06] text-accent"
                            : "border-transparent text-ink/80 hover:bg-canvas-soft"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-[5px] border transition-colors ${
                              active
                                ? "border-accent bg-accent text-white"
                                : "border-black/20"
                            }`}
                          >
                            {active && (
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2.5 6.5l2.5 2.5 4.5-5"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          {f.name} cancer
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            active
                              ? "bg-accent/15 text-accent"
                              : "bg-canvas-soft text-ink-muted"
                          }`}
                        >
                          {f.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {filters.length > VISIBLE && (
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  className="mt-3 text-sm font-medium text-accent hover:underline"
                >
                  {showAll ? "Show fewer" : "View all cancer types"}
                </button>
              )}
            </>
          )}
        </div>

        {/* help card */}
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-accent/15 bg-accent/[0.04] p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <PhoneIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Need help choosing?
            </p>
            <p className="text-[13px] text-ink-muted">
              Our team is here to help. Call us on{" "}
              <a
                href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                className="font-medium text-accent hover:underline"
              >
                {site.contact.phone}
              </a>
            </p>
          </div>
        </div>
      </aside>

      {/* ── trail ── */}
      <div>
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-black/[0.06] bg-white p-10 text-center text-ink-muted">
            No consultants match that selection.{" "}
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="font-medium text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ConsultantTrail items={filtered} />
        )}
      </div>
    </div>
  );
}
