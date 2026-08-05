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
            <div className="mb-6">
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
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                {section?.summary}
              </p>
            </Reveal>
          </>
        }
      />

      <section className="container-wide pb-24 pt-20 md:pb-32 md:pt-28">
        {practicalPages.length > 0 && (
          <div>
            <Reveal>
              <h2 className="font-display text-2xl text-ink md:text-3xl">
                Getting there and other sites
              </h2>
            </Reveal>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {practicalPages.map((link, i) => (
                <Reveal key={link.href} delay={i} className="h-full">
                  <Link
                    href={link.href}
                    className="group flex h-full flex-col rounded-3xl border border-black/[0.06] bg-canvas-warm p-5 transition-colors hover:border-accent/25 hover:bg-white md:p-6"
                  >
                    <span className="font-display text-lg text-ink">
                      {link.label}
                    </span>
                    {link.description && (
                      <span className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                        {link.description}
                      </span>
                    )}
                    <span className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-medium text-accent">
                      Read more
                      <Arrow />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <Reveal>
          <div className="card-soft mt-16 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Not sure which site you need?
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
              Our practice manager can tell you where your consultant sees
              patients, and where your treatment would take place, before you
              make any arrangements. We would always rather check than have you
              go to the wrong building.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/contact" variant="primary">
                Contact the practice
              </Button>
              <Button href="/consultants" variant="ghost">
                Find a consultant
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
