import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { pathways } from "@/content/patientHub";

// ─────────────────────────────────────────────────────────────────────────────
// The five ways in. Each one opens where it stands, so nobody arriving at this
// page frightened should have to gamble on a link and land somewhere that turns
// out not to be about them.
//
// Built on <details>/<summary> rather than React state: it is keyboard and
// screen-reader correct for free, it works before hydration, and it survives
// find-in-page (browsers open a closed <details> to reveal a match).
//
// A single column, not a grid. Ninety per cent of this practice's traffic is on
// a phone, and five stacked sentences are read in order; a two-column grid of
// disclosure cards reflows unpleasantly the moment one of them opens.
// ─────────────────────────────────────────────────────────────────────────────

function Plus() {
  return (
    <span
      aria-hidden
      className="ml-5 mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full border border-ink/10 text-ink-muted transition-all duration-300 group-hover:border-accent/30 group-hover:bg-accent/[0.06] group-hover:text-accent group-open:rotate-45 group-open:border-accent/30 group-open:bg-accent/[0.06] group-open:text-accent"
    >
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 3v10M3 8h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function PathwayCards() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {pathways.map((p, i) => (
        <Reveal key={p.id} delay={i}>
          <details
            // Namespaced: the pathway ids overlap the section ids further down
            // the page ("support" is both a card and a section), and a
            // duplicate id sends the "Treatment support" jump link to the wrong
            // element.
            id={`pathway-${p.id}`}
            className="card-soft group scroll-mt-28 overflow-hidden transition-shadow duration-300 open:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(6,28,70,0.22)]"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between p-6 md:p-8 [&::-webkit-details-marker]:hidden">
              <div>
                <h3 className="font-display text-xl leading-snug tracking-tight text-ink md:text-2xl">
                  {p.label}
                </h3>
                <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                  {p.summary}
                </p>
              </div>
              <Plus />
            </summary>

            <div className="px-6 pb-8 md:px-8">
              {/* the rule starts where the heading does, so the opened panel
                  reads as part of the card rather than a new box */}
              <div className="h-px w-full bg-ink/[0.07]" />

              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/85 md:text-base">
                {p.body.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>

              {p.points && (
                <ul className="mt-6 space-y-3">
                  {p.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-[15px] leading-relaxed text-ink-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent/40"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={p.action.href}
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-ink"
              >
                {p.action.label}
                <svg
                  className="h-4 w-4 transition-transform duration-300 hover:translate-x-1"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </details>
        </Reveal>
      ))}
    </div>
  );
}
