import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getConsultantBySlug,
  getProfiledConsultantSlugs,
  getSpecialitiesForConsultant,
} from "@/content/queries";
import { getTherapiesForConsultant } from "@/content/therapies";
import { modalitiesByConsultant } from "@/content/modalities";
import { consultantProfileCopy } from "@/content/consultantProfileCopy";
import {
  consultantSites,
  SITE_PAGE_SLUGS,
} from "@/content/consultantSites";
import { site } from "@/content/site";
import { pageMeta, physicianLd, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ConsultantProfileOverview from "@/components/consultants/ConsultantProfileOverview";
import { consultantAppointmentHref } from "@/content/routes";
import ConsultantAboutJourney from "@/components/consultants/ConsultantAboutJourney";
import ConsultantTreatmentExperience from "@/components/consultants/ConsultantTreatmentExperience";
import ConsultantLocationsJourney from "@/components/consultants/ConsultantLocationsJourney";
import ConsultantReviews from "@/components/consultants/ConsultantReviews";
import { getConsultantReviews } from "@/content/consultantReviews";

export function generateStaticParams() {
  return getProfiledConsultantSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = getConsultantBySlug((await params).slug);
  if (!c) return {};
  const specs = getSpecialitiesForConsultant(c.slug).map((s) => s.speciality.name);
  const title = c.seoTitle ?? `${c.name} — ${c.role}, Reading`;
  const description =
    c.seoDescription ??
    `${c.name} is a ${c.role.toLowerCase()} at Berkshire Oncology Partnership in Reading${
      specs.length ? `, treating ${specs.slice(0, 4).join(", ").toLowerCase()} cancers` : ""
    }.`;
  return pageMeta({ title, description, path: `/consultants/${c.slug}` });
}

type TreatmentLink = { label: string; href: string };

const MODALITY_DETAILS: Record<
  string,
  { description: string; links: TreatmentLink[] }
> = {
  Chemotherapy: {
    description:
      "Anti-cancer medicines, usually given as a course of treatment in cycles.",
    links: [{ label: "Understand chemotherapy", href: "/treatments/chemotherapy" }],
  },
  Radiotherapy: {
    description:
      "Treatment that uses carefully planned radiation to target cancer cells.",
    links: [{ label: "Understand radiotherapy", href: "/treatments/radiotherapy" }],
  },
  Immunotherapy: {
    description:
      "Treatment that works through the immune system rather than acting directly on the cancer.",
    links: [{ label: "Understand immunotherapy", href: "/treatments/immunotherapy" }],
  },
  "Biological and immunotherapy": {
    description:
      "Treatments that work with the immune system or particular features of cancer cells.",
    links: [{ label: "Understand immunotherapy", href: "/treatments/immunotherapy" }],
  },
  "Targeted and endocrine treatments": {
    description:
      "Different treatments selected around features of the cancer or its response to hormones.",
    links: [
      { label: "Targeted therapies", href: "/treatments/targeted-therapies" },
      { label: "Hormone therapy", href: "/treatments/hormone-therapy" },
    ],
  },
  "Targeted therapies": {
    description:
      "Medicines selected around particular features of cancer cells, helping treatment act more precisely.",
    links: [
      { label: "Understand targeted therapies", href: "/treatments/targeted-therapies" },
    ],
  },
  "Hormone treatment": {
    description:
      "Treatment that lowers or blocks hormones that some cancers use to grow.",
    links: [{ label: "Understand hormone therapy", href: "/treatments/hormone-therapy" }],
  },
  "Hormone therapy": {
    description:
      "Treatment that lowers or blocks hormones that some cancers use to grow.",
    links: [{ label: "Understand hormone therapy", href: "/treatments/hormone-therapy" }],
  },
  Brachytherapy: {
    description:
      "Radiotherapy delivered from a source placed inside or close to the treatment area.",
    links: [{ label: "Understand brachytherapy", href: "/treatments/brachytherapy" }],
  },
  "Prostate brachytherapy": {
    description:
      "Radiotherapy delivered from a source placed inside the prostate.",
    links: [{ label: "Understand brachytherapy", href: "/treatments/brachytherapy" }],
  },
  "Therapeutic radioisotopes": {
    description:
      "Radioactive medicine that travels through the body to reach particular cancer cells.",
    links: [
      { label: "Understand radioisotope therapy", href: "/treatments/radioisotope-therapy" },
    ],
  },
  "Radio-isotope therapy": {
    description:
      "Radioactive medicine that travels through the body to reach particular cancer cells.",
    links: [
      { label: "Understand radioisotope therapy", href: "/treatments/radioisotope-therapy" },
    ],
  },
  "Systemic therapy": {
    description:
      "An umbrella term for treatments that travel through the body, including several types of medicine.",
    links: [{ label: "Explore medicine treatments", href: "/treatments#medicine-treatments" }],
  },
};

function consultantReference(name: string) {
  const names = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return `Dr ${names[names.length - 1]}`;
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function thirdPersonNarrative(paragraph: string, name: string) {
  const possessive = `${name}${name.endsWith("s") ? "’" : "’s"}`;

  return paragraph
    .replace(/\bI occasionally accept\b/g, `${name} occasionally accepts`)
    .replace(/\bI now practice\b/g, `${name} now practises`)
    .replace(/\bI also refer\b/g, `${name} also refers`)
    .replace(/\bI recently updated\b/g, `${name} recently updated`)
    .replace(/\bI have\b/g, `${name} has`)
    .replace(/\bI am\b/g, `${name} is`)
    .replace(/\bI was\b/g, `${name} was`)
    .replace(/\bI would\b/g, `${name} would`)
    .replace(/\bI accept\b/g, `${name} accepts`)
    .replace(/\bI acquired\b/g, `${name} acquired`)
    .replace(/\bI aim\b/g, `${name} aims`)
    .replace(/\bI attend\b/g, `${name} attends`)
    .replace(/\bI commenced\b/g, `${name} commenced`)
    .replace(/\bI completed\b/g, `${name} completed`)
    .replace(/\bI did\b/g, `${name} completed`)
    .replace(/\bI edited\b/g, `${name} edited`)
    .replace(/\bI graduated\b/g, `${name} graduated`)
    .replace(/\bI helped\b/g, `${name} helped`)
    .replace(/\bI make\b/g, `${name} makes`)
    .replace(/\bI moved\b/g, `${name} moved`)
    .replace(/\bI see\b/g, `${name} sees`)
    .replace(/\bI sing\b/g, `${name} sings`)
    .replace(/\bI specialise\b/g, `${name} specialises`)
    .replace(/\bI spent\b/g, `${name} spent`)
    .replace(/\bI started\b/g, `${name} started`)
    .replace(/\bI took\b/g, `${name} took`)
    .replace(/\bI treat\b/g, `${name} treats`)
    .replace(/\band am\b/g, "and is")
    .replace(/\band have\b/g, "and has")
    .replace(/\band hold\b/g, "and holds")
    .replace(/\bmy\b/gi, possessive)
    .replace(/\bI\b/g, name);
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 12h15M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InformationDisclosure({
  title,
  paragraphs,
  defaultOpen = false,
}: {
  title: string;
  paragraphs: string[];
  defaultOpen?: boolean;
}) {
  return (
    <details
      name="consultant-professional-work"
      className="group border-b border-ink/[0.14]"
      open={defaultOpen}
    >
      <summary className="type-card-title flex min-h-[86px] cursor-pointer list-none items-center justify-between gap-6 py-6 text-ink marker:content-none">
        {title}
        <span className="relative h-5 w-5 flex-none" aria-hidden>
          <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
        </span>
      </summary>
      <div className="type-body space-y-5 pb-9 text-ink-muted md:pr-14">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </details>
  );
}

export default async function ConsultantProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = getConsultantBySlug((await params).slug);
  if (!c) notFound();

  const treats = getSpecialitiesForConsultant(c.slug);
  const therapies = getTherapiesForConsultant(c.slug);
  const listedModalities = modalitiesByConsultant[c.slug] ?? [];
  const profileCopy = consultantProfileCopy[c.slug];
  const locationSlugs = (consultantSites[c.slug] ?? []).map(
    ({ site: siteId }) => SITE_PAGE_SLUGS[siteId],
  );
  const cancerLabels = treats.map((item) => item.speciality.title);
  const treatmentLabels = therapies.map((therapy) => therapy.title);
  const name = consultantReference(c.name);
  const intro =
    profileCopy?.intro ??
    `${name} treats ${formatList(cancerLabels.slice(0, 3).map((label) => label.toLowerCase()))}, with experience across ${formatList(
      treatmentLabels.slice(0, 3).map((label) => label.toLowerCase()),
    )}.`;

  const aboutChapters =
    profileCopy
      ? [
          {
            label: "About",
            heading: `About ${name}`,
            paragraphs: profileCopy.about,
          },
          {
            label: "Training",
            heading: "Training",
            paragraphs: profileCopy.training,
          },
          {
            label: "Clinical focus",
            heading: "Clinical focus",
            paragraphs: profileCopy.clinicalFocus,
          },
        ]
      : [
          {
            label: "About",
            heading: `About ${name}`,
            paragraphs: [intro],
          },
          ...(c.clinicalInvolvement ?? []).map((paragraph, index) => ({
            label: index === 0 ? "Training" : "Clinical focus",
            heading: index === 0 ? "Training" : "Clinical focus",
            paragraphs: [thirdPersonNarrative(paragraph, name)],
          })),
        ];

  const backgroundFacts = [
    c.gmc ? `GMC registration: ${c.gmc}.` : "",
    c.consultantInReadingSince ? `Consultant in Reading since ${c.consultantInReadingSince}.` : "",
    c.medicalSchool ? `Medical school: ${c.medicalSchool.name}${c.medicalSchool.year ? `, ${c.medicalSchool.year}` : ""}.` : "",
  ].filter(Boolean);
  if (backgroundFacts.length) aboutChapters.push({ label: "Professional details", heading: "Professional details", paragraphs: backgroundFacts });

  const leadershipParagraphs = profileCopy?.leadership ?? [];
  const researchParagraphs = c.research?.map((paragraph) =>
    thirdPersonNarrative(paragraph, name),
  );
  const achievementParagraphs = c.achievements?.map((paragraph) =>
    thirdPersonNarrative(paragraph, name),
  );
  const disclosureParagraphs = c.disclosures?.map((paragraph) =>
    thirdPersonNarrative(paragraph, name),
  );

  const treatmentExperienceItems = listedModalities.map((modality) => {
    const detail = MODALITY_DETAILS[modality] ?? {
      description: `A treatment approach listed in ${name}'s clinical profile.`,
      links: [{ label: "Explore treatment information", href: "/treatments" }],
    };

    return {
      title: modality,
      description: detail.description,
      links: detail.links,
    };
  });

  return (
    <article
      className="bg-paper-soft"
      data-consultant-profile
    >
      <JsonLd
        data={[
          physicianLd(
            c,
            treats.map((t) => t.speciality),
          ),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Consultants", path: "/consultants" },
            { name: c.name, path: `/consultants/${c.slug}` },
          ]),
        ]}
      />

      <ConsultantProfileOverview
        consultant={c}
        intro={intro}
        specialities={treats.map(({ speciality }) => speciality)}
        hasTreatments={treatmentExperienceItems.length > 0}
        hasLocations={locationSlugs.length > 0}
      />


      {aboutChapters.length > 0 && (
        <ConsultantAboutJourney
          chapters={aboutChapters}
          title={`About ${name}.`}
        />
      )}

      {treatmentExperienceItems.length > 0 && (
        <ConsultantTreatmentExperience
          consultantName={name}
          consultantRole={c.role}
          items={treatmentExperienceItems}
        />
      )}

      {locationSlugs.length > 0 && (
        <ConsultantLocationsJourney
          consultantName={name}
          locationSlugs={locationSlugs}
        />
      )}

      <section id="fees" data-anchor-align="viewport" aria-labelledby="profile-fees-heading" className="consultant-section-rhythm scroll-mt-24 bg-canvas text-ink">
        <div className="container-wide grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <h2 id="profile-fees-heading" className="type-feature-title">Consultation fees.</h2>
            <p className="type-section-lede mt-6 max-w-lg text-ink-muted">Contact the practice for initial and follow-up consultation fees.</p>
          </div>
          <div className="rounded-[20px] bg-white p-7 md:p-9">
            <dl className="type-body divide-y divide-ink/15">
              <div className="flex flex-wrap justify-between gap-4 pb-5"><dt>Initial consultation</dt><dd>On request</dd></div>
              <div className="flex flex-wrap justify-between gap-4 py-5"><dt>Follow-up</dt><dd>On request</dd></div>
            </dl>
            <Link href="/tariffs" className="mt-3 inline-flex min-h-11 items-center gap-3 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">Fees and insurance <Arrow /></Link>
          </div>
        </div>
      </section>

      {(leadershipParagraphs.length > 0 ||
        researchParagraphs?.length ||
        achievementParagraphs?.length ||
        disclosureParagraphs?.length) && (
        <section
          id="professional-work"
          data-anchor-align="viewport"
          className="consultant-section-rhythm scroll-mt-24 bg-paper-soft"
        >
          <div className="container-wide grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 xl:gap-24">
            <div>
              <h2 className="type-feature-title max-w-md text-ink">
                Professional work.
              </h2>
              <p className="type-section-lede mt-6 max-w-sm text-ink-muted">
                Clinical leadership, research and professional information from {name}&rsquo;s profile.
              </p>
            </div>
            <div className="relative lg:py-5">
              <div
                aria-hidden
                className="absolute -right-4 top-0 hidden h-[42%] w-[36%] rounded-panel bg-accent-mist lg:block"
              />
              <div className="relative rounded-panel border border-ink/[0.08] bg-white/80 px-7 shadow-[0_34px_80px_-58px_rgba(6,28,70,0.4)] sm:px-9 md:px-11 lg:mr-5">
                <div className="border-t border-ink/[0.14]">
                  {leadershipParagraphs.length > 0 && (
                    <InformationDisclosure
                      title="Clinical leadership"
                      paragraphs={leadershipParagraphs}
                      defaultOpen
                    />
                  )}
                  {researchParagraphs && researchParagraphs.length > 0 && (
                    <InformationDisclosure
                      title="Research and publications"
                      paragraphs={researchParagraphs}
                    />
                  )}
                  {achievementParagraphs && achievementParagraphs.length > 0 && (
                    <InformationDisclosure
                      title="Achievements"
                      paragraphs={achievementParagraphs}
                    />
                  )}
                  {disclosureParagraphs && disclosureParagraphs.length > 0 && (
                    <InformationDisclosure
                      title="Disclosures"
                      paragraphs={disclosureParagraphs}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <ConsultantReviews key={c.slug} consultantName={c.name} reviews={getConsultantReviews(c.slug)} />

      <section
        id="contact"
        data-anchor-align="viewport"
        className="consultant-contact-section consultant-section-rhythm scroll-mt-24 rounded-t-panel bg-ink text-white md:rounded-t-panel lg:flex lg:items-center"
      >
        <div className="container-wide grid gap-12 lg:grid-cols-[0.54fr_0.46fr] lg:items-center lg:gap-20 xl:gap-28">
          <div>
            <h2 className="type-editorial-hero max-w-3xl text-white">
              Ready to speak to the practice?
            </h2>
            <p className="type-section-lede mt-7 max-w-xl text-white/72">
              You do not need to know which treatment you need. The practice team can help you arrange a consultation with {name}.
            </p>
            <p className="type-body mt-5 max-w-xl text-white/55">
              If you have a referral letter or recent results, you can share them when you contact us.
            </p>
          </div>
          <div className="rounded-panel border border-white/10 bg-paper-soft p-7 text-ink shadow-[0_35px_90px_-50px_rgba(0,0,0,0.65)] sm:p-9 md:p-11">
            <p className="type-supporting text-ink-muted">What would help now?</p>
            <Link
              href={consultantAppointmentHref(c.slug)}
              className="group mt-5 grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-y border-ink/[0.12] py-6"
            >
              <span>
                <span className="type-card-title block">
                  Request an appointment
                </span>
                <span className="type-supporting mt-2 block text-ink-muted">
                  Request an appointment with {name} and share the details you have.
                </span>
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-mulberry/45 text-mulberry-ink transition-transform duration-300 group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
            <Link
              href="/contact#guidance"
              className="group grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-b border-ink/[0.12] py-6"
            >
              <span>
                <span className="type-card-title block">
                  I&rsquo;m not sure what happens next
                </span>
                <span className="type-supporting mt-2 block text-ink-muted">
                  Ask the practice team for guidance before choosing a consultant or treatment.
                </span>
              </span>
              <span className="ink-cta-icon flex h-12 w-12 items-center justify-center rounded-full">
                <Arrow />
              </span>
            </Link>
            <div className="mt-7 flex flex-col gap-2 border-t border-ink/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="type-supporting text-ink-muted">Prefer to speak to someone?</span>
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="type-compact-title text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
