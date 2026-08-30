"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChapterTint from "@/components/sections/home/ChapterTint";
import JourneyMapCanvas from "@/components/sections/locations/JourneyMapCanvas";
import { buildFrames, cameraAt, project } from "@/components/sections/locations/mapCamera";
import Button from "@/components/ui/Button";
import { mapAttribution } from "@/content/mapAttribution";
import { journeyStops } from "@/content/journey";
import {
  scrollToAnchor,
} from "@/components/SmoothScroll";

export interface CancerTypePrototypeItem {
  id: string;
  label: string;
  title: string;
  blurb: string;
  treated: boolean;
  entries: { slug: string; title: string }[];
  consultants: { slug: string; name: string; photo?: string; role?: string; areas?: string[] }[];
  treatments: { slug?: string; href?: string; title: string; summary: string; byOthers?: boolean }[];
  locations: { slug: string; name: string; area: string; provider?: string; description?: string; address?: string }[];
  treatmentBasis?: "general" | "cancer-specific" | "consultant-linked" | "unconfirmed";
  treatmentIntro?: string;
  clinicalReview?: {
    status: "draft" | "reviewed";
    reviewedBy?: string;
    reviewerCredentials?: string;
    reviewedOn?: string;
    nextReviewOn?: string;
    sources: { label: string; url: string }[];
    href?: string;
  };
}

const aliases: Record<string, string[]> = {
  breast: ["breast", "mammogram"],
  prostate: ["prostate", "psa"],
  "bladder-and-kidney": ["bladder", "kidney", "renal", "urinary", "urology"],
  colorectal: ["bowel", "colon", "rectal", "colorectal", "lower gi"],
  lung: ["lung", "chest", "airways"],
  "head-and-neck": ["head", "neck", "mouth", "throat", "larynx", "voice box", "salivary", "sinus"],
  gynaecological: ["gynae", "ovary", "ovarian", "womb", "uterine", "endometrial", "cervix", "cervical", "vulva"],
  "brain-and-spinal": ["brain", "spine", "spinal", "cns", "glioma", "tumour"],
  "upper-gi": ["upper gi", "oesophagus", "oesophageal", "gullet", "stomach", "gastric"],
  "liver-and-pancreatic": ["liver", "pancreas", "pancreatic", "bile duct", "hepatic"],
  "skin-and-melanoma": ["skin", "melanoma", "basal cell", "squamous cell", "mole"],
  testicular: ["testicle", "testicular"],
  lymphoma: ["lymphoma", "hodgkin", "non-hodgkin", "lymph"],
  "cancer-of-unknown-primary": ["unknown primary", "cup", "secondary", "metastatic", "primary not known"],
  sarcoma: ["sarcoma", "bone", "soft tissue"],
};

const examples = ["Breast", "Bowel", "Prostate", "Lung"];
const ease = [0.22, 1, 0.36, 1] as const;
const sectionPadding = "pb-16 pt-28 md:pb-20 md:pt-32 lg:py-16";
const shortSectionPadding =
  "pb-16 pt-28 md:pb-20 md:pt-32 lg:pb-16 lg:pt-28";

function Arrow() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M3.5 9h11M10.5 5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m12.2 12.2 4.3 4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Miss|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function searchText(item: CancerTypePrototypeItem) {
  return [item.label, item.title, ...item.entries.map((entry) => entry.title), ...(aliases[item.id] ?? [])]
    .join(" ")
    .toLowerCase();
}

function Finder({
  items,
  query,
  committedTitle,
  onQuery,
  onSelect,
  onUnsure,
  onBrowseAll,
}: {
  items: CancerTypePrototypeItem[];
  query: string;
  committedTitle?: string;
  onQuery: (value: string) => void;
  onSelect: (item: CancerTypePrototypeItem) => void;
  onUnsure: () => void;
  onBrowseAll: () => void;
}) {
  const term = query.trim().toLowerCase();
  const open = Boolean(term) && query !== committedTitle;
  const matches = useMemo(
    () => (term ? items.filter((item) => searchText(item).includes(term)).slice(0, 6) : []),
    [items, term],
  );

  return (
    <div className="mt-8 rounded-[1.6rem] border border-ink/10 bg-white p-4 shadow-[0_22px_60px_-34px_rgba(6,28,70,0.35)] sm:p-5 md:mt-10 md:rounded-[2rem]">
      <label htmlFor="cancer-finder" className="block px-1 font-display text-lg font-semibold text-ink md:text-xl">
        What have you been told?
      </label>
      <p className="mt-1 px-1 text-xs leading-relaxed text-ink-muted md:text-sm">
        Enter a cancer type to see possible matches.
      </p>

      <div className="relative mt-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"><SearchIcon /></span>
        <input
          id="cancer-finder"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Try breast, bowel, lymphoma…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="cancer-finder-results"
          className="h-14 w-full rounded-2xl border border-ink/15 bg-paper pl-12 pr-4 text-base text-ink placeholder:text-ink-muted/65 focus:border-ink/40"
        />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="cancer-finder-results"
            role="listbox"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10">
              {matches.length ? (
                <div className="divide-y divide-ink/10">
                  {matches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected="false"
                      onClick={() => onSelect(item)}
                      className="group flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition-colors hover:bg-sage-wash focus-visible:bg-sage-wash"
                    >
                      <span aria-hidden className="h-2 w-2 flex-none rounded-full bg-sage-soft" />
                      <span className="min-w-0 flex-1 text-sm font-medium text-ink">{item.title}</span>
                      <span className="text-ink-muted transition-transform group-hover:translate-x-1"><Arrow /></span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white px-4 py-4 text-sm text-ink-muted">
                  No close match. <button type="button" onClick={onUnsure} className="font-medium text-ink underline underline-offset-4">Start without the exact type</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!term && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-ink-muted">Examples</span>
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => onQuery(example)} className="rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink/30">
              {example}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
        <button type="button" onClick={onUnsure} className="text-left text-sm text-ink-muted transition-colors hover:text-ink focus-visible:text-ink">
          I’m not sure what type it is
        </button>
        <button type="button" onClick={onBrowseAll} className="text-sm font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
          Browse all
        </button>
      </div>
    </div>
  );
}

const consultantSnapshots: Record<string, string> = {
  "joss-adams": "Dr Adams treats breast and lung cancers as well as lymphoma. He has led clinical trials in breast and lung cancer and brings experience across radiotherapy and drug treatments.",
  "nicola-dallas": "Dr Dallas specialises in urological, head and neck, and thyroid cancers. Her work includes highly targeted radiotherapy techniques designed to shape treatment closely around each patient.",
  "gelareh-eslamian": "Dr Eslamian treats breast and upper gastrointestinal cancers, including pancreatic and oesophageal cancers. She has extensive experience in chemotherapy, immunotherapy, endocrine treatments and targeted antibodies.",
  "alice-freebairn": "Dr Freebairn focuses on colorectal, head and neck, and skin cancers. She has helped introduce advanced radiotherapy techniques in Reading and works closely with regional multidisciplinary teams.",
  "helen-odonnell": "Dr O’Donnell treats gynaecological, prostate, bladder and kidney cancers. She is Clinical Director and Lead Cancer Physician at the Berkshire Cancer Centre, with particular expertise in prostate brachytherapy.",
  "madhumita-bhattacharyya": "Dr Bhattacharyya specialises in breast and ovarian cancers and melanoma using systemic treatments. She is closely involved in clinical trials and leads acute oncology work across the Thames Valley.",
  "ruth-davis": "Dr Davis treats breast and brain cancers and is Radiotherapy Clinical Lead at the Berkshire Cancer Centre. She has helped introduce breath-hold breast radiotherapy and IMRT for brain treatment in Reading.",
  "ayman-madi": "Dr Madi treats breast and colorectal cancers and is Research Lead at the Berkshire Cancer Centre. His work includes clinical trials and research into the treatment of advanced colorectal cancer.",
  "esme-hill": "Dr Hill treats upper gastrointestinal, liver, pancreatic and cancers of unknown primary. She works closely with Reading and Oxford multidisciplinary teams across radiotherapy and systemic treatment.",
  "paul-rogers": "Dr Rogers treats prostate, bladder, kidney and testicular cancers. His experience includes prostate brachytherapy, therapeutic radioisotopes and national clinical trials in urological cancers.",
};

function GeneralSpecialistsViewport({ item, general = false }: { item: CancerTypePrototypeItem; general?: boolean }) {
  const preferredSlugs = ["joss-adams", "nicola-dallas", "gelareh-eslamian", "alice-freebairn", "helen-odonnell", "madhumita-bhattacharyya"];
  const preferred = preferredSlugs.flatMap((slug) => item.consultants.filter((consultant) => consultant.slug === slug));
  const ordered = [...preferred, ...item.consultants.filter((consultant) => !preferredSlugs.includes(consultant.slug))];
  const examples = general ? ordered.slice(0, 5) : ordered;
  const compactRoster = examples.length <= 3;
  const compactRowHeight = examples.length === 1
    ? "lg:min-h-[clamp(280px,40svh,420px)]"
    : examples.length === 2
      ? "lg:min-h-[clamp(250px,31svh,340px)]"
      : "lg:min-h-[clamp(230px,27svh,310px)]";
  const specialistHref = general
    ? "/consultants"
    : `/specialities?type=${item.id}#specialists`;
  const specialistIntro = general
    ? "Each consultant focuses on a smaller group of cancers and treatments. Together, the team covers a broad range of needs."
    : examples.length === 1
      ? `We have one consultant who treats ${item.title.toLowerCase()}. Their profile explains their experience and the treatments they work with.`
      : `We have ${examples.length} consultants who treat ${item.title.toLowerCase()}. Their profiles explain their experience and the treatments they work with.`;

  return (
    <section
      id="specialists"
      data-anchor-align="viewport"
      className={`relative isolate text-ink ${sectionPadding} ${compactRoster ? "lg:flex lg:min-h-[100svh] lg:items-center" : "lg:min-h-[100svh]"}`}
    >
      <ChapterTint colour="var(--surface-warm)" triggerSelector="[data-chapter-tint-trigger]" />
      <div className="site-gutter w-full">
        <div className={`grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 ${compactRoster ? "lg:items-center" : "items-start"}`}>
          <div className={compactRoster ? "" : "lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center"}>
            <div data-chapter-tint-trigger>
              <h2 className="type-feature-title">
                <span className="block lg:whitespace-nowrap">Different expertise.</span>
                <span className="block lg:whitespace-nowrap">One partnership.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted md:text-lg">
                {specialistIntro}
              </p>
              <Button href={specialistHref} variant="ghost" className="mt-7">
                {general ? "Meet all 10 consultants" : `View ${item.title.toLowerCase()} specialists`}
              </Button>
            </div>
          </div>

          <div className="border-t border-ink/15">
            {examples.map((consultant, index) => {
              const originalPhoto = consultant.photo?.replace("/consultants/", "/consultants/tall/");
              return (
                <Link
                  key={consultant.slug}
                  href={`/consultants/${consultant.slug}`}
                  className={`group grid grid-cols-[76px_minmax(0,1fr)] items-start gap-3 border-b border-ink/15 py-7 min-[400px]:grid-cols-[104px_minmax(0,1fr)_40px] min-[400px]:items-center min-[400px]:gap-4 md:grid-cols-[140px_minmax(0,1fr)_40px] md:gap-7 lg:grid-cols-[auto_minmax(0,1fr)_minmax(190px,0.65fr)_40px] lg:gap-8 lg:py-8 ${compactRoster ? compactRowHeight : "lg:min-h-[33.333svh]"}`}
                >
                  <div className="relative aspect-[2/3] w-[76px] overflow-hidden bg-sage-mist min-[400px]:w-[104px] md:w-[140px] lg:h-[clamp(160px,20svh,210px)] lg:w-auto">
                    {originalPhoto ? (
                      <Image src={originalPhoto} alt={consultant.name} fill sizes="(max-width: 768px) 104px, 160px" className="object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-4xl text-ink">{initials(consultant.name)}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] tabular-nums text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                    <p className="type-card-title mt-3 text-ink">{consultant.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">{consultant.role ?? "Consultant Oncologist"}</p>
                    <p className="type-body mt-4 max-w-xl text-ink-muted">
                      {consultantSnapshots[consultant.slug] ?? "A consultant whose practice brings focused experience to a defined group of cancer types and treatment approaches."}
                    </p>
                    <span className="mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-ink/15 transition-colors group-hover:bg-ink group-hover:text-white min-[400px]:hidden"><Arrow /></span>
                  </div>
                  <div className="mt-1 hidden self-center lg:block">
                    <p className="type-label text-ink-muted">{general ? "Specialist areas" : "Cancer focus"}</p>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                      {general
                        ? (consultant.areas ?? []).slice(0, 3).join(" · ")
                        : item.entries.map((entry) => entry.title).join(" · ")}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-ink">View profile <Arrow /></span>
                  </div>
                  <span className="hidden h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition-colors group-hover:bg-ink group-hover:text-white min-[400px]:flex"><Arrow /></span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface TreatmentPanel {
  title: string;
  summary: string;
  detail?: string;
  href?: string;
  linkLabel?: string;
  treatments?: CancerTypePrototypeItem["treatments"];
}

const generalTreatmentPanels: TreatmentPanel[] = [
  {
    title: "Treatment using medicines",
    summary:
      "Chemotherapy, hormone therapy, targeted treatments and immunotherapy may be used alone or with other treatments. Your consultant will explain whether any of these medicines may help you.",
    detail: "Chemotherapy · Hormone therapy · Targeted treatments · Immunotherapy",
    href: "/treatments#medicine-treatments",
    linkLabel: "Understand medicine treatments",
  },
  {
    title: "Precisely targeted radiotherapy",
    summary:
      "Radiotherapy uses carefully planned radiation to treat cancer while limiting the dose to surrounding healthy tissue. Whether it is suitable depends on the cancer, its position and your wider treatment plan.",
    detail: "External beam radiotherapy · Brachytherapy · Radioisotope therapy",
    href: "/treatments/radiotherapy",
    linkLabel: "Understand radiotherapy",
  },
  {
    title: "Combined approaches",
    summary:
      "A treatment plan may bring different approaches together or arrange them in a particular sequence. The order and timing are shaped around your diagnosis, your health and what matters to you.",
    detail: "A plan shaped around you, rather than a standard pathway",
    href: "/treatments",
    linkLabel: "Explore all treatment types",
  },
];

const medicineTreatmentSlugs = new Set([
  "chemotherapy",
  "hormone-therapy",
  "targeted-therapies",
  "immunotherapy",
]);
const radiotherapyTreatmentSlugs = new Set([
  "radiotherapy",
  "brachytherapy",
  "radioisotope-therapy",
]);
function cancerTreatmentPanels(item: CancerTypePrototypeItem): TreatmentPanel[] {
  const consultantLinked = item.treatmentBasis === "consultant-linked";

  if (consultantLinked) {
    return [
      {
        title: "General treatment information",
        summary:
          "The treatments page explains medicines and radiotherapy in general terms. It does not identify what would be suitable for you or form part of your care.",
        href: "/treatments",
        linkLabel: "Read about treatment types",
      },
    ];
  }

  const medicineTreatments = item.treatments.filter(
    (treatment) => treatment.slug && medicineTreatmentSlugs.has(treatment.slug),
  );
  const radiotherapyTreatments = item.treatments.filter(
    (treatment) => treatment.slug && radiotherapyTreatmentSlugs.has(treatment.slug),
  );
  const otherTreatments = item.treatments.filter(
    (treatment) =>
      !treatment.slug ||
      (!medicineTreatmentSlugs.has(treatment.slug) &&
        !radiotherapyTreatmentSlugs.has(treatment.slug)),
  );

  const panels: TreatmentPanel[] = [
    {
      title: "Treatment using medicines",
      summary: "Medicine treatments that may be discussed in some situations.",
      treatments: medicineTreatments,
    },
    {
      title: "Radiotherapy approaches",
      summary: "Radiotherapy approaches that may be discussed in some situations.",
      treatments: radiotherapyTreatments,
    },
    {
      title: "Other and combined approaches",
      summary:
        "Depending on the diagnosis, care may also involve surgery, research or another approach alongside oncology treatment.",
      treatments: otherTreatments,
    },
  ].filter((panel) => panel.treatments && panel.treatments.length > 0);

  if (panels.length > 0) return panels;

  return [
    {
      title: "Your treatment plan",
      summary: `We do not have a general treatment overview for ${item.title.toLowerCase()} here yet. A consultant can talk you through what information they need and what happens next.`,
      href: `/specialities/${item.entries[0]?.slug ?? item.id}`,
      linkLabel: `Read about ${item.title.toLowerCase()}`,
    },
  ];
}

function TreatmentsViewport({ item, general = false }: { item: CancerTypePrototypeItem; general?: boolean }) {
  const treatmentPanels = useMemo(
    () => (general ? generalTreatmentPanels : cancerTreatmentPanels(item)),
    [general, item],
  );
  // Cancer-specific copy is grouped by treatment type for scanning, not by
  // clinical priority. Start every group closed so the first panel cannot read
  // as a recommendation or an implied treatment sequence.
  const collapseByDefault = !general;
  const [openTreatment, setOpenTreatment] = useState<number | null>(
    collapseByDefault ? null : 0,
  );
  const treatmentSectionRef = useRef<HTMLElement>(null);
  const manualTreatmentUntil = useRef(0);
  const treatmentReducedMotion = useReducedMotion();

  useEffect(() => {
    if (collapseByDefault || treatmentReducedMotion || treatmentPanels.length < 2) return;

    let animationFrame = 0;
    const updateFromScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const section = treatmentSectionRef.current;
        if (!section || window.innerWidth < 1024 || Date.now() < manualTreatmentUntil.current) return;

        const bounds = section.getBoundingClientRect();
        const lockedDistance = Math.max(1, bounds.height - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -bounds.top / lockedDistance));
        const nextTreatment = Math.min(
          treatmentPanels.length - 1,
          Math.floor(progress * treatmentPanels.length),
        );
        setOpenTreatment((current) => (current === nextTreatment ? current : nextTreatment));
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [collapseByDefault, treatmentPanels.length, treatmentReducedMotion]);

  function chooseTreatment(index: number) {
    manualTreatmentUntil.current = Date.now() + 1400;
    setOpenTreatment((current) =>
      collapseByDefault && current === index ? null : index,
    );
  }

  const sectionHeight = collapseByDefault || treatmentPanels.length === 1
    ? "lg:min-h-[100svh]"
    : treatmentPanels.length === 2
      ? "lg:min-h-[145svh]"
      : "lg:min-h-[175svh]";

  return (
    <section id="treatments" data-anchor-align="viewport" ref={treatmentSectionRef} className={`relative bg-transparent pb-16 pt-28 text-ink md:pb-20 md:pt-32 lg:py-0 ${sectionHeight}`}>
      <div className="site-gutter w-full lg:sticky lg:top-0 lg:flex lg:min-h-[100svh] lg:items-center lg:py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[0.4fr_0.6fr] lg:items-center lg:gap-[5vw]">
          <div>
            <h2 className="type-feature-title max-w-[9ch]">
              {general
                ? "Understand one thing at a time."
                : "Treatment approaches you may hear about."}
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
              {general
                ? "You do not need to compare or choose treatments yourself. This section explains some of the language you may hear during a consultation."
                : item.treatmentBasis === "cancer-specific"
                  ? item.treatmentIntro ?? `Treatment for ${item.title.toLowerCase()} depends on the exact diagnosis, the extent of the cancer, relevant test results, treatment you have already had, your general health and what matters to you. The approaches below may be discussed, but this page cannot show which, if any, are suitable for you.`
                  : `We do not yet have a clinically reviewed treatment guide for ${item.title.toLowerCase()}. You can read general information about treatment types, but their inclusion on this site does not mean they would form part of your care. A consultant would need to review your diagnosis and test results before explaining what, if anything, may be relevant.`}
            </p>
            {general && (
              <p className="mt-6 max-w-sm text-xs leading-relaxed text-ink-muted">
                This is general information, not a treatment recommendation.
              </p>
            )}
            {!general && item.clinicalReview && (
              <div className="mt-7 max-w-md border-t border-ink/15 pt-5 text-xs leading-relaxed text-ink-muted">
                {item.clinicalReview.status === "reviewed" ? (
                  <>
                    <p>
                      Clinically reviewed by {item.clinicalReview.reviewedBy}
                      {item.clinicalReview.reviewerCredentials
                        ? `, ${item.clinicalReview.reviewerCredentials}`
                        : ""}
                      {` · ${item.clinicalReview.reviewedOn}.`}
                    </p>
                    {item.clinicalReview.nextReviewOn && (
                      <p className="mt-2">Next review due {item.clinicalReview.nextReviewOn}.</p>
                    )}
                  </>
                ) : (
                  <p>Draft clinical information. Awaiting review by one of the partnership’s consultants.</p>
                )}
                <p className="mt-2">
                  Sources:{" "}
                  {item.clinicalReview.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 && "; "}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                      >
                        {source.label}
                      </a>
                    </span>
                  ))}
                  .
                </p>
                {item.clinicalReview.href && (
                  <Link
                    href={item.clinicalReview.href}
                    className="mt-2 inline-flex items-center gap-2 font-medium text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink"
                  >
                    View the full guide and review status <Arrow />
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-ink/15">
            {treatmentPanels.map((panel, index) => {
              const open = openTreatment === index;

              return (
                <motion.div
                  key={panel.title}
                  layout="position"
                  transition={{ layout: { duration: treatmentReducedMotion ? 0 : 0.58, ease } }}
                  className="border-b border-ink/15"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => chooseTreatment(index)}
                    className="group grid w-full grid-cols-[28px_minmax(0,1fr)_32px] items-start gap-4 py-7 text-left md:grid-cols-[34px_minmax(0,1fr)_36px] md:gap-6 md:py-9"
                  >
                    <span className="pt-1 text-[10px] tabular-nums text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                    <span className="type-card-title text-ink">
                      {panel.title}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-lg leading-none text-ink transition-colors group-hover:border-ink/15" aria-hidden>
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, y: 8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -5 }}
                        transition={{
                          height: { duration: treatmentReducedMotion ? 0 : 0.62, ease },
                          opacity: { duration: treatmentReducedMotion ? 0 : 0.4, ease },
                          y: { duration: treatmentReducedMotion ? 0 : 0.48, ease },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 pb-8 md:grid-cols-[34px_minmax(0,1fr)] md:gap-6 md:pb-10">
                          <span aria-hidden />
                          <div>
                            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted md:text-base">
                              {panel.summary}
                            </p>

                            {panel.treatments && panel.treatments.length > 0 && (
                              <div className="mt-5 border-t border-ink/10">
                                {panel.treatments.map((treatment) => {
                                  const content = (
                                    <>
                                      <span>
                                        <span className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold leading-tight text-ink">
                                          {treatment.title}
                                          {treatment.byOthers && (
                                            <span className="type-label rounded-full bg-section-warm px-2 py-1 font-sans text-ink-muted">
                                              Another specialist
                                            </span>
                                          )}
                                        </span>
                                        <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-ink-muted">
                                          {treatment.summary}
                                        </span>
                                      </span>
                                      {treatment.href && (
                                        <span className="mt-1 text-ink-muted transition-transform group-hover/link:translate-x-1 group-hover/link:text-ink"><Arrow /></span>
                                      )}
                                    </>
                                  );

                                  return treatment.href ? (
                                    <Link
                                      key={`${treatment.href}-${treatment.title}`}
                                      href={treatment.href}
                                      className="group/link grid grid-cols-[minmax(0,1fr)_28px] gap-4 border-b border-ink/10 py-4 last:border-b-0"
                                    >
                                      {content}
                                    </Link>
                                  ) : (
                                    <div
                                      key={treatment.title}
                                      className="grid grid-cols-1 border-b border-ink/10 py-4 last:border-b-0"
                                    >
                                      {content}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {panel.detail && <p className="type-supporting mt-4 text-ink-muted">{panel.detail}</p>}
                            {panel.href && panel.linkLabel && (
                              <Link href={panel.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink">
                                {panel.linkLabel} <Arrow />
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function GeneralLocationsViewport({ item, general = false }: { item: CancerTypePrototypeItem; general?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const rotationDirection = useRef<1 | -1>(1);
  const reducedMotion = useReducedMotion();
  const stops = useMemo(
    () => journeyStops.filter((stop) => item.locations.some((location) => location.slug === stop.slug)),
    [item.locations],
  );
  const [activeLocation, setActiveLocation] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);
  const [rotationCycle, setRotationCycle] = useState(0);
  const mapProgress = useMotionValue(1);
  const activeStop = stops[activeLocation] ?? stops[0];
  const mapFrames = useMemo(() => buildFrames(stops), [stops]);
  const activeCamera = activeStop ? cameraAt(mapFrames, activeLocation + 1) : null;
  const activePin = activeStop ? project(activeStop.lat, activeStop.lng) : null;
  const panelOnRight = Boolean(activeCamera && activePin && activePin.x < activeCamera.x);
  const stopGridClass = [
    "sm:grid-cols-1",
    "sm:grid-cols-1",
    "sm:grid-cols-2",
    "sm:grid-cols-3",
    "sm:grid-cols-4",
    "sm:grid-cols-5",
  ][Math.min(stops.length, 5)];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSectionVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sectionVisible || reducedMotion || stops.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveLocation((current) => {
        if (current >= stops.length - 1) rotationDirection.current = -1;
        if (current <= 0) rotationDirection.current = 1;
        return current + rotationDirection.current;
      });
    }, 5200);

    return () => window.clearInterval(interval);
  }, [reducedMotion, rotationCycle, sectionVisible, stops.length]);

  useEffect(() => {
    const destination = activeLocation + 1;
    const distance = Math.abs(mapProgress.get() - destination);
    const controls = animate(mapProgress, destination, {
      duration: reducedMotion ? 0 : Math.min(1.9, 1.05 + distance * 0.18),
      ease,
    });
    return () => controls.stop();
  }, [activeLocation, mapProgress, reducedMotion]);

  function chooseLocation(index: number) {
    rotationDirection.current = index >= activeLocation ? 1 : -1;
    setActiveLocation(index);
    setRotationCycle((cycle) => cycle + 1);
  }

  return (
    <section id="locations" data-anchor-align="viewport" ref={sectionRef} className={`flex min-h-[100svh] items-center bg-sage-panel text-ink ${sectionPadding}`}>
      <div className="site-gutter grid w-full gap-12 lg:grid-cols-[0.35fr_0.65fr] lg:items-center lg:gap-[5vw]">
        <div>
          <h2 className="type-feature-title max-w-[8ch]">
            Where care can happen.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
            {general
              ? "Our consultants practise across hospitals and specialist centres in Reading, Windsor and Oxford. The right place depends on your consultant and the care you need."
              : item.treatmentBasis === "consultant-linked"
                ? `These are some of the places connected to consultants who treat ${item.title.toLowerCase()}. Your consultant will confirm where your appointments and treatment would take place.`
                : `Where appointments or treatment take place depends on your exact care plan and provider. We have not inferred a location from the general treatment information for ${item.title.toLowerCase()}; the practice team or your consultant will confirm it.`}
          </p>
          <Button href="/locations" variant="ghost" className="mt-8">Explore all locations</Button>
        </div>

        <div>
          {activeStop ? (
            <>
              <div className="relative min-h-[520px] rounded-[2.25rem] border border-ink/10 shadow-[0_28px_75px_-48px_rgba(6,28,70,0.38)] lg:min-h-[clamp(480px,62svh,620px)]">
                <div className="absolute inset-0 overflow-hidden rounded-[calc(2.25rem-1px)] bg-canvas">
                  <JourneyMapCanvas stops={stops} active={activeLocation} progress={mapProgress} />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/65 via-transparent to-transparent" aria-hidden />

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.article
                      key={activeStop.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: reducedMotion ? 0 : 0.55, ease }}
                      className={`absolute bottom-5 left-5 right-5 rounded-[1.65rem] border border-ink/10 bg-paper/95 p-5 shadow-[0_22px_60px_-38px_rgba(6,28,70,0.38)] backdrop-blur-md md:bottom-7 md:w-[40%] md:p-6 ${panelOnRight ? "md:left-auto md:right-7" : "md:left-7 md:right-auto"}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="type-label text-ink-muted">{activeStop.area}</span>
                        <span className="text-[10px] tabular-nums text-ink-muted">{String(activeLocation + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}</span>
                      </div>
                      <h3 className="type-card-title mt-3">{activeStop.name}</h3>
                      <p className="mt-1 text-xs text-ink-muted">{activeStop.provider ?? activeStop.eyebrow}</p>
                      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-muted">{activeStop.description}</p>
                      <Link href={activeStop.href} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:decoration-ink">
                        View this location <Arrow />
                      </Link>
                    </motion.article>
                  </AnimatePresence>

                  <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-canvas/80 px-2.5 py-1 text-[8px] leading-none text-ink-muted backdrop-blur-sm">{mapAttribution}</p>
                </div>
              </div>

              <div className={`mt-4 grid gap-px overflow-hidden rounded-[1.35rem] border border-ink/10 bg-ink/10 ${stopGridClass}`}>
                {stops.map((stop, index) => {
                  const active = index === activeLocation;
                  return (
                    <button
                      key={stop.slug}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseLocation(index)}
                      className="group relative min-w-0 bg-sage-wash px-4 py-4 text-left transition-colors hover:bg-white/60"
                    >
                      <span className="type-label block text-ink-muted">{stop.area}</span>
                      <span className={`mt-1 block truncate font-display text-sm font-semibold transition-colors ${active ? "text-ink" : "text-ink/60 group-hover:text-ink"}`}>{stop.name.replace(" Hospital", "")}</span>
                      <motion.span
                        aria-hidden
                        initial={false}
                        animate={{ scaleX: active ? 1 : 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.5, ease }}
                        className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-ink"
                      />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] items-center rounded-[2.25rem] border border-ink/10 bg-canvas p-8 shadow-[0_28px_75px_-48px_rgba(6,28,70,0.38)] md:p-12 lg:min-h-[clamp(480px,62svh,620px)]">
              <div className="max-w-xl">
                <h3 className="type-section-title text-ink">Where you go depends on the care you need.</h3>
                <p className="mt-5 text-base leading-relaxed text-ink-muted">We do not have a location listed for this cancer type. Once a consultant has reviewed your diagnosis, the practice team can explain where your appointments and treatment would take place.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function LocationsViewport({ item, general = false }: { item: CancerTypePrototypeItem; general?: boolean }) {
  return <GeneralLocationsViewport item={item} general={general} />;
}

function CancerJourney({ item, onReset, general = false }: { item: CancerTypePrototypeItem; onReset: () => void; general?: boolean }) {
  if (!item.treated) {
    return (
      <motion.div id="specialists" data-anchor-align="viewport" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scroll-mt-28">
        <section className={`flex min-h-[82svh] items-center bg-section-warm text-ink ${sectionPadding}`}>
          <div className="site-gutter grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-20">
            <div>
              <h2 className="type-editorial-hero max-w-2xl">We do not currently have a consultant who treats this cancer.</h2>
            </div>
            <div>
              <p className="max-w-lg text-lg leading-relaxed text-ink-muted">The practice team can still help you find an appropriate specialist service.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Button href="/contact#guidance">Talk to the team</Button><button type="button" onClick={onReset} className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium">Choose another type</button></div>
            </div>
          </div>
        </section>
        {item.clinicalReview && <TreatmentsViewport item={item} />}
      </motion.div>
    );
  }

  return (
    <motion.div id="cancer-journey" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease }} className="scroll-mt-24">
      <GeneralSpecialistsViewport item={item} general={general} />
      <TreatmentsViewport item={item} general={general} />
      <LocationsViewport item={item} general={general} />
    </motion.div>
  );
}

export default function CancerTypesPrototype({ items }: { items: CancerTypePrototypeItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUnsure, setShowUnsure] = useState(false);
  const selected = items.find((item) => item.id === selectedId);
  const generalItem = useMemo<CancerTypePrototypeItem>(() => {
    const consultants = new Map<string, CancerTypePrototypeItem["consultants"][number]>();
    const treatments = new Map<string, CancerTypePrototypeItem["treatments"][number]>();
    const locations = new Map<string, CancerTypePrototypeItem["locations"][number]>();
    const entries = new Map<string, CancerTypePrototypeItem["entries"][number]>();

    journeyStops.forEach((stop) => {
      if (!stop.slug) return;
      locations.set(stop.slug, {
        slug: stop.slug,
        name: stop.name,
        area: stop.area,
        provider: stop.provider,
        description: stop.description,
        address: stop.address,
      });
    });

    for (const item of items.filter((candidate) => candidate.treated)) {
      item.consultants.forEach((consultant) => {
        const existing = consultants.get(consultant.slug);
        consultants.set(consultant.slug, {
          ...consultant,
          areas: Array.from(new Set([...(existing?.areas ?? []), item.label])),
        });
      });
      item.treatments.forEach((treatment) => {
        if (treatment.slug && !treatments.has(treatment.slug)) treatments.set(treatment.slug, treatment);
      });
      item.entries.forEach((entry) => entries.set(entry.slug, entry));
    }

    return {
      id: "general",
      label: "Cancer",
      title: "All cancer care",
      blurb: "An overview of the consultants, treatments and locations across the partnership.",
      treated: true,
      entries: Array.from(entries.values()),
      consultants: Array.from(consultants.values()),
      treatments: Array.from(treatments.values()),
      locations: Array.from(locations.values()),
      treatmentBasis: "general",
    };
  }, [items]);
  const journeyItem = selected ?? generalItem;
  const journeySteps = selected && !selected.treated
    ? [
        { label: "Specialist guidance", href: "#specialists" },
        { label: "Possible treatment information", href: "#treatments" },
        { label: "Contact and next steps", href: "#contact-next-step" },
      ]
    : [
        { label: "Specialists", href: "#specialists" },
        { label: "Possible treatments", href: "#treatments" },
        { label: "Care locations", href: "#locations" },
        { label: "Contact and next steps", href: "#contact-next-step" },
      ];

  const scrollTo = useCallback(
    (id: string) => {
      requestAnimationFrame(() =>
        window.setTimeout(() => {
          scrollToAnchor(id, { duration: 0.9 });
        }, 60),
      );
    },
    [],
  );

  const alignBrowseAll = useCallback(
    (immediate: boolean, moveFocus: boolean) => {
      scrollToAnchor("browse-all", {
        duration: 0.9,
        immediate,
        focus: moveFocus,
      });
    },
    [],
  );

  useEffect(() => {
    let resizeTimer: number | null = null;

    const realignAfterResize = () => {
      if (window.location.hash !== "#browse-all") return;
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => alignBrowseAll(true, false),
        180,
      );
    };

    window.addEventListener("resize", realignAfterResize);
    return () => {
      window.removeEventListener("resize", realignAfterResize);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    };
  }, [alignBrowseAll]);

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const type = new URL(window.location.href).searchParams.get("type");
      const item = items.find((candidate) => candidate.id === type);
      setSelectedId(item?.id ?? null);
      setQuery(item?.title ?? "");
      setShowUnsure(false);

      // A homepage cancer card links straight to the selected specialists
      // viewport. Repeat the anchor scroll after React has replaced the
      // general journey with the selected one, otherwise the change in content
      // height can leave the visitor above or below the intended section.
      const isSpecialistDestination =
        window.location.hash === "#specialists" ||
        window.location.hash === "#cancer-journey";

      if (item && isSpecialistDestination) {
        if (window.location.hash !== "#specialists") {
          const canonicalUrl = new URL(window.location.href);
          canonicalUrl.hash = "specialists";
          window.history.replaceState(
            window.history.state,
            "",
            canonicalUrl,
          );
        }

        requestAnimationFrame(() =>
          window.setTimeout(
            () => scrollTo("specialists"),
            60,
          ),
        );
      } else if (!item && window.location.hash === "#browse-all") {
        requestAnimationFrame(() =>
          window.setTimeout(
            () => alignBrowseAll(true, false),
            60,
          ),
        );
      }
    };

    syncSelectionFromUrl();
    window.addEventListener("popstate", syncSelectionFromUrl);
    return () => window.removeEventListener("popstate", syncSelectionFromUrl);
  }, [alignBrowseAll, items, scrollTo]);

  function selectItem(item: CancerTypePrototypeItem) {
    const url = new URL(window.location.href);
    url.searchParams.set("type", item.id);
    url.hash = "specialists";
    window.history.pushState({}, "", url);
    setSelectedId(item.id);
    setShowUnsure(false);
    setQuery(item.title);
    scrollTo("specialists");
  }

  function showNotSure() {
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.hash = "not-sure";
    window.history.pushState({}, "", url);
    setSelectedId(null);
    setShowUnsure(true);
    scrollTo("not-sure");
  }

  function browseAll() {
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.hash = "browse-all";
    window.history.pushState({}, "", url);
    setSelectedId(null);
    setShowUnsure(false);
    setQuery("");
    requestAnimationFrame(() =>
      window.setTimeout(() => alignBrowseAll(false, true), 60),
    );
  }

  function resetJourney() {
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.hash = "";
    window.history.pushState({}, "", url);
    setSelectedId(null);
    setShowUnsure(false);
    setQuery("");
    requestAnimationFrame(() =>
      window.setTimeout(
        () => scrollToAnchor("cancer-finder", { focus: true }),
        60,
      ),
    );
  }

  return (
    <>
      <section className="pb-16 pt-32 text-ink md:pb-20 md:pt-40 lg:pb-16">
        <div className="site-gutter grid w-full items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
          <div className="max-w-2xl">
            <h1 className="type-page-hero text-ink">
              Start with what you’ve been told.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted md:mt-6 md:text-xl">
              You do not need the exact clinical name. Try a cancer type such as breast, bowel, prostate or lung, or browse the full list below.
            </p>
            <Finder items={items} query={query} committedTitle={selected?.title} onQuery={setQuery} onSelect={selectItem} onUnsure={showNotSure} onBrowseAll={browseAll} />
          </div>

          <div className="relative hidden min-h-[610px] lg:block">
            <div className="absolute right-0 top-[2%] h-[74%] w-[55%] rounded-[2.75rem] bg-accent-mist" />

            <div className="absolute left-0 top-[8%] h-[68%] w-[73%] overflow-hidden rounded-[2.4rem] border border-ink/10 bg-white shadow-[0_30px_76px_-42px_rgba(6,28,70,0.4)]">
              <div className="relative h-full w-full">
                <Image
                  src="/home/hero.jpg"
                  alt=""
                  fill
                  priority
                  sizes="42vw"
                  className="object-cover object-[66%_center]"
                />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[82%] rounded-[2rem] border border-ink/10 bg-paper p-4 shadow-[0_30px_78px_-38px_rgba(6,28,70,0.42)]">
              <div className="flex items-center justify-between border-b border-ink/10 px-2 pb-3">
                <p className="font-display text-lg font-semibold text-ink">Your cancer pathway</p>
                <span className="type-label text-ink-muted">{journeySteps.length === 3 ? "Three steps" : "Four steps"}</span>
              </div>
              <ol className="divide-y divide-ink/10">
                {journeySteps.map(({ label, href }, index) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="group flex items-center gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-ink/[0.035] focus-visible:bg-ink/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                    >
                      <span aria-hidden className={`h-2.5 w-2.5 flex-none rounded-full transition-colors group-hover:bg-sage-soft ${index === 0 ? "bg-sage-soft" : "border border-ink/20"}`} />
                      <span className="type-compact-title min-w-0 flex-1 leading-tight text-ink">{label}</span>
                      <span className="text-ink transition-transform duration-300 group-hover:translate-x-1"><Arrow /></span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        <CancerJourney key={journeyItem.id} item={journeyItem} onReset={resetJourney} general={!selected} />
      </AnimatePresence>

      <AnimatePresence>
        {showUnsure && (
          <motion.section id="not-sure" data-anchor-align="viewport" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`scroll-mt-28 bg-section-cool ${shortSectionPadding}`}>
            <div className="site-gutter grid w-full gap-7 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
              <h2 className="max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">Not knowing the exact name is a normal place to begin.</h2>
              <div>
                <p className="text-base leading-relaxed text-ink/75">If you have a referral letter, scan report or consultant’s name, send us what you have. The practice team can help work out who you need to speak to.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button href="/contact#guidance">Ask the practice team</Button>
                  <button type="button" onClick={browseAll} className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink hover:border-ink/40">Browse all cancer types</button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!selected && (
        <section id="browse-all" data-anchor-align="viewport" tabIndex={-1} aria-labelledby="browse-all-heading" className={`scroll-mt-28 bg-white focus:outline-none ${shortSectionPadding}`}>
          <div className="site-gutter w-full">
            <div className="flex flex-col items-center border-b border-ink/10 pb-10 text-center">
              <h2 id="browse-all-heading" className="max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">Browse all cancer types.</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">Choose the name that looks closest to what you have been told. You can check the details on the next page.</p>
            </div>

            <div className="mt-8 grid gap-x-12 md:mt-12 md:grid-cols-2">
              {items.map((item, index) => (
                <button key={item.id} type="button" onClick={() => selectItem(item)} className="group grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-ink/15 py-4 text-left transition-colors hover:border-ink/45 focus-visible:border-ink/60 md:py-5">
                  <span className="text-[11px] tabular-nums text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-display text-lg font-semibold leading-tight text-ink transition-colors group-hover:text-accent md:text-xl">{item.title}</span>
                    {!item.treated && <span className="type-supporting mt-1 block text-ink-muted">Not currently treated here</span>}
                  </span>
                  <span className="text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"><Arrow /></span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
