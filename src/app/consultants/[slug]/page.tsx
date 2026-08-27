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
import {
  consultantSites,
  SITE_LABELS,
  sitesForConsultant,
  type ConsultantSiteId,
} from "@/content/consultantSites";
import { getLocation, type Location } from "@/content/locations";
import { site } from "@/content/site";
import { pageMeta, physicianLd, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import ConsultantAboutJourney, {
  type ConsultantAboutChapter,
} from "@/components/consultants/ConsultantAboutJourney";

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

const PROFILE_INTROS: Record<string, string> = {
  "gelareh-eslamian":
    "Gelareh specialises in breast and upper gastrointestinal cancer care, with experience across chemotherapy, immunotherapy, targeted and endocrine treatments.",
};

const PROFILE_WORK_SECTIONS: Record<string, { leadershipParagraphs: number[] }> = {
  "gelareh-eslamian": { leadershipParagraphs: [2] },
};

const PROFILE_ABOUT_CHAPTERS: Record<string, ConsultantAboutChapter[]> = {
  "gelareh-eslamian": [
    {
      label: "About",
      heading: "About Gelareh",
      paragraphs: [
        "Gelareh is a consultant medical oncologist specialising in breast and upper gastrointestinal cancers. Her work combines patient care with clinical leadership, research and medical education.",
      ],
    },
    {
      label: "Training",
      heading: "Training",
      paragraphs: [
        "She graduated in medicine from Babol University in Iran, then continued her foundation and medical training in Devon. She completed specialist oncology training across Wessex, South Yorkshire, London and Kent.",
      ],
    },
    {
      label: "Clinical focus",
      heading: "Clinical focus",
      paragraphs: [
        "Gelareh specialises in breast, oesophageal, gastric and pancreato-biliary cancers, with a particular focus on breast cancer.",
        "Her work includes chemotherapy, immunotherapy, monoclonal antibodies and endocrine treatment. She also encourages patients to consider clinical trials when a suitable study is available.",
      ],
      tint: true,
    },
  ],
};

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

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
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
  const workConfig = PROFILE_WORK_SECTIONS[c.slug];
  const leadershipIndexes = new Set(workConfig?.leadershipParagraphs ?? []);
  const aboutParagraphs =
    c.clinicalInvolvement?.filter((_, index) => !leadershipIndexes.has(index)) ?? [];
  const leadershipParagraphs =
    c.clinicalInvolvement?.filter((_, index) => leadershipIndexes.has(index)) ?? [];
  const locationDetails = (consultantSites[c.slug] ?? [])
    .map(({ site: siteId }) => {
      const location = getLocation(SITE_PAGE_SLUGS[siteId]);
      return location ? { ...location, label: SITE_LABELS[siteId] } : undefined;
    })
    .filter(
      (location): location is Location & { label: string } => Boolean(location),
    );
  const cancerLabels = treats.map((item) => item.speciality.title);
  const treatmentLabels = therapies.map((therapy) => therapy.title);
  const name = firstName(c.name);
  const nameScale =
    c.name.length > 24
      ? "lg:text-[46px] xl:text-[50px]"
      : c.name.length > 18
        ? "lg:text-[50px] xl:text-[56px] xl:whitespace-nowrap"
        : "lg:text-[60px] xl:text-[68px] xl:whitespace-nowrap";
  const intro =
    PROFILE_INTROS[c.slug] ??
    `${name} treats ${formatList(cancerLabels.slice(0, 3).map((label) => label.toLowerCase()))}, with experience across ${formatList(
      treatmentLabels.slice(0, 3).map((label) => label.toLowerCase()),
    )}.`;

  const aboutChapters =
    PROFILE_ABOUT_CHAPTERS[c.slug] ??
    [
      {
        label: "About",
        heading: `About ${name}`,
        paragraphs: [intro],
      },
      ...aboutParagraphs.map((paragraph, index) => ({
        label: index === 0 ? "Training" : `Background ${index + 1}`,
        heading: index === 0 ? "Training" : "Clinical background",
        paragraphs: [paragraph],
        tint: index === aboutParagraphs.length - 1,
      })),
    ];

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
    <article className="bg-[#f8f5ef]">
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
                  {name.slice(0, 1)}
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
                  href={`/contact?intent=consultation#next-step`}
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
                <ProfileRow href="#treatments" title="Treatments" items={treatmentLabels} />
                <ProfileRow href="#locations" title="Locations" items={locations} />
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
        <ConsultantAboutJourney chapters={aboutChapters} />
      )}

      {treats.length > 0 && (
        <section
          id="cancer-expertise"
          className="scroll-mt-24 bg-[#dce9e4] py-20 md:py-28 lg:flex lg:min-h-[92svh] lg:items-center lg:py-32"
        >
          <div className="container-wide grid gap-12 lg:grid-cols-[0.37fr_0.63fr] lg:gap-20 xl:gap-28">
            <div>
              <h2 className="max-w-md font-display text-[46px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl">
                Cancer expertise.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-[1.7] text-ink-muted">
                {name} works with people affected by these cancer types. Each page explains the wider care pathway.
              </p>
            </div>
            <div className="border-t border-ink/[0.16]">
              {treats.map(({ speciality }, index) => (
                <Link
                  key={speciality.slug}
                  href={`/specialities/${speciality.slug}`}
                  className="group grid min-h-[104px] grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-ink/[0.16] py-5 text-ink transition-colors hover:text-accent md:min-h-[124px] md:grid-cols-[64px_1fr_auto]"
                >
                  <span className="text-sm tabular-nums text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl font-medium leading-tight tracking-[-0.025em] md:text-[32px]">
                    {speciality.title}
                  </span>
                  <span className="transition-transform duration-300 ease-smooth group-hover:translate-x-1">
                    <Arrow />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {listedModalities.length > 0 && (
        <section
          id="treatments"
          className="scroll-mt-24 py-20 md:py-28 lg:flex lg:min-h-[96svh] lg:items-center lg:py-32"
        >
          <div className="container-wide grid gap-12 lg:grid-cols-[0.37fr_0.63fr] lg:gap-20 xl:gap-28">
            <div>
              <h2 className="max-w-md font-display text-[46px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl">
                Treatment experience.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-[1.7] text-ink-muted">
                These are the treatment approaches listed in {name}&rsquo;s profile. The right approach depends on your diagnosis and a clinical review.
              </p>
              <p className="mt-5 max-w-sm text-sm leading-[1.7] text-ink-muted/85">
                You do not need to decide between them before arranging a consultation.
              </p>
            </div>
            <div className="overflow-hidden rounded-[36px] bg-[#dce9e4] px-6 sm:px-9 md:px-12">
              {listedModalities.map((modality, index) => {
                const detail = MODALITY_DETAILS[modality] ?? {
                  description: `A treatment approach listed in ${name}'s clinical profile.`,
                  links: [{ label: "Explore treatment information", href: "/treatments" }],
                };
                return (
                  <div
                    key={modality}
                    className="grid gap-4 border-b border-ink/[0.14] py-7 last:border-b-0 md:grid-cols-[52px_1fr] md:gap-7 md:py-9"
                  >
                    <span className="pt-1 text-sm tabular-nums text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[27px] font-medium leading-tight tracking-[-0.025em] text-ink md:text-[34px]">
                        {modality}
                      </h3>
                      <p className="mt-3 max-w-2xl text-[15px] leading-[1.72] text-ink-muted md:text-base">
                        {detail.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                        {detail.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="group inline-flex items-center gap-3 border-b border-ink/20 pb-1 text-sm font-medium text-ink transition-colors hover:text-accent"
                          >
                            {link.label}
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {locationDetails.length > 0 && (
        <section
          id="locations"
          className="scroll-mt-24 bg-[#e4edf3] py-20 md:py-28 lg:flex lg:min-h-[92svh] lg:items-center lg:py-32"
        >
          <div className="container-wide grid gap-12 lg:grid-cols-[0.37fr_0.63fr] lg:gap-20 xl:gap-28">
            <div>
              <h2 className="max-w-md font-display text-[46px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl">
                Where {name} works.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-[1.7] text-ink-muted">
                {name} practises at {locationDetails.length === 1 ? "this site" : "these sites"}. The right place depends on the consultation and care you need.
              </p>
              <Link
                href="/locations"
                className="mt-8 inline-flex items-center gap-3 border-b border-ink/20 pb-1 text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                Explore all locations <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="space-y-5">
              {locationDetails.map((location, index) => {
                const firstSentence = location.description?.split(". ")[0];
                return (
                  <Link
                    key={location.slug}
                    href={`/locations/${location.slug}`}
                    className="group grid min-h-[210px] gap-8 rounded-[32px] border border-ink/[0.08] bg-[#f8f5ef] p-7 text-ink shadow-[0_24px_60px_-52px_rgba(6,28,70,0.34)] transition-transform duration-500 ease-smooth hover:-translate-y-1 sm:p-9 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <span>
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                        {location.area} · {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-4 block font-display text-[28px] font-medium leading-tight tracking-[-0.025em] md:text-[36px]">
                        {location.name}
                      </span>
                      {location.provider && (
                        <span className="mt-1 block text-sm text-ink-muted">
                          {location.provider}
                        </span>
                      )}
                      {firstSentence && (
                        <span className="mt-5 block max-w-2xl text-[15px] leading-[1.7] text-ink-muted">
                          {firstSentence}.
                        </span>
                      )}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 transition-all duration-300 group-hover:translate-x-1 group-hover:border-accent group-hover:text-accent">
                      <Arrow />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(leadershipParagraphs.length > 0 ||
        c.research?.length ||
        c.achievements?.length ||
        c.disclosures?.length) && (
        <section
          id="professional-work"
          className="scroll-mt-24 py-20 md:py-28 lg:flex lg:min-h-[92svh] lg:items-center lg:py-32"
        >
          <div className="container-wide grid gap-12 lg:grid-cols-[0.37fr_0.63fr] lg:gap-20 xl:gap-28">
            <div>
              <h2 className="max-w-md font-display text-[46px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl">
                Professional work.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-[1.7] text-ink-muted">
                Clinical leadership, research and professional information from {name}&rsquo;s profile.
              </p>
            </div>
            <div className="border-t border-ink/[0.14]">
              {leadershipParagraphs.length > 0 && (
                <InformationDisclosure
                  title="Clinical leadership"
                  paragraphs={leadershipParagraphs}
                  defaultOpen
                />
              )}
              {c.research && c.research.length > 0 && (
                <InformationDisclosure
                  title="Research and publications"
                  paragraphs={c.research}
                />
              )}
              {c.achievements && c.achievements.length > 0 && (
                <InformationDisclosure title="Achievements" paragraphs={c.achievements} />
              )}
              {c.disclosures && c.disclosures.length > 0 && (
                <InformationDisclosure title="Disclosures" paragraphs={c.disclosures} />
              )}
            </div>
          </div>
        </section>
      )}

      <section
        id="contact"
        className="scroll-mt-24 bg-ink py-20 text-white md:py-28 lg:flex lg:min-h-[88svh] lg:items-center lg:py-32"
      >
        <div className="container-wide grid gap-12 lg:grid-cols-[0.54fr_0.46fr] lg:items-center lg:gap-20 xl:gap-28">
          <div>
            <h2 className="max-w-3xl font-display text-[48px] font-medium leading-[0.98] tracking-[-0.05em] text-white md:text-6xl lg:text-7xl">
              Ready to speak to the practice?
            </h2>
            <p className="mt-7 max-w-xl text-[17px] leading-[1.72] text-white/72">
              You do not need to know which treatment you need. The practice team can help you arrange a consultation with {name}.
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/55">
              If you have a referral letter or recent results, you can share them when you contact us.
            </p>
          </div>
          <div className="rounded-[34px] bg-[#f8f5ef] p-7 text-ink sm:p-9 md:p-11">
            <p className="text-sm text-ink-muted">What would help now?</p>
            <Link
              href="/contact?intent=consultation#next-step"
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
              href="/contact?intent=guidance#next-step"
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
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-1">
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
    </article>
  );
}
