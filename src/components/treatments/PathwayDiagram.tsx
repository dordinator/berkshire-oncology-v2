/*
  PathwayDiagram — the Integrated register.

  A restrained diagram of the route a patient actually travels, from referral to
  follow-up, with the four things they need to reach attached at the point where
  each one becomes relevant: the treatment itself, the consultant, the location,
  and support.

  Deliberately built from layout rather than absolute SVG geometry: a vertical
  stepper on a phone (where most of this site is read) and a five-column
  horizontal run from `md` up, sharing one component and one set of hairlines.
  Hard-coded SVG coordinates would have forced a second mobile drawing.

  It is a diagram of *process*, not of anatomy. No body, no cells, nothing that
  could be read as depicting disease.
*/

import Link from "next/link";

export interface PathwayStop {
  /** Short stage name — "Referral", "Consultation", … */
  stage: string;
  /** One line of what happens here. */
  body: string;
  /** Optional onward route, shown as a small chip. */
  link?: { label: string; href: string };
}

function Node({ index, total }: { index: number; total: number }) {
  const first = index === 0;
  const last = index === total - 1;

  // The rail is drawn per item as two segments — one reaching back towards the
  // previous dot, one reaching forward to the next — each overhanging by the
  // grid gap (mobile gap-y-7 = 28px, desktop gap-x-4 = 16px). Drawing it as a
  // single span per item instead would leave the gaps unpainted and the rail
  // would read as dashes rather than one continuous line.
  return (
    <>
      {/* mobile: vertical rail */}
      {!first && (
        <span
          aria-hidden
          className="absolute -top-7 left-[7px] h-11 w-px bg-accent/25 md:hidden"
        />
      )}
      {!last && (
        <span
          aria-hidden
          className="absolute -bottom-7 left-[7px] top-4 w-px bg-accent/25 md:hidden"
        />
      )}

      {/* desktop: horizontal rail */}
      {!first && (
        <span
          aria-hidden
          className="absolute -left-4 top-[7px] hidden h-px right-1/2 bg-accent/25 md:block"
        />
      )}
      {!last && (
        <span
          aria-hidden
          className="absolute -right-4 top-[7px] hidden h-px left-1/2 bg-accent/25 md:block"
        />
      )}
      <span
        aria-hidden
        className="absolute left-0 top-4 z-10 h-[15px] w-[15px] -translate-y-1/2 rounded-full border border-accent/40 bg-canvas md:left-1/2 md:top-0 md:-translate-x-1/2 md:translate-y-0"
      >
        <span className="absolute inset-[3px] rounded-full bg-accent/45" />
      </span>
    </>
  );
}

export default function PathwayDiagram({
  stops,
  className = "",
}: {
  stops: PathwayStop[];
  className?: string;
}) {
  return (
    <div className={className}>
      <ol className="relative grid gap-y-7 md:grid-cols-5 md:gap-x-4 md:gap-y-0">
        {stops.map((stop, i) => (
          <li
            key={stop.stage}
            className="relative pl-8 md:pl-0 md:pt-8 md:text-center"
          >
            <Node index={i} total={stops.length} />

            <p className="type-compact-title text-ink">
              {stop.stage}
            </p>
            <p className="type-supporting mt-1.5 text-ink-muted">
              {stop.body}
            </p>

            {stop.link && (
              <Link
                href={stop.link.href}
                className="type-button group mt-3 inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-black/[0.07] bg-white/70 px-3 text-ink/80 transition-colors hover:border-accent/35 hover:bg-accent/[0.05] hover:text-accent"
              >
                {stop.link.label}
                <span
                  aria-hidden
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
