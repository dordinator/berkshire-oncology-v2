import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { allNavLinks, getSection } from "@/content/navigation";
import { locations, getLocation } from "@/content/locations";

// ─────────────────────────────────────────────────────────────────────────────
// /locations — the hospitals and centres the partnership practises from, plus
// the practical pages that sit alongside them.
//
// Cards deliberately carry only what locations.ts confirms: name, area,
// provider and whether the site is NHS. Which services run where is not yet
// confirmed by the practice, so nothing on this page implies it.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Locations",
  description:
    "The hospitals and cancer centres where the consultants of Berkshire Oncology Partnership practise, in Reading, Windsor and Oxford.",
  path: "/locations",
});

function NhsPill() {
  return (
    <span className="rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
      NHS
    </span>
  );
}

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

      <PageHeader
        eyebrow="Locations"
        title="Where we practise"
        intro={section?.summary}
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Locations" }]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <Reveal>
          <p className="max-w-2xl text-lg leading-relaxed text-ink md:text-xl">
            The partnership is a group of independent consultants rather than a
            single hospital. Between them they practise across several
            providers, including NHS and private sites, so the building you come
            to depends on your consultant and on the care you need.
          </p>
        </Reveal>
        <Reveal delay={1}>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            If you are not certain where your appointment is, please ask us
            before you travel — we would always rather check than have you go to
            the wrong building.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {locations.map((location, i) => (
            <Reveal key={location.slug} delay={i} className="h-full">
              <Link
                href={`/locations/${location.slug}`}
                className="group card-soft flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl text-ink">
                    {location.name}
                  </h2>
                  {location.nhs && <NhsPill />}
                </div>
                <p className="mt-2 text-[15px] text-ink-muted">
                  {location.area}
                </p>
                {location.provider && location.provider !== location.name && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {location.provider}
                  </p>
                )}
                <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium text-accent">
                  About this site
                  <Arrow />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        {practicalPages.length > 0 && (
          <div className="mt-16 md:mt-20">
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
              make any arrangements.
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
