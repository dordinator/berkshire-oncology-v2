"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { protonReferral } from "@/content/treatmentLocations";

/*
  The treatments explorer: "Different treatments do different jobs."

  A click-to-swap instrument, deliberately NOT the scroll-stepped stage —
  Cancer Types owns that device, and treatments is a lookup task ("I have
  been told chemo"), not a journey. The page scrolls normally.

  The LANDING FRAME is designed, not accidental: on desktop the grid is a
  full-viewport scene — the sheet runs the full right-hand column top to
  bottom (its own spare space opens between the overview and the callout,
  so it never ends as a stub mid-screen), the title heads the left column
  and the proton block anchors its foot to the sheet's bottom line.

  The CLICK MOMENT is choreographed: the picked row nudges toward the
  sheet, the gold wire redraws, and the sheet rebuilds in sequence —
  title, summary, then the overview rows cascading in, with "What it is"
  already open. Nothing blinks wholesale.

  Phones get the cancer-types device: a snap strip of treatment names over
  the live sheet, content on screen from the first swipe. No wires, no
  scroll capture, ever.

  Deep links: /treatments#radiotherapy preselects; selection writes the
  hash back with replaceState so a shared URL lands on the same panel.
*/

export interface ExplorerConsultant {
  slug: string;
  name: string;
  shortRole?: string;
  photo?: string;
}

export interface ExplorerLocation {
  slug: string;
  name: string;
  area: string;
  note: string;
}

export interface TreatmentItemData {
  slug: string;
  title: string;
  summary: string;
  group: "drug" | "radiotherapy";
  href: string;
  what: string[];
  whenConsidered: string[];
  expect: { title: string; body: string }[];
  consultants: ExplorerConsultant[];
  locations: ExplorerLocation[];
  /** External, respected sources (CRUK / NHS / Macmillan) — where all
   *  "read more" affordances point. The practice's site orientates and
   *  routes to consultation; the medical depth belongs to charities and
   *  the NHS, whose pages are clinically reviewed. */
  sources: { label: string; url: string }[];
}

const SHEET = "#fbfaf5";
const GOLD = "#c8992f";
const GOLD_SOFT = "#e3bd6a";
const CALLOUT = "#e9eff7";
const EASE = [0.22, 1, 0.36, 1] as const;

/** Shown when a therapy has no officially-stated locations. */
const LOCATION_FALLBACK =
  "Where your treatment would be delivered depends on what is planned for you. The partnership practises across five hospitals in Reading, Windsor and Oxford — your consultant will confirm the arrangements at consultation.";

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Miss|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Stroke vocabulary ── */
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const rowIcons: Record<string, JSX.Element> = {
  what: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.8.3-1 .9-1 1.8M12 16.6v.1" />
    </svg>
  ),
  when: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </svg>
  ),
  expect: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  consultants: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.8 18.6a5.4 5.4 0 0 1 10.4 0M15.5 9.4a2.6 2.6 0 1 0 .01-5.2M15.8 13.2a4.8 4.8 0 0 1 4.6 5.1" />
    </svg>
  ),
  locations: (
    <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
      <path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  ),
};

/* The stagger vocabulary for the sheet's entrance. */
const riseVar = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** "Cancer Research UK — Chemotherapy" → "Cancer Research UK". */
function sourceOrg(label: string) {
  return label.split(" — ")[0];
}

/* The depth lives with the charities and the NHS, not on this site: every
   "read more" affordance is an external, clinically-reviewed page. */
function SourceLink({ source }: { source: { label: string; url: string } }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.label}
      className="inline-flex items-center gap-1.5 text-[14px] font-medium text-accent focus-visible:underline lg:hover:underline"
    >
      {sourceOrg(source.label)}
      <svg viewBox="0 0 16 16" {...stroke} className="h-3 w-3" aria-hidden>
        <path d="M4 12 12 4M6 4h6v6" />
      </svg>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function SourcesRow({
  sources,
}: {
  sources: { label: string; url: string }[];
}) {
  if (sources.length === 0) return null;
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-ink-muted">
      Read more from trusted sources:
      {sources.map((s) => (
        <SourceLink key={s.url} source={s} />
      ))}
    </p>
  );
}

/* ── One accordion row ── */
function AccordionRow({
  id,
  icon,
  title,
  open,
  onToggle,
  preview,
  children,
}: {
  id: string;
  icon: JSX.Element;
  title: string;
  open: boolean;
  onToggle: () => void;
  preview?: React.ReactNode;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="border-t border-ink/10 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors focus-visible:bg-ink/[0.04] md:px-6 lg:hover:bg-ink/[0.025]"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-ink/12 bg-white/70 text-ink-muted"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 font-display text-[1.08rem] font-semibold leading-snug text-ink md:text-[1.18rem]">
          {title}
        </span>
        {!open && preview}
        <svg
          viewBox="0 0 16 16"
          {...stroke}
          className={`h-4 w-4 flex-none text-ink-muted transition-transform duration-300 motion-reduce:transition-none ${
            open ? "-rotate-180" : ""
          }`}
          aria-hidden
        >
          <path d="M3 5.5l5 5 5-5" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pl-[4.4rem] pr-6 md:px-6 md:pl-[4.75rem]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── The sheet for one treatment ── */
function TreatmentPanel({
  item,
  onProton,
  fillFrame,
}: {
  item: TreatmentItemData;
  onProton: () => void;
  /** Desktop: stretch to the full column height; phone: hug content. */
  fillFrame: boolean;
}) {
  const reduce = useReducedMotion();
  // One row open at a time; every swap re-opens "What it is". Keyed by the
  // parent on item.slug, so this state resets naturally per treatment.
  const [open, setOpen] = useState(0);
  const toggle = (k: number) => setOpen((o) => (o === k ? -1 : k));

  const previewFaces = item.consultants.slice(0, 3);

  const rows: {
    key: string;
    icon: JSX.Element;
    title: string;
    preview?: React.ReactNode;
    body: React.ReactNode;
  }[] = [
    {
      key: "what",
      icon: rowIcons.what,
      title: "What it is",
      // The lead paragraph orientates; the clinically-reviewed depth lives
      // with CRUK / the NHS / Macmillan. Short enough that the rows below
      // always stay on show.
      body: (
        <>
          <p className="max-w-[58ch] text-[15.5px] leading-[1.75] text-ink/85">
            {item.what[0]}
          </p>
          <SourcesRow sources={item.sources} />
        </>
      ),
    },
    {
      key: "when",
      icon: rowIcons.when,
      title: "When it may be considered",
      // Deliberately general copy, shown whole — truncating it left the
      // row saying nothing.
      body: (
        <div className="max-w-[58ch] space-y-3.5 text-[15.5px] leading-[1.75] text-ink/85">
          {item.whenConsidered.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      ),
    },
    {
      key: "expect",
      icon: rowIcons.expect,
      title: "Preparing and what to expect",
      body: (
        <ol className="max-w-[60ch] space-y-4">
          {item.expect.map((stage, i) => (
            <li key={stage.title} className="flex gap-3.5">
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#5c7767] text-[10px] font-semibold text-white"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-ink">
                  {stage.title}
                </p>
                <p className="mt-0.5 text-[14.5px] leading-[1.65] text-ink-muted">
                  {stage.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ),
    },
    {
      key: "consultants",
      icon: rowIcons.consultants,
      title: "Consultants who provide it",
      preview:
        previewFaces.length > 0 ? (
          <span aria-hidden className="mr-1 hidden -space-x-2 sm:flex">
            {previewFaces.map((c) => (
              <span
                key={c.slug}
                className="relative block h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-accent/10 to-accent-glow/20"
              >
                {c.photo ? (
                  <Image
                    src={c.photo}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover object-top"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[9px] font-semibold text-accent">
                    {initials(c.name)}
                  </span>
                )}
              </span>
            ))}
          </span>
        ) : undefined,
      body:
        item.consultants.length > 0 ? (
          <>
          <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {item.consultants.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/consultants/${c.slug}`}
                  className="group/consultant flex items-center gap-3 rounded-xl focus-visible:bg-ink/[0.04]"
                >
                  <span className="relative block h-11 w-11 flex-none overflow-hidden rounded-full bg-gradient-to-br from-accent/10 to-accent-glow/20">
                    {c.photo ? (
                      <Image
                        src={c.photo}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[11px] font-semibold text-accent">
                        {initials(c.name)}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-ink group-hover/consultant:underline">
                      {c.name}
                    </span>
                    {c.shortRole && (
                      <span className="block text-[12.5px] text-ink-muted">
                        {c.shortRole}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          </>
        ) : (
          <p className="text-[15px] leading-relaxed text-ink-muted">
            Ask at consultation — the right consultant depends on your
            diagnosis.
          </p>
        ),
    },
    {
      key: "locations",
      icon: rowIcons.locations,
      title: "Locations and practical information",
      preview:
        item.locations.length > 0 ? (
          <span
            aria-hidden
            className="mr-1 hidden text-[13px] text-ink-muted md:block"
          >
            {Array.from(new Set(item.locations.map((l) => l.area))).join(
              "  ·  "
            )}
          </span>
        ) : undefined,
      body:
        item.locations.length > 0 ? (
          <>
            <ul className="max-w-[60ch] space-y-3">
              {item.locations.map((l) => (
                <li
                  key={l.slug}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-[14.5px] font-medium text-ink">
                    {l.name}
                    <span className="ml-1.5 text-[13px] font-normal text-ink-muted">
                      {l.area}
                    </span>
                  </span>
                  <span className="text-right text-[13px] text-ink-muted">
                    {l.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[58ch] text-[13px] leading-relaxed text-ink-muted">
              Which location is right for you depends on what is planned —
              your consultant will confirm the arrangements.{" "}
              <Link
                href="/locations"
                className="font-medium text-accent focus-visible:underline lg:hover:underline"
              >
                About our locations
              </Link>
            </p>
          </>
        ) : (
          <p className="max-w-[58ch] text-[15px] leading-[1.7] text-ink-muted">
            {LOCATION_FALLBACK}{" "}
            <Link
              href="/locations"
              className="font-medium text-accent focus-visible:underline lg:hover:underline"
            >
              About our locations
            </Link>
          </p>
        ),
    },
  ];

  return (
    // The sheet fills its column on desktop (fillFrame): spare space opens
    // BETWEEN the overview and the callout block, so a short treatment
    // still composes a full frame instead of ending as a stub.
    <motion.article
      variants={
        reduce
          ? undefined
          : {
              hidden: {},
              show: {
                transition: { staggerChildren: 0.055, delayChildren: 0.04 },
              },
            }
      }
      initial={reduce ? false : "hidden"}
      animate="show"
      className={`overflow-hidden rounded-[1.75rem] border border-ink/10 ${
        fillFrame ? "flex h-full flex-col" : ""
      }`}
      style={{ backgroundColor: SHEET }}
    >
      <motion.div
        variants={reduce ? undefined : riseVar}
        className="shrink-0 px-6 pb-4 pt-6 md:px-8"
      >
        <h2 className="font-display text-[1.8rem] font-semibold leading-tight tracking-tight text-ink md:text-[2.1rem]">
          {item.title}
        </h2>
        <p className="mt-2 max-w-xl text-[15.5px] leading-relaxed text-ink-muted">
          {item.summary}
        </p>
        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Treatment overview
        </p>
      </motion.div>

      <div
        data-lenis-prevent
        className={
          fillFrame
            ? "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
            : ""
        }
      >
        <div className="mx-4 rounded-2xl border border-ink/10 bg-white/60 md:mx-6">
          {rows.map((row, k) => (
            <motion.div key={row.key} variants={reduce ? undefined : riseVar}>
              <AccordionRow
                id={`${item.slug}-${row.key}`}
                icon={row.icon}
                title={row.title}
                open={open === k}
                onToggle={() => toggle(k)}
                preview={row.preview}
              >
                {row.body}
              </AccordionRow>
            </motion.div>
          ))}
        </div>

        {/* mt-auto: on tall frames the spare space opens here, keeping the
            callout + closing line seated at the sheet's foot. */}
        <div className={fillFrame ? "mt-auto" : ""}>
          {item.group === "radiotherapy" && (
            <motion.div
              variants={reduce ? undefined : riseVar}
              className="mx-4 mt-4 rounded-2xl px-5 py-4 md:mx-6 md:px-6"
              style={{ backgroundColor: CALLOUT }}
            >
              <div className="flex gap-4">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink text-white"
                >
                  <svg viewBox="0 0 16 16" {...stroke} className="h-3.5 w-3.5" aria-hidden>
                    <path d="M14 2 7.5 8.5M14 2 9.8 14l-2.3-5.5L2 6.2 14 2Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-ink">
                    Looking for proton beam therapy?
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink/75">
                    Some treatments are delivered through national specialist
                    centres. Your consultant can explain whether a specialist
                    referral may be relevant.
                  </p>
                  <button
                    type="button"
                    onClick={onProton}
                    className="mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent focus-visible:underline lg:hover:underline"
                  >
                    Understand specialist referrals
                    <svg viewBox="0 0 16 16" {...stroke} className="h-3 w-3" aria-hidden>
                      <path d="M3 8h10M9.5 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.p
            variants={reduce ? undefined : riseVar}
            className="flex items-center gap-2 px-6 pb-4 pt-3.5 text-[13px] text-ink-muted md:px-8"
          >
            <svg viewBox="0 0 16 16" {...stroke} className="h-3.5 w-3.5 flex-none" aria-hidden>
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 7.2v3.6M8 5v.1" />
            </svg>
            Treatments are not a fixed sequence.
          </motion.p>
        </div>
      </div>

      {/* ── the navy action bar — outside the squeeze, always in frame ── */}
      <motion.div
        variants={reduce ? undefined : riseVar}
        className="grid shrink-0 grid-cols-1 divide-y divide-white/15 bg-ink sm:grid-cols-2 sm:divide-x sm:divide-y-0"
      >
        {/* The reading CTA leaves the site on purpose: clinically-reviewed
            depth belongs to the charities and the NHS, not to a page
            nobody at the practice has verified. */}
        <a
          href={(item.sources[0] ?? { url: "/contact" }).url}
          target="_blank"
          rel="noopener noreferrer"
          title={item.sources[0]?.label}
          className="flex items-center justify-center gap-2.5 px-6 py-4 text-[14px] font-medium text-white transition-colors focus-visible:bg-white/10 lg:hover:bg-white/10"
        >
          <svg viewBox="0 0 20 16" {...stroke} className="h-3.5 w-4" aria-hidden>
            <path d="M10 3.5C8.6 2.2 6.7 1.8 4.5 1.8c-1.1 0-2.1.1-2.9.4v11.2c.8-.3 1.8-.4 2.9-.4 2.2 0 4.1.5 5.5 1.7 1.4-1.2 3.3-1.7 5.5-1.7 1.1 0 2.1.1 2.9.4V2.2c-.8-.3-1.8-.4-2.9-.4-2.2 0-4.1.4-5.5 1.7ZM10 3.5v11.2" />
          </svg>
          Read more at {sourceOrg(item.sources[0]?.label ?? "trusted sources")}
          <svg viewBox="0 0 16 16" {...stroke} className="h-3 w-3" aria-hidden>
            <path d="M4 12 12 4M6 4h6v6" />
          </svg>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <Link
          href="/contact#consultation"
          className="flex items-center justify-center gap-2.5 px-6 py-4 text-[14px] font-medium text-white transition-colors focus-visible:bg-white/10 lg:hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" {...stroke} className="h-4 w-4" aria-hidden>
            <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
            <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5M12 13.5l1.2 2.4 2.6.3-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.3 1.2-2.4Z" />
          </svg>
          Arrange a consultation
        </Link>
      </motion.div>
    </motion.article>
  );
}

/* ── The proton / national-referrals sheet ── */
function ProtonPanel({ fillFrame }: { fillFrame: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      variants={
        reduce
          ? undefined
          : {
              hidden: {},
              show: {
                transition: { staggerChildren: 0.07, delayChildren: 0.04 },
              },
            }
      }
      initial={reduce ? false : "hidden"}
      animate="show"
      className={`overflow-hidden rounded-[1.75rem] border border-ink/10 ${
        fillFrame ? "flex h-full flex-col" : ""
      }`}
      style={{ backgroundColor: SHEET }}
    >
      <div className={`px-6 pb-6 pt-6 md:px-8 md:pt-7 ${fillFrame ? "min-h-0 flex-1 overflow-y-auto" : ""}`} data-lenis-prevent>
        <motion.div variants={reduce ? undefined : riseVar}>
          <h2 className="font-display text-[1.8rem] font-semibold leading-tight tracking-tight text-ink md:text-[2.1rem]">
            {protonReferral.title}
          </h2>
          <p className="mt-2 max-w-xl text-[15.5px] leading-relaxed text-ink-muted">
            {protonReferral.summary}
          </p>
        </motion.div>
        <motion.div
          variants={reduce ? undefined : riseVar}
          className="mt-6 max-w-[60ch] space-y-3.5 text-[15.5px] leading-[1.75] text-ink/85"
        >
          {protonReferral.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </motion.div>
        <motion.p
          variants={reduce ? undefined : riseVar}
          className="mt-5 max-w-[60ch] border-t border-ink/10 pt-4 text-[13.5px] leading-relaxed text-ink-muted"
        >
          {protonReferral.note}
        </motion.p>
      </div>
      <motion.div variants={reduce ? undefined : riseVar} className="shrink-0 bg-ink">
        <Link
          href="/contact#consultation"
          className="flex items-center justify-center gap-2.5 px-6 py-4 text-[14px] font-medium text-white transition-colors focus-visible:bg-white/10 lg:hover:bg-white/10"
        >
          Arrange a consultation
          <svg viewBox="0 0 16 16" {...stroke} className="h-3.5 w-3.5" aria-hidden>
            <path d="M3 8h10M9.5 4l4 4-4 4" />
          </svg>
        </Link>
      </motion.div>
    </motion.article>
  );
}

/* ── The instrument ── */
export default function TreatmentsExplorer({
  items,
}: {
  items: TreatmentItemData[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>(items[0]?.slug ?? "");

  const rootRef = useRef<HTMLDivElement>(null);
  const panelColRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const stripRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());

  const drug = items.filter((i) => i.group === "drug");
  const radio = items.filter((i) => i.group === "radiotherapy");
  const activeItem = items.find((i) => i.slug === active);
  const isProton = active === protonReferral.id;

  const pick = useCallback((slug: string) => {
    setActive(slug);
    // Shareable state without a scroll jump.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${slug}`);
    }
  }, []);

  // Deep links: #radiotherapy preselects, on load and on hash change.
  useEffect(() => {
    const apply = () => {
      const slug = window.location.hash.slice(1);
      if (
        slug &&
        (slug === protonReferral.id || items.some((i) => i.slug === slug))
      ) {
        setActive(slug);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phone strip: keep the tapped chip in view.
  useEffect(() => {
    const strip = stripRef.current;
    const chip = chipRefs.current.get(active);
    if (!strip || !chip) return;
    if (strip.clientWidth === 0) return; // desktop — strip not rendered
    if (strip.scrollWidth <= strip.clientWidth + 8) return;
    strip.scrollTo({
      left: chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  // ── The wires. Measured, not guessed: each path runs from a row's right
  // edge to the sheet's entry point. Recomputed on resize and after each
  // swap settles (the picked row's nudge moves its edge). Purely
  // decorative (aria-hidden), desktop only. ──
  const [wires, setWires] = useState<{ slug: string; d: string }[] | null>(
    null
  );

  const measureWires = useCallback(() => {
    const root = rootRef.current;
    const panel = panelColRef.current;
    if (!root || !panel) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setWires(null);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const endX = panelRect.left - rootRect.left + 2;
    const endY = panelRect.top - rootRect.top + 88;
    const next: { slug: string; d: string }[] = [];
    rowRefs.current.forEach((el, slug) => {
      const r = el.getBoundingClientRect();
      const startX = r.right - rootRect.left + 14;
      const startY = r.top + r.height / 2 - rootRect.top;
      const spanX = endX - startX;
      if (spanX < 40) return;
      const d = `M ${startX} ${startY} C ${startX + spanX * 0.45} ${startY}, ${
        endX - spanX * 0.45
      } ${endY}, ${endX} ${endY}`;
      next.push({ slug, d });
    });
    setWires(next);
  }, []);

  useLayoutEffect(() => {
    measureWires();
    window.addEventListener("resize", measureWires);
    return () => window.removeEventListener("resize", measureWires);
  }, [measureWires]);

  // Re-measure once the nudge transition lands.
  useEffect(() => {
    const t = setTimeout(measureWires, 350);
    return () => clearTimeout(t);
  }, [active, measureWires]);

  const listGroups = [
    { title: "Drug treatments", rows: drug },
    { title: "Radiotherapy", rows: radio },
  ];

  const panel = isProton ? (
    <ProtonPanel fillFrame />
  ) : activeItem ? (
    <TreatmentPanel
      key={activeItem.slug}
      item={activeItem}
      onProton={() => pick(protonReferral.id)}
      fillFrame
    />
  ) : null;

  const phonePanel = isProton ? (
    <ProtonPanel fillFrame={false} />
  ) : activeItem ? (
    <TreatmentPanel
      key={activeItem.slug}
      item={activeItem}
      onProton={() => pick(protonReferral.id)}
      fillFrame={false}
    />
  ) : null;

  return (
    <div ref={rootRef} className="relative">
      {/* wires under everything, desktop only */}
      {wires && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        >
          {wires.map((w) => (
            <path
              key={w.slug}
              d={w.d}
              fill="none"
              stroke={w.slug === active ? GOLD : "#0a2540"}
              strokeWidth={w.slug === active ? 1.6 : 1}
              opacity={w.slug === active ? 0.9 : 0.12}
            />
          ))}
          {!reduce &&
            wires
              .filter((w) => w.slug === active)
              .map((w) => (
                <motion.path
                  key={`draw-${w.slug}`}
                  d={w.d}
                  fill="none"
                  stroke={GOLD_SOFT}
                  strokeWidth={2.5}
                  initial={{ pathLength: 0, opacity: 1 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{
                    pathLength: { duration: 0.7, ease: EASE },
                    opacity: { delay: 0.7, duration: 0.4 },
                  }}
                />
              ))}
        </svg>
      )}

      {/* ════ Desktop: the composed full-height frame ════ */}
      <div className="hidden lg:grid lg:h-[max(720px,calc(100svh-10.5rem))] lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:gap-14 xl:gap-20">
        {/* ── Left: title heading the column, list, proton at its foot ── */}
        <div className="flex h-full min-h-0 flex-col">
          <h1 className="font-display text-[clamp(2.2rem,2.8vw,3rem)] font-semibold leading-[1.08] tracking-tight text-ink">
            Different treatments do different jobs.
          </h1>
          <p className="mt-3 max-w-[42ch] text-[14.5px] leading-relaxed text-ink-muted">
            Start with the name you have been given. Your consultant will
            explain what applies to you.
          </p>
          <div aria-hidden className="mt-4 h-[3px] w-10 rounded-full bg-[#e3bd6a]" />

          <nav aria-label="Treatments" className="mt-9 flex min-h-0 flex-1 flex-col">
            {listGroups.map((groupBlock) => (
              <div key={groupBlock.title} className="mb-7">
                <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  {groupBlock.title}
                </p>
                <ul className="space-y-1">
                  {groupBlock.rows.map((item) => {
                    const current = active === item.slug;
                    return (
                      <li key={item.slug} id={item.slug} className="scroll-mt-28">
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) rowRefs.current.set(item.slug, el);
                            else rowRefs.current.delete(item.slug);
                          }}
                          aria-current={current ? "true" : undefined}
                          onClick={() => pick(item.slug)}
                          // The picked row steps toward the sheet — the
                          // selection reads in the list's geometry, not
                          // just its colour.
                          className="group flex items-center gap-3.5 py-1.5 text-left transition-transform duration-300 ease-out motion-reduce:transition-none"
                          style={{
                            transform: current
                              ? "translateX(12px)"
                              : "translateX(0px)",
                          }}
                        >
                          <span
                            aria-hidden
                            className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full"
                            style={
                              current
                                ? { border: `1.5px solid ${GOLD}`, padding: 2.5 }
                                : { padding: 4.5 }
                            }
                          >
                            <span
                              className="block h-full w-full rounded-full"
                              style={{
                                backgroundColor: current ? GOLD : "#9aa7b8",
                              }}
                            />
                          </span>
                          <span
                            className={`font-display text-[1.25rem] font-semibold leading-snug tracking-tight transition-colors md:text-[1.4rem] ${
                              current
                                ? "text-[#a9791a]"
                                : "text-ink group-hover:text-ink/70"
                            } group-focus-visible:underline group-focus-visible:underline-offset-4`}
                          >
                            {item.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* specialist treatments elsewhere — anchored to the frame foot */}
            <div
              className="mt-auto border-t border-dotted border-ink/25 pt-6"
              id={protonReferral.id}
            >
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                Specialist treatments elsewhere
              </p>
              <button
                type="button"
                ref={(el) => {
                  if (el) rowRefs.current.set(protonReferral.id, el);
                  else rowRefs.current.delete(protonReferral.id);
                }}
                aria-current={isProton ? "true" : undefined}
                onClick={() => pick(protonReferral.id)}
                className="group flex items-center gap-3.5 py-1.5 text-left transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{
                  transform: isProton ? "translateX(12px)" : "translateX(0px)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full border-[1.5px]"
                  style={{
                    borderColor: isProton ? GOLD : "#9aa7b8",
                    padding: 2.5,
                  }}
                >
                  {isProton && (
                    <span
                      className="block h-full w-full rounded-full"
                      style={{ backgroundColor: GOLD }}
                    />
                  )}
                </span>
                <span
                  className={`text-[1.05rem] font-medium leading-snug transition-colors ${
                    isProton
                      ? "text-[#a9791a]"
                      : "text-ink group-hover:text-ink/70"
                  } group-focus-visible:underline group-focus-visible:underline-offset-4`}
                >
                  {protonReferral.label}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  {...stroke}
                  className="h-3.5 w-3.5 flex-none text-ink-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden
                >
                  <path d="M4 12 12 4M6 4h6v6" />
                </svg>
              </button>
              <p className="mt-3 max-w-[34ch] text-[12.5px] leading-relaxed text-ink-muted">
                Specialist care provided through national centres outside our
                partnership.
              </p>
            </div>
          </nav>
        </div>

        {/* ── Right: the sheet, full column height ── */}
        <div ref={panelColRef} className="min-h-0 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="h-full"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE }}
              onAnimationComplete={measureWires}
            >
              {panel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ════ Phones and tablets: snap strip over the live sheet ════ */}
      <div className="min-w-0 lg:hidden">
        <h1 className="font-display text-[clamp(2.1rem,7vw,2.6rem)] font-semibold leading-[1.05] tracking-tight text-ink">
          Different treatments do different jobs.
        </h1>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-ink-muted">
          Start with the name you have been given. Your consultant will
          explain what applies to you.
        </p>
        <div aria-hidden className="mt-4 h-[3px] w-10 rounded-full bg-[#e3bd6a]" />

        <div
          ref={stripRef}
          data-lenis-prevent-horizontal
          aria-label="Treatments"
          className="site-gutter-bleed mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {[...items].map((item) => (
            <button
              key={item.slug}
              type="button"
              aria-current={active === item.slug ? "true" : undefined}
              ref={(el) => {
                if (el) chipRefs.current.set(item.slug, el);
                else chipRefs.current.delete(item.slug);
              }}
              onClick={() => pick(item.slug)}
              className={`shrink-0 snap-start whitespace-nowrap font-display text-[1.35rem] font-semibold leading-none tracking-[-0.03em] transition-colors ${
                active === item.slug ? "text-ink" : "text-[#5c7767]"
              } focus-visible:underline focus-visible:underline-offset-8`}
            >
              <span className="flex items-center gap-2">
                {active === item.slug && (
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: GOLD_SOFT }}
                  />
                )}
                {item.title}
              </span>
            </button>
          ))}
          <button
            type="button"
            aria-current={isProton ? "true" : undefined}
            ref={(el) => {
              if (el) chipRefs.current.set(protonReferral.id, el);
              else chipRefs.current.delete(protonReferral.id);
            }}
            onClick={() => pick(protonReferral.id)}
            className={`shrink-0 snap-start whitespace-nowrap font-display text-[1.35rem] font-semibold leading-none tracking-[-0.03em] transition-colors ${
              isProton ? "text-ink" : "text-[#5c7767]"
            } focus-visible:underline focus-visible:underline-offset-8`}
          >
            <span className="flex items-center gap-2">
              {isProton && (
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GOLD_SOFT }}
                />
              )}
              Proton beam therapy
              <svg viewBox="0 0 16 16" {...stroke} className="h-3.5 w-3.5 text-ink-muted" aria-hidden>
                <path d="M4 12 12 4M6 4h6v6" />
              </svg>
            </span>
          </button>
        </div>

        <div className="mt-4 pb-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {phonePanel}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
