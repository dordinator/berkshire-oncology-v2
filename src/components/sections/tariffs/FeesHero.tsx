"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useCenterGap } from "./useCenterGap";

/*
  The fees hero: the comp's composition set in the site's own type — display
  face headline with the house gradient second line on clean near-white
  ground, the photograph (hands passing a price-free "Your care plan"
  document — generated, Photo A) sweeping in from the right at 80% width and
  dissolving mid-way through the blue strip, which floats over it slightly
  translucent.

  The photograph's edges are handled with a MASK rather than painted
  overlays: an overlay fades by washing the image toward the ground colour
  (which reads as fog); a mask thins the image itself away, so it keeps its
  true colour right up to where it disappears. Same approach ParticleField
  uses — two gradients intersected, one for the left edge under the text,
  one for the bottom edge.

  Motion: an entrance sequence on load for the headline, copy and pills, and
  a slight upward parallax on the photograph as the hero scrolls out. The
  photograph itself is visible immediately so the largest visual does not
  wait for an entrance animation. The parallax moves the image INSIDE the
  static mask — faster than the page, so the gap it opens is at the bottom
  edge, where the mask has already dissolved to nothing. At rest the framing
  is exactly the approved one. On exit, the blue strip's
  surface unrounds and stretches edge to edge (see below) — the box opening
  into the page. Everything uses the site's Reveal vocabulary (0.7s, ease
  [0.22,1,0.36,1]) and collapses under prefers-reduced-motion.

  COPY IS PLACEHOLDER: headline, supporting line and card copy are the
  comp's own words and make claims the practice hasn't made. They need the
  practice's wording before this ships. The photograph is generated — same
  caveat.
*/

const GROUND = "var(--surface-paper-soft)";
const SAGE = "var(--brand-sage)";

const pill =
  "type-button inline-flex items-center justify-center rounded-full px-6 py-3.5 transition-colors md:px-4 lg:px-7";

const MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 6%, #000 48%), linear-gradient(to bottom, #000 76%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 6%, #000 48%), linear-gradient(to bottom, #000 76%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

const MOBILE_MASK = {
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 36%, #000 68%, #000 84%, transparent 100%)",
  maskImage:
    "linear-gradient(to bottom, transparent 36%, #000 68%, #000 84%, transparent 100%)",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const CARDS = [
  {
    title: "Self-funding",
    body: "Receive a comprehensive tariff before your treatment starts.",
    href: "#self-funding",
    cta: "Self-funding details",
  },
  {
    title: "Using insurance",
    body: "Obtain a quote to check whether your treatment is covered in full.",
    href: "#insurance",
    cta: "Insurance guidance",
  },
  {
    title: "Quotes and changes",
    body: "Quotes are estimates and may change depending on the treatment given.",
    href: "#estimates",
    cta: "How estimates work",
  },
];

export default function FeesHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -44]);

  // The strip transition: the blue strip's background lives on a
  // full-bleed layer clipped back to the strip's own box. As the strip
  // approaches the top of the viewport the clip releases — corners unround,
  // the blue stretches edge to edge — so the box "opens" into the page on
  // the way out. Under reduced motion the clip freezes at the resting box
  // and nothing moves.
  const stripWrapRef = useRef<HTMLDivElement>(null);
  const stripBoxRef = useRef<HTMLDivElement>(null);
  const stripGap = useCenterGap(stripBoxRef);
  const { scrollYProgress: stripProgress } = useScroll({
    target: stripWrapRef,
    offset: ["start 0.45", "start 0.08"],
  });
  const stripDraw = useSpring(stripProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const stripInset = useTransform(stripDraw, (v) =>
    Math.max(0, stripGap * (1 - (reduce ? 0 : v)))
  );
  const stripRadius = useTransform(stripDraw, (v) =>
    16 * (1 - (reduce ? 0 : v))
  );
  const stripClip = useMotionTemplate`inset(0px ${stripInset}px 0px ${stripInset}px round ${stripRadius}px)`;

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: GROUND }}
    >
      {/* On phones the photograph belongs to the hero rather than becoming a
          separate full-width content block. A long vertical mask keeps the
          heading and copy on quiet ground, then reveals the care-plan scene
          beneath the actions before dissolving into the summary panel. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[680px] md:hidden"
        style={MOBILE_MASK}
      >
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { y: parallaxY }}
        >
          <Image
            src="/tariffs/hero-plan-a.webp"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-[58%_center]"
          />
        </motion.div>
      </div>

      {/* The photograph: 80% wide, from the top edge down to mid-strip, its
          left and bottom edges thinned away by the mask. The mask stays put;
          the image drifts in and parallaxes inside it. */}
      <div
        aria-hidden
        className="absolute right-0 top-0 hidden md:bottom-[18%] md:block md:w-[74%] lg:bottom-[17%] lg:w-[80%]"
        style={MASK}
      >
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { y: parallaxY }}
        >
          <Image
            src="/tariffs/hero-plan-a.webp"
            alt=""
            fill
            priority
            unoptimized
            sizes="80vw"
            className="object-cover object-[50%_38%]"
          />
        </motion.div>
      </div>

      {/* ── Hero — text on clean ground left ── */}
      <div className="relative flex min-h-[640px] items-start pt-28 sm:min-h-[680px] sm:pt-32 md:min-h-[600px] md:items-center md:pt-24 lg:min-h-[70svh] lg:pt-28">
        <motion.div
          className="container-wide relative z-10 w-full pb-12"
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
          }}
        >
          <div className="max-w-xl md:max-w-[50%] lg:max-w-[48%] xl:max-w-[44%]">
            {/* the contact hero's exact treatment: display face, ink first
                line, house gradient on the second */}
            <h1 className="type-page-hero text-ink">
              <motion.span variants={rise} className="block">
                How treatment
              </motion.span>
              <motion.span variants={rise} className="block text-gradient">
                fees work
              </motion.span>
            </h1>

            <motion.p
              variants={rise}
              className="type-section-lede mt-6 max-w-md text-ink/75"
            >
              Tariffs are a guide. Self-funding packages are tailored to
              individual needs, while insurance cover varies by policy.
            </motion.p>

            <motion.div
              variants={rise}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="#tailored"
                className={`${pill} ink-cta`}
              >
                How fees work
              </a>
              <Link
                href="/contact#guidance"
                className={`${pill} border border-ink/20 bg-white/60 text-ink backdrop-blur-sm focus-visible:border-ink/45 focus-visible:bg-white`}
              >
                Request tariff details
              </Link>
            </motion.div>
          </div>

        </motion.div>
      </div>

      {/* ── Three-up strip — floats over the photograph's lower reach ── */}
      <div ref={stripWrapRef} className="container-wide relative z-10 -mt-8 pb-14 md:mt-0 md:pb-20">
        <motion.div
          ref={stripBoxRef}
          className="relative grid gap-6 px-6 py-8 md:grid-cols-3 md:gap-0 md:px-0 md:py-8 lg:py-10"
        >
          {/* the strip's surface: full-bleed, clipped back to the box at
              rest; the scroll scrub releases the clip on exit */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-screen backdrop-blur-md"
            style={{
              marginLeft: "-50vw",
              backgroundColor:
                "color-mix(in srgb, var(--brand-blue-mist) 90%, transparent)",
              clipPath: stripClip,
              filter: "drop-shadow(0 16px 30px rgba(6,28,70,0.16))",
            }}
          />
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className={`relative grid h-full grid-rows-[auto_1fr_auto] justify-items-center px-2 text-center md:px-5 lg:px-6 xl:px-9 ${
                i > 0 ? "md:border-l md:border-ink/10" : ""
              }`}
            >
              <h2 className="type-compact-title text-ink">
                {card.title}
              </h2>
              <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-ink/70">
                {card.body}
              </p>
              <Link
                href={card.href}
                className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink after:absolute after:-inset-3 after:content-['']"
              >
                {card.cta}
                <svg viewBox="0 0 20 12" fill="none" className="h-3 w-6" aria-hidden>
                  <path d="M1 6h16M13 1.5 17.5 6 13 10.5" stroke={SAGE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
