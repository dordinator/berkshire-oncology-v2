"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { organisationGroups, domain } from "@/content/organisations";
import { hospitals } from "@/content/hospitals";
import ChapterTint from "@/components/sections/home/ChapterTint";
import HospitalStrip from "@/components/sections/home/HospitalStrip";
import RegionMap from "@/components/site/RegionMap";

const SUPPORT_CHAPTER_BLUE = "#dbe8ee";

type ResourceResult = {
  id: string;
  title: string;
  description: string;
  category: string;
  href: string;
  logo?: string;
  external: boolean;
  keywords: string;
};

const resultItems: ResourceResult[] = [
  ...organisationGroups.flatMap((group) =>
    group.entries.map(({ link, reason }) => ({
      id: `organisation-${link.name}`,
      title: link.name,
      description: reason ?? group.note,
      category: group.title,
      href: link.url,
      logo: link.logo,
      external: true,
      keywords: `${link.name} ${reason ?? ""} ${group.title} ${group.note}`,
    })),
  ),
];

const informationResources = resultItems.filter(
  (result) => result.category === "Information and support",
);
const informationHalf = Math.ceil(informationResources.length / 2);
const informationColumns = [
  informationResources.slice(0, informationHalf),
  informationResources.slice(informationHalf),
];

const resourceLogoSizes: Record<string, string> = {
  "/links/macmillan.png": "w-[88%] max-w-[430px]",
  "/links/cancer-research-uk.png": "w-[72%] max-w-[220px]",
  "/links/nhs.png": "w-[76%] max-w-[250px]",
  "/links/maggies.png": "w-[84%] max-w-[340px]",
  "/links/cancer-care-map.png": "w-[88%] max-w-[430px]",
};

const compactResourceLogoSizes: Record<string, string> = {
  "/links/macmillan.png": "w-full",
  "/links/cancer-research-uk.png": "w-[78%] max-w-[100px]",
  "/links/nhs.png": "w-[82%] max-w-[105px]",
  "/links/maggies.png": "w-full",
  "/links/cancer-care-map.png": "w-full",
};

const suggestedSearches = [
  {
    title: "Macmillan Cancer Support",
    detail: "Practical, financial and emotional support",
    query: "Macmillan",
    category: "Charity",
  },
  {
    title: "Cancer Research UK",
    detail: "Cancer types, treatments and clinical trials",
    query: "Cancer Research UK",
    category: "Information",
  },
  {
    title: "Healthcare at Home (Sciensus)",
    detail: "Medicines and cancer care at home when arranged by your care team",
    query: "Sciensus",
    category: "Home cancer care",
  },
  {
    title: "Hospitals and treatment centres",
    detail: "Reading, Windsor and Oxford",
    query: "private oncology services",
    category: "Locations",
  },
  {
    title: "Support with benefits and money",
    detail: "Practical and financial support",
    query: "financial benefits",
    category: "Support",
  },
];

const resourceFaqs = [
  {
    question: "Where can I read trusted information about cancer and treatment?",
    answer:
      "The NHS explains symptoms, cancer types and common treatments. Cancer Research UK has detailed information about cancer types, tests, treatments and clinical trials. For advice about your own situation, speak to your consultant or clinical team.",
    resources: ["NHS cancer information", "Cancer Research UK"],
  },
  {
    question: "Where can I find practical or emotional support?",
    answer:
      "Macmillan covers practical and financial support; Maggie’s offers free practical, emotional and social support.",
    resources: ["Macmillan Cancer Support", "Maggie’s"],
  },
  {
    question: "How can I find support close to home?",
    answer:
      "Cancer Care Map lets you search for cancer support services near you, anywhere in the UK.",
    resources: ["Cancer Care Map"],
  },
  {
    question: "Can some care be provided at home?",
    answer:
      "Sciensus provides some medicines and cancer care at home when this is arranged by your care team.",
    resources: ["Healthcare at Home (Sciensus)"],
  },
  {
    question: "How will I know which hospital to attend?",
    answer:
      "Your consultant and treatment determine the location. The practice will confirm it with you.",
    resources: [],
    internalLink: { href: "#treatment-locations", label: "View treatment locations" },
  },
  {
    question: "Where can I find specialist urology services?",
    answer:
      "The Forbury Clinic is run by the Reading Urology Partnership. Contact the clinic directly to ask which services are available.",
    resources: ["The Forbury Clinic (Reading Urology Partnership)"],
  },
];

function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="10.8" cy="10.8" r="6.7" stroke="currentColor" strokeWidth="1.55" />
      <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ external = false }: { external?: boolean }) {
  return (
    <span aria-hidden className="text-lg leading-none">
      {external ? "↗" : "→"}
    </span>
  );
}

function ResultRow({ result }: { result: ResourceResult }) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas-soft text-ink-muted transition-colors group-hover:bg-white">
        <SearchIcon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-snug text-ink">
          {result.title}
        </span>
        <span className="mt-0.5 block line-clamp-1 text-[13px] leading-snug text-ink-muted">
          {result.description}
        </span>
      </span>
      <span className="hidden shrink-0 rounded-full bg-canvas-soft px-3 py-1.5 text-[11px] font-medium text-ink-muted sm:block">
        {result.category}
      </span>
      <span className="shrink-0 text-ink-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-ink">
        <ArrowIcon external={result.external} />
      </span>
    </>
  );

  const cls =
    "group grid min-h-[62px] grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-canvas-soft sm:grid-cols-[36px_minmax(0,1fr)_auto_auto]";

  return result.external ? (
    <a href={result.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={result.href} className={cls}>
      {content}
    </Link>
  );
}

function FeatureResourceCard({
  result,
  index,
}: {
  result: ResourceResult;
  index: number;
}) {
  return (
    <a
      href={result.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex min-h-[390px] w-full flex-col overflow-hidden rounded-[1.75rem] border border-ink/[0.07] bg-[#f8f7f4] p-5 text-ink shadow-[0_24px_70px_-35px_rgba(6,28,70,0.3)] transition-transform duration-500 hover:-translate-y-1 sm:min-h-[420px] sm:rounded-[2rem] sm:p-7 md:min-h-[430px] lg:p-8 xl:min-h-[450px]"
    >
      <span className="flex items-start justify-between gap-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          0{index + 1}
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
          <ArrowIcon external />
        </span>
      </span>

      <span className="mt-4 flex min-h-28 flex-1 items-center justify-center overflow-hidden py-2 sm:mt-5 sm:min-h-32 lg:min-h-36">
        <ResourceLogo result={result} />
      </span>

      <span className="block pt-2 sm:pt-3">
        <span className="block font-display text-[19px] font-semibold leading-tight tracking-tight text-ink sm:text-2xl">
          {result.title}
        </span>
        <span className="mt-2 block max-w-md text-[12px] leading-relaxed text-ink-muted sm:text-sm">
          {result.description}
        </span>
        <span className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-accent sm:mt-5">
          Visit {domain(result.href)}
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
            ↗
          </span>
        </span>
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function ResourceLogo({
  result,
  compact = false,
}: {
  result: ResourceResult;
  compact?: boolean;
}) {
  if (!result.logo) {
    return (
      <span
        className={`font-display font-semibold text-ink ${
          compact ? "text-3xl" : "text-4xl"
        }`}
      >
        {result.title.charAt(0)}
      </span>
    );
  }

  if (result.logo === "/links/sciensus.png") {
    return (
      <span
        className={`relative block aspect-[540/103] overflow-hidden ${
          compact ? "w-full max-w-[118px]" : "w-[84%] max-w-[290px]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.logo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center mix-blend-multiply"
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={result.logo}
      alt=""
      className={`block h-auto object-contain ${
        compact
          ? `max-h-16 ${
              compactResourceLogoSizes[result.logo] ?? "w-[86%] max-w-[110px]"
            }`
          : resourceLogoSizes[result.logo] ?? "w-[82%] max-w-[300px]"
      }`}
    />
  );
}

function CompactResourceRow({
  result,
  index,
}: {
  result: ResourceResult;
  index: number;
}) {
  return (
    <a
      href={result.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid min-h-[138px] w-full grid-cols-[7.5rem_minmax(0,1fr)_2.75rem] items-center gap-5 rounded-[1.5rem] border border-ink/[0.07] bg-[#f8f7f4] p-5 text-ink shadow-[0_18px_55px_-36px_rgba(6,28,70,0.3)] transition duration-300 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_22px_60px_-34px_rgba(6,28,70,0.36)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span className="relative flex h-20 w-full items-center justify-center overflow-hidden">
        <span className="absolute left-0 top-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          0{index + 1}
        </span>
        <ResourceLogo result={result} compact />
      </span>

      <span className="min-w-0">
        <span className="block font-display text-[19px] font-semibold leading-tight tracking-tight text-ink">
          {result.title}
        </span>
        <span className="mt-1.5 block text-[12px] leading-relaxed text-ink-muted">
          {result.description}
        </span>
        <span className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold text-accent">
          Visit {domain(result.href)}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1 group-focus-visible:translate-x-1"
          >
            ↗
          </span>
        </span>
      </span>

      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white group-focus-visible:border-ink group-focus-visible:bg-ink group-focus-visible:text-white">
        <ArrowIcon external />
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function ResourceSearchLanding() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) return [];
    const terms = normalise(trimmed)
      .split(" ")
      .filter((term) => term.length > 1);

    if (terms.length === 0) return [];

    return resultItems
      .map((item) => {
        const title = normalise(item.title);
        const haystack = normalise(`${item.title} ${item.keywords}`);
        const matches = terms.every((term) => haystack.includes(term));
        const score = terms.reduce(
          (total, term) => total + (title.includes(term) ? 3 : haystack.includes(term) ? 1 : 0),
          0,
        );
        return { item, matches, score };
      })
      .filter(({ matches }) => matches)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
      .map(({ item }) => item);
  }, [trimmed]);

  const chooseSuggestion = (value: string) => {
    setQuery(value);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const browseAll = () => {
    document.getElementById("trusted-organisations")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <section className="relative min-h-svh overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:flex lg:items-center lg:pb-16 lg:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_14%_22%,rgba(207,225,230,0.62),transparent_27%),radial-gradient(circle_at_87%_80%,rgba(200,153,47,0.09),transparent_24%)]"
        />
        <div className="relative mx-auto w-full max-w-[940px] text-center lg:-translate-y-2">
          <h1 className="mx-auto max-w-4xl font-display text-[clamp(2.55rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
            What can we help you find?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
            Find information from national cancer organisations, practical
            support and the hospitals where our consultants provide care.
          </p>

          <div className="mx-auto mt-8 w-full max-w-[860px] overflow-hidden rounded-[1.75rem] border border-ink/[0.08] bg-white text-left shadow-[0_2px_8px_rgba(6,28,70,0.05),0_28px_75px_-38px_rgba(6,28,70,0.36)] sm:mt-10 sm:rounded-[2rem]">
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
              }}
              className="grid min-h-[70px] grid-cols-[34px_minmax(0,1fr)] items-center gap-2 border-b border-ink/[0.08] px-4 sm:min-h-[78px] sm:grid-cols-[38px_minmax(0,1fr)] sm:px-5"
            >
              <span className="flex items-center justify-center text-ink-muted">
                <SearchIcon />
              </span>
              <label htmlFor="resources-search" className="sr-only">
                Search resources
              </label>
              <input
                ref={inputRef}
                id="resources-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
                placeholder="Search organisations, charities or treatment locations…"
                autoComplete="off"
                className="min-w-0 bg-transparent py-5 text-[15px] text-ink outline-none placeholder:text-ink-muted/65 sm:text-[17px]"
              />
            </form>

            <div className="px-2 pb-3 pt-3 sm:px-3 sm:pb-4">
              <div className="flex items-center justify-between gap-4 px-3 pb-2 text-[11.5px] font-medium text-ink-muted sm:px-4 sm:text-xs">
                <span>
                  {trimmed
                    ? `${results.length} matching ${results.length === 1 ? "resource" : "resources"}`
                    : "Suggested searches"}
                </span>
                {!trimmed && <span className="text-[#a9791a]">Start anywhere</span>}
                {trimmed && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-accent hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div aria-live="polite" className="sr-only">
                {trimmed
                  ? `${results.length} matching ${results.length === 1 ? "resource" : "resources"}`
                  : ""}
              </div>

              {trimmed ? (
                results.length > 0 ? (
                  <motion.ul
                    key={trimmed}
                    initial={{ opacity: 0, y: reduced ? 0 : 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    className="max-h-[min(48vh,450px)] overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]"
                  >
                    {results.map((result) => (
                      <li key={result.id}>
                        <ResultRow result={result} />
                      </li>
                    ))}
                  </motion.ul>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="font-display text-xl font-semibold text-ink">
                      No exact match found.
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                      Try a shorter phrase, browse all resources below, or contact
                      the practice team for help finding the right information.
                    </p>
                  </div>
                )
              ) : (
                <ul>
                  {suggestedSearches.map((suggestion, index) => (
                    <li key={suggestion.title}>
                      <button
                        type="button"
                        onClick={() => chooseSuggestion(suggestion.query)}
                        className={`group grid min-h-[62px] w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-canvas-soft sm:grid-cols-[36px_minmax(0,1fr)_auto] ${
                          index === 0 ? "bg-[#f1f5f9]" : ""
                        }`}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-muted">
                          <SearchIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium leading-snug text-ink">
                            {suggestion.title}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-[13px] leading-snug text-ink-muted">
                            {suggestion.detail}
                          </span>
                        </span>
                        <span className="hidden rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-ink-muted sm:block">
                          {suggestion.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={browseAll}
            className="group mt-6 inline-flex items-center gap-2 text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            <span className="font-medium text-accent">Browse all resources</span>
            if you would rather look around
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <p className="mx-auto mt-4 max-w-xl text-[12px] leading-relaxed text-ink-muted sm:text-[13px]">
            Questions about your own care? Speak to your consultant or{" "}
            <Link href="/contact" className="font-medium text-accent hover:underline">
              contact the practice
            </Link>
            .
          </p>
        </div>
      </section>

      <section
        id="trusted-organisations"
        aria-labelledby="information-support-heading"
        className="relative isolate"
      >
        <ChapterTint colour={SUPPORT_CHAPTER_BLUE} />

        <div className="mx-auto w-full max-w-[1560px] px-6 py-24 md:px-10 md:py-32 lg:pl-16 lg:pr-10">
          <div className="grid gap-12 xl:h-[33rem] xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] xl:items-stretch xl:gap-16 2xl:h-auto 2xl:grid-cols-[minmax(0,0.58fr)_minmax(0,1fr)] 2xl:items-start 2xl:gap-24">
            <div className="xl:flex xl:items-center 2xl:sticky 2xl:top-0 2xl:min-h-svh">
              <div>
                <h2
                  id="information-support-heading"
                  className="max-w-[9ch] font-display text-[clamp(3rem,5vw,5.3rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-ink"
                >
                  Information and support.
                </h2>
                <p className="mt-7 max-w-md text-[15px] leading-relaxed text-ink/75 sm:text-[17px]">
                  National organisations offering cancer information and
                  practical support, plus services that may be arranged as part
                  of your care.
                </p>
              </div>
            </div>

            <div className="relative hidden min-w-0 xl:block 2xl:hidden">
              <div
                data-lenis-prevent
                className="absolute inset-0 snap-y snap-proximity overflow-y-auto overscroll-contain scroll-smooth pr-1 [scrollbar-color:rgba(6,28,70,0.18)_transparent] [scrollbar-width:thin]"
              >
                <ul className="grid gap-4">
                  {informationResources.map((result, index) => (
                    <li key={result.id} className="snap-start">
                      <CompactResourceRow result={result} index={index} />
                    </li>
                  ))}
                </ul>
              </div>

              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#dbe8ee] to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#dbe8ee] via-[#dbe8ee]/50 to-transparent"
              />
            </div>

            <div
              data-lenis-prevent-horizontal
              className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-auto md:grid md:w-full md:max-w-[1040px] md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:gap-7 xl:hidden 2xl:grid 2xl:max-w-none"
            >
              {informationColumns.map((column, columnIndex) => (
                <ul
                  key={columnIndex}
                  className={`flex shrink-0 gap-4 md:block md:shrink md:space-y-6 lg:space-y-7 ${
                    columnIndex === 0 ? "2xl:order-2" : "2xl:order-1 2xl:mt-32"
                  }`}
                >
                  {column.map((result) => (
                    <li
                      key={result.id}
                      className="w-[82vw] shrink-0 snap-start sm:w-[58vw] md:w-auto"
                    >
                      <FeatureResourceCard
                        result={result}
                        index={informationResources.indexOf(result)}
                      />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="treatment-locations"
        aria-labelledby="treatment-locations-heading"
        className="relative flex min-h-svh items-center overflow-hidden py-24 md:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_88%_22%,rgba(204,224,232,0.55),transparent_29%),radial-gradient(circle_at_8%_88%,rgba(200,153,47,0.08),transparent_24%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_82%,transparent_100%)]"
        />
        <div className="container-wide relative">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:items-start lg:gap-16">
            <div>
              <h2
                id="treatment-locations-heading"
                className="max-w-[10ch] font-display text-[clamp(2.75rem,4.7vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-ink"
              >
                Where you may be treated.
              </h2>
              <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-ink/75 sm:text-[18px]">
                {hospitals.length} hospitals and cancer centres across Reading,
                Windsor and Oxford.
              </p>
              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
                Which location applies depends on your consultant and treatment;
                the practice will confirm this with you.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[1.75rem] border border-ink/[0.08] bg-white shadow-[0_22px_70px_-36px_rgba(6,28,70,0.32)] sm:rounded-[2rem]">
              <RegionMap className="h-[270px] sm:h-[320px] lg:h-[350px]" />
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
                <p className="font-display text-2xl leading-none text-ink">
                  {hospitals.length}
                </p>
                <p className="mt-1.5 text-[13px] leading-tight text-ink-muted">
                  hospitals and cancer centres
                  <br />
                  across Berkshire &amp; Oxford
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-11">
            <HospitalStrip />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="resource-faq-heading"
        className="relative flex min-h-svh items-center overflow-hidden py-24 md:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_13%_18%,rgba(255,255,255,0.8),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(204,224,232,0.5),transparent_30%),linear-gradient(to_bottom,rgba(242,240,235,0)_0%,rgba(242,240,235,0.94)_18%,rgba(242,240,235,0.94)_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_100%)]"
        />
        <div className="container-wide relative">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20 xl:gap-28">
            <div className="text-center">
              <h2
                id="resource-faq-heading"
                className="mx-auto max-w-[10ch] font-display text-[clamp(2.75rem,4.7vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-ink"
              >
                Not sure where to start?
              </h2>
              <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-ink/75 sm:text-[17px]">
                Choose the question closest to what you need. Each answer points
                you to the relevant organisation or section.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.09] bg-white/80 px-5 shadow-[0_24px_80px_-48px_rgba(6,28,70,0.34)] backdrop-blur-sm sm:px-8 sm:rounded-[2rem]">
              {resourceFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-ink/[0.09] last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-[17px] font-semibold leading-snug text-ink marker:hidden sm:py-6 sm:text-xl [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-xl font-normal text-ink transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="max-w-2xl pb-6 pr-12">
                    <p className="text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
                      {faq.answer}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {faq.resources.map((resourceName) => {
                        const resource = resultItems.find(
                          (item) => item.title === resourceName,
                        );
                        if (!resource) return null;
                        return (
                          <a
                            key={resourceName}
                            href={resource.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent hover:underline"
                          >
                            Visit {resource.title}
                            <ArrowIcon external />
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        );
                      })}
                      {faq.internalLink && (
                        <a
                          href={faq.internalLink.href}
                          className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent hover:underline"
                        >
                          {faq.internalLink.label}
                          <ArrowIcon />
                        </a>
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
