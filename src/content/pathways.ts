import { getNavLink } from "./navigation";

// ─────────────────────────────────────────────────────────────────────────────
// The five situations, and where each one leads.
//
// This is the only hand-written content on the resources page, and it is
// hand-written for a reason: the site's information architecture is organised
// by topic ("cancer information", "financial and benefits advice") and a reader
// who has just been told they have cancer is not looking for a topic. They are
// looking for themselves. Nothing in src/content/* encodes "I've just been
// diagnosed", so the mapping from situation to page has to be made here.
//
// Every href below was checked against a running server. The destinations are
// spread deliberately across the whole site rather than pointed at /resources/*
// — a person in situation 1 needs the cancer-type list and a consultant far
// more than they need a page of links.
//
// `built` is NOT typed here. It is read from navigation.ts at render time via
// isOutline(), so a page that gains real copy stops being marked as an outline
// without anyone editing this file.
// ─────────────────────────────────────────────────────────────────────────────

export type PathwayLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type Pathway = {
  id: string;
  title: string;
  description: string;
  links: PathwayLink[];
  action: { label: string; href: string };
};

export const pathways: Pathway[] = [
  {
    id: "just-diagnosed",
    title: "I’ve just been diagnosed",
    description:
      "You don’t need to have everything in order before you get in touch.",
    links: [
      { label: "Cancer types we treat", href: "/specialities" },
      {
        label: "Find a consultant by cancer type",
        href: "/consultants/by-cancer-type",
      },
      { label: "Questions people ask first", href: "/patients#faqs" },
      {
        label: "Cancer Research UK",
        href: "https://www.cancerresearchuk.org/about-cancer",
        external: true,
      },
    ],
    action: { label: "Where to start", href: "/patients#start-here" },
  },
  {
    id: "preparing",
    title: "I’m preparing for treatment",
    description:
      "Reading about a treatment beforehand mostly means you arrive with better questions.",
    links: [
      { label: "Your first appointment", href: "/patients#first-appointment" },
      // #start-here holds the route cards, including "I'm looking for private
      // treatment" — the old #how-it-works anchor never existed on the page.
      { label: "How private care works", href: "/patients#start-here" },
      {
        label: "Browse consultants by treatment",
        href: "/consultants/by-treatment",
      },
      { label: "Preparing for treatment", href: "/resources/treatment-preparation" },
    ],
    action: { label: "Treatments we provide", href: "/treatments" },
  },
  {
    id: "side-effects",
    title: "I’m managing side effects",
    description:
      "Treatment isn’t only a series of appointments. What happens between them matters too.",
    links: [
      { label: "Managing side effects", href: "/resources/managing-side-effects" },
      {
        label: "If you’re already receiving treatment",
        href: "/patients/receiving-treatment",
      },
      { label: "Contact the practice", href: "/contact" },
      {
        label: "Macmillan Cancer Support",
        href: "https://www.macmillan.org.uk",
        external: true,
      },
    ],
    action: { label: "Support during treatment", href: "/patients#support" },
  },
  {
    id: "supporting-someone",
    title: "I’m supporting someone close to me",
    description:
      "Support for the people around a diagnosis, not only the person who has it.",
    links: [
      {
        label: "Emotional and practical support",
        href: "/resources/emotional-and-practical-support",
      },
      {
        label: "I’m supporting someone with cancer",
        href: "/patients/supporting-someone",
      },
      {
        label: "Coming with someone to an appointment",
        href: "/patients#first-appointment",
      },
      {
        label: "Macmillan Cancer Support",
        href: "https://www.macmillan.org.uk",
        external: true,
      },
    ],
    action: { label: "Support for carers and families", href: "/resources/carers-and-families" },
  },
  {
    id: "practical-help",
    title: "I need practical or financial help",
    description:
      "Money, travel, work and time off, all having to be managed at once.",
    links: [
      {
        label: "Financial and benefits advice",
        href: "/resources/financial-and-benefits-advice",
      },
      { label: "Where you’ll be seen", href: "/locations" },
      // #funding, not #guidance — the latter does not exist. The real ids on
      // /tariffs are tailored, funding, self-funding, insurance,
      // before-you-start, estimates, shortfalls, request, faqs, contact-fees.
      { label: "How fees and insurance work", href: "/tariffs#funding" },
      {
        label: "Macmillan Cancer Support",
        href: "https://www.macmillan.org.uk",
        external: true,
      },
    ],
    action: { label: "Fees and payment", href: "/tariffs" },
  },
];

/**
 * Routes whose page component renders <SectionPage/> — the scaffold that shows
 * a description and a contents outline instead of written copy. Verified by
 * reading the route files: /patients/[slug], /about/[slug], /resources/[slug]
 * and /locations/[slug] all render it; /specialities/[slug] and
 * /treatments/[slug] do not.
 */
const SCAFFOLD_ROUTES = [
  "/patients/",
  "/about/",
  "/resources/",
  "/locations/",
];

/**
 * True when a destination is a scaffold — the page exists and renders an
 * outline of what it will contain, but the copy has not been written yet.
 *
 * Deliberately NOT `getNavLink(href).built !== true` on its own. `built: true`
 * is set on leaf destinations only, so the section roots — /specialities,
 * /treatments, /locations, /tariffs — come back false despite being real pages
 * with real copy, and every one of them would have been badged "outline" on a
 * page whose whole point is telling the reader the truth about where a link
 * goes. The route-shape test decides whether a page *can* be a scaffold; `built`
 * then lets an individual one opt out once its copy is written, with no edit
 * needed here.
 *
 * Anchored links (/patients#faqs) point at real copy inside a real page, and
 * external links are somebody else's, so neither is ever an outline.
 */
export function isOutline(href: string): boolean {
  if (href.startsWith("http") || href.includes("#")) return false;
  if (!SCAFFOLD_ROUTES.some((prefix) => href.startsWith(prefix))) return false;
  const link = getNavLink(href);
  return link ? link.built !== true : true;
}
