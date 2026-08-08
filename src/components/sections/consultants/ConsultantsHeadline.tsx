"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// The band above the focus strip. The headline is settled — three stacked
// lines — and the right-hand column is under review: three candidate
// treatments behind a toggle, judged in place at full size. Hard-code the
// winner and delete the toggle once picked.
//
//   A · Steer    — the quiet paragraph beside the gold hairline
//   B · Links    — begin-with routes, echoing the reference's nav tabs
//   C · Figures  — the partnership in three verifiable numbers
// ─────────────────────────────────────────────────────────────────────────────

const KEY = "bop-consultants-right";

const LINES = ["Ten consultants.", "Different expertise.", "One partnership."];

type PanelId = "a" | "b" | "c";

export interface HeadlineFigures {
  consultants: number;
  cancerTypes: number;
  sites: number;
}

function SteerPanel() {
  return (
    <p className="max-w-sm text-[15px] leading-relaxed text-ink-muted">
      Browse the partnership, or begin with the cancer type or treatment you
      already know.
    </p>
  );
}

function LinksPanel() {
  const links = [
    { label: "By cancer type", href: "/consultants/by-cancer-type" },
    { label: "By treatment", href: "/consultants/by-treatment" },
    { label: "A–Z directory", href: "#directory" },
  ];
  return (
    <nav aria-label="Find a consultant" className="max-w-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
        Begin with
      </p>
      <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex items-center justify-between py-2.5 text-[15px] text-ink transition-colors hover:text-accent focus-visible:text-accent"
            >
              {l.label}
              <span
                aria-hidden
                className="text-[#c8992f] transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FiguresPanel({ figures }: { figures: HeadlineFigures }) {
  const rows = [
    { n: figures.consultants, label: "consultant oncologists" },
    { n: figures.cancerTypes, label: "cancer types treated" },
    { n: figures.sites, label: "hospitals across the region" },
  ];
  return (
    <dl className="flex max-w-sm gap-8">
      {rows.map((r) => (
        <div key={r.label}>
          <dd className="font-display text-3xl text-ink" style={{ fontWeight: 500 }}>
            {r.n}
          </dd>
          <dt className="mt-1 text-[12.5px] leading-snug text-ink-muted">
            {r.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

export default function ConsultantsHeadline({
  figures,
}: {
  figures: HeadlineFigures;
}) {
  const [panel, setPanel] = useState<PanelId>("a");

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "a" || saved === "b" || saved === "c") setPanel(saved);
  }, []);

  const pick = (id: PanelId) => {
    setPanel(id);
    window.localStorage.setItem(KEY, id);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
      <h1
        className="max-w-3xl font-display text-[clamp(1.9rem,4vw,3.9rem)] leading-[1.14] tracking-[-0.02em] text-ink"
        style={{ fontWeight: 500 }}
      >
        {LINES.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <div className="lg:border-l lg:border-[#c8992f]/50 lg:pl-8">
        {panel === "a" && <SteerPanel />}
        {panel === "b" && <LinksPanel />}
        {panel === "c" && <FiguresPanel figures={figures} />}

        {/* Right-column review toggle — remove once a treatment is chosen. */}
        <div className="mt-4 inline-flex overflow-hidden border border-ink/10 bg-white/80 text-[10px] font-medium uppercase tracking-[0.1em]">
          {(
            [
              { id: "a", label: "Steer" },
              { id: "b", label: "Links" },
              { id: "c", label: "Figures" },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => pick(v.id)}
              aria-pressed={panel === v.id}
              className={`px-2.5 py-1 transition-colors ${
                panel === v.id
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
