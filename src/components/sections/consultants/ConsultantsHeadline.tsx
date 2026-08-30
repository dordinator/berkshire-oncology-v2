import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// The band above the focus strip: three stacked lines, and to their right —
// behind the gold hairline — the quiet steer with the begin-with tabs
// beneath it. Settled from a five-way review; the strip below is the page,
// so this band carries all of its wayfinding.
// ─────────────────────────────────────────────────────────────────────────────

const LINES = ["Ten consultants.", "Different expertise.", "One partnership."];

const TABS = [
  { label: "By cancer type", href: "/specialities" },
  { label: "By treatment", href: "/consultants/by-treatment" },
  { label: "A–Z", href: "/consultants/profiles" },
];

export default function ConsultantsHeadline() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
      <h1 className="type-page-hero max-w-3xl text-ink">
        {LINES.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <div className="lg:border-l lg:border-gold/50 lg:pl-8">
        <p className="type-section-lede max-w-sm text-ink-muted">
          Browse the partnership, or begin with the cancer type or treatment
          you already know.
        </p>

        <nav aria-label="Find a consultant" className="mt-5">
          <ul className="flex items-center gap-7">
            {TABS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="type-button group relative inline-block whitespace-nowrap pb-2 text-ink transition-colors hover:text-accent"
                >
                  {t.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
