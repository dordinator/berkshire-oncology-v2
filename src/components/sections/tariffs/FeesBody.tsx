"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Button from "@/components/ui/Button";
import { site } from "@/content/site";
import { useCenterGap } from "./useCenterGap";

/*
  The fees page below the hero. One constant warm off-white ground; colour
  lives in panels; every band is the site's split — text one side, a
  composition the other, alternating sides. The scroll choreography is the
  site's PageMotion engine (mounted by the page): TEXT SITS STILL and the
  compositions move around it — tinted backdrop blocks drifting at their
  own speed (data-fx="drift"), white cards rising and settling as they
  arrive (data-fx="rise"), and the pathway's line drawing itself
  (data-fx="draw"). Everything scrubbed, so it runs backwards under the
  reader's thumb and composes with the Lenis lerp — the same texture as
  the home, patients and resources pages.

  Framer stays for the navy close docking like a sheet and the FAQ
  accordions' sprung open/close — interaction, not scroll.

  Type is the patients register: clamp statements (semibold, tight
  leading, −0.05em family tracking), with one task-led heading and one
  short support paragraph per band.

  Measure refs: the clip scrubs rest at the CONTENT edge of the container,
  so the measured element must be a child inside .container-wide — the
  container's border box is full-width below 1400px and rect.left would
  read 0.

  COPY: assembled from the practice's own published tariff wording, cut to
  the reference pages' density. Needs the practice's sign-off before ship.
*/

// The constant ground — the SAME ivory the hero sits on, so there is no
// visible seam where the hero ends and the body begins.
const OFFWHITE = "#f7f5f1";
const PANEL = "#dfe9f5"; // the kept pale-blue surface (hero strip's family)
const SAGE_BLOCK = "#c8d6cf"; // patients' signature sage backdrop block
const SAGE_NODE = "#8ca49a"; // patients mid sage — node fill
const SAGE_DOT = "#769187"; // patients deep sage — bullet dots

const EASE = [0.22, 1, 0.36, 1] as const;

/* The chosen scroll pacing ("Early"): every scrubbed element finishes its
   travel by the time it is a quarter up the viewport — data-lock="top 78%"
   on the rises, "bottom 78%" on the drawn line — then holds still, so
   nothing is ever moving while it is being read. */
const LOCK = "top 78%";

/* Heading tiers. Splits carry the column statement tier; the two
   full-bleed moments keep their own cuts, and the navy close crescendos. */
const H_SPLIT =
  "font-display text-[clamp(2.25rem,4.1vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink";
const H_CLOSE =
  "font-display text-[clamp(3.2rem,5.9vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white";

/* The band split: text one side, composition the other. The flipped
   variant mirrors the TRACKS as well as the order — grid auto-placement
   fills tracks positionally, so lg:order alone would hand the composition
   the narrow column. */
const SPLIT =
  "grid items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20";
const SPLIT_FLIP =
  "grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20";

const SUPPORT = "mt-7 max-w-lg text-lg leading-relaxed text-ink-muted";

/** The site's inline text CTA: label + chevron that slides 4px on hover. */
function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group relative mt-8 inline-flex items-center gap-3 text-sm font-medium text-ink after:absolute after:-inset-3 after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
        aria-hidden
      >
        <path d="M1.5 8h13M9.5 3l5 5-5 5" />
      </svg>
    </a>
  );
}

/**
 * The composition half of a split, in the patients material stack: a
 * tinted backdrop block drifting at its own speed, a photograph moving
 * slower than the page inside its rounded frame, and a white card of
 * quiet hairline rows docked over the photograph's foot, rising as it
 * arrives. `corner` names the side the backdrop peeks from; the photo
 * and card counter it.
 */
function RowPanel({
  tint,
  label,
  rows,
  photo,
  alt,
  corner = "right",
}: {
  tint: string;
  label: string;
  rows: string[];
  photo: string;
  alt: string;
  corner?: "left" | "right";
}) {
  const right = corner === "right";
  return (
    <div className="relative min-h-[480px] py-6 lg:min-h-[560px]">
      <div
        aria-hidden
        data-fx="drift"
        data-drift="0.3"
        className={`absolute bottom-[8%] top-[2%] w-[47%] rounded-[2.5rem] ${
          right ? "right-0" : "left-0"
        }`}
        style={{ backgroundColor: tint }}
      />

      <div
        data-parallax-frame
        className={`absolute top-[5%] h-[60%] w-[72%] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-white shadow-[0_35px_90px_-40px_rgba(6,28,70,0.35)] ${
          right ? "left-0" : "right-0"
        }`}
      >
        {/* Taller than its frame so the parallax never shows an edge. */}
        <div
          data-fx="parallax"
          data-parallax="7"
          className="absolute inset-x-0 -top-[16%] h-[132%]"
        >
          <Image
            src={photo}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 72vw, 42vw"
            className="object-cover"
          />
        </div>
      </div>

      <div
        data-fx="rise"
        data-rise-y="55"
        data-lock={LOCK}
        className={`absolute bottom-3 w-[78%] rounded-[2rem] border border-ink/10 bg-white p-6 md:p-7 ${
          right ? "right-0" : "left-0"
        }`}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </p>
        <div className="mt-3 divide-y divide-ink/10">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-3.5 py-3.5">
              <span
                aria-hidden
                className="h-1.5 w-1.5 flex-none rounded-full"
                style={{ backgroundColor: SAGE_DOT }}
              />
              <span className="font-display text-lg text-ink md:text-xl">
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  {
    title: "Ask for tariff details",
    body: "Contact the practice if you are self-funding or need information about fees.",
  },
  {
    title: "Receive a self-funding tariff",
    body: "The practice provides a comprehensive tariff before treatment starts.",
  },
  {
    title: "Obtain an insurance quote",
    body: "Ask your insurer whether the treatment cost will be covered in full.",
  },
  {
    title: "Ask about anything unclear",
    body: "Contact the practice about your tariff and your insurer about policy cover.",
  },
];

/**
 * The four-stage pathway — the visual half of its split. The connector
 * line is an SVG path the PageMotion engine draws against scroll
 * (data-fx="draw"); the nodes are the register's filled mid-sage cores
 * with a ring in the ground colour and a 1px ink halo.
 */
function Pathway() {
  return (
    <div data-fx="draw" data-lock="bottom 78%" className="relative">
      <svg
        aria-hidden
        preserveAspectRatio="none"
        viewBox="0 0 12 100"
        className="absolute bottom-2 left-0 top-1.5 h-[calc(100%-0.875rem)] w-3 overflow-visible text-ink/15"
      >
        <path
          d="M6 0 L6 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ol className="grid gap-10">
        {STAGES.map((s) => (
          <li key={s.title} className="relative pl-10">
            <span
              aria-hidden
              className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-[3px] shadow-[0_0_0_1px_rgba(6,28,70,0.15)]"
              style={{ borderColor: OFFWHITE, backgroundColor: SAGE_NODE }}
            />
            <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
              {s.title}
            </h3>
            <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

const FAQS = [
  {
    q: "How do I request tariff details?",
    a: (
      <>
        Contact the practice by phone or email for details of your tariff.
      </>
    ),
  },
  {
    q: "Can I self-fund treatment?",
    a: (
      <>
        Yes. Self-funding packages are tailored to each patient, and anyone
        self-funding receives a comprehensive tariff before starting
        treatment.
      </>
    ),
  },
  {
    q: "Can an estimate change?",
    a: (
      <>
        Yes. All quotes are estimates and may change depending on the
        treatment given.
      </>
    ),
  },
  {
    q: "Why are fixed prices not listed?",
    a: (
      <>
        Each consultant is an independent practitioner and sets their own
        tariff. Self-funding packages are also tailored to individual needs,
        so contact the practice for the tariff that applies to you.
      </>
    ),
  },
  {
    q: "Who should I contact about fees?",
    a: (
      <>
        Contact the practice for tariff details. Call{" "}
        <a
          href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
          className="text-accent underline underline-offset-2"
        >
          {site.contact.phone}
        </a>{" "}
        or email{" "}
        <a
          href={`mailto:${site.contact.email}`}
          className="text-accent underline underline-offset-2"
        >
          {site.contact.email}
        </a>. If you are insured, contact your insurer to check what your policy
        covers.
      </>
    ),
  },
];

/* The two shortfall topics that expand inside the mint section. Same approved
   wording the FAQ list used to carry. */
const BAND_ROWS = [
  {
    q: "What is a shortfall?",
    a: "A shortfall is the balance left when an insurer does not settle an account in full. The patient is responsible for paying it.",
  },
  {
    // The navigation's insurance-cover entry deep-links to this row.
    id: "authorisation",
    q: "How do I check my insurance cover?",
    a: "Ask your insurer whether the treatment will be covered in full before it starts. Fee schedules and policy benefits vary.",
  },
];

/** The expandable topic rows inside the shortfall card. Hairline rules keep
 *  them part of one calm information panel; the plus rotates when open. */
function BandRows() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-10 border-t border-ink/15">
      {BAND_ROWS.map((row, i) => {
        const isOpen = open === i;
        return (
          <div
            key={row.q}
            id={"id" in row ? row.id : undefined}
            className="scroll-mt-32 border-b border-ink/15"
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`fees-band-row-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-display text-lg font-semibold leading-snug text-ink transition-colors hover:text-accent focus-visible:underline focus-visible:underline-offset-4 md:text-xl"
              >
                {row.q}
                <motion.span
                  aria-hidden
                  className="relative h-4 w-4 shrink-0 text-ink-muted"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`fees-band-row-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-xl pb-6 pr-8 text-base leading-relaxed text-ink/75">
                    {row.a}
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

/**
 * The FAQ accordion inside the white panel half of its split. The panel
 * rises via the engine; the open/close is framer — interaction, not
 * scroll. Exclusive; the plus rotates 45°; buttons carry aria-expanded/
 * aria-controls and a focus underline.
 */
function Faqs() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      data-fx="rise"
      data-lock={LOCK}
      className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-[0_30px_80px_-35px_rgba(6,28,70,0.35)] md:p-9"
    >
      <div className="divide-y divide-ink/10">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`fees-faq-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-display text-lg font-semibold leading-snug text-ink transition-colors hover:text-accent focus-visible:underline focus-visible:underline-offset-4 md:text-xl"
                >
                  {f.q}
                  <motion.span
                    aria-hidden
                    className="relative h-4 w-4 shrink-0 text-ink-muted"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`fees-faq-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-muted md:text-base">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FeesBody() {
  const c = site.contact;
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;
  const reduce = useReducedMotion();

  // The navy sheet: inset with rounded shoulders on approach, docking
  // flush as it lands. Reduced motion freezes it flush.
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetBoxRef = useRef<HTMLDivElement>(null);
  const sheetGap = useCenterGap(sheetBoxRef);
  const { scrollYProgress: sheetProgress } = useScroll({
    target: sheetRef,
    offset: ["start 0.98", "start 0.6"],
  });
  const sheetDraw = useSpring(sheetProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const sheetInset = useTransform(sheetDraw, (v) =>
    Math.max(0, sheetGap * (1 - (reduce ? 1 : v)))
  );
  const sheetRadius = useTransform(sheetDraw, (v) => 28 * (1 - (reduce ? 1 : v)));
  const sheetClip = useMotionTemplate`inset(0px ${sheetInset}px 0px ${sheetInset}px round ${sheetRadius}px ${sheetRadius}px 0px 0px)`;

  return (
    <div style={{ backgroundColor: OFFWHITE }}>
      {/* ── 1 · Fees are tailored to your care — text | sage composition ── */}
      {/* pb-12 keeps the rows card inside this band's overflow-clip during
          its 55px entrance rise; §2's top padding gives the difference back
          so the §1→§2 gap stays on rhythm. */}
      <div id="tailored" data-drift-band className="scroll-mt-24 overflow-clip">
        <div className={`container-wide pb-12 pt-24 md:pt-32 ${SPLIT}`}>
          <div>
            <h2 className={H_SPLIT}>
              Consultants set their own tariffs.
            </h2>
            <p className={SUPPORT}>
              Berkshire Oncology Partnership is a group of independent
              practitioners. Tariffs are intended as a guide, so contact the
              practice for details of the tariff that applies to you.
            </p>
          </div>
          <RowPanel
            tint={SAGE_BLOCK}
            label="If you are self-funding"
            rows={[
              "Package tailored to your needs",
              "Comprehensive tariff provided",
              "Before treatment starts",
            ]}
            photo="/tariffs/consultation.jpg"
            alt="A consultant listening to a patient during a consultation"
          />
        </div>
      </div>

      {/* ── 2 · Funding routes — text | rising cards ── */}
      <div id="funding" data-drift-band className="scroll-mt-24 overflow-clip">
        <div className={`container-wide pb-24 pt-12 md:pb-32 md:pt-20 ${SPLIT}`}>
          <div>
            <h2 className={H_SPLIT}>
              You can self-fund treatment or use private medical insurance.
            </h2>
            <p className={SUPPORT}>
              Self-funding patients receive a comprehensive tariff. Insured
              patients should obtain a quote from their provider before
              treatment.
            </p>
          </div>
          <div className="space-y-6">
            <article
              data-fx="rise"
              data-lock={LOCK}
              id="self-funding"
              className="scroll-mt-24 rounded-[2rem] p-8 md:p-10"
              style={{ backgroundColor: "#dce6e1" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/70">
                Self-funding
              </p>
              <h3 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                Paying for your own treatment
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/75 md:text-base">
                Each self-funding package is tailored to individual needs. You
                will receive a comprehensive tariff before treatment starts.
              </p>
              <ArrowLink href="#request">
                Request tariff details
              </ArrowLink>
            </article>

            <article
              data-fx="rise"
              data-lock={LOCK}
              id="insurance"
              className="scroll-mt-24 rounded-[2rem] p-8 md:p-10"
              style={{ backgroundColor: "#e6edf3" }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/70">
                Insured
              </p>
              <h3 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight text-ink">
                Private medical insurance
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/75 md:text-base">
                Insurance providers have their own fee schedules, and policy
                benefits vary. Obtain a quote before treatment to check
                whether the cost is covered in full.
              </p>
              <ArrowLink href="#shortfalls">
                What if my policy doesn&rsquo;t cover everything?
              </ArrowLink>
            </article>
          </div>
        </div>
      </div>

      {/* ── 3 · Before you start — text | the drawn pathway ── */}
      <div id="before-you-start" className="scroll-mt-24">
        <div className={`container-wide pb-24 md:pb-32 ${SPLIT}`}>
          <div>
            <h2 className={H_SPLIT}>
              Check the relevant costs before treatment begins.
            </h2>
            <p className={SUPPORT}>
              Ask the practice for tariff details if you are self-funding. If
              you are insured, obtain a quote from your provider and confirm
              whether the treatment is covered in full.
            </p>
          </div>
          <Pathway />
        </div>
      </div>

      {/* ── 4 · Estimates — blue composition | text (sides flipped) ── */}
      <div id="estimates" data-drift-band className="scroll-mt-24 overflow-clip">
        <div className={`container-wide pb-24 md:pb-32 ${SPLIT_FLIP}`}>
          <div className="lg:order-2">
            <h2 className={H_SPLIT}>
              Quotes are estimates and may change.
            </h2>
            <p className={SUPPORT}>
              The amount may change depending on the treatment given. Contact
              the practice if you have questions about a tariff or estimate.
            </p>
          </div>
          <div className="lg:order-1">
            <RowPanel
              tint={PANEL}
              label="Questions to ask about a quote"
              rows={[
                "What does this quote include?",
                "Could the amount change?",
                "Who should I contact?",
              ]}
              photo="/tariffs/estimate.jpg"
              alt="Working through the pages of a written estimate at a desk"
              corner="left"
            />
          </div>
        </div>
      </div>

      {/* ── 5 · Insurance shortfalls — full-width mint background ── */}
      <section id="shortfalls" className="scroll-mt-24 bg-mint">
        <div className="container-wide py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14 xl:gap-20">
            <div className="flex flex-col items-start text-left">
              <h2 className="max-w-[13ch] font-display text-[clamp(2.5rem,4.15vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink">
                If your insurer does not pay in full, you are responsible for
                the balance.
              </h2>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted md:text-xl">
                Check what your policy covers before treatment begins.
              </p>
            </div>

            <div className="rounded-[2rem] border border-ink/10 bg-white/90 p-6 shadow-[0_30px_80px_-45px_rgba(6,28,70,0.3)] sm:p-8 md:p-10 lg:p-12">
              <p className="max-w-xl text-lg leading-relaxed text-ink/70 md:text-xl">
                Contact the practice for tariff details, then ask your insurer
                whether the cost will be covered in full before treatment
                starts.
              </p>
              <div id="request" className="mt-8 scroll-mt-32">
                <Button
                  href="/contact#guidance"
                  className="w-full sm:w-auto sm:px-9 sm:py-4 sm:text-base"
                >
                  Request tariff details
                </Button>
              </div>
              <BandRows />
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 · FAQs — text | white panel of questions. items-start so an
             opening answer doesn't re-seat the statement. ── */}
      <div id="faqs" className="scroll-mt-24">
        <div
          className={`container-wide py-24 md:py-32 ${SPLIT.replace(
            "items-center",
            "items-start"
          )}`}
        >
          <div className="flex flex-col items-start text-left lg:self-center">
            <h2 className={`max-w-[15ch] ${H_SPLIT}`}>
              Answers to common questions about fees.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
              Find out how to request tariff details, self-fund treatment,
              check insurance cover and understand changes to a quote. Call{" "}
              <a
                href={tel(c.phone)}
                className="inline-block py-2 -my-2 text-accent underline underline-offset-2"
              >
                {c.phone}
              </a>{" "}
              if your question is not covered.
            </p>
          </div>
          <Faqs />
        </div>
      </div>

      {/* ── 8 · Contact — the navy sheet ── */}
      <div id="contact-fees" className="scroll-mt-24">
        <div ref={sheetRef} className="relative">
          {/* the navy surface: inset with rounded shoulders on approach,
              docking flush as it lands */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-screen"
            style={{
              marginLeft: "-50vw",
              backgroundColor: "#061c46",
              clipPath: sheetClip,
            }}
          />
          <div className="container-wide">
            {/* content-edge measure ref, same contract as the band */}
            <div ref={sheetBoxRef}>
              <div className="relative py-24 md:py-28">
                <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <h2 className={`max-w-3xl ${H_CLOSE}`}>
                    Contact the practice for tariff details.
                  </h2>
                  <div className="lg:text-right">
                    <div className="space-y-1.5 text-lg text-white/85">
                      <p>
                        <a
                          href={tel(c.phone)}
                          className="inline-block py-2.5 -my-2.5 focus-visible:underline lg:hover:underline"
                        >
                          {c.phone}
                        </a>
                      </p>
                      <p>
                        <a
                          href={tel(c.phoneMobile)}
                          className="inline-block py-2.5 -my-2.5 focus-visible:underline lg:hover:underline"
                        >
                          {c.phoneMobile}
                        </a>{" "}
                        <span className="text-white/50">(mobile)</span>
                      </p>
                      <p className="[overflow-wrap:anywhere]">
                        <a
                          href={`mailto:${c.email}`}
                          className="focus-visible:underline lg:hover:underline"
                        >
                          {c.email}
                        </a>
                      </p>
                    </div>
                    <div className="mt-8">
                      <Button
                        href="/contact#guidance"
                        variant="light"
                        className="focus-visible:shadow-[0_0_0_2px_rgba(255,255,255,0.85)]"
                      >
                        Contact the practice team
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
