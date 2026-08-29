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
      <h1 className="max-w-3xl font-display text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink sm:text-[clamp(2.65rem,4.6vw,4.8rem)] sm:leading-[0.96] sm:tracking-[-0.055em]">
        {LINES.map((line) => (
          <span key={line} className="block sm:whitespace-nowrap">
            {line}
          </span>
        ))}
      </h1>

      <div className="lg:border-l lg:border-[#c8992f]/50 lg:pl-8">
        <p className="max-w-sm text-base leading-relaxed text-ink-muted md:text-lg">
          Browse the partnership, or begin with the cancer type or treatment
          you already know.
        </p>

        <nav aria-label="Find a consultant" className="mt-5">
          <ul className="flex items-center gap-7">
            {TABS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="group relative inline-block whitespace-nowrap pb-2 text-sm font-medium text-ink transition-colors hover:text-accent"
                >
                  {t.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#c8992f] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
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
