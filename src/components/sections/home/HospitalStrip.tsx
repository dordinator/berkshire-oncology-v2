import type { SVGProps } from "react";
import Reveal from "@/components/ui/Reveal";
import { hospitals } from "@/content/hospitals";

// ─────────────────────────────────────────────────────────────────────────────
// The row of hospitals and cancer centres, one cell each, linking out to the
// site's own website.
//
// Lifted out of the old home page's Hospitals section, which the redesign left
// orphaned. Only the strip came across: the map, the eyebrow and the gradient
// headline that sat above it stayed behind.
//
// It carries only what hospitals.ts confirms — name, place, and the site's own
// URL. Which treatments run where is not confirmed by the practice, so nothing
// here implies it. The one NHS site is labelled as such, which is the point of
// putting the strip under this particular heading: four private hospitals and
// the NHS trust, in one row.
// ─────────────────────────────────────────────────────────────────────────────

const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

const IconBuilding = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16" />
    <path d="M14 21V9h4a1 1 0 0 1 1 1v11" />
    <path d="M8 8h2M8 12h2M8 16h2" />
  </svg>
);
const IconCrown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M5 19h14" />
    <path d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 8h-13L4 8Z" />
  </svg>
);
const IconHeart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M12 20C7 16.5 4 13.5 4 10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.5-3 6.5-8 10Z" />
  </svg>
);
const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...p}>
    <path d="M12 3l7 3v5.5c0 4-3 7.5-7 8.5-4-1-7-4.5-7-8.5V6l7-3Z" />
    <path d="M12 9v5M9.5 11.5h5" />
  </svg>
);

/** Matched to each hospital, in the same order as src/content/hospitals.ts. */
const icons = [IconBuilding, IconCrown, IconHeart, IconBuilding, IconShield];

export default function HospitalStrip() {
  return (
    <Reveal>
      {/* A one-pixel background showing through the cell gaps draws the dividers,
          so there are no doubled borders where cells meet. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/[0.08] bg-ink/[0.08] lg:grid-cols-5">
        {hospitals.map((h, i) => {
          const Icon = icons[i] ?? IconBuilding;
          const isNhs = h.location.includes("(NHS)");
          const place = h.location.replace(" (NHS)", "");
          // Two columns on a phone rather than one, so five sites are a compact
          // block instead of five screens of scrolling. Five into two leaves the
          // last cell alone, so it takes the full width — which happens to be
          // the NHS site, and reading as the odd one out is correct.
          const odd = i === hospitals.length - 1 && hospitals.length % 2 === 1;

          return (
            <a
              key={`${h.name}-${h.location}`}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col items-center bg-white px-5 py-8 text-center transition-colors hover:bg-canvas-soft ${
                odd ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <span className="text-accent">
                <Icon className="h-8 w-8" />
              </span>

              <h3 className="mt-4 font-display text-base leading-snug text-ink">
                {h.name}
              </h3>

              <p className="mt-1 text-sm text-ink-muted">
                {place}
                {isNhs && (
                  <span className="ml-1.5 rounded-full border border-accent/25 bg-accent/[0.07] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
                    NHS
                  </span>
                )}
              </p>

              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                <span data-copy-key="nhs.location.action">View location</span>
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
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
                <span className="sr-only"> for {h.name}, opens in a new tab</span>
              </span>
            </a>
          );
        })}
      </div>
    </Reveal>
  );
}
