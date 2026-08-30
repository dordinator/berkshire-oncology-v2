import { specialities } from "./specialities";

// ─────────────────────────────────────────────────────────────────────────────
// Site information architecture — the single source of truth for the navbar,
// the mobile drawer, the search index, the scaffolded section pages and the
// sitemap. Add a destination here and it appears in all five automatically.
//
// URL policy: existing routes keep their paths so the 301s from the old site
// stay intact (/specialities, /tariffs, /links). Only the labels change —
// "Cancer Types", "Fees & Insurance", "Resources".
// ─────────────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  /** One line of orientation. Shown in the mega-menu, the search results and
   *  as the intro on a scaffolded page. */
  description?: string;
  /** Outline of what the finished page will contain — rendered on scaffolded
   *  pages so a reviewer can see the intended shape before copy is written. */
  covers?: string[];
  /** True when the destination already exists with real content. */
  built?: boolean;
}

export interface NavGroup {
  /** Optional column heading inside a mega-menu panel. */
  title?: string;
  links: NavLink[];
}

export interface NavSection {
  id: string;
  label: string;
  href: string;
  /** Shown at the head of the mega-menu panel. */
  summary: string;
  groups: NavGroup[];
  /** Panel width hint for the desktop mega-menu. */
  size?: "sm" | "md" | "lg";
}

// ── 1. Patients & Families ───────────────────────────────────────────────────
const patients: NavSection = {
  id: "patients",
  label: "Patients & Families",
  href: "/patients",
  summary:
    "Wherever you are in this, there is a place to start. Choose the line below that sounds most like you.",
  size: "md",
  groups: [
    {
      title: "Start here",
      links: [
        {
          label: "I'm newly diagnosed",
          href: "/patients#newly-diagnosed",
          description: "The first steps after a diagnosis, and how quickly we can see you.",
          covers: [
            "What happens between diagnosis and your first appointment",
            "How to arrange an appointment, with or without a GP referral",
            "How quickly you can usually be seen",
            "What to bring — scans, reports, referral letters, medication list",
            "Questions worth asking at the first consultation",
          ],
          built: true,
        },
        {
          label: "I'm looking for a second opinion",
          href: "/patients#second-opinion",
          description: "How to arrange an independent review of an existing diagnosis or plan.",
          covers: [
            "When a second opinion is helpful, and when it may not change anything",
            "What we need from your current team",
            "How to request one without affecting your NHS care",
            "Typical timescales and costs",
          ],
          built: true,
        },
        {
          label: "I'm looking for private treatment",
          href: "/patients#private-treatment",
          description: "What private care with the partnership involves, and what it costs.",
          covers: [
            "What is included in private oncology care",
            "Self-pay and insured routes",
            "Which treatments happen at which location",
            "How to get an estimate before you commit",
          ],
          built: true,
        },
        {
          label: "I'm already receiving treatment",
          href: "/patients#receiving-treatment",
          description: "Contacts, practical support and who to call between appointments.",
          covers: [
            "Who to contact about side effects, and when to call urgently",
            "Repeat prescriptions and homecare delivery",
            "Changing or rearranging an appointment",
            "Support available during treatment",
          ],
          built: true,
        },
        {
          label: "I'm supporting someone with cancer",
          href: "/patients#supporting-someone",
          description: "Guidance for partners, family, friends and carers.",
          covers: [
            "Coming to appointments and what you can ask",
            "Practical caring at home",
            "Looking after your own wellbeing",
            "Support organisations for carers",
          ],
          built: true,
        },
      ],
    },
    {
      title: "Practical information",
      links: [
        {
          label: "What to expect at your first appointment",
          href: "/patients#first-appointment",
          description: "How long it takes, who you'll meet and what to bring.",
          covers: [
            "Where to go and how to find us",
            "How long the appointment usually takes",
            "What the consultant will ask and examine",
            "What you will leave with — plan, letter, next steps",
          ],
          built: true,
        },
        {
          label: "Frequently asked questions",
          href: "/patients#faqs",
          description: "The questions patients ask us most often.",
          covers: [
            "Referrals, waiting times and appointments",
            "Costs, insurance and billing",
            "Treatment locations and travel",
            "Working with your NHS team",
          ],
          built: true,
        },
        {
          label: "Patient resources and support",
          href: "/resources",
          description: "Information, guides and organisations that can help.",
          built: true,
        },
      ],
    },
  ],
};

// ── 2. Cancer Types ──────────────────────────────────────────────────────────
// Driven entirely by the existing speciality data — these pages are already
// live, so the dropdown links straight at them.
const cancerTypes: NavSection = {
  id: "cancer-types",
  label: "Cancer Types",
  href: "/specialities",
  summary:
    "The cancers our consultants diagnose and treat. Each page lists the consultants who treat it and the treatments they offer.",
  size: "lg",
  groups: [
    {
      links: specialities.map((s) => ({
        label: s.title,
        href: `/specialities/${s.slug}`,
        description: `Consultants, treatments and appointments for ${s.title.toLowerCase()}.`,
        built: true,
      })),
    },
  ],
};

// ── 3. Treatments ────────────────────────────────────────────────────────────
// These pages are written (see content/therapies.ts), so they carry `built`
// rather than a `covers` outline. The section deliberately holds seven
// treatments, not eleven: SACT is an umbrella term explained on the hub,
// palliative radiotherapy is a section within radiotherapy, and clinical trials
// is not published because nothing in the practice's own material evidences it.
const treatments: NavSection = {
  id: "treatments",
  label: "Treatments",
  href: "/treatments",
  summary:
    "The treatments our consultants provide across Reading, Windsor and Oxford.",
  size: "md",
  groups: [
    {
      title: "Drug treatments",
      links: [
        {
          label: "Chemotherapy",
          href: "/treatments/chemotherapy",
          description: "Drug treatment that targets rapidly dividing cells.",
          built: true,
        },
        {
          label: "Immunotherapy",
          href: "/treatments/immunotherapy",
          description: "Treatment that helps the immune system recognise cancer.",
          built: true,
        },
        {
          label: "Targeted therapies",
          href: "/treatments/targeted-therapies",
          description: "Drugs aimed at specific features of a cancer cell.",
          built: true,
        },
        {
          label: "Hormone therapy",
          href: "/treatments/hormone-therapy",
          description: "Treatment that blocks hormones a cancer depends on.",
          built: true,
        },
      ],
    },
    {
      title: "Radiotherapy",
      links: [
        {
          label: "Radiotherapy",
          href: "/treatments/radiotherapy",
          description: "Precisely targeted radiation to treat a tumour.",
          built: true,
        },
        {
          label: "Brachytherapy",
          href: "/treatments/brachytherapy",
          description: "Radiation delivered from a source placed inside the body.",
          built: true,
        },
        {
          label: "Radioisotope therapy",
          href: "/treatments/radioisotope-therapy",
          description: "A radioactive medicine given to treat cancer from within.",
          built: true,
        },
        {
          // Not a page of its own: no consultant lists it as separate wording,
          // so it is a section within radiotherapy rather than a page with an
          // empty consultant list. See therapies.ts.
          label: "Palliative radiotherapy",
          href: "/treatments/radiotherapy#palliative-radiotherapy",
          description: "Radiotherapy given to control symptoms rather than cure.",
          built: true,
        },
      ],
    },
  ],
};

// ── 4. Consultants ───────────────────────────────────────────────────────────
const consultantsSection: NavSection = {
  id: "consultants",
  label: "Consultants",
  href: "/consultants",
  summary:
    "Ten independent consultant oncologists. Find the right one by cancer type, by treatment, or browse every profile.",
  size: "md",
  groups: [
    {
      title: "Find a consultant",
      links: [
        {
          label: "Find a consultant",
          href: "/consultants",
          description: "Search and filter all ten consultants.",
          built: true,
        },
        {
          label: "Browse by cancer type",
          href: "/specialities",
          description: "Choose a cancer type to see the consultants who treat it.",
          built: true,
        },
        {
          label: "Browse by treatment",
          href: "/consultants/by-treatment",
          description: "Every treatment, and the consultants who provide it.",
          built: true,
        },
      ],
    },
    {
      title: "By type",
      links: [
        {
          label: "Consultant clinical oncologists",
          href: "/consultants/clinical-oncologists",
          description: "Consultants who provide radiotherapy alongside drug treatments.",
          built: true,
        },
        {
          label: "Consultant medical oncologists",
          href: "/consultants/medical-oncologists",
          description: "Consultants who specialise in drug treatments for cancer.",
          built: true,
        },
        {
          label: "Consultant profiles",
          href: "/consultants/profiles",
          description: "Every profile, A to Z.",
          built: true,
        },
      ],
    },
  ],
};

// ── 5. Locations ─────────────────────────────────────────────────────────────
const locations: NavSection = {
  id: "locations",
  label: "Locations",
  href: "/locations",
  summary:
    "The partnership works across several hospitals. Each page explains exactly what happens where, so you know what to expect before you travel.",
  size: "md",
  groups: [
    {
      title: "Explore locations",
      links: [
        {
          label: "Browse all locations",
          href: "/locations",
          description: "Explore the hospitals and cancer centres where our consultants work.",
          built: true,
        },
        {
          label: "Treatment locations",
          href: "/resources#treatment-locations",
          description: "A concise list of treatment sites and links to their own websites.",
          built: true,
        },
      ],
    },
    {
      title: "Need help?",
      links: [
        {
          label: "Confirm where to go",
          href: "/contact#guidance",
          description: "Ask the practice team to confirm the right site before you travel.",
          built: true,
        },
      ],
    },
  ],
};

// ── 6. Fees & Insurance ──────────────────────────────────────────────────────
const fees: NavSection = {
  id: "fees",
  label: "Fees & Insurance",
  href: "/tariffs",
  summary:
    "Guidance for self-funding and insured patients, including estimates and insurance shortfalls.",
  size: "md",
  groups: [
    {
      title: "Paying for treatment",
      links: [
        {
          label: "Tariff details",
          href: "/tariffs#request",
          description: "Contact the practice for details of your tariff.",
          covers: [
            "How to request tariff details",
            "The practice phone number and email address",
            "Who to contact with questions",
          ],
        },
        {
          label: "Self-funding treatment",
          href: "/tariffs#self-funding",
          description: "Paying for treatment yourself, with a comprehensive tariff.",
          covers: [
            "Packages tailored to individual needs",
            "Receiving a comprehensive tariff",
            "Information provided before treatment starts",
          ],
        },
        {
          label: "Private medical insurance",
          href: "/tariffs#insurance",
          description: "Checking your insurer's quote and policy cover.",
          covers: [
            "Insurance-provider fee schedules",
            "How policy benefits can vary",
            "Obtaining a quote before treatment",
            "Responsibility for an unpaid shortfall",
          ],
        },
        {
          label: "Tariffs",
          href: "/tariffs#tailored",
          description: "How independent practitioners set their tariffs.",
          built: true,
        },
      ],
    },
    {
      title: "Before you start",
      links: [
        {
          label: "How estimates work",
          href: "/tariffs#estimates",
          description: "Why a quote is an estimate and may change.",
          covers: [
            "Quotes are estimates",
            "Changes depending on the treatment given",
            "Who to contact with questions",
          ],
        },
        {
          label: "Checking insurance cover",
          href: "/tariffs#authorisation",
          description: "Obtaining a quote to check whether costs are covered in full.",
          covers: [
            "Obtaining a quote before treatment",
            "Checking whether costs are covered in full",
            "How policy benefits can vary",
            "Responsibility for an unpaid shortfall",
          ],
        },
        {
          label: "Insurance shortfalls",
          href: "/tariffs#shortfalls",
          description: "What happens when an insurer does not settle an account in full.",
          covers: [
            "Checking whether costs are covered in full",
            "What an insurance shortfall is",
            "Who is responsible for the balance",
            "Who to contact about tariff details",
          ],
        },
        {
          label: "Payment questions",
          href: "/tariffs#faqs",
          description: "Short answers to the questions patients ask most.",
          covers: [
            "How to request a tariff",
            "Self-funding treatment",
            "Whether an estimate can change",
            "Who can help you understand the costs",
          ],
        },
      ],
    },
  ],
};

// ── 7. About Us ──────────────────────────────────────────────────────────────
const about: NavSection = {
  id: "about",
  label: "About Us",
  // The homepage is the canonical About landing page. Keep this direct rather
  // than sending visitors through the legacy /about redirect.
  href: "/",
  summary:
    "A partnership of ten independent consultant oncologists, working together across Berkshire and the surrounding area.",
  size: "md",
  groups: [
    {
      title: "The partnership",
      links: [
        {
          label: "About the partnership",
          href: "/#partnership",
          description: "Who we are, and how a partnership of independent consultants works.",
          built: true,
        },
        {
          label: "Our consultants",
          href: "/consultants",
          description: "The ten consultants who make up the partnership.",
          built: true,
        },
      ],
    },
    {
      title: "Get in touch",
      links: [
        {
          label: "Referring professionals",
          href: "/contact#referral",
          description: "Use the secure healthcare professional referral route.",
          built: true,
        },
        {
          label: "Professional and career enquiries",
          href: "/contact#professional",
          description: "Contact the practice about joining or working with us.",
          built: true,
        },
      ],
    },
  ],
};

// ── 8. Resources ─────────────────────────────────────────────────────────────
const resources: NavSection = {
  id: "resources",
  label: "Resources",
  href: "/resources",
  summary:
    "Information, practical guidance and the organisations we most often point patients and families towards.",
  size: "md",
  groups: [
    {
      title: "Information and guidance",
      links: [
        {
          label: "Browse resources and support",
          href: "/resources",
          description: "Search trusted organisations, practical support and treatment locations.",
          built: true,
        },
        {
          label: "Trusted organisations",
          href: "/resources#trusted-organisations",
          description: "Cancer information and practical, emotional and financial support.",
          built: true,
        },
        {
          label: "Treatment information",
          href: "/treatments",
          description: "Understand the treatments our consultants provide.",
          built: true,
        },
        {
          label: "Your first appointment",
          href: "/patients#first-appointment",
          description: "What to bring and how to prepare for your consultation.",
          built: true,
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          label: "Support for carers and families",
          href: "/patients#supporting-someone",
          description: "A starting point for people supporting someone with cancer.",
          built: true,
        },
        {
          label: "Treatment locations",
          href: "/resources#treatment-locations",
          description: "Hospitals and cancer centres where our consultants provide care.",
          built: true,
        },
        {
          label: "Fees and insurance",
          href: "/tariffs",
          description: "Self-funding, medical insurance, estimates and shortfalls.",
          built: true,
        },
        {
          label: "External organisations",
          href: "/resources#trusted-organisations",
          description: "Macmillan, Cancer Research UK and the other organisations we recommend.",
          built: true,
        },
      ],
    },
  ],
};

// Order matters everywhere downstream — the navbar, the drawer, the footer
// columns, the search index and the sitemap all read this array in sequence.
// Patients & Families comes first deliberately: it is the section a frightened
// visitor needs, and it should never sit below "About Us".
// About Us leads — the practice asked for it leftmost.
// Order matters everywhere downstream — the navbar, the drawer, the footer
// columns, the search index and the sitemap all read this array in sequence.
// Patients & Families comes first deliberately: it is the section a frightened
// visitor needs, and it must never sit below "About Us". About Us is seventh.
// ORDER IS DELIBERATE — About Us leads, at the practice's request.
// Do not re-sort this array.
// Order matters everywhere downstream — the navbar, the drawer, the footer
// columns, the search index and the sitemap all read this array in sequence.
// Patients & Families comes first deliberately: it is the section a frightened
// visitor needs, and it must never sit below "About Us". About Us is seventh.
// ORDER IS DELIBERATE. About Us leads because the practice asked for it
// leftmost. An automated review previously "corrected" this back to a
// patients-first order three times — it is not a mistake. Do not re-sort.
export const navSections: NavSection[] = [
  about,
  patients,
  cancerTypes,
  treatments,
  consultantsSection,
  locations,
  fees,
  resources,
];

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Every link in the IA, flattened, with the section it belongs to. */
export interface FlatNavLink extends NavLink {
  section: NavSection;
  groupTitle?: string;
}

export const allNavLinks: FlatNavLink[] = navSections.flatMap((section) =>
  section.groups.flatMap((group) =>
    group.links.map((link) => ({ ...link, section, groupTitle: group.title })),
  ),
);

const linkByHref = new Map<string, FlatNavLink>();
for (const link of allNavLinks) {
  if (!linkByHref.has(link.href)) linkByHref.set(link.href, link);
}

export function getNavLink(href: string): FlatNavLink | undefined {
  return linkByHref.get(href);
}

export function getSection(id: string): NavSection | undefined {
  return navSections.find((s) => s.id === id);
}

/** True when some section owns this path by URL prefix. */
function ownedByPrefix(pathname: string): boolean {
  return navSections.some(
    (s) => pathname === s.href || pathname.startsWith(`${s.href}/`),
  );
}

/**
 * Whether a section should render as the current one. Shared by the desktop bar
 * and the mobile drawer so they can never disagree.
 *
 * A section owns its own URL prefix. Two sections also link to pages outside
 * their prefix — Resources links to /links, About links to /consultants — so
 * there is a fallback on an explicit link match. That fallback only applies
 * when no section owns the path by prefix; otherwise /consultants would light
 * up both Consultants and About at once.
 */
export function isSectionActive(section: NavSection, pathname: string): boolean {
  if (pathname === section.href) return true;
  if (pathname.startsWith(`${section.href}/`)) return true;
  if (ownedByPrefix(pathname)) return false;
  return section.groups.some((g) => g.links.some((l) => l.href === pathname));
}

/** Sibling links within the same section — used for "elsewhere in this section". */
export function getSiblings(href: string): FlatNavLink[] {
  const link = linkByHref.get(href);
  if (!link) return [];
  return allNavLinks.filter(
    (l) => l.section.id === link.section.id && l.href !== href,
  );
}

/** Section landing pages that need scaffolding (i.e. don't already exist). */
export const scaffoldedSectionRoots = ["/patients", "/treatments", "/locations", "/about", "/resources"];

/** Every route the IA introduces, for the sitemap. */
export function allNavRoutes(): string[] {
  const routes = new Set<string>(scaffoldedSectionRoots);
  for (const link of allNavLinks) {
    if (link.href.startsWith("/")) routes.add(link.href);
  }
  return Array.from(routes);
}
