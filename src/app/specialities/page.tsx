import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { cancerGroups, unlistedGroup } from "@/content/cancerGroups";
import {
  getAllSpecialities,
  getSpecialityBySlug,
  getConsultantsForSpeciality,
} from "@/content/queries";
import TypesJourney, {
  type TypeCardData,
} from "@/components/sections/specialities/TypesJourney";

/*
  The cancer-types hub: "Start with what you know."

  The page is the scroll-stepped picker instrument — fourteen groups in the
  practice's own order, a giant type list on the left, a detail sheet on
  the right — followed by a compact A-Z of every speciality page (all 18,
  sarcoma included) so nothing the nav or the old site's 301s point at is
  ever more than one list away.

  This file owns the CONTENT: it maps cancerGroups + the consultant edge
  list into TypeCardData server-side (consultants deduped across a group's
  slugs — bladder-and-kidney shares one team across two pages; summing
  would double-count). TypesJourney owns the choreography.

  data-no-snap on the instrument's section: the global proximity snap in
  SmoothScroll must not fight the instrument's own mandatory snap.
*/

export const metadata: Metadata = pageMeta({
  title: "Cancer Types",
  description:
    "The cancers treated by Berkshire Oncology Partnership in Reading, Berkshire — who treats each one, which treatments they provide, and where care is delivered.",
  path: "/specialities",
});

/** Group card data, consultants deduped across the group's pages. */
function toCard(group: (typeof cancerGroups)[number], index: number): TypeCardData {
  const seen = new Map<
    string,
    { name: string; slug: string; shortRole?: string; photo?: string }
  >();
  for (const slug of group.slugs) {
    for (const c of getConsultantsForSpeciality(slug)) {
      if (!seen.has(c.slug)) {
        seen.set(c.slug, {
          name: c.name,
          slug: c.slug,
          shortRole: c.shortRole,
          photo: c.photo,
        });
      }
    }
  }
  const team = Array.from(seen.values());
  const primary = group.slugs[0];
  const entries = group.slugs.map((slug) => ({
    slug,
    title: getSpecialityBySlug(slug)?.title ?? slug,
  }));

  return {
    id: group.id,
    label: group.label,
    // A 1:1 group borrows its page's full title ("Breast Cancer"); a
    // grouping reads as a family ("Upper GI cancers"), and its sheet
    // carries one pill per covered page so neither page is orphaned.
    title:
      group.slugs.length === 1
        ? getSpecialityBySlug(primary)?.title ?? group.label
        : `${group.label} cancers`,
    blurb: group.blurb,
    consultants: team.slice(0, 3),
    extraConsultants: Math.max(0, team.length - 3),
    entries: entries.length > 1 ? entries : undefined,
    specialistsHref: `/consultants/by-cancer-type#${primary}`,
    nextStepsHref: `/specialities/${primary}`,
    supportHref: "/links",
  };
}

export default function SpecialitiesPage() {
  const cards: TypeCardData[] = cancerGroups.map(toCard);

  // Sarcoma sits outside the list: the partnership does not treat it, and
  // presenting it as a peer of the fourteen would promise care that is not
  // offered. It keeps its page and its own honest note below.
  const az = getAllSpecialities()
    .filter((s) => !unlistedGroup.slugs.includes(s.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Cancer Types", path: "/specialities" },
        ])}
      />

      {/* ── The instrument ── */}
      <section data-no-snap className="relative bg-[#f7f5f1]">
        <TypesJourney cards={cards} />
      </section>

      {/* ── Every speciality page, A to Z — the completeness net under the
             instrument: all 18 slugs the nav and the old site's 301s expect,
             sarcoma included. ── */}
      <section id="types-az" className="scroll-mt-24 bg-[#f7f5f1]">
        <div className="container-wide border-t border-ink/10 py-20 md:py-24">
          <p className="eyebrow">
            <span aria-hidden className="h-px w-8 bg-ink-muted" />
            Every cancer type
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
            All cancer types, A to Z.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {az.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/specialities/${s.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-xl px-3 py-3 text-[15px] text-ink/80 transition-colors focus-visible:bg-ink/[0.04] focus-visible:text-ink lg:hover:bg-ink/[0.035] lg:hover:text-ink"
                >
                  {s.title}
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5 text-ink-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                    aria-hidden
                  >
                    <path d="M5.5 3l5 5-5 5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl border-t border-ink/10 pt-6 text-[14px] leading-relaxed text-ink-muted">
            {unlistedGroup.blurb}{" "}
            <Link
              href={`/specialities/${unlistedGroup.slugs[0]}`}
              className="text-accent underline underline-offset-2"
            >
              {unlistedGroup.label}
            </Link>
            .
          </p>
          <div className="mt-10">
            <Button href="/contact">Arrange a consultation</Button>
          </div>
        </div>
      </section>
    </>
  );
}
