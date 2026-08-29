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

  Motion: an entrance sequence on load (headline lines, copy, pills, then
  the photograph drifting in from the right), and a slight upward parallax
  on the photograph as the hero scrolls out. The parallax moves the image
  INSIDE the static mask — faster than the page, so the gap it opens is at
  the bottom edge, where the mask has already dissolved to nothing. At rest
  the framing is exactly the approved one. On exit, the blue strip's
  surface unrounds and stretches edge to edge (see below) — the box opening
  into the page. Everything uses the site's Reveal vocabulary (0.7s, ease
  [0.22,1,0.36,1]) and collapses under prefers-reduced-motion.

  COPY IS PLACEHOLDER: headline, supporting line and card copy are the
  comp's own words and make claims the practice hasn't made. They need the
  practice's wording before this ships. The photograph is generated — same
  caveat.
*/

const GROUND = "#f7f5f1";
const SAGE = "#6f7f55";

const pill =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors";

const MASK = {
  WebkitMaskImage:
    "linear-gradient(to right, transparent 6%, #000 48%), linear-gradient(to bottom, #000 76%, transparent 100%)",
  maskImage:
    "linear-gradient(to right, transparent 6%, #000 48%), linear-gradient(to bottom, #000 76%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const riseSoft: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const CARDS = [
  {
    title: "What you pay for",
    body: "Consultation, records review and treatment planning—clearly itemised.",
    href: "#tailored",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ink" aria-hidden>
        <path d="M7 3.5h7l3.5 3.5v13a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5v-16a.5.5 0 0 1 .5-.5Z" />
        <path d="M14 3.5V7h3.5M9.5 11h5M9.5 14.5h5" />
      </svg>
    ),
  },
  {
    title: "What may vary",
    body: "Factors that can influence fees, explained upfront.",
    href: "#estimates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ink" aria-hidden>
        <path d="M4 7.5h16M4 12h16M4 16.5h16" />
        <circle cx="9.5" cy="7.5" r="1.6" fill="#dfe9f5" />
        <circle cx="14.5" cy="12" r="1.6" fill="#dfe9f5" />
        <circle cx="8" cy="16.5" r="1.6" fill="#dfe9f5" />
      </svg>
    ),
  },
  {
    title: "How we help",
    body: "Our team is here to guide you with clarity and compassion.",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-ink" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="2.6" />
        <path d="M7.2 18.4a5.4 5.4 0 0 1 9.6 0" />
      </svg>
    ),
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
      {/* The photograph: 80% wide, from the top edge down to mid-strip, its
          left and bottom edges thinned away by the mask. The mask stays put;
          the image drifts in and parallaxes inside it. */}
      <div
        aria-hidden
        className="absolute right-0 top-0 hidden lg:bottom-[17%] lg:block lg:w-[80%]"
        style={MASK}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
          style={reduce ? undefined : { y: parallaxY }}
        >
          <Image
            src="/tariffs/hero-plan-a.jpg"
            alt=""
            fill
            priority
            sizes="80vw"
            className="object-cover object-[50%_38%]"
          />
        </motion.div>
      </div>

      {/* ── Hero — text on clean ground left ── */}
      <div className="relative flex min-h-[62svh] items-center pt-28 md:min-h-[70svh]">
        <motion.div
          className="container-wide relative z-10 w-full pb-12"
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
          }}
        >
          <div className="max-w-xl lg:max-w-[44%]">
            {/* the contact hero's exact treatment: display face, ink first
                line, house gradient on the second */}
            <h1 className="font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
              <motion.span variants={rise} className="block">
                Clear fees
              </motion.span>
              <motion.span variants={rise} className="block text-gradient">
                for complex care
              </motion.span>
            </h1>

            <motion.p
              variants={rise}
              className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/75 md:text-lg"
            >
              We explain the cost of consultation, records review and treatment
              planning before care begins.
            </motion.p>

            <motion.div
              variants={rise}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a
                href="#tailored"
                className={`${pill} bg-ink text-white focus-visible:bg-accent`}
              >
                How fees work
              </a>
              <Link
                href="/contact#guidance"
                className={`${pill} border border-ink/20 bg-white/60 text-ink backdrop-blur-sm focus-visible:border-ink/45 focus-visible:bg-white`}
              >
                Talk to our team
              </Link>
            </motion.div>
          </div>

          {/* phone/tablet: photograph below the copy, bleeding to the right
              edge, left edge thinned by the same kind of mask */}
          <motion.div
            variants={rise}
            className="relative -mr-6 mt-10 aspect-[16/10] overflow-hidden md:-mr-10 lg:hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, #000 18%)",
              maskImage: "linear-gradient(to right, transparent 0%, #000 18%)",
            }}
          >
            <Image
              src="/tariffs/hero-plan-a.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Three-up strip — floats over the photograph's lower reach ── */}
      <div ref={stripWrapRef} className="container-wide relative z-10 pb-14 md:pb-20">
        <motion.div
          ref={stripBoxRef}
          className="relative grid gap-8 px-7 py-9 lg:grid-cols-3 lg:gap-0 lg:px-0 lg:py-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0, y: 32 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: EASE,
                delay: 0.4,
                staggerChildren: 0.1,
                delayChildren: 0.55,
              },
            },
          }}
        >
          {/* the strip's surface: full-bleed, clipped back to the box at
              rest; the scroll scrub releases the clip on exit */}
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-screen backdrop-blur-md"
            style={{
              marginLeft: "-50vw",
              backgroundColor: "rgba(223,233,245,0.9)",
              clipPath: stripClip,
              filter: "drop-shadow(0 16px 30px rgba(6,28,70,0.16))",
            }}
          />
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              variants={riseSoft}
              className={`relative flex gap-5 lg:px-9 ${
                i > 0 ? "lg:border-l lg:border-ink/10" : ""
              }`}
            >
              <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-ink/20">
                {card.icon}
              </div>
              <div>
                <h2 className="font-display text-[1.3rem] leading-snug text-ink">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-ink/70">
                  {card.body}
                </p>
                <Link
                  href={card.href}
                  className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium text-ink after:absolute after:-inset-3 after:content-['']"
                >
                  Explore
                  <svg viewBox="0 0 20 12" fill="none" className="h-3 w-6" aria-hidden>
                    <path d="M1 6h16M13 1.5 17.5 6 13 10.5" stroke={SAGE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
