"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { memo } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Snap from "lenis/snap";
import Button from "@/components/ui/Button";
import { getLenis } from "@/components/SmoothScroll";

/*
  The cancer-types instrument: "Start with what you know."

  A scroll-stepped picker in the locations-journey architecture — a track
  whose sticky stage holds a giant type list on the left and a detail sheet
  on the right, one gesture advancing one cancer type. The page owns the
  content (the server page maps cancerGroups + consultants into TypeCard
  data); this component owns the choreography.

  Differences from /locations, all deliberate:
  - No intro or outro locks. The heading column is persistent, so p = 0 is
    already the first type; locks run 0..N-1 and the A-Z outro below is a
    normal section.
  - Compressed gaps: each lock is GAP_FACTOR of a viewport, not a full one
    — fourteen stops at full-height gaps would be a 17-second traversal.
    Flight time drops to match.
  - Everything on the rail is a control: dots, arrows and the neighbouring
    type names all jump straight to a lock, because the instrument's job is
    "stop at YOURS", not "see all fourteen".
  - Below lg none of the stage machinery mounts. Phones get the home page's
    snap-strip device (type names in a horizontal scroller) over a single
    card that swaps on tap — no scroll capture on touch, ever.

  The scrub contract is the locations one verbatim: one MotionValue, sprung
  for glide (stepped cuts under reduced motion), every visual written
  imperatively in a progress subscription, React state touched only when
  the rounded index changes. SSR renders the exact p = 0 frame.
*/

export interface TypeCardConsultant {
  name: string;
  slug: string;
  shortRole?: string;
  photo?: string;
}

export interface TypeCardData {
  id: string;
  /** The picker word — the group label as the practice worded it. */
  label: string;
  /** The sheet title — the speciality's own title where the group is 1:1. */
  title: string;
  blurb: string;
  consultants: TypeCardConsultant[];
  extraConsultants: number;
  /** For grouped sheets (Bladder & Kidney…): one pill per covered page. */
  entries?: { slug: string; title: string }[];
  specialistsHref: string;
  nextStepsHref: string;
  supportHref: string;
}

const GAP_FACTOR = 0.62; // of one viewport per lock — the traversal fix
const FLIGHT_S = 0.85; // wheel-step flight, shorter than locations' 1.1
const ROW = 84; // picker row height, px — constant so SSR can place p = 0
// Card handover width, in locks. Locations used 0.45, tuned for stepped
// travel where the stage never rests between locks. Browsing here is
// CONTINUOUS, so the fades must overlap — at 0.45 the sheet went blank
// through the middle of every gap; at 0.75 the outgoing and incoming
// sheets genuinely crossfade (~0.33 each at the midpoint).
const FADE = 0.75;

const INK = { r: 6, g: 28, b: 70 }; // #061c46
// The word ramp lands on the DEEP sage — the words are controls, and the
// lighter #769187 fell under 3:1 a row away from the lock.
const SAGE = { r: 92, g: 119, b: 103 }; // #5c7767
const GOLD = "#c8992f"; // the active rail dot (non-text)
const GOLD_TEXT = "#a9791a"; // the numeral — the site's light-ground gold
const GOLD_SOFT = "#e3bd6a";
const NODE_SAGE = "#5c7767"; // deep enough for AA white numerals
const SHEET = "#fbfaf5"; // the patients picker-panel paper

/** Word colour at distance d: ink at the lock, sage a row away. */
function wordColour(d: number) {
  const t = Math.min(d, 1);
  const r = Math.round(INK.r + (SAGE.r - INK.r) * t);
  const g = Math.round(INK.g + (SAGE.g - INK.g) * t);
  const b = Math.round(INK.b + (SAGE.b - INK.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
const wordScale = (d: number) => 1 + 0.75 * Math.max(0, 1 - Math.min(d, 1));
// Floor 0.4: the vertical mask hides anything beyond ~2 rows, so only the
// readable neighbours ever sit at the floor.
const wordOpacity = (d: number) => Math.max(0.4, 1 - 0.2 * d);

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Miss|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* Row icons for the three destinations — site stroke vocabulary. */
const rowIcons = {
  specialists: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 9.5a2.8 2.8 0 1 0 .01-5.6M15.6 13.6a5 5 0 0 1 4.9 5.4" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M12 3v18M12 7h6l2 2-2 2h-6M12 15H6l-2-2 2-2h6" />
    </svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M3.5 16.5c2 0 3-1.5 5-1.5 1.6 0 2.6 1 4.5 1h2.5a1.5 1.5 0 0 0 0-3h-4" />
      <path d="M12.6 10.5c-.8-.9-1.6-2-1.6-3.2A2.3 2.3 0 0 1 15.5 6a2.3 2.3 0 0 1 4.5 1.3c0 1.2-.8 2.3-1.6 3.2-.8.8-1.7 1.5-2.4 2-.7-.5-1.6-1.2-2.4-2Z" />
    </svg>
  ),
};

/** Everyday words → group ids. DRAFT COPY — needs practice sign-off. */
const ALIASES: Record<string, string[]> = {
  breast: ["breast"],
  prostate: ["prostate", "psa"],
  "bladder-and-kidney": ["bladder", "kidney", "renal", "urological"],
  colorectal: ["bowel", "colon", "rectal", "colorectal"],
  lung: ["lung", "chest"],
  "head-and-neck": ["head", "neck", "throat", "mouth", "larynx", "thyroid"],
  gynaecological: ["womb", "ovarian", "ovary", "cervical", "uterine", "endometrial", "gynae"],
  "upper-gi": ["oesophagus", "oesophageal", "stomach", "gastric", "gullet"],
  "liver-and-pancreatic": ["liver", "pancreas", "pancreatic", "bile", "hepatic"],
  "skin-and-melanoma": ["skin", "melanoma", "basal", "squamous"],
  testicular: ["testicle", "testicular"],
  lymphoma: ["lymphoma", "hodgkin", "lymph"],
  "brain-and-spinal": ["brain", "spinal", "glioma", "tumour"],
  "cancer-unknown-primary": ["unknown", "cup", "primary"],
};

function matchTypes(cards: TypeCardData[], q: string): number[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const hits: number[] = [];
  cards.forEach((card, k) => {
    const hay = [
      card.label,
      card.title,
      ...(card.entries?.map((e) => e.title) ?? []),
      ...(ALIASES[card.id] ?? []),
    ]
      .join(" ")
      .toLowerCase();
    if (hay.includes(query)) hits.push(k);
  });
  return hits;
}

/** One detail sheet. Rendered fourteen times on desktop (the crossfade
 *  stack) and once on phones (the active card). */
const TypeCard = memo(function TypeCard({
  card,
  index,
  interactive,
}: {
  card: TypeCardData;
  index: number;
  interactive: boolean;
}) {
  const rows = [
    {
      key: "specialists",
      title: "Specialists",
      body: "Your care begins with a conversation. Meet the consultants who may be involved in your diagnosis and treatment.",
      href: card.specialistsHref,
      icon: rowIcons.specialists,
      highlight: false,
    },
    {
      key: "next",
      title: "What may happen next",
      body: "Understand the typical steps from assessment through to treatment and follow-up. Your pathway is planned around you.",
      href: card.nextStepsHref,
      icon: rowIcons.next,
      highlight: true,
    },
    {
      key: "support",
      title: "Support & resources",
      body: "Practical support, trusted information and services to help you and those close to you.",
      href: card.supportHref,
      icon: rowIcons.support,
      highlight: false,
    },
  ];

  return (
    <article
      className="flex flex-col overflow-hidden rounded-[2rem] border border-ink/10 lg:max-h-[calc(100svh-9rem)] lg:rounded-[2.5rem]"
      style={{ backgroundColor: SHEET, "--sheet": SHEET } as React.CSSProperties}
      aria-hidden={interactive ? undefined : true}
    >
      {/* ── Head: numeral, title, blurb | consultant team ── */}
      <div className="flex flex-col gap-6 px-7 pt-7 md:px-9 md:pt-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <p className="label-tight tabular-nums" style={{ color: GOLD_TEXT }}>
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink md:text-[2.6rem]">
            {card.title}
          </h2>
          <div
            aria-hidden
            className="mt-3 h-[3px] w-12 rounded-full"
            style={{ backgroundColor: GOLD_SOFT }}
          />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            {card.blurb}
          </p>
          {card.entries && (
            <div className="mt-4 flex flex-wrap gap-2">
              {card.entries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={`/specialities/${entry.slug}`}
                  tabIndex={interactive ? undefined : -1}
                  className="rounded-full border border-ink/15 bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-ink/80 transition-colors focus-visible:border-ink/45 focus-visible:text-ink lg:hover:border-ink/40 lg:hover:text-ink"
                >
                  {entry.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Consultant team
          </p>
          <div className="mt-3 flex gap-4">
            {card.consultants.map((c) => (
              <div key={c.slug} className="w-[76px]">
                <span className="relative block h-[76px] w-[76px] overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 to-lilac/20">
                  {c.photo ? (
                    // object-top: the portraits are head-and-shoulders
                    // frames; a centred square crop cuts foreheads off.
                    <Image
                      src={c.photo}
                      alt=""
                      fill
                      sizes="76px"
                      className="object-cover object-top"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-lg text-accent">
                      {initials(c.name)}
                    </span>
                  )}
                </span>
                <p className="mt-1.5 text-[12px] font-medium leading-tight text-ink">
                  {c.name}
                </p>
                {c.shortRole && (
                  <p className="mt-0.5 text-[11px] leading-tight text-ink-muted">
                    {c.shortRole}
                  </p>
                )}
              </div>
            ))}
          </div>
          {card.extraConsultants > 0 && (
            <Link
              href={card.specialistsHref}
              tabIndex={interactive ? undefined : -1}
              className="mt-2 inline-block text-[12px] font-medium text-accent underline-offset-2 focus-visible:underline lg:hover:underline"
            >
              +{card.extraConsultants} more
            </Link>
          )}
        </div>
      </div>

      {/* ── The three destinations on their connector. The rows region is
             the ONLY part allowed to squeeze: on short viewports it scrolls
             quietly (the wheel stepper hands gestures over while it can
             scroll), and the CTA below it is always visible. ── */}
      <div className="mt-7 flex min-h-0 flex-1 flex-col border-t border-ink/10">
        <div
          data-card-scroll
          data-lenis-prevent
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 pb-2 pt-6 md:px-9"
        >
          <svg
            aria-hidden
            preserveAspectRatio="none"
            viewBox="0 0 12 100"
            className="absolute bottom-4 left-[39px] top-10 w-3 overflow-visible text-ink/15 md:left-[47px]"
          >
            <path d="M6 0 L6 100" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="relative space-y-1.5">
          {rows.map((row, i) => (
            <li key={row.key}>
              <Link
                href={row.href}
                tabIndex={interactive ? undefined : -1}
                className={`group flex items-center gap-4 rounded-2xl px-2.5 py-4 transition-colors md:gap-5 md:px-3 ${
                  row.highlight
                    ? "bg-[#e6edf3]/80"
                    : "lg:hover:bg-ink/[0.03]"
                } focus-visible:bg-ink/[0.04]`}
              >
                <span
                  className="relative z-10 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-[0_0_0_3px_var(--sheet,#fbfaf5)]"
                  style={{ backgroundColor: NODE_SAGE }}
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span
                  aria-hidden
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-ink/15 bg-white/70 text-ink-muted"
                >
                  {row.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold leading-snug text-ink md:text-xl">
                    {row.title}
                  </span>
                  <span className="mt-1 block max-w-md text-[13px] leading-relaxed text-ink-muted md:text-[14px]">
                    {row.body}
                  </span>
                </span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 flex-none text-ink-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden
                >
                  <path d="M5.5 3l5 5-5 5" />
                </svg>
              </Link>
            </li>
          ))}
          </ol>
        </div>

        {/* ── The sheet's action — always visible, outside the squeeze ── */}
        <div className="flex shrink-0 justify-center px-7 pb-5 pt-3">
          <Button href="/contact#consultation" variant="sage">
            Arrange a consultation
          </Button>
        </div>
      </div>
    </article>
  );
});

/** The type-ahead: matches as you type, Enter or click flies the picker
 *  to the type. A shortcut, never a filter — the list stays whole. */
function SearchBox({
  cards,
  onPick,
}: {
  cards: TypeCardData[];
  onPick: (k: number) => void;
}) {
  const [q, setQ] = useState("");
  const hits = matchTypes(cards, q);
  const open = q.trim().length > 0;

  const commit = (k: number) => {
    setQ("");
    onPick(k);
  };

  return (
    // The search is the page's fast path — it reads as the primary
    // control, not an afterthought: full-width in its column, solid white,
    // and the focus state answers in the instrument's gold.
    <div className="relative mt-5 w-full max-w-[340px]">
      <div className="flex items-center gap-2.5 rounded-full border border-ink/20 bg-white px-4 py-3 shadow-[0_6px_24px_-14px_rgba(6,28,70,0.25)] transition-colors focus-within:border-[#c8992f]">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-4 w-4 flex-none text-ink-muted" aria-hidden>
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3 3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits.length) commit(hits[0]);
            if (e.key === "Escape") setQ("");
          }}
          placeholder="Search your cancer type…"
          aria-label="Search your cancer type"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-muted/70"
        />
      </div>
      {open && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_24px_60px_-24px_rgba(6,28,70,0.35)]">
          {hits.slice(0, 5).map((k) => (
            <li key={cards[k].id}>
              <button
                type="button"
                onClick={() => commit(k)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06]"
              >
                {cards[k].title}
                <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  Go
                </span>
              </button>
            </li>
          ))}
          {hits.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-ink-muted">
              No match — try the A to Z below.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function MiniGrid({
  cards,
  onPick,
}: {
  cards: TypeCardData[];
  onPick: (k: number) => void;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, k) => (
        <li key={card.id}>
          <button
            type="button"
            onClick={() => onPick(k)}
            className="group flex h-full w-full flex-col rounded-2xl border border-ink/10 bg-white/70 p-5 text-left transition-colors focus-visible:border-ink/45 lg:hover:border-ink/30"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-display text-xl font-semibold leading-snug text-ink">
                {card.title}
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 flex-none text-ink-muted transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden>
                <path d="M5.5 3l5 5-5 5" />
              </svg>
            </span>
            <span className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              {card.blurb}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TypesOverlay({
  cards,
  onPick,
  onClose,
}: {
  cards: TypeCardData[];
  onPick: (k: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="All cancer types"
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#f7f5f1]/98 backdrop-blur-sm"
      data-lenis-prevent
    >
      <div className="container-wide py-16 md:py-20">
        <div className="flex items-start justify-between gap-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            All cancer types
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors focus-visible:border-ink/60 lg:hover:border-ink/45"
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden>
              <path d="M2 2l10 10M12 2 2 12" />
            </svg>
          </button>
        </div>
        <div className="mt-8">
          <MiniGrid cards={cards} onPick={onPick} />
        </div>
      </div>
    </div>
  );
}

export default function TypesJourney({ cards }: { cards: TypeCardData[] }) {
  const N = cards.length;
  const LAST = N - 1;
  const reduced = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wordRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Per-word ceiling on the active scale, measured against the live column
  // width — the fit guarantee that length-based size tiers cannot give.
  const maxScaleRef = useRef<number[]>([]);
  const vpRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  const rawP = useMotionValue(0);
  const sprungP = useSpring(rawP, { stiffness: 110, damping: 26, mass: 0.6 });
  const steppedP = useTransform(rawP, (v) => Math.round(v));
  const progress = reduced ? steppedP : sprungP;

  // React state only where React is needed: the rounded active index (rail
  // dots, aria) and the phone layout's selection. The refs mirror them for
  // the breakpoint-crossing handler, whose closures would otherwise be
  // stale — crossing lg must carry the reader's chosen type across.
  const [active, setActive] = useState(0);
  const [phoneActive, setPhoneActive] = useState(0);
  const activeRef = useRef(0);
  const phoneActiveRef = useRef(0);

  const [overlayOpen, setOverlayOpen] = useState(false);
  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches;
  const pick = (k: number) => {
    if (isDesktop()) jumpTo(k);
    else {
      phoneActiveRef.current = k;
      setPhoneActive(k);
    }
  };
  const pickFromOverlay = (k: number) => {
    setOverlayOpen(false);
    setTimeout(() => pick(k), 60);
  };
  const stripRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** Jump straight to a lock — dots, arrows and neighbour words all use it. */
  const jumpTo = (k: number) => {
    const el = trackRef.current;
    if (!el) return;
    const trackTop = el.getBoundingClientRect().top + window.scrollY;
    const target = trackTop + k * window.innerHeight * GAP_FACTOR;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 0.9 });
    else window.scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
  };

  // ── The desktop stage machinery ─────────────────────────────────────────
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    let teardown: (() => void) | undefined;

    const setup = () => {
      if (!mql.matches || !trackRef.current) return;

      const el = trackRef.current;
      let trackTop = 0;
      let gapPx = window.innerHeight * GAP_FACTOR;
      let vpH = 0; // list viewport height
      let maxT = 0; // furthest the list window can slide
      const stageEnd = () => trackTop + LAST * gapPx;
      const measure = () => {
        trackTop = el.getBoundingClientRect().top + window.scrollY;
        gapPx = window.innerHeight * GAP_FACTOR;
        vpH = vpRef.current?.clientHeight ?? 0;
        maxT = Math.max(0, N * ROW - vpH);
      };
      measure();

      // The fit guarantee: measure each label's natural width (offsetWidth
      // ignores the scale transform) against the list column, and cap that
      // word's ACTIVE scale so its right edge can never cross the column
      // and vanish under the sheet — at any viewport width. Short labels
      // still reach the full 1.75; long ones grow exactly as far as the
      // column allows.
      const measureWords = () => {
        const ul = listRef.current;
        if (!ul || ul.clientWidth === 0) return;
        const avail = ul.clientWidth - 6;
        for (let k = 0; k < N; k++) {
          const w = wordRefs.current[k];
          if (!w || w.offsetWidth === 0) continue;
          maxScaleRef.current[k] = Math.max(
            0.6,
            Math.min(1.75, avail / w.offsetWidth)
          );
        }
      };
      measureWords();

      const onScroll = () => {
        rawP.set(
          Math.min(Math.max((window.scrollY - trackTop) / gapPx, 0), LAST)
        );
      };
      onScroll();
      // A mid-track reload restores scroll AFTER mount; without a jump the
      // spring glides from 0 and replays the whole journey on arrival.
      sprungP.jump(rawP.get());
      window.addEventListener("scroll", onScroll, { passive: true });

      // Mandatory snap so touch flicks and scrollbar drags still land on a
      // lock; guarded at BOTH ends so it never drags the reader back in.
      const lenis = getLenis();
      let snap: Snap | undefined;
      const inStage = () =>
        window.scrollY > trackTop - window.innerHeight * 0.4 &&
        window.scrollY < stageEnd() + window.innerHeight * 0.4;
      const guard = () => {
        if (!snap) return;
        if (inStage()) snap.start();
        else snap.stop();
      };
      const buildSnap = () => {
        snap?.destroy();
        if (!lenis) return;
        snap = new Snap(lenis, {
          type: "mandatory",
          duration: 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          debounce: 320,
        });
        for (let k = 0; k <= LAST; k++) snap.add(trackTop + k * gapPx);
        guard();
      };
      buildSnap();
      window.addEventListener("scroll", guard, { passive: true });

      // Browsing is CONTINUOUS: no wheel capture, no one-gesture-one-lock.
      // Scrolling scrubs straight through the list — the spring glides the
      // words and cards through each other — and the mandatory snap above
      // settles the stage onto the nearest type once the gesture ends.
      // (The stepper made 14 types feel like 14 speed bumps when someone
      // just wanted to look through them; search and the rail remain the
      // fast paths.) Keyboard still steps one type at a time below.
      const currentLock = () => Math.round(rawP.get());
      let stepping = false;
      let backstop: ReturnType<typeof setTimeout> | undefined;
      const step = (dir: 1 | -1) => {
        const next = Math.min(Math.max(currentLock() + dir, 0), LAST);
        stepping = true;
        clearTimeout(backstop);
        backstop = setTimeout(() => (stepping = false), 1700);
        const arrive = () => {
          stepping = false;
          clearTimeout(backstop);
        };
        if (lenis) {
          lenis.scrollTo(trackTop + next * gapPx, {
            duration: FLIGHT_S,
            onComplete: arrive,
          });
        } else {
          window.scrollTo({ top: trackTop + next * gapPx });
          arrive();
        }
      };

      const onKey = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement | null;
        // Never steal keys from form fields — and never steal Space/arrows
        // from the stage's own 30 buttons (dots, words, rail arrows), whose
        // activation key IS Space. Enter still works on them regardless.
        if (
          t &&
          (t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.tagName === "BUTTON" ||
            t.tagName === "A" ||
            t.tagName === "SELECT" ||
            t.isContentEditable)
        )
          return;
        if (!inStage()) return;
        const down =
          e.key === "PageDown" ||
          e.key === "ArrowDown" ||
          (e.key === " " && !e.shiftKey);
        const up =
          e.key === "PageUp" ||
          e.key === "ArrowUp" ||
          (e.key === " " && e.shiftKey);
        if (!down && !up) return;
        if (down && currentLock() >= LAST) return;
        if (up && currentLock() <= 0) return;
        e.preventDefault();
        if (stepping) return;
        step(down ? 1 : -1);
      };
      window.addEventListener("keydown", onKey);

      const onResize = () => {
        measure();
        measureWords();
        buildSnap();
        onScroll();
        // The viewport height feeds the window clamp — re-write the frame
        // even when the scroll-derived p happens not to change.
        write(rawP.get());
      };
      window.addEventListener("resize", onResize);

      // Every frame is a pure function of p, written straight to refs.
      let lastIndex = -1;
      const write = (p: number) => {
        // The window clamps at both ends like a real list: the active row
        // is centred only while there are rows to fill both sides of it.
        // On landing the list hugs the viewport's top — no hole above
        // Breast — and at the far end it hugs the bottom. The gold marker
        // and the edge fades track the active row instead of sitting at a
        // fixed centre.
        const T = Math.min(Math.max(p * ROW - (vpH / 2 - ROW / 2), 0), maxT);
        if (listRef.current) {
          listRef.current.style.transform = `translateY(${-T}px)`;
        }
        if (markerRef.current) {
          markerRef.current.style.transform = `translateY(${
            p * ROW - T + ROW / 2 - 5
          }px)`;
        }
        if (vpRef.current) {
          // Each fade earns its keep: it only reaches full depth once the
          // window has actually slid past rows on that side.
          const topPct = 22 - 20 * Math.max(0, 1 - T / 100);
          const botPct = 78 + 20 * Math.max(0, 1 - (maxT - T) / 100);
          const m = `linear-gradient(to bottom, transparent 0%, #000 ${topPct}%, #000 ${botPct}%, transparent 100%)`;
          vpRef.current.style.webkitMaskImage = m;
          vpRef.current.style.maskImage = m;
        }
        for (let k = 0; k < N; k++) {
          const w = wordRefs.current[k];
          if (w) {
            const d = Math.abs(k - p);
            w.style.color = wordColour(d);
            w.style.opacity = String(wordOpacity(d));
            w.style.transform = `scale(${Math.min(
              wordScale(d),
              maxScaleRef.current[k] ?? 1.75
            )})`;
          }
          const c = cardRefs.current[k];
          if (c) {
            const d = Math.abs(k - p);
            const o = Math.max(0, 1 - d / FADE);
            c.style.opacity = String(o);
            const hide = o < 0.02;
            // Never let a hiding card take keyboard focus down with it —
            // hand focus to the stage before the visibility flip.
            if (
              hide &&
              c.style.visibility !== "hidden" &&
              c.contains(document.activeElement)
            ) {
              stageRef.current?.focus();
            }
            c.style.visibility = hide ? "hidden" : "visible";
            c.style.transform = `translate(0, ${(k - p) * 24}px)`;
          }
        }
        const idx = Math.round(p);
        if (idx !== lastIndex) {
          lastIndex = idx;
          activeRef.current = idx;
          setActive(idx);
        }
      };
      write(rawP.get());
      const unsub = progress.on("change", write);

      // The display face swaps in after first paint and changes every
      // word's width — re-measure the caps once it lands and re-apply.
      let disposed = false;
      document.fonts?.ready.then(() => {
        if (disposed) return;
        measureWords();
        write(rawP.get());
      });

      teardown = () => {
        disposed = true;
        unsub();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scroll", guard);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onResize);
        snap?.destroy();
        clearTimeout(backstop);
      };
    };

    setup();
    const onChange = () => {
      teardown?.();
      teardown = undefined;
      if (mql.matches) {
        // Entering desktop: adopt the phone selection and land ON its lock
        // before the machinery measures, or the reader is dumped at
        // whatever the collapsed document's scroll clamped to.
        const k = phoneActiveRef.current;
        activeRef.current = k;
        setActive(k);
        const el = trackRef.current;
        if (el) {
          const top =
            el.getBoundingClientRect().top +
            window.scrollY +
            k * window.innerHeight * GAP_FACTOR;
          window.scrollTo({ top, behavior: "auto" });
        }
      } else {
        // Leaving desktop: the phone layout adopts the stage's selection.
        const k = activeRef.current;
        phoneActiveRef.current = k;
        setPhoneActive(k);
      }
      setup();
    };
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, N, LAST]);

  // Phone strip: keep the tapped chip in view.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = chipRefs.current[phoneActive];
    if (!strip || !chip) return;
    if (strip.scrollWidth <= strip.clientWidth + 8) return;
    strip.scrollTo({
      left: chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2,
      behavior: "smooth",
    });
  }, [phoneActive]);

  return (
    <>
      {/* ════ Desktop: the scroll-stepped stage ════ */}
      {/* Track = LAST gaps of travel PLUS the stage's own height — the +1
          viewport must not be scaled by the gap factor, or the pin ends
          before the final lock and the stage drags off-screen. */}
      <div
        ref={trackRef}
        style={{ height: `calc(${LAST * GAP_FACTOR * 100}vh + 100svh)` }}
        className="relative hidden lg:block"
      >
        <div
          ref={stageRef}
          tabIndex={-1}
          className="sticky top-0 h-[100svh] outline-none"
        >
          {/* announce sheet changes that happen under a scrub */}
          <div aria-live="polite" className="sr-only">
            {cards[active].title}
          </div>
          {/* Both columns hang from ONE top line (the pt-28 edge — enough
              air under the nav pill): the sheet's top border and the title
              sit level, whatever height the active card happens to be —
              centre-anchoring made the panel's start drift card by card. */}
          <div className="container-wide grid h-full grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-10 pb-8 pt-28 [grid-template-rows:100%] xl:gap-14">
            {/* ── Left: heading, rail, the giant list ── */}
            <div className="flex h-full max-h-[760px] flex-col">
              <div>
                <h1 className="font-display text-[clamp(2.6rem,3.3vw,3.7rem)] font-semibold leading-[1.05] tracking-tight text-ink">
                  Start with
                  <br />
                  what you know.
                </h1>
                <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-ink-muted">
                  Search for the type you have been given, or scroll
                  through the list.
                </p>
                <div
                  aria-hidden
                  className="mt-4 h-[3px] w-10 rounded-full"
                  style={{ backgroundColor: GOLD_SOFT }}
                />
                <SearchBox cards={cards} onPick={pick} />
                <button
                  type="button"
                  onClick={() => setOverlayOpen(true)}
                  className="mt-3 text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors focus-visible:underline lg:hover:text-ink"
                >
                  View all types
                </button>
              </div>

              <div className="mt-6 flex min-h-0 flex-1 items-center gap-7">
                {/* the rail: arrows and one dot per type, all controls */}
                <div className="flex h-[min(380px,42svh)] flex-col items-center">
                  <button
                    type="button"
                    aria-label="Previous cancer type"
                    onClick={() => jumpTo(Math.max(0, active - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink-muted transition-colors hover:border-ink/45 hover:text-ink focus-visible:border-ink/60 focus-visible:text-ink"
                  >
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                      <path d="M2.5 7.5 6 4l3.5 3.5" />
                    </svg>
                  </button>
                  <div className="relative my-2 w-px flex-1 bg-ink/15">
                    <div className="absolute inset-x-0 top-0 flex h-full flex-col items-center justify-between py-1">
                      {cards.map((card, k) => (
                        <button
                          key={card.id}
                          type="button"
                          aria-label={`Go to ${card.title}`}
                          aria-current={active === k ? "true" : undefined}
                          onClick={() => jumpTo(k)}
                          className="relative flex h-3 w-3 items-center justify-center rounded-full after:absolute after:-inset-1.5 after:content-[''] focus-visible:shadow-[0_0_0_2px_#c8992f]"
                        >
                          <span
                            className="block rounded-full transition-all duration-300"
                            style={{
                              width: active === k ? 8 : 5,
                              height: active === k ? 8 : 5,
                              backgroundColor: active === k ? GOLD : NODE_SAGE,
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Next cancer type"
                    onClick={() => jumpTo(Math.min(LAST, active + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink-muted transition-colors hover:border-ink/45 hover:text-ink focus-visible:border-ink/60 focus-visible:text-ink"
                  >
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                      <path d="M2.5 4.5 6 8l3.5-3.5" />
                    </svg>
                  </button>
                </div>

                {/* the list viewport: five-ish rows, edges dissolved. The
                    mask, marker and window position are all written per
                    frame — these inline values are the exact p = 0 frame
                    (window at its top clamp, marker on row one). */}
                <div
                  ref={vpRef}
                  className="relative h-[min(380px,42svh)] min-w-0 flex-1"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, #000 2%, #000 78%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, #000 2%, #000 78%, transparent 100%)",
                  }}
                >
                  {/* the gold marker rides the active row */}
                  <span
                    ref={markerRef}
                    aria-hidden
                    className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: GOLD_SOFT,
                      transform: `translateY(${ROW / 2 - 5}px)`,
                    }}
                  />
                  <ul
                    ref={listRef}
                    aria-label="Cancer types"
                    className="absolute left-7 right-0 top-0 will-change-transform"
                    style={{ transform: "translateY(0px)" }}
                  >
                    {cards.map((card, k) => (
                      <li key={card.id} style={{ height: ROW }} className="flex items-center">
                        <button
                          type="button"
                          aria-current={active === k ? "true" : undefined}
                          // Roving tabindex: only the active word is in the
                          // tab order (the rest are dim and off-centre);
                          // arrows move the selection and carry focus along.
                          tabIndex={active === k ? 0 : -1}
                          onKeyDown={(e) => {
                            const dir =
                              e.key === "ArrowDown"
                                ? 1
                                : e.key === "ArrowUp"
                                  ? -1
                                  : 0;
                            if (!dir) return;
                            e.preventDefault();
                            const next = Math.min(
                              Math.max(k + dir, 0),
                              cards.length - 1
                            );
                            jumpTo(next);
                            wordRefs.current[next]?.focus({
                              preventScroll: true,
                            });
                          }}
                          ref={(el) => {
                            wordRefs.current[k] = el;
                          }}
                          onClick={() => jumpTo(k)}
                          className={`origin-left whitespace-nowrap font-display font-semibold leading-none tracking-[-0.045em] transition-none focus-visible:underline focus-visible:underline-offset-8 ${
                            // Long labels at the 1.75x active scale overflow
                            // the column and vanish under the sheet — the
                            // base steps down with length ("Cancer of
                            // Unknown Primary" measured 569px in a 500px
                            // viewport at the middle tier).
                            card.label.length > 20
                              ? "text-[1.25rem] xl:text-[1.4rem]"
                              : card.label.length > 12
                                ? "text-[1.6rem] xl:text-[1.75rem]"
                                : "text-[2.1rem] xl:text-[2.3rem]"
                          }`}
                          style={{
                            color: wordColour(k),
                            opacity: wordOpacity(k),
                            transform: `scale(${wordScale(k)})`,
                          }}
                        >
                          {card.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ── Right: the crossfaded sheet stack. Cards hang from the
                   shared top line and are height-capped so the sheet hugs
                   its content and NEVER clips its own CTA. ── */}
            <div className="relative h-full">
              {cards.map((card, k) => (
                <div
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[k] = el;
                  }}
                  className="absolute inset-x-0 top-0"
                  style={{
                    opacity: k === 0 ? 1 : 0,
                    visibility: k === 0 ? "visible" : "hidden",
                    transform: `translate(0, ${k === 0 ? 0 : 24}px)`,
                  }}
                >
                  <TypeCard card={card} index={k} interactive={active === k} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════ Phones and tablets: snap strip over one swapping card ════ */}
      <div className="lg:hidden">
        <div className="container-wide pt-24">
          <h1 className="font-display text-[clamp(2.1rem,7vw,2.6rem)] font-semibold leading-[1.05] tracking-tight text-ink">
            Start with what you know.
          </h1>
          <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-ink-muted">
            Search for the type you have been given, or swipe through the
            list.
          </p>
          <div
            aria-hidden
            className="mt-4 h-[3px] w-10 rounded-full"
            style={{ backgroundColor: GOLD_SOFT }}
          />
          <SearchBox cards={cards} onPick={pick} />
          <button
            type="button"
            onClick={() => setOverlayOpen(true)}
            className="mt-3 text-[13px] font-medium text-ink-muted underline-offset-4 focus-visible:underline"
          >
            View all types
          </button>
        </div>

        <div className="container-wide mt-7 min-w-0">
          <div
            ref={stripRef}
            data-lenis-prevent-horizontal
            aria-label="Cancer types"
            className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-6 overflow-x-auto overscroll-x-contain px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((card, k) => (
              <button
                key={card.id}
                type="button"
                aria-current={phoneActive === k ? "true" : undefined}
                ref={(el) => {
                  chipRefs.current[k] = el;
                }}
                onClick={() => {
                  phoneActiveRef.current = k;
                  setPhoneActive(k);
                }}
                className={`shrink-0 snap-start whitespace-nowrap font-display text-[1.7rem] font-semibold leading-none tracking-[-0.04em] transition-colors ${
                  phoneActive === k ? "text-ink" : "text-[#5c7767]"
                } focus-visible:underline focus-visible:underline-offset-8`}
              >
                <span className="flex items-center gap-2.5">
                  {phoneActive === k && (
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: GOLD_SOFT }}
                    />
                  )}
                  {card.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 pb-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={cards[phoneActive].id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <TypeCard
                  card={cards[phoneActive]}
                  index={phoneActive}
                  interactive
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {overlayOpen && (
        <TypesOverlay
          cards={cards}
          onPick={pickFromOverlay}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </>
  );
}
