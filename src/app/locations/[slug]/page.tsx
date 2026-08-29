import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import Reveal from "@/components/ui/Reveal";
import { pageMeta } from "@/content/seo";
import { allNavLinks, getNavLink } from "@/content/navigation";
import {
  locations,
  getLocation,
  allLocationServices,
  type Location,
} from "@/content/locations";

// ─────────────────────────────────────────────────────────────────────────────
// /locations/[slug] — two kinds of page share this route:
//
//   • the five hospitals in locations.ts, which have real details to show;
//   • the practical pages in the IA (other locations, getting here, parking),
//     which are scaffolds until the copy is written.
//
// Services are NOT claimed. locations.ts leaves `services` empty on purpose —
// which department runs at which building is operational detail only the
// practice can confirm, and sending a patient to the wrong site would be a
// serious failure. The page shows the question, not an assumed answer.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = "/locations/";

export function generateStaticParams() {
  const slugs = new Set<string>(locations.map((l) => l.slug));
  for (const link of allNavLinks) {
    if (!link.href.startsWith(PREFIX)) continue;
    const slug = link.href.slice(PREFIX.length);
    if (slug && !slug.includes("/")) slugs.add(slug);
  }
  // Array.from rather than a spread: the project's tsconfig has no `target`,
  // so it defaults to ES5 and spreading a Set fails to compile.
  return Array.from(slugs, (slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const href = `${PREFIX}${params.slug}`;
  const location = getLocation(params.slug);

  if (location) {
    // Deliberately not sectionPageMeta here: the navigation description for
    // each hospital names services the practice hasn't confirmed yet.
    return pageMeta({
      title: `${location.name}, ${location.area}`,
      description: `${location.name}${
        location.provider ? ` (${location.provider})` : ""
      } in ${location.area} — one of the sites the consultant oncologists of Berkshire Oncology Partnership practise from.`,
      path: href,
    });
  }

  if (!getNavLink(href)) return {};
  return sectionPageMeta(href);
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 flex-none"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3h4v4" />
      <path d="M13 3 7.5 8.5" />
      <path d="M11.5 9.5V13H3V4.5h3.5" />
    </svg>
  );
}

function HospitalDetails({ location }: { location: Location }) {
  const confirmed = location.services;
  const unconfirmed = allLocationServices.filter((s) => !confirmed.includes(s));

  return (
    <>
      <Reveal>
        <div className="card-soft p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              Hospital details
            </h2>
            {location.nhs && (
              <span className="rounded-full border border-accent/25 bg-accent/[0.07] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                NHS
              </span>
            )}
          </div>

          <dl className="mt-7 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
                Site
              </dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-ink">
                {location.name}
                {location.nhs && ", an NHS hospital"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
                Provider
              </dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-ink">
                {location.provider ?? location.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-ink-muted">
                Area
              </dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-ink">
                {location.area}
              </dd>
            </div>
          </dl>

          {location.url && (
            <a
              href={location.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-ink/15 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-accent/[0.05] hover:text-accent"
            >
              Visit the hospital&rsquo;s own website
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}

          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            Addresses, departments and opening times are published by the
            hospital itself, so its own site is the most reliable source for
            them.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mt-14">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            What happens at this site
          </h2>

          {confirmed.length > 0 && (
            <ul className="mt-6 space-y-3">
              {confirmed.map((service) => (
                <li
                  key={service}
                  className="flex items-center gap-3 text-[15px] leading-relaxed text-ink"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 flex-none rounded-full bg-accent/50"
                  />
                  {service}
                </li>
              ))}
            </ul>
          )}

          {unconfirmed.length > 0 && (
            <>
              <p
                className={`max-w-2xl text-[15px] leading-relaxed text-ink-muted ${
                  confirmed.length > 0 ? "mt-8" : "mt-3"
                }`}
              >
                We are still confirming with the practice which of the following
                run at {location.name}, so none of them is confirmed for this
                site yet.
              </p>
              <ul className="mt-6 space-y-3">
                {unconfirmed.map((service) => (
                  <li
                    key={service}
                    className="flex items-center gap-3 text-[15px] leading-relaxed text-ink-muted"
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 flex-none rounded-full border border-ink-muted/40"
                    />
                    {service}
                    <span className="sr-only">
                      {" "}
                      — not yet confirmed for this site
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            If you need to know what happens here before you travel,{" "}
            <Link
              href="/contact#guidance"
              className="text-accent underline-offset-2 hover:underline"
            >
              ask the practice about this site
            </Link>{" "}
            and we will check it for you.
          </p>
        </div>
      </Reveal>
    </>
  );
}

export default function LocationPage({
  params,
}: {
  params: { slug: string };
}) {
  const href = `${PREFIX}${params.slug}`;
  const location = getLocation(params.slug);
  const link = getNavLink(href);

  if (!location && !link) notFound();

  if (!location) return <SectionPage href={href} />;

  return (
    <SectionPage
      href={href}
      title={location.name}
      // The navigation description names services that aren't confirmed for
      // this site, so the page introduces itself neutrally instead.
      intro={`One of the sites our consultants practise from, in ${location.area}.`}
    >
      <HospitalDetails location={location} />
    </SectionPage>
  );
}
