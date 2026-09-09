import Link from "next/link";
import { therapies, getTherapiesForConsultant } from "@/content/therapies";
import type { Metadata } from "next";
import {
  getAllConsultants,
  getSpecialitiesForConsultant,
} from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ConsultantFocusStrip, {
  type FocusConsultant,
} from "@/components/sections/consultants/ConsultantFocusStrip";
import ConsultantsHeadline from "@/components/sections/consultants/ConsultantsHeadline";
import { modalitiesByConsultant } from "@/content/modalities";
import { sitesForConsultant } from "@/content/consultantSites";

export const metadata: Metadata = pageMeta({
  title: "Our Consultants",
  description:
    "Meet the ten consultant oncologists of Berkshire Oncology Partnership, providing private cancer care in Reading, Berkshire and the surrounding area.",
  path: "/consultants",
});

export default function ConsultantsPage({ searchParams = {} }: {
  searchParams?: { role?: string; view?: string; treatment?: string; sort?: string };
}) {
  const role = ["clinical", "medical"].includes(searchParams.role ?? "") ? searchParams.role : "";
  const treatment = therapies.find((therapy) => therapy.slug === searchParams.treatment);
  const showTreatments = searchParams.view === "treatments" || Boolean(treatment);
  const sortAZ = searchParams.sort === "az";
  const selected = getAllConsultants().filter((consultant) =>
    (!role || consultant.role.toLowerCase().includes(role)) &&
    (!treatment || getTherapiesForConsultant(consultant.slug).some((therapy) => therapy.slug === treatment.slug)),
  );
  if (sortAZ) selected.sort((a, b) => a.name.split(" ").at(-1)!.localeCompare(b.name.split(" ").at(-1)!, "en-GB"));
  const focusConsultants: FocusConsultant[] = selected.map((c) => ({
    slug: c.slug,
    name: c.name,
    shortRole: c.shortRole ?? c.role,
    photo: c.photo ?? "",
    photoTall: `/consultants/tall/${c.slug}.jpg`,
    cancerTypes: getSpecialitiesForConsultant(c.slug).map(
      (x) => x.speciality.name,
    ),
    treatments: modalitiesByConsultant[c.slug] ?? [],
    sites: sitesForConsultant(c.slug),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
        ])}
      />

      {/* The page IS the strip: headline band, then the partnership as one
          wall of portraits, the hovered consultant coming into focus. All
          further wayfinding lives in the band's tabs. */}
      <section className="bg-paper-soft pb-10 pt-28 md:pt-32 lg:pb-12">
        <div className="container-wide">
          <ConsultantsHeadline />
        </div>
        <div id="consultant-list" className="container-wide mt-8 scroll-mt-32">
          <nav aria-label="Consultant filters" className="flex flex-wrap gap-x-6 gap-y-3">
            {[
              { label: "All consultants", href: "/consultants#consultant-list", active: !role && !showTreatments && !sortAZ },
              { label: "Clinical oncologists", href: "/consultants?role=clinical#consultant-list", active: role === "clinical" },
              { label: "Medical oncologists", href: "/consultants?role=medical#consultant-list", active: role === "medical" },
              { label: "By treatment", href: "/consultants?view=treatments#consultant-list", active: showTreatments },
              { label: "A–Z", href: "/consultants?sort=az#consultant-list", active: sortAZ },
            ].map((filter) => <Link key={filter.href} href={filter.href}
              aria-current={filter.active ? "page" : undefined}
              className={`type-button py-2 underline-offset-8 hover:underline ${filter.active ? "text-ink underline" : "text-ink-muted"}`}>
              {filter.label}
            </Link>)}
          </nav>
          {showTreatments && <form action="/consultants#consultant-list" method="get" className="mt-6 flex flex-wrap items-end gap-4">
            <input type="hidden" name="view" value="treatments" />
            <label className="type-body flex flex-col gap-2 text-ink">
              Treatment
              <select key={treatment?.slug ?? "all"} name="treatment" defaultValue={treatment?.slug ?? ""} className="max-w-full rounded-xl border border-ink/20 bg-white px-4 py-3">
                <option value="">All treatments</option>
                {therapies.map((therapy) => <option key={therapy.slug} value={therapy.slug}>{therapy.title}</option>)}
              </select>
            </label>
            <button type="submit" className="type-button rounded-full bg-ink px-6 py-3 text-white">Show consultants</button>
          </form>}
          <p role="status" className="type-supporting mt-4 text-ink-muted">
            {selected.length} {selected.length === 1 ? "consultant" : "consultants"}{treatment ? ` · ${treatment.title}` : ""}
          </p>
          {selected.length === 0 && <p className="type-body mt-4 text-ink">No consultants match these filters. <Link href="/consultants#consultant-list" className="underline">View all consultants</Link>.</p>}
        </div>
        {/* Full width of the screen — end to end, no container: at any inset
            the band reads as a card, and the point is a wall of the whole
            partnership. */}
        <div className="mt-8 lg:mt-10">
          {/* The strip's consultant names are h3s, so without this the page ran
              h1 straight to h3. The heading is not shown because the headline
              band above already says what this is; it exists for anyone
              navigating the page by its outline. */}
          <h2 className="sr-only">The consultants</h2>
          {focusConsultants.length > 0 && <ConsultantFocusStrip key={`${role}:${treatment?.slug}:${sortAZ}`} consultants={focusConsultants} />}
        </div>
      </section>
    </>
  );
}
