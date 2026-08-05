import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import LocationsJourney from "@/components/sections/locations/LocationsJourney";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { allNavLinks, getSection } from "@/content/navigation";
import { getLocation } from "@/content/locations";
import { journeyStops } from "@/content/journey";
import { attribution } from "@/content/mapPaths.generated";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — a scroll journey in the manner of HCA's "Our locations".
//
// A hero beside a faint vector map of the whole UK, whose pins cluster in the
// Thames Valley; scrolling flies the map to the practice's own rooms first and
// then to each hospital in turn, each stop's panel saying what the building is
// in its operator's own terms. The choreography lives in LocationsJourney; the
// stops, their order and their framing in content/journey.ts.
//
// What used to be here — a card grid of the five sites — is replaced by the
// journey itself (every panel links on to its detail page). The practical
// pages and the "not sure which site" card survive below it unchanged.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Locations",
  description:
    "The hospitals and cancer centres where the consultants of Berkshire Oncology Partnership practise, in Reading, Windsor and Oxford.",
  path: "/locations",
});

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LocationsPage() {
  const section = getSection("locations");

  // The pages under /locations that aren't hospitals — travel, parking and the
  // other-providers page. Read from the IA so nothing is missed.
  const practicalPages = allNavLinks.filter(
    (link) =>
      link.href.startsWith("/locations/") &&
      !getLocation(link.href.slice("/locations/".length)),
  );

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ])}
      />

      <LocationsJourney
        stops={journeyStops}
        attribution={attribution}
        hero={
          <>
            {/* Hidden below md: the phone hero's box is exactly full without
                it, and the breadcrumb trail survives in the page's JSON-LD. */}
            <div className="mb-6 hidden md:block">
              <Breadcrumbs
                items={[{ name: "Home", href: "/" }, { name: "Locations" }]}
              />
            </div>
            <Reveal>
              <span className="eyebrow">
                <span className="h-px w-8 bg-ink-muted" /> Our locations
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="heading-lg mt-5">Where we practise</h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="body-lg mt-6 max-w-xl">
                The partnership is a group of independent consultants rather
                than a single hospital. Between them they practise across
                several providers, including NHS and private sites, so the
                building you come to depends on your consultant and on the care
                you need.
              </p>
            </Reveal>
            <Reveal delay={3}>
              {/* Hidden below md: the hero shares a pinned stage with the map
                  on a phone, and two paragraphs push the panel past its box. */}
              <p className="mt-5 hidden max-w-xl text-[15px] leading-relaxed text-ink-muted md:block">
                {section?.summary}
              </p>
            </Reveal>
            <Reveal delay={4}>
              {/* The same divided-row grammar as the journey's outro, so the
                  two wide shots bookend each other. Short names by hand —
                  the full ones are the journey's own panels; a row only
                  needs to say who is where. Keep in step with journey.ts. */}
              {/* Hidden below md for the same reason as the paragraph above:
                  the phone's hero box cannot hold them, and the journey
                  itself is about to say the same thing better. */}
              <div className="mt-6 hidden max-w-md divide-y divide-ink/[0.07] border-y border-ink/[0.07] md:block lg:mt-8">
                {(
                  [
                    ["Reading", "The practice · Spire Dunedin · Royal Berkshire"],
                    ["Windsor", "Princess Margaret · GenesisCare"],
                    ["Oxford", "GenesisCare"],
                  ] as const
                ).map(([town, sites]) => (
                  <div
                    key={town}
                    className="flex items-baseline justify-between gap-4 py-2.5 lg:py-3"
                  >
                    <span className="font-display text-base text-ink lg:text-lg">
                      {town}
                    </span>
                    <span className="text-right text-[12px] leading-snug text-ink-muted lg:text-[13px]">
                      {sites}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={5}>
              <p className="mt-6 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted lg:mt-8">
                Scroll to explore the six sites
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  fill="none"
                  className="animate-cue-drift h-4 w-4 text-accent"
                >
                  <path
                    d="M8 2v11M3.5 8.5 8 13l4.5-4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            </Reveal>
          </>
        }
        outro={
          // The journey's last lock: the camera has pulled back out to the
          // UK-wide shot it opened on, and the practical pages that used to
          // live in a section below now close the story beside it.
          <>
            <h2 className="font-display text-[26px] leading-tight text-ink md:text-3xl">
              Getting there and other sites
            </h2>
            <div className="mt-5 divide-y divide-ink/[0.07] border-y border-ink/[0.07] lg:mt-7">
              {practicalPages.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between gap-4 py-3.5 lg:py-4"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-base text-ink transition-colors group-hover:text-accent lg:text-lg">
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="mt-0.5 hidden text-[13px] leading-snug text-ink-muted md:block">
                        {link.description}
                      </span>
                    )}
                  </span>
                  <Arrow className="shrink-0 text-accent" />
                </Link>
              ))}
            </div>

            <div className="mt-6 lg:mt-9">
              <h3 className="font-display text-lg text-ink lg:text-xl">
                Not sure which site you need?
              </h3>
              <p className="mt-2 hidden max-w-md text-[14px] leading-relaxed text-ink-muted sm:block">
                Our practice manager can tell you where your consultant sees
                patients, and where your treatment would take place, before you
                make any arrangements. We would always rather check than have
                you go to the wrong building.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 lg:mt-5">
                <Button href="/contact" variant="primary">
                  Contact the practice
                </Button>
                <Button href="/consultants" variant="ghost">
                  Find a consultant
                </Button>
              </div>
            </div>
          </>
        }
      />

    </>
  );
}
