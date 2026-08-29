"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
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
    body: "Cancer surgery is carried out by surgical specialists. Our consultants work with those teams and plan any oncology treatment needed before or after an operation.",
  },
  {
    title: "Tests and scans",
    body: "Imaging, biopsies and laboratory tests are provided by hospital and diagnostic teams. Your consultant uses the results to help shape the treatment plan.",
  },
  {
    title: "Specialist national services",
    body: "A small number of treatments, including proton beam therapy, are delivered through national specialist centres. Your consultant can explain whether a referral may be relevant.",
  },
];

const faqRows = [
  {
    title: "How do I know which treatment I need?",
    body: "You are not expected to work that out from this website. A consultant considers the cancer type, test results, your general health and what matters to you before explaining which options may be appropriate.",
  },
  {
    title: "Can more than one treatment be used?",
    body: "Yes. A plan may use treatments together or in a particular order. For example, medicines may be given before or after surgery, or alongside radiotherapy.",
  },
  {
    title: "What does SACT mean?",
    body: "SACT stands for systemic anti-cancer treatment. It is an umbrella term used for medicines that travel through the body, including chemotherapy, immunotherapy, targeted therapies and hormone therapy.",
  },
  {
    title: "Where would treatment happen?",
    body: "That depends on the consultant, the treatment and the facilities needed. Your consultant and the practice team will confirm the location as part of planning your care.",
  },
  {
    title: "Can I ask about a treatment before booking?",
    body: "Yes. Contact the practice with the diagnosis, letter or treatment name you have. The team can help you identify the most appropriate consultant to speak with.",
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

function AccordionList({
  rows,
  idPrefix,
  panel = false,
  firstOpen = false,
}: {
  rows: { title: string; body: string }[];
  idPrefix: string;
  panel?: boolean;
  firstOpen?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(firstOpen ? 0 : null);
  const reduce = useReducedMotion();

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
      id="radiotherapy-treatments-mobile"
      className="scroll-mt-24 overflow-clip bg-[#e7eeeb] lg:hidden"
    >
      <div className="container-wide grid items-center gap-14 py-24 md:py-32 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
        <figure className="relative min-h-[480px] md:min-h-[600px]">
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
            <h2 className="max-w-[10ch] font-display text-[clamp(3rem,4.8vw,5.3rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
              Radiation can be delivered in different ways.
            </h2>
            <p className="mt-7 max-w-[35rem] text-[16px] leading-[1.75] text-ink-muted md:text-[17px]">
              The method depends on where the cancer is, the aim of treatment
              and how precisely the dose needs to be delivered.
            </p>
          </Reveal>

          <div className="mt-10">
            <TreatmentRows treatments={group.treatments} compact />
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
              className="grid items-center gap-5 rounded-[1.75rem] border border-white/70 bg-[#e5eef6]/95 px-6 py-5 shadow-[0_24px_70px_-45px_rgba(6,28,70,0.45)] backdrop-blur-md md:grid-cols-[auto_1fr_auto] md:gap-10 md:px-10 lg:mx-4 lg:px-12"
            >
              <p className="font-display text-xl font-semibold tracking-tight text-ink md:text-2xl">
                Not sure where to begin?
              </p>
              <p className="text-[14px] leading-relaxed text-ink-muted md:text-[15px]">
                Your cancer type is usually the clearest starting point.
              </p>
              <Link
                href="/specialities#browse-all"
                className="ink-cta group inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-full px-6 text-sm font-medium"
              >
                Find your cancer type
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
        className="relative scroll-mt-24 overflow-clip"
      >
        <motion.div
          style={{
            backgroundColor: PALE_BLUE,
            clipPath: reduce ? "inset(0 0vw round 0rem)" : boundaryClip,
          }}
        >
          <div className="container-wide grid items-start gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
            <Reveal>
              <h2 className="max-w-[11ch] font-display text-[clamp(3rem,4.8vw,5.3rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
                Some parts of care happen elsewhere.
              </h2>
              <p className="mt-7 max-w-[34rem] text-[16px] leading-[1.75] text-ink-muted md:text-[17px]">
                Berkshire Oncology is a partnership of consultant oncologists,
                not a hospital. Care may involve hospital teams, surgical
                specialists and national centres.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <AccordionList
                rows={boundaryRows}
                idPrefix="treatment-boundary"
                firstOpen
              />
            </Reveal>
          </div>
        </motion.div>
      </section>

      <section id="treatment-faqs" className="scroll-mt-24">
        <div className="container-wide grid items-start gap-14 py-24 md:py-32 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
          <Reveal>
            <h2 className="max-w-[10ch] font-display text-[clamp(3rem,4.8vw,5.3rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
              Treatment, explained plainly.
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-[1.75] text-ink-muted">
              Short answers to the questions people often have before a
              consultation.
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
            <h2 className="max-w-[12ch] font-display text-[clamp(3.2rem,5.2vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
              You do not need to choose a treatment before you contact us.
            </h2>
          </div>

          <div className="lg:pb-2">
            <p className="max-w-[34rem] text-[16px] leading-[1.75] text-white/70 md:text-[17px]">
              Start with the diagnosis, letter or information you already
              have. The practice team can help you find the appropriate
              consultant.
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
