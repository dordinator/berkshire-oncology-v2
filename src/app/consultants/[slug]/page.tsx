import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
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
  sitesForConsultant,
  type ConsultantSiteId,
} from "@/content/consultantSites";
import { site } from "@/content/site";
import { pageMeta, physicianLd, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import ConsultantAboutJourney from "@/components/consultants/ConsultantAboutJourney";
import ConsultantTreatmentExperience from "@/components/consultants/ConsultantTreatmentExperience";
import ConsultantLocationsJourney from "@/components/consultants/ConsultantLocationsJourney";
import ConsultantSpacingControl from "@/components/consultants/ConsultantSpacingControl";

export function generateStaticParams() {
  return getProfiledConsultantSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getConsultantBySlug(params.slug);
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

const SITE_PAGE_SLUGS: Record<ConsultantSiteId, string> = {
  "spire-dunedin": "spire-dunedin-reading",
  "princess-margaret": "princess-margaret-windsor",
  "genesiscare-windsor": "genesiscare-windsor",
  "genesiscare-oxford": "genesiscare-oxford",
  "royal-berkshire": "royal-berkshire-hospital",
};

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

function firstName(name: string) {
  return name.replace(/^Dr\.?\s+/i, "").split(/\s+/)[0];
}

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

function ProfileRow({
  href,
  title,
  items,
}: {
  href: string;
  title: string;
  items: string[];
}) {
  return (
    <Link
      href={href}
      className="group grid min-h-[86px] grid-cols-[1fr_auto] items-center gap-5 border-b border-ink/[0.12] py-4 text-ink transition-colors hover:text-accent focus-visible:text-accent md:min-h-[92px]"
    >
      <span>
        <span className="block font-display text-[25px] font-medium leading-tight tracking-[-0.02em] md:text-[28px]">
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted md:text-sm">
          {items.join(" · ")}
        </span>
      </span>
      <span className="transition-transform duration-300 ease-smooth group-hover:translate-x-1">
        <Arrow />
      </span>
    </Link>
  );
}

function Fact({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-16 items-center justify-center px-5 py-4 text-center text-[13px] leading-snug text-ink md:min-h-[76px] md:text-sm">
      {children}
    </div>
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
    <details className="group border-b border-ink/[0.14]" open={defaultOpen}>
      <summary className="flex min-h-[86px] cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-xl font-medium text-ink marker:content-none md:text-2xl">
        {title}
        <span className="relative h-5 w-5 flex-none" aria-hidden>
          <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-current" />
          <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:rotate-90 group-open:opacity-0" />
        </span>
      </summary>
      <div className="space-y-5 pb-9 text-[15px] leading-[1.78] text-ink-muted md:pr-14 md:text-base">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </details>
  );
}

export default function ConsultantProfile({
  params,
}: {
  params: { slug: string };
}) {
  const c = getConsultantBySlug(params.slug);
  if (!c) notFound();

  const treats = getSpecialitiesForConsultant(c.slug);
  const therapies = getTherapiesForConsultant(c.slug);
  const locations = sitesForConsultant(c.slug);
  const listedModalities = modalitiesByConsultant[c.slug] ?? [];
  const profileCopy = consultantProfileCopy[c.slug];
  const locationSlugs = (consultantSites[c.slug] ?? []).map(
    ({ site: siteId }) => SITE_PAGE_SLUGS[siteId],
  );
  const cancerLabels = treats.map((item) => item.speciality.title);
  const treatmentLabels = therapies.map((therapy) => therapy.title);
  const givenName = firstName(c.name);
  const name = consultantReference(c.name);
  const nameScale =
    c.name.length > 24
      ? "lg:text-[46px] xl:text-[50px]"
      : c.name.length > 18
        ? "lg:text-[50px] xl:text-[56px] xl:whitespace-nowrap"
        : "lg:text-[60px] xl:text-[68px] xl:whitespace-nowrap";
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

  const facts = [
    c.qualifications,
    c.gmc ? `GMC ${c.gmc}` : undefined,
    c.consultantInReadingSince
      ? `Consultant in Reading since ${c.consultantInReadingSince}`
      : undefined,
    c.medicalSchool
      ? `${c.medicalSchool.name}${c.medicalSchool.year ? `, ${c.medicalSchool.year}` : ""}`
      : undefined,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <article
      className="bg-[#f8f5ef]"
      data-consultant-profile
      data-section-spacing="balanced"
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

      <section className="pb-0 pt-28 md:pt-32 lg:pt-[8.5rem]">
        <div className="container-wide">
          <div className="grid gap-8 lg:grid-cols-[0.44fr_0.56fr] lg:gap-12 xl:gap-14">
            <div className="relative min-h-[430px] overflow-hidden rounded-[28px] bg-[#dbe3e8] sm:min-h-[560px] lg:min-h-[650px]">
              {c.photo ? (
                <Image
                  src={c.photo}
                  alt={`${c.name}, ${c.shortRole ?? c.role}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-7xl text-ink/35">
                  {givenName.slice(0, 1)}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col py-1 lg:py-6 xl:py-8">
              <div>
                <h1
                  className={`font-display text-[44px] font-normal leading-[0.98] tracking-[-0.045em] text-ink sm:text-5xl ${nameScale}`}
                >
                  {c.name}
                </h1>
                <p className="mt-4 font-display text-xl font-medium text-ink sm:text-2xl">
                  {c.shortRole ?? c.role}
                </p>
                <p className="mt-4 max-w-[640px] text-[15px] leading-[1.65] text-ink/80 sm:text-base">
                  {intro}
                </p>
                <Button
                  href="/contact#consultation"
                  variant="sage"
                  arrow={false}
                  className="mt-6 rounded-lg px-6 py-3"
                >
                  Arrange a consultation
                </Button>
              </div>

              <div className="mt-3 lg:mt-auto">
                <ProfileRow
                  href="#cancer-expertise"
                  title="Cancer expertise"
                  items={cancerLabels}
                />
                {treatmentLabels.length > 0 && (
                  <ProfileRow
                    href="#treatments"
                    title="Treatments"
                    items={treatmentLabels}
                  />
                )}
                {locations.length > 0 && (
                  <ProfileRow href="#locations" title="Locations" items={locations} />
                )}
              </div>
            </div>
          </div>
        </div>

        {facts.length > 0 && (
          <div className="container-wide mt-8 md:mt-10">
            <dl className="grid overflow-hidden rounded-[24px] border border-ink/[0.06] bg-[#e7eeea] divide-y divide-ink/[0.12] shadow-[0_18px_45px_-42px_rgba(6,28,70,0.28)] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
              {facts.map((fact) => (
                <Fact key={fact}>{fact}</Fact>
              ))}
            </dl>
          </div>
        )}
      </section>

      {aboutChapters.length > 0 && (
        <ConsultantAboutJourney
          chapters={aboutChapters}
          consultantName={name}
          expertise={treats.map(({ speciality }) => ({
            href: `/specialities/${speciality.slug}`,
            title: speciality.title,
          }))}
          title={`About ${name}.`}
        />
      )}

      {treatmentExperienceItems.length > 0 && (
        <ConsultantTreatmentExperience
          consultantName={name}
          items={treatmentExperienceItems}
        />
      )}

      {locationSlugs.length > 0 && (
        <ConsultantLocationsJourney
          consultantName={name}
          locationSlugs={locationSlugs}
        />
      )}

      {(leadershipParagraphs.length > 0 ||
        researchParagraphs?.length ||
        achievementParagraphs?.length ||
        disclosureParagraphs?.length) && (
        <section
          id="professional-work"
          className="consultant-section-rhythm scroll-mt-24 bg-[#f7f5f1]"
        >
          <div className="container-wide grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 xl:gap-24">
            <div>
              <h2 className="max-w-md font-display text-[46px] font-semibold leading-[0.98] tracking-[-0.05em] text-ink md:text-6xl">
                Professional work.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-[1.7] text-ink-muted">
                Clinical leadership, research and professional information from {name}&rsquo;s profile.
              </p>
            </div>
            <div className="relative lg:py-5">
              <div
                aria-hidden
                className="absolute -right-4 top-0 hidden h-[42%] w-[36%] rounded-[2.5rem] bg-[#dfe9f5] lg:block"
              />
              <div className="relative rounded-[2.5rem] border border-ink/[0.08] bg-white/80 px-7 shadow-[0_34px_80px_-58px_rgba(6,28,70,0.4)] sm:px-9 md:px-11 lg:mr-5">
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

      <section
        id="contact"
        className="consultant-contact-section consultant-section-rhythm scroll-mt-24 rounded-t-[3rem] bg-ink text-white md:rounded-t-[4.5rem] lg:flex lg:items-center"
      >
        <div className="container-wide grid gap-12 lg:grid-cols-[0.54fr_0.46fr] lg:items-center lg:gap-20 xl:gap-28">
          <div>
            <h2 className="max-w-3xl font-display text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-white md:text-6xl lg:text-7xl">
              Ready to speak to the practice?
            </h2>
            <p className="mt-7 max-w-xl text-[17px] leading-[1.72] text-white/72">
              You do not need to know which treatment you need. The practice team can help you arrange a consultation with {name}.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/55">
              If you have a referral letter or recent results, you can share them when you contact us.
            </p>
          </div>
          <div className="rounded-[2.5rem] border border-white/10 bg-[#f8f5ef] p-7 text-ink shadow-[0_35px_90px_-50px_rgba(0,0,0,0.65)] sm:p-9 md:p-11">
            <p className="text-sm text-ink-muted">What would help now?</p>
            <Link
              href="/contact#consultation"
              className="group mt-5 grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-y border-ink/[0.12] py-6"
            >
              <span>
                <span className="block font-display text-2xl font-medium leading-tight">
                  Arrange a consultation
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
                  Request an appointment with {name} and share the details you have.
                </span>
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#b78a42]/45 text-[#a06d22] transition-transform duration-300 group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
            <Link
              href="/contact#guidance"
              className="group grid min-h-[108px] grid-cols-[1fr_auto] items-center gap-5 border-b border-ink/[0.12] py-6"
            >
              <span>
                <span className="block font-display text-2xl font-medium leading-tight">
                  I&rsquo;m not sure what happens next
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-ink-muted">
                  Ask the practice team for guidance before choosing a consultant or treatment.
                </span>
              </span>
              <span className="ink-cta-icon flex h-12 w-12 items-center justify-center rounded-full">
                <Arrow />
              </span>
            </Link>
            <div className="mt-7 flex flex-col gap-2 border-t border-ink/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-ink-muted">Prefer to speak to someone?</span>
              <a
                href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                className="font-display text-xl font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-accent"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {process.env.NODE_ENV === "development" && <ConsultantSpacingControl />}
    </article>
  );
}
