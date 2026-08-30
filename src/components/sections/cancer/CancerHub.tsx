"use client";

import { useState } from "react";
import Link from "next/link";
import { specialityIcon } from "@/components/site/SpecialityIcons";
import SpecialityIndex, { type IndexItem } from "../specialities/SpecialityIndex";
import CancerGraphic from "@/components/graphic/CancerGraphic";
import { GraphicModeToggle } from "@/components/graphic/GraphicMode";
import type { CareMapData } from "@/components/graphic/CareMap";
import Reveal from "@/components/ui/Reveal";

export interface HubEntry {
  slug: string;
  title: string;
  count: number;
}

export interface HubGroup {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  entries: HubEntry[];
  /** Distinct consultants across the whole group — NOT the sum of the entry
   *  counts. Bladder and Kidney are treated by the same three people; adding
   *  the two pages together would advertise six. */
  consultants: { name: string; slug: string }[];
  /** Shown apart from the main grid, with its own explanation. */
  unlisted?: boolean;
}

function consultantLine(group: HubGroup) {
  const n = group.consultants.length;
  if (n === 0) return "No consultant currently listed";
  return `${n} consultant${n === 1 ? "" : "s"}`;
}

/** "Dr Joss Adams" → "Adams", so a card can name five people without wrapping. */
function surname(name: string) {
  const parts = name.replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, "").split(/\s+/);
  return parts[parts.length - 1];
}

function GroupCard({ group }: { group: HubGroup }) {
  const Icon = specialityIcon[group.icon];
  const single = group.entries.length === 1;
  const primaryHref = `/specialities/${group.entries[0].slug}`;

  const inner = (
    <>
      <div className="flex items-start gap-4">
        {Icon && (
          <span
            aria-hidden
            className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl ${
              group.unlisted
                ? "bg-ink/[0.04] text-ink-muted"
                : "bg-accent/[0.07] text-accent"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="type-compact-title leading-tight text-ink">
            {group.label}
          </h3>
          <p className="type-supporting mt-1 text-ink-muted">
            {consultantLine(group)}
          </p>
        </div>
        {single && (
          <span
            aria-hidden
            className="mt-1 flex-none text-ink-muted/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
          >
            →
          </span>
        )}
      </div>

      <p className="type-supporting mt-4 text-ink/75">
        {group.blurb}
      </p>

      {/* Naming the consultants on the card is the fastest answer to the
          question people actually arrive with: who would I see? Pushed to the
          bottom of the card so the line sits on a shared baseline across a row
          however long the description above it runs. */}
      {group.consultants.length > 0 && (
        <p className="type-supporting mt-auto pt-6 text-ink-muted">
          <span className="text-ink/55">Treated by </span>
          {group.consultants.map((c) => surname(c.name)).join(" · ")}
        </p>
      )}
    </>
  );

  // A group covering one cancer type is one destination, so the whole card is
  // the link. A group covering two is not — making the card link to only one of
  // them would quietly hide the other, so those get explicit links instead.
  if (single) {
    return (
      <Link
        href={primaryHref}
        className="card-soft group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="card-soft flex h-full flex-col p-6 md:p-7">
      {inner}
      <ul className="mt-4 flex flex-wrap gap-2">
        {group.entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/specialities/${e.slug}`}
              className="type-button inline-flex min-h-[40px] items-center rounded-full border border-ink/12 px-4 text-ink transition-colors hover:border-accent/45 hover:bg-accent/[0.05] hover:text-accent"
            >
              {e.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CancerHub({
  groups,
  unlisted,
  indexItems,
  mapData,
}: {
  groups: HubGroup[];
  unlisted: HubGroup;
  indexItems: IndexItem[];
  mapData: CareMapData;
}) {
  const [view, setView] = useState<"grouped" | "az">("grouped");

  return (
    <div>
      {/* ── how the site is wired, in whichever style the reader prefers ── */}
      <section className="container-wide pt-10 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink-muted" /> How care is joined up
            </span>
            <p className="type-body mt-4 text-ink/80">
              Every cancer type on this page connects to the consultants who
              treat it, the treatments they provide, and the places those
              treatments happen. Radiotherapy only happens at two of our
              centres — the map shows where.
            </p>
          </div>
          <GraphicModeToggle />
        </div>

        <CancerGraphic data={mapData} className="mt-8 md:mt-10" />
      </section>

      {/* ── the directory ── */}
      <section className="container-wide pb-24 pt-16 md:pb-32 md:pt-20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.07] pb-5">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            Find your cancer type
          </h2>
          <div
            role="tablist"
            aria-label="How to browse cancer types"
            className="inline-flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-white p-1"
          >
            {(
              [
                ["grouped", "By type"],
                ["az", "A–Z"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                onClick={() => setView(key)}
                className={`type-button rounded-full px-4 py-1.5 transition-colors ${
                  view === key
                    ? "bg-ink text-white"
                    : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {view === "grouped" ? (
          <>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
              {groups.map((g, i) => (
                <Reveal key={g.id} delay={Math.min(i, 6)} as="li" className="h-full">
                  <GroupCard group={g} />
                </Reveal>
              ))}
            </ul>

            {/* A container for the sarcoma card, not an aside — so it takes a
                plain tinted panel rather than the accented left rule the site
                uses for genuine callouts. */}
            <div className="mt-12 rounded-3xl border border-black/[0.06] bg-canvas-soft/60 p-6 md:p-7">
              <h3 className="font-display text-lg text-ink md:text-xl">
                Not treated by the partnership
              </h3>
              <p className="type-supporting mt-2 max-w-2xl text-ink/75">
                We list this so nobody is left guessing. If you need care for it,
                the practice can point you towards a centre that provides it.
              </p>
              <div className="mt-5 max-w-md">
                <GroupCard group={unlisted} />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <SpecialityIndex items={indexItems} />
          </div>
        )}
      </section>
    </div>
  );
}
