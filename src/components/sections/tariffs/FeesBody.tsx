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

  Framer stays for exactly three things: the two approved full-bleed
  signatures (the pale-blue shortfalls band stretching from rounded panel
  to full bleed, and the navy close docking like a sheet) and the FAQ
  accordion's sprung open/close — interaction, not scroll.

  Type is the patients register: clamp statements (semibold, tight
  leading, −0.05em family tracking), the site .eyebrow with its ink
  hairline, one statement + one short support paragraph per band.

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

/** The site eyebrow: hairline + small caps, exactly as patients types it. */
function Eyebrow({
  children,
  light = false,
  center = false,
}: {
  children: React.ReactNode;
  light?: boolean;
  center?: boolean;
}) {
  return (
    <p
      className={`eyebrow ${light ? "text-white/55" : ""} ${
        center ? "justify-center" : ""
      }`}
    >
      <span
        aria-hidden
        className={`h-px w-8 ${light ? "bg-white/35" : "bg-ink-muted"}`}
      />
      {children}
    </p>
  );
}

/* Heading tiers. Splits carry the column statement tier; the two
   full-bleed moments keep their own cuts, and the navy close crescendos. */
const H_SPLIT =
  "font-display text-[clamp(2.25rem,4.1vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink";
const H_LONG =
  "font-display text-[clamp(2.4rem,4.2vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink";
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
    title: "Discuss your care",
    body: "Your consultant sets out the treatment being proposed and what it involves.",
  },
  {
    title: "Confirm how you are paying",
    body: "Self-funding, or through a private medical insurance policy.",
  },
  {
    title: "Receive your tariff or estimate",
    body: "A personalised tariff or written estimate, before treatment begins.",
  },
  {
    title: "Ask questions before proceeding",
    body: "The practice team will go through anything that is unclear.",
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
    q: "How do I request a tariff?",
    a: (
      <>
        Contact the practice team and tell us which consultant you are seeing.
        A personalised tariff is prepared for your treatment plan and provided
        before treatment starts.
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
        Yes. Estimates are based on the treatment plan at the time they are
        prepared, and may change if your treatment or circumstances change.
      </>
    ),
  },
  {
    q: "Who can help me understand the costs?",
    a: (
      <>
        The practice team. Call{" "}
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
        </a>{" "}
        for consultant-specific information.
      </>
    ),
  },
];

/* The two shortfall topics that expand inside the blue band — the patients
   support-band device. Same approved wording the FAQ list used to carry. */
const BAND_ROWS = [
  {
    q: "What is a shortfall?",
    a: "If your insurer does not settle an account in full, the remaining amount — the shortfall — is the patient's responsibility.",
  },
  {
    // The row the nav's "Insurance authorisation" entry deep-links to.
    id: "authorisation",
    q: "Do I need insurance authorisation?",
    a: "If you are insured, confirm your cover and obtain authorisation from your insurer before treatment begins — policies and fee schedules vary between insurers and between individual policies.",
  },
];

/** The expandable topic rows inside the blue band, in the patients
 *  register: bordered rounded rows, the plus rotating 45° when open. */
function BandRows() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mt-8 space-y-3">
      {BAND_ROWS.map((row, i) => {
        const isOpen = open === i;
        return (
          <div
            key={row.q}
            id={"id" in row ? row.id : undefined}
            className="scroll-mt-32 rounded-2xl border border-ink/15 bg-white/45"
          >
            <h3 className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`fees-band-row-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-4 text-left font-display text-lg font-semibold leading-snug text-ink transition-colors hover:text-accent focus-visible:underline focus-visible:underline-offset-4"
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
                  <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink/75">
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

  // The shortfalls band: full-bleed layer clipped back to a rounded panel;
  // scrolling into it releases the clip. Reduced motion freezes the panel.
  const bandRef = useRef<HTMLDivElement>(null);
  const bandBoxRef = useRef<HTMLDivElement>(null);
  const bandGap = useCenterGap(bandBoxRef);
  const { scrollYProgress: bandProgress } = useScroll({
    target: bandRef,
    offset: ["start 0.92", "start 0.45"],
  });
  const bandDraw = useSpring(bandProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const bandInset = useTransform(bandDraw, (v) =>
    Math.max(0, bandGap * (1 - (reduce ? 0 : v)))
  );
  const bandRadius = useTransform(bandDraw, (v) => 16 * (1 - (reduce ? 0 : v)));
  const bandClip = useMotionTemplate`inset(0px ${bandInset}px 0px ${bandInset}px round ${bandRadius}px)`;

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
            <Eyebrow>How fees are set</Eyebrow>
            <h2 className={`mt-7 ${H_SPLIT}`}>
              Fees are tailored to your care.
            </h2>
            <p className={SUPPORT}>
              Each consultant is an independent practitioner and sets a
              tariff they feel is fair and reasonable. Cancer care is
              individual, so we don&rsquo;t publish fixed prices.
            </p>
          </div>
          <RowPanel
            tint={SAGE_BLOCK}
            label="What your tariff covers"
            rows={["Consultation", "Records review", "Treatment planning"]}
            photo="/tariffs/consultation.jpg"
            alt="A consultant listening to a patient during a consultation"
          />
        </div>
      </div>

      {/* ── 2 · Funding routes — text | rising cards ── */}
      <div id="funding" data-drift-band className="scroll-mt-24 overflow-clip">
        <div className={`container-wide pb-24 pt-12 md:pb-32 md:pt-20 ${SPLIT}`}>
          <div>
            <Eyebrow>Funding routes</Eyebrow>
            <h2 className={`mt-7 ${H_SPLIT}`}>
              Two ways to pay for treatment.
            </h2>
            <p className={SUPPORT}>
              Self-funding or insured — either way, you&rsquo;ll know where
              you stand before treatment begins.
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
                Every package is tailored to the patient, with a
                comprehensive, personalised tariff before treatment starts.
              </p>
              <ArrowLink href="#request">
                Request a personalised tariff
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
                Insurers set their own fee schedules, and policies vary.
                Confirm your cover and obtain authorisation before treatment
                begins.
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
            <Eyebrow>Before you start treatment</Eyebrow>
            <h2 className={`mt-7 ${H_SPLIT}`}>
              Four things happen before treatment begins.
            </h2>
            <p className={SUPPORT}>
              The same four steps, whoever your consultant is and however you
              are paying.
            </p>
          </div>
          <Pathway />
        </div>
      </div>

      {/* ── 4 · Estimates — blue composition | text (sides flipped) ── */}
      <div id="estimates" data-drift-band className="scroll-mt-24 overflow-clip">
        <div className={`container-wide pb-24 md:pb-32 ${SPLIT_FLIP}`}>
          <div className="lg:order-2">
            <Eyebrow>Estimates and changes</Eyebrow>
            <h2 className={`mt-7 ${H_SPLIT}`}>
              An estimate is a starting point, not a contract.
            </h2>
            <p className={SUPPORT}>
              Estimates reflect your treatment plan as it stands. If your
              plan changes, the estimate changes with it — and your
              consultant&rsquo;s team will keep you informed.
            </p>
          </div>
          <div className="lg:order-1">
            <RowPanel
              tint={PANEL}
              label="What can change an estimate"
              rows={[
                "Your treatment plan",
                "The length of a course",
                "Your circumstances",
              ]}
              photo="/tariffs/estimate.jpg"
              alt="Working through the pages of a written estimate at a desk"
              corner="left"
            />
          </div>
        </div>
      </div>

      {/* ── 5 · Excesses and shortfalls — the pale-blue full-bleed band ── */}
      <div id="shortfalls" className="scroll-mt-24">
        <div className="pb-24 md:pb-32">
          <div ref={bandRef} className="relative">
            {/* the band's surface: a rounded panel at rest; the scroll
                scrub stretches it edge to edge */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 left-1/2 w-screen"
              style={{
                marginLeft: "-50vw",
                backgroundColor: PANEL,
                clipPath: bandClip,
              }}
            />
            <div className="container-wide">
              {/* measure ref INSIDE the container: content edge, not the
                  full-width border box */}
              <div ref={bandBoxRef}>
                {/* The patients support-band anatomy: statement left; on the
                    right a hairline-ruled column carrying the support copy,
                    the tariff CTA pair, and two expandable topic rows.
                    Tighter vertical padding than the open bands — the panel
                    is dense enough to carry a shorter room. */}
                <div className="relative py-14 md:py-20">
                  <Eyebrow>Excesses and shortfalls</Eyebrow>
                  {/* items-START, not center: the right column grows when a
                      topic row expands, and a centred grid would re-seat the
                      statement mid-read. */}
                  <div className="mt-7 grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
                    <h2 className={H_LONG}>
                      If your policy doesn&rsquo;t cover everything, the
                      difference rests with you.
                    </h2>
                    <div className="border-t border-ink/15 pt-7">
                      <p className="max-w-lg text-lg leading-relaxed text-ink/70">
                        You may be responsible for an excess, a contribution,
                        or a shortfall your insurer does not settle. Obtain a
                        quote from your insurer before treatment begins.
                      </p>
                      <div
                        id="request"
                        className="mt-8 flex scroll-mt-32 flex-wrap items-center gap-3"
                      >
                        <Button href="/contact#guidance">Request a tariff</Button>
                        <Button href="#faqs" variant="ghost">
                          More questions
                        </Button>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink/60">
                        Your request goes to the practice team — tell them
                        which consultant you are seeing.
                      </p>
                      <BandRows />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6 · FAQs — text | white panel of questions. items-start so an
             opening answer doesn't re-seat the statement. ── */}
      <div id="faqs" className="scroll-mt-24">
        <div
          className={`container-wide pb-24 md:pb-32 ${SPLIT.replace(
            "items-center",
            "items-start"
          )}`}
        >
          <div>
            <Eyebrow>Common questions</Eyebrow>
            <h2 className={`mt-7 ${H_SPLIT}`}>Fees, answered plainly.</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
              Short answers to the questions patients ask most — and{" "}
              <a
                href={tel(c.phone)}
                className="inline-block py-2 -my-2 text-accent underline underline-offset-2"
              >
                {c.phone}
              </a>{" "}
              for the rest.
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
                <Eyebrow light>Talk to us about fees</Eyebrow>
                <div className="mt-7 grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <h2 className={`max-w-3xl ${H_CLOSE}`}>
                    The practice team will talk you through any of it.
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
