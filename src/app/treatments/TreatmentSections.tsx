"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { site } from "@/content/site";
import TreatmentOverviewConcepts from "./TreatmentOverviewConcepts";

export interface TreatmentSummary {
  slug: string;
  title: string;
  summary: string;
}

export interface TreatmentGroupData {
  id: "medicine" | "radiotherapy";
  number: string;
  title: string;
  description: string;
  treatments: TreatmentSummary[];
}

const EASE = [0.22, 1, 0.36, 1] as const;
const PALE_BLUE = "#dfe9f5";

const boundaryRows = [
  {
    title: "Surgery",
    body: "Surgery is carried out by a surgical team. If you also need oncology treatment, your consultant will work with that team to plan when it happens.",
  },
  {
    title: "Tests and scans",
    body: "Hospital and diagnostic teams provide imaging, biopsies and laboratory tests. Your consultant uses the results when discussing and planning treatment with you.",
  },
  {
    title: "Specialist services",
    body: "Some treatments, such as proton beam therapy, are available through specialist centres. Your consultant will explain the referral process when a specialist treatment applies to your diagnosis.",
  },
];

const faqRows = [
  {
    title: "How do I know which treatment I need?",
    body: "You are not expected to decide this from the website. A consultant will review your diagnosis, test results, general health and what matters to you, then discuss the available options with you.",
  },
  {
    title: "Can more than one treatment be used?",
    body: "Yes. A treatment plan can include treatments together or in a particular order. For example, medicines can be given before or after surgery, or alongside radiotherapy.",
  },
  {
    title: "What does SACT mean?",
    body: "SACT stands for systemic anti-cancer treatment. It is an umbrella term used for medicines that travel through the body, including chemotherapy, immunotherapy, targeted therapies and hormone therapy.",
  },
  {
    title: "Where would treatment happen?",
    body: "The location depends on the consultant, treatment and facilities needed. The practice team or your consultant will confirm it before treatment is arranged.",
  },
  {
    title: "Can I ask about a treatment before arranging a consultation?",
    body: "Yes. You can contact the practice first. The team can explain what information they need and pass your enquiry to the relevant person.",
  },
];

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className={`h-4 w-4 ${className}`}
      aria-hidden
    >
      <path
        d="M3.5 9h11M10.5 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.82, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function TreatmentRows({
  treatments,
  compact = false,
}: {
  treatments: TreatmentSummary[];
  compact?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="border-t border-ink/15">
      {treatments.map((treatment, index) => (
        <motion.article
          key={treatment.slug}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.72, delay: index * 0.07, ease: EASE }}
          className="border-b border-ink/15"
        >
          <Link
            href={`/treatments/${treatment.slug}`}
            className={`group grid gap-4 py-7 md:items-start md:gap-7 md:py-9 ${
              compact
                ? "md:grid-cols-[2.4rem_minmax(0,1fr)_auto]"
                : "md:grid-cols-[2.4rem_minmax(0,0.62fr)_minmax(0,1.38fr)_auto]"
            }`}
          >
            <span className="pt-1 text-[11px] font-medium tracking-[0.15em] text-ink-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink transition-colors duration-300 group-hover:text-accent md:text-[1.7rem]">
              {treatment.title}
            </h3>
            <p
              className={`max-w-[38rem] text-[15px] leading-[1.7] text-ink-muted md:text-[16px] ${
                compact ? "md:col-start-2 md:row-start-2 md:pr-4" : ""
              }`}
            >
              {treatment.summary}
            </p>
            <span
              className={`mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-all duration-300 ease-smooth group-hover:border-ink group-hover:bg-ink group-hover:text-white md:justify-self-end ${
                compact ? "md:col-start-3 md:row-span-2 md:row-start-1" : ""
              }`}
            >
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}

function RadiotherapyRows({
  treatments,
}: {
  treatments: TreatmentSummary[];
}) {
  return (
    <div className="border-t border-ink/15">
      {treatments.map((treatment) => (
        <Link
          key={treatment.slug}
          href={`/treatments/${treatment.slug}`}
          className="group flex items-center justify-between gap-8 border-b border-ink/15 py-5"
        >
          <span className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.025em] text-ink transition-transform duration-300 group-hover:translate-x-1 xl:text-[1.55rem]">
            {treatment.title}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
            <Arrow />
          </span>
        </Link>
      ))}
    </div>
  );
}

function AccordionList({
  rows,
  idPrefix,
  panel = false,
  firstOpen = false,
  openIndex,
  onOpenChange,
}: {
  rows: { title: string; body: string }[];
  idPrefix: string;
  panel?: boolean;
  firstOpen?: boolean;
  openIndex?: number | null;
  onOpenChange?: (index: number | null) => void;
}) {
  const [internalOpen, setInternalOpen] = useState<number | null>(
    firstOpen ? 0 : null,
  );
  const reduce = useReducedMotion();
  const open = openIndex === undefined ? internalOpen : openIndex;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <div
      className={
        panel
          ? "rounded-[2rem] border border-ink/10 bg-white px-6 shadow-[0_30px_80px_-38px_rgba(6,28,70,0.32)] md:px-9"
          : "border-t border-ink/15"
      }
    >
      {rows.map((row, index) => {
        const isOpen = open === index;
        const id = `${idPrefix}-${index}`;

        return (
          <div key={row.title} className="border-b border-ink/15 last:border-b-0">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : index)}
                className="group flex w-full items-center justify-between gap-8 py-6 text-left font-display text-xl font-semibold leading-snug text-ink transition-colors hover:text-accent focus-visible:underline focus-visible:underline-offset-4 md:py-7 md:text-2xl"
              >
                {row.title}
                <motion.span
                  aria-hidden
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.32, ease: EASE }}
                  className="relative h-4 w-4 shrink-0 text-ink-muted"
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={id}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.42, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[42rem] pb-7 pr-8 text-[15px] leading-[1.75] text-ink-muted md:text-[16px]">
                    {row.body}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function RadiotherapySection({ group }: { group: TreatmentGroupData }) {
  return (
    <section
      id="radiotherapy-treatments"
      className="scroll-mt-24 overflow-clip bg-[#e7eeeb]"
    >
      <div className="container-wide grid items-center gap-12 py-20 md:py-24 lg:hidden">
        <figure className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[520px]">
          <div
            aria-hidden
            className="absolute bottom-0 left-0 top-16 w-[58%] rounded-[2.5rem] bg-[#cbdbe8]"
          />
          <div className="absolute right-0 top-0 h-[92%] w-[92%] overflow-hidden rounded-[2.5rem] border border-white/50 bg-white shadow-[0_35px_90px_-42px_rgba(6,28,70,0.35)]">
            <Image
              src="/treatments/radiotherapy-conversation.jpg"
              alt="A therapeutic radiographer speaking with a patient before radiotherapy"
              fill
              sizes="92vw"
              className="object-cover object-center"
            />
          </div>
        </figure>

        <div>
          <Reveal>
            <h2 className="max-w-[10ch] font-display text-[clamp(2.7rem,10.5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink lg:text-[clamp(3rem,4.8vw,5.3rem)]">
              Types of radiotherapy
            </h2>
            <p className="mt-7 max-w-[35rem] text-[16px] leading-[1.75] text-ink-muted md:text-[17px]">
              The type used depends on where the cancer is and the aim of
              treatment.
            </p>
          </Reveal>

          <div className="mt-10">
            <TreatmentRows treatments={group.treatments} compact />
          </div>
        </div>
      </div>

      <div className="container-wide hidden min-h-screen items-center pb-8 pt-28 lg:flex">
        <div className="grid h-[min(620px,calc(100svh-10rem))] min-h-[420px] w-full items-center gap-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-24">
          <figure className="relative h-[min(560px,100%)] overflow-hidden rounded-[2.5rem] bg-[#cbdbe8] shadow-[0_35px_90px_-42px_rgba(6,28,70,0.34)]">
            <Image
              src="/treatments/radiotherapy-conversation.jpg"
              alt="A therapeutic radiographer speaking with a patient before radiotherapy"
              fill
              sizes="(max-width: 1279px) 52vw, 48vw"
              className="object-cover object-center"
            />
          </figure>

          <div>
            <h2 className="max-w-[11ch] font-display text-[clamp(2.8rem,4.3vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
              Types of radiotherapy
            </h2>
            <p className="mt-6 max-w-[35rem] text-[15px] leading-[1.7] text-ink-muted md:text-[16px]">
              The type used depends on where the cancer is and the aim of
              treatment.
            </p>
            <div className="mt-7">
              <RadiotherapyRows treatments={group.treatments} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TreatmentSections({
  groups,
}: {
  groups: TreatmentGroupData[];
}) {
  const reduce = useReducedMotion();
  const boundaryRef = useRef<HTMLElement>(null);
  const boundaryManualScrollRef = useRef<number | null>(null);
  const [boundaryOpen, setBoundaryOpen] = useState<number | null>(0);
  const { scrollYProgress: boundaryProgress } = useScroll({
    target: boundaryRef,
    offset: ["start 0.98", "start 0.2"],
  });
  const boundarySpring = useSpring(boundaryProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });
  const boundaryClip = useTransform(
    boundarySpring,
    [0, 1],
    [
      "inset(3rem 5vw round 2.75rem)",
      "inset(0rem 0vw round 0rem)",
    ],
  );
  const { scrollYProgress: boundaryRowsProgress } = useScroll({
    target: boundaryRef,
    offset: ["start start", "end end"],
  });

  const selectBoundaryRow = (index: number | null) => {
    boundaryManualScrollRef.current = window.scrollY;
    setBoundaryOpen(index);
  };

  useMotionValueEvent(boundaryRowsProgress, "change", (latest) => {
    if (
      reduce ||
      !window.matchMedia(
        "(min-width: 1024px) and (min-height: 700px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    ) {
      return;
    }

    if (boundaryManualScrollRef.current !== null) {
      if (Math.abs(window.scrollY - boundaryManualScrollRef.current) < 64) {
        return;
      }
      boundaryManualScrollRef.current = null;
    }

    const nextIndex = latest < 0.34 ? 0 : latest < 0.67 ? 1 : 2;
    setBoundaryOpen((current) =>
      current === nextIndex ? current : nextIndex,
    );
  });

  const medicine = groups.find((group) => group.id === "medicine");
  const radiotherapy = groups.find((group) => group.id === "radiotherapy");
  const tel = `tel:${site.contact.phone.replace(/\s+/g, "")}`;

  if (!medicine || !radiotherapy) return null;

  return (
    <div data-treatment-body className="relative">
      {/*
        This bar is anchored to the real hero/body boundary. Translating it by
        40% of its own height keeps a reliable 40/60 overlap at every width.
      */}
      <div className="relative z-20 h-0">
        <div className="absolute inset-x-0 top-0 -translate-y-[40%]">
          <div className="container-wide">
            <div
              data-treatment-route-bar
              className="grid items-center gap-4 rounded-[1.5rem] border border-white/70 bg-[#e5eef6]/95 px-5 py-5 shadow-[0_24px_70px_-45px_rgba(6,28,70,0.45)] backdrop-blur-md sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8 md:gap-y-3 md:px-8 lg:mx-4 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-10 xl:px-12"
            >
              <p className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
                Find information by cancer type
              </p>
              <p className="text-[14px] leading-relaxed text-ink-muted md:col-span-2 md:row-start-2 md:text-[15px] xl:col-span-1 xl:col-start-auto xl:row-start-auto">
                Browse cancer types to find consultant profiles.
              </p>
              <Link
                href="/specialities#browse-all"
                className="ink-cta group inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-full px-6 text-sm font-medium md:col-start-2 md:row-start-1 xl:col-start-auto xl:row-start-auto"
              >
                Browse cancer types
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <TreatmentOverviewConcepts groups={groups} />

      <RadiotherapySection group={radiotherapy} />

      <section
        ref={boundaryRef}
        id="what-we-do-not-provide"
        className="treatment-boundary-scene relative scroll-mt-24 overflow-clip"
      >
        <motion.div
          className="treatment-boundary-focus"
          style={{
            backgroundColor: PALE_BLUE,
            clipPath: reduce ? "inset(0 0vw round 0rem)" : boundaryClip,
          }}
        >
          <div className="container-wide grid items-start gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-20">
            <Reveal>
              <h2 className="max-w-[11ch] font-display text-[clamp(2.7rem,10.5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink lg:text-[clamp(3rem,4.8vw,5.3rem)]">
                Care provided by other teams
              </h2>
              <p className="mt-7 max-w-[34rem] text-[16px] leading-[1.75] text-ink-muted md:text-[17px]">
                Berkshire Oncology is a partnership of consultant oncologists,
                not a hospital. Tests, surgery and some treatments are provided
                by hospitals or specialist centres.
              </p>
            </Reveal>

            <div className="lg:flex lg:min-h-[26rem] lg:items-center">
              <Reveal className="w-full" delay={0.08}>
                <AccordionList
                  rows={boundaryRows}
                  idPrefix="treatment-boundary"
                  openIndex={boundaryOpen}
                  onOpenChange={selectBoundaryRow}
                />
              </Reveal>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="treatment-faqs" className="scroll-mt-24">
        <div className="container-wide grid items-start gap-14 py-24 md:py-32 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-20">
          <Reveal>
            <h2 className="max-w-[10ch] font-display text-[clamp(2.7rem,10.5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink lg:text-[clamp(3rem,4.8vw,5.3rem)]">
              Common questions about treatment
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-[1.75] text-ink-muted">
              Answers about treatment decisions, terminology and where care
              takes place.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <AccordionList rows={faqRows} idPrefix="treatment-faq" panel />
          </Reveal>
        </div>
      </section>

      <section className="close-merged overflow-clip bg-ink text-white">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="container-wide grid gap-12 py-24 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-end lg:gap-20"
        >
          <div>
            <h2 className="max-w-[12ch] font-display text-[clamp(2.75rem,11vw,4.8rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white lg:text-[clamp(3.2rem,5.2vw,5.8rem)]">
              You do not need to choose a treatment before you contact us.
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[34rem] text-[16px] leading-[1.75] text-white/70 md:text-[17px]">
              Contact the practice with the information you have. The team can
              explain what to do next and help arrange a consultation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contact#guidance"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-medium text-ink transition-colors hover:bg-[#e5eef6]"
              >
                Contact the practice
                <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href={tel}
                className="inline-flex min-h-12 items-center px-2 text-sm font-medium text-white underline decoration-white/30 underline-offset-[7px] hover:decoration-white"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
