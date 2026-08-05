"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { site } from "@/content/site";
import { useCenterGap } from "./useCenterGap";

/*
  The fees page below the hero: a compact editorial sequence, not a pricing
  table and not a case study.

  Borrowed registers — Little Tiger/Linear: confident display statements with
  tightly edited support copy, colour-blocked sections, one repeatable motif;
  Granola: modular sections with one job each, quiet borders and rounded
  panels, in-page navigation, short direct copy, an efficient scroll.

  The motif: a short sage hairline before every kicker, and sage nodes on the
  four-stage pathway. Colour system: the hero's warm ivory ground, pale
  blue-grey information panels, deep navy close. No numbered sections, no
  prices anywhere.

  Motion: a calm base in the site's Reveal vocabulary (rise 28px, 0.7s,
  ease [0.22,1,0.36,1], once-only) — sections stagger their kicker, heading
  and copy; the kicker hairline grows in; the in-page nav tracks the reader
  with a sliding sage indicator; the FAQs open on a sprung height — plus
  three scroll-scrubbed signatures so the page isn't one gesture repeated:
  the funding panels pop in with overshoot and a tilt that settles, the
  shortfalls band stretches from rounded panel to full bleed, the pathway's
  connector line draws itself, and the navy close docks like a sheet. All
  of it collapses under prefers-reduced-motion.

  COPY: assembled from the practice's own published tariff wording (tailored
  packages, comprehensive tariff before treatment, insurer variation, quotes
  before treatment, shortfall liability, estimates subject to change) plus
  the briefed additions. Needs the practice's sign-off before ship.
*/

const GROUND = "#f7f5f1";
const PANEL = "#dfe9f5";
const SAGE = "#6f7f55";

const pill =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors";

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const VIEW = { once: true, margin: "-80px" } as const;

const staggerShow = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/** The funding panels' entrance: scale overshoot + a degree of tilt that
 *  settles straight. Reduced motion (via the site MotionConfig) drops the
 *  transforms and keeps the fade. */
const cardPop = (tilt: number): Variants => ({
  hidden: { opacity: 0, y: 26, scale: 0.94, rotate: tilt },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 16, mass: 0.9 },
  },
});

/** A once-only in-view group whose motion children rise in sequence. */
function Group({
  children,
  className,
  step = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEW}
      variants={staggerShow(step, delay)}
    >
      {children}
    </motion.div>
  );
}

/** The repeatable motif: sage hairline (grows in from the left) + kicker. */
function Kicker({
  children,
  className = "",
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <motion.p
      variants={rise}
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] ${
        light ? "text-white/50" : "text-ink-muted"
      } ${className}`}
    >
      <motion.span
        aria-hidden
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
        }}
        className="h-px w-8 origin-left"
        style={{ backgroundColor: light ? `${SAGE}B3` : `${SAGE}99` }}
      />
      {children}
    </motion.p>
  );
}

const NAV = [
  { label: "Tailored fees", href: "#tailored" },
  { label: "Funding routes", href: "#funding" },
  { label: "Before you start", href: "#before-you-start" },
  { label: "Estimates", href: "#estimates" },
  { label: "Shortfalls", href: "#shortfalls" },
  { label: "Request a tariff", href: "#request" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact", href: "#contact-fees" },
];

/**
 * The sticky in-page nav, now aware of where the reader is: an
 * IntersectionObserver watches a band around the viewport's upper middle,
 * the link for the section currently in it turns ink, and a sage indicator
 * slides between links (layoutId does the travelling). On phones the strip
 * also keeps the active link in view by scrolling its own overflow — never
 * the page.
 */
function FeesNav() {
  const [active, setActive] = useState<string | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const ids = NAV.map((n) => n.href.slice(1));
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible.set((e.target as HTMLElement).id, e.isIntersecting);
        }
        // The band is thin, so usually one section is in it; if two touch it,
        // the later one in reading order is the one being entered.
        let current: string | null = null;
        for (const id of ids) if (visible.get(id)) current = id;
        if (current) setActive(current);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const strip = stripRef.current;
    const item = itemRefs.current[active];
    if (!strip || !item) return;
    if (strip.scrollWidth <= strip.clientWidth + 8) return;
    strip.scrollTo({
      left: item.offsetLeft - strip.clientWidth / 2 + item.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[86px] z-30 border-y border-ink/[0.06] backdrop-blur-md"
      style={{ backgroundColor: "rgba(247,245,241,0.92)" }}
    >
      <div
        ref={stripRef}
        className="container-wide overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max items-center gap-6 py-3 lg:w-full lg:justify-center lg:gap-8">
          {NAV.map((item) => {
            const isActive = active === item.href.slice(1);
            return (
              <li
                key={item.href}
                className="relative"
                ref={(el) => {
                  itemRefs.current[item.href.slice(1)] = el;
                }}
              >
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`whitespace-nowrap text-sm transition-colors focus-visible:text-ink ${
                    isActive ? "text-ink" : "text-ink-muted lg:hover:text-ink"
                  }`}
                >
                  {item.label}
                </a>
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="fees-nav-active"
                    className="absolute -bottom-3 left-0 right-0 h-[2px] rounded-full"
                    style={{ backgroundColor: SAGE }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
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
    body: "A personalised tariff or written estimate for the planned treatment, before it begins.",
  },
  {
    title: "Ask questions before proceeding",
    body: "The practice team will go through anything that is unclear before you commit.",
  },
];

/**
 * The four-stage pathway. The connector line is scroll-driven: it draws
 * itself as the section moves up the viewport (a spring smooths the scrub so
 * it floats rather than tracks), and each sage node springs in as its stage
 * rises. Two lines — vertical for the stacked phone layout, horizontal from
 * lg — so each only ever scales along its own length.
 */
function Pathway() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });
  const draw = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    restDelta: 0.001,
  });

  return (
    <div ref={ref} className="relative mt-14">
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-[5px] top-1 w-px origin-top bg-ink/10 lg:hidden"
        style={{ scaleY: reduce ? 1 : draw }}
      />
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 top-[5px] hidden h-px origin-left bg-ink/10 lg:block"
        style={{ scaleX: reduce ? 1 : draw }}
      />
      <motion.ol
        className="grid gap-10 lg:grid-cols-4 lg:gap-8"
        initial="hidden"
        whileInView="show"
        viewport={VIEW}
        variants={staggerShow(0.12)}
      >
        {STAGES.map((s) => (
          <motion.li
            key={s.title}
            variants={rise}
            className="relative pl-8 lg:pl-0 lg:pt-8"
          >
            <motion.span
              aria-hidden
              variants={{
                hidden: { scale: 0 },
                show: {
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1,
                  },
                },
              }}
              className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border-2 bg-[#f7f5f1] lg:top-0"
              style={{ borderColor: SAGE }}
            />
            <h3 className="font-display text-lg leading-snug text-ink">
              {s.title}
            </h3>
            <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-ink/70">
              {s.body}
            </p>
          </motion.li>
        ))}
      </motion.ol>
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
    q: "Do I need insurance authorisation?",
    a: (
      <>
        If you are insured, confirm your cover and obtain authorisation from
        your insurer before treatment begins — policies and fee schedules vary
        between insurers and between individual policies.
      </>
    ),
  },
  {
    q: "What is a shortfall?",
    a: (
      <>
        If your insurer does not settle an account in full, the remaining
        amount — the shortfall — is the patient&rsquo;s responsibility.
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
        The practice team. Call {site.contact.phone} or email{" "}
        <a
          href={`mailto:${site.contact.email}`}
          className="text-accent underline-offset-2 hover:underline"
        >
          {site.contact.email}
        </a>{" "}
        for consultant-specific information.
      </>
    ),
  },
];

/**
 * The FAQ accordion, controlled so the answers can open on a sprung height
 * rather than snapping. Exclusive like the partnership rows — opening one
 * closes the rest. Buttons carry aria-expanded/aria-controls; keyboard
 * behaviour is the native button's.
 */
function Faqs() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Group step={0.06} className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <motion.div key={f.q} variants={rise}>
            <h3 className="m-0 font-display text-[1.05rem] font-normal text-ink">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`fees-faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left font-display text-[1.05rem] text-ink focus-visible:underline focus-visible:underline-offset-4"
              >
                {f.q}
                <span aria-hidden className="relative h-3.5 w-3.5 shrink-0 text-ink-muted">
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  {/* The vertical stroke collapses, so + becomes − */}
                  <motion.span
                    className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current"
                    animate={{ scaleY: isOpen ? 0 : 1 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                </span>
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
                  <p className="pb-6 pr-8 text-[15px] leading-relaxed text-ink/75">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </Group>
  );
}

export default function FeesBody() {
  const c = site.contact;
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;
  const reduce = useReducedMotion();

  // The shortfalls band: its surface is a full-bleed layer clipped back to
  // a rounded panel; scrolling into it releases the clip so the pale blue
  // stretches edge to edge. Reduced motion freezes it at the rounded panel.
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

  // The navy sheet: the close starts inset with rounded top corners and
  // docks flush as it enters. Reduced motion freezes it flush.
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
    <div style={{ backgroundColor: GROUND }}>
      {/* ── In-page navigation — quiet, sticky under the navbar ── */}
      <FeesNav />

      {/* ── 1 · Fees are tailored to your care ── */}
      <section id="tailored" className="scroll-mt-36">
        <Group className="container-wide grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Kicker>How fees are set</Kicker>
            <motion.h2
              variants={rise}
              className="mt-6 max-w-md font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
            >
              Fees are tailored to your care.
            </motion.h2>
          </div>
          <div className="max-w-xl space-y-5 text-[17px] leading-relaxed text-ink/80 lg:pt-14">
            <motion.p variants={rise}>
              Berkshire Oncology Partnership is a group of professional
              independent practitioners, and each consultant sets their own
              tariff — one they feel is fair and reasonable for the service
              provided.
            </motion.p>
            <motion.p variants={rise}>
              Because cancer care is individual, we do not publish fixed
              treatment prices. Your tariff reflects your diagnosis, your
              treatment plan and your consultant, and is provided to you
              directly.
            </motion.p>
          </div>
        </Group>
      </section>

      {/* ── 2 · Funding routes ── */}
      <section id="funding" className="scroll-mt-36">
        <Group className="container-wide pb-20 md:pb-28">
          <Kicker>Funding routes</Kicker>
          <motion.h2
            variants={rise}
            className="mt-6 max-w-lg font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
          >
            Two ways to pay for treatment.
          </motion.h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <motion.article
              variants={cardPop(-1.4)}
              id="self-funding"
              className="scroll-mt-36 rounded-2xl border border-ink/[0.08] bg-white/50 p-8 md:p-10"
            >
              <h3 className="font-display text-2xl text-ink">
                Self-funding treatment
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-ink/75">
                Each self-funding package is tailored to the individual needs
                of the patient. Anyone self-funding their treatment is provided
                with a comprehensive, personalised tariff before treatment
                starts — so you know where you stand from the outset.
              </p>
              <a
                href="#request"
                className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink after:absolute after:-inset-3 after:content-['']"
              >
                Request a personalised tariff
                <svg viewBox="0 0 20 12" fill="none" className="h-3 w-6" aria-hidden>
                  <path d="M1 6h16M13 1.5 17.5 6 13 10.5" stroke={SAGE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </motion.article>

            <motion.article
              variants={cardPop(1.6)}
              id="insurance"
              className="scroll-mt-36 rounded-2xl border border-ink/[0.08] bg-white/50 p-8 md:p-10"
            >
              <h3 className="font-display text-2xl text-ink">
                Private medical insurance
              </h3>
              <p className="mt-4 text-[16px] leading-relaxed text-ink/75">
                Insurers each have their own fee schedule, and the benefits of
                individual policies vary. Before treatment begins, confirm your
                cover with your insurer, check that your consultant is
                recognised, and obtain any authorisation your policy requires.
              </p>
              <a
                href="#shortfalls"
                className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink after:absolute after:-inset-3 after:content-['']"
              >
                What if my policy doesn&rsquo;t cover everything?
                <svg viewBox="0 0 20 12" fill="none" className="h-3 w-6" aria-hidden>
                  <path d="M1 6h16M13 1.5 17.5 6 13 10.5" stroke={SAGE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </motion.article>
          </div>
        </Group>
      </section>

      {/* ── 3 · Before you start treatment — the pathway ── */}
      <section id="before-you-start" className="scroll-mt-36 bg-white/40">
        <div className="container-wide py-20 md:py-28">
          <Group>
            <Kicker>Before you start treatment</Kicker>
            <motion.h2
              variants={rise}
              className="mt-6 max-w-lg font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
            >
              Four things happen before any treatment begins.
            </motion.h2>
          </Group>

          {/* the pathway: a connected line with sage nodes, never numbers */}
          <Pathway />
        </div>
      </section>

      {/* ── 4 · Estimates and changes ── */}
      <section id="estimates" className="scroll-mt-36">
        <Group className="container-wide grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Kicker>Estimates and changes</Kicker>
            <motion.h2
              variants={rise}
              className="mt-6 max-w-md font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
            >
              An estimate is a starting point, not a contract.
            </motion.h2>
          </div>
          <div className="max-w-xl space-y-5 text-[17px] leading-relaxed text-ink/80 lg:pt-14">
            <motion.p variants={rise}>
              Every estimate is based on the treatment plan available at the
              time it is prepared. Cancer care adapts to you — so if your
              treatment or circumstances change, the estimate may change with
              them.
            </motion.p>
            <motion.p variants={rise}>
              Tariffs and quotes are a guide to expected costs, and your
              consultant&rsquo;s team will keep you informed as your plan
              develops.
            </motion.p>
          </div>
        </Group>
      </section>

      {/* ── 5 · Excesses and shortfalls — pale-blue information block ── */}
      <section id="shortfalls" className="scroll-mt-36">
        <div className="pb-20 md:pb-28">
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
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={VIEW}
              transition={{ duration: 0.7, ease: EASE }}
            />
            <div className="container-wide">
              <motion.div
                ref={bandBoxRef}
                className="relative p-8 md:p-12"
                initial="hidden"
                whileInView="show"
                viewport={VIEW}
                variants={{
              hidden: { opacity: 0, y: 28 },
              show: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.7,
                  ease: EASE,
                  staggerChildren: 0.08,
                  delayChildren: 0.15,
                },
              },
            }}
          >
            <Kicker>Excesses and shortfalls</Kicker>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
              <motion.h2
                variants={rise}
                className="max-w-md font-display text-2xl leading-[1.15] tracking-tight text-ink md:text-3xl"
              >
                If your policy doesn&rsquo;t cover everything, the difference
                rests with you.
              </motion.h2>
              <motion.div
                variants={rise}
                className="space-y-4 text-[16px] leading-relaxed text-ink/80"
              >
                <p>
                  Policies vary. Depending on yours, you may be responsible for
                  an excess, a policy contribution, a service your cover
                  doesn&rsquo;t include, or a shortfall where your insurer does
                  not settle the account in full.
                </p>
                <p>
                  We strongly advise obtaining a quote from your insurer before
                  any treatment, so you know whether the cost of your care will
                  be covered in full.
                </p>
              </motion.div>
            </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 · Request tariff information ── */}
      <section id="request" className="scroll-mt-36">
        <Group className="container-wide pb-20 text-center md:pb-28">
          <Kicker className="justify-center">Tariff information</Kicker>
          <motion.h2
            variants={rise}
            className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
          >
            Request a personalised tariff.
          </motion.h2>
          <motion.p
            variants={rise}
            className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-ink/75"
          >
            We don&rsquo;t publish fixed treatment costs, because no two plans
            are the same. The practice team will prepare consultant-specific
            tariff information for your care.
          </motion.p>
          <motion.div variants={rise} className="mt-8">
            <Link
              href="/contact"
              className={`${pill} bg-ink text-white focus-visible:bg-accent`}
            >
              Request a personalised tariff
            </Link>
          </motion.div>
        </Group>
      </section>

      {/* ── 7 · FAQs ── */}
      <section id="faqs" className="scroll-mt-36 bg-white/40">
        <div className="container-wide grid gap-10 py-20 md:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <Group>
            <Kicker>Common questions</Kicker>
            <motion.h2
              variants={rise}
              className="mt-6 max-w-sm font-display text-3xl leading-[1.12] tracking-tight text-ink md:text-[2.6rem]"
            >
              Fees, answered plainly.
            </motion.h2>
          </Group>
          <Faqs />
        </div>
      </section>

      {/* ── 8 · Contact — deep navy close ── */}
      <section id="contact-fees" className="scroll-mt-36">
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
          <div ref={sheetBoxRef} className="container-wide">
            <Group className="relative py-20 md:py-24">
          <Kicker light>Talk to us about fees</Kicker>
          <div className="mt-6 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <motion.h2
              variants={rise}
              className="max-w-xl font-display text-3xl leading-[1.1] tracking-tight text-white md:text-[2.8rem]"
            >
              The practice team will talk you through any of it.
            </motion.h2>
            <motion.div variants={rise} className="lg:text-right">
              <div className="space-y-1 text-[17px] text-white/85">
                <p>
                  <a href={tel(c.phone)} className="focus-visible:underline lg:hover:underline">
                    {c.phone}
                  </a>
                </p>
                <p>
                  <a href={tel(c.phoneMobile)} className="focus-visible:underline lg:hover:underline">
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
              <div className="mt-7">
                <Link
                  href="/contact"
                  className={`${pill} bg-white text-ink focus-visible:bg-canvas-soft`}
                >
                  Contact the practice team
                </Link>
              </div>
            </motion.div>
          </div>
            </Group>
          </div>
        </div>
      </section>
    </div>
  );
}
