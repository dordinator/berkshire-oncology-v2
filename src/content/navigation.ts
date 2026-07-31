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
          href: "/patients/newly-diagnosed",
          description: "The first steps after a diagnosis, and how quickly we can see you.",
          covers: [
            "What happens between diagnosis and your first appointment",
            "How to arrange an appointment, with or without a GP referral",
            "How quickly you can usually be seen",
            "What to bring — scans, reports, referral letters, medication list",
            "Questions worth asking at the first consultation",
          ],
        },
        {
          label: "I'm looking for a second opinion",
          href: "/patients/second-opinion",
          description: "How to arrange an independent review of an existing diagnosis or plan.",
          covers: [
            "When a second opinion is helpful, and when it may not change anything",
            "What we need from your current team",
            "How to request one without affecting your NHS care",
            "Typical timescales and costs",
          ],
        },
        {
          label: "I'm looking for private treatment",
          href: "/patients/private-treatment",
          description: "What private care with the partnership involves, and what it costs.",
          covers: [
            "What is included in private oncology care",
            "Self-pay and insured routes",
            "Which treatments happen at which location",
            "How to get an estimate before you commit",
          ],
        },
        {
          label: "I'm already receiving treatment",
          href: "/patients/receiving-treatment",
          description: "Contacts, practical support and who to call between appointments.",
          covers: [
            "Who to contact about side effects, and when to call urgently",
            "Repeat prescriptions and homecare delivery",
            "Changing or rearranging an appointment",
            "Support available during treatment",
          ],
        },
        {
          label: "I'm supporting someone with cancer",
          href: "/patients/supporting-someone",
          description: "Guidance for partners, family, friends and carers.",
          covers: [
            "Coming to appointments and what you can ask",
            "Practical caring at home",
            "Looking after your own wellbeing",
            "Support organisations for carers",
          ],
        },
      ],
    },
    {
      title: "Practical information",
      links: [
        {
          label: "What to expect at your first appointment",
          href: "/patients/first-appointment",
          description: "How long it takes, who you'll meet and what to bring.",
          covers: [
            "Where to go and how to find us",
            "How long the appointment usually takes",
            "What the consultant will ask and examine",
            "What you will leave with — plan, letter, next steps",
          ],
        },
        {
          label: "Frequently asked questions",
          href: "/patients/faqs",
          description: "The questions patients ask us most often.",
          covers: [
            "Referrals, waiting times and appointments",
            "Costs, insurance and billing",
            "Treatment locations and travel",
            "Working with your NHS team",
          ],
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
const treatmentCovers = [
  "What the treatment is",
  "When it may be recommended",
  "Which of our consultants provide it",
  "Where it takes place",
  "What to expect, appointment by appointment",
  "Possible side effects and who to contact",
];

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
          covers: treatmentCovers,
        },
        {
          label: "Immunotherapy",
          href: "/treatments/immunotherapy",
          description: "Treatment that helps the immune system recognise cancer.",
          covers: treatmentCovers,
        },
        {
          label: "Targeted therapies",
          href: "/treatments/targeted-therapies",
          description: "Drugs aimed at specific features of a cancer cell.",
          covers: treatmentCovers,
        },
        {
          label: "Hormone therapy",
          href: "/treatments/hormone-therapy",
          description: "Treatment that blocks hormones a cancer depends on.",
          covers: treatmentCovers,
        },
        {
          label: "Systemic anti-cancer treatment",
          href: "/treatments/systemic-anti-cancer-treatment",
          description: "The umbrella term (SACT) for drug treatments given across the body.",
          covers: treatmentCovers,
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
          covers: treatmentCovers,
        },
        {
          label: "Brachytherapy",
          href: "/treatments/brachytherapy",
          description: "Radiation delivered from a source placed inside the body.",
          covers: treatmentCovers,
        },
        {
          label: "Radioisotope therapy",
          href: "/treatments/radioisotope-therapy",
          description: "A radioactive medicine given to treat cancer from within.",
          covers: treatmentCovers,
        },
        {
          label: "Palliative radiotherapy",
          href: "/treatments/palliative-radiotherapy",
          description: "Radiotherapy given to control symptoms rather than cure.",
          covers: treatmentCovers,
        },
      ],
    },
    {
      title: "Research",
      links: [
        {
          label: "Clinical trials and research",
          href: "/treatments/clinical-trials",
          description: "How trials work and how our consultants are involved in research.",
          covers: [
            "What a clinical trial is and what taking part involves",
            "How to ask whether a trial is suitable for you",
            "Research our consultants are involved in",
            "Where trials run locally",
          ],
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
          href: "/consultants/by-cancer-type",
          description: "Every cancer type, and the consultants who treat it.",
          built: true,
        },
        {
          label: "Browse by treatment",
          href: "/consultants/by-treatment",
          description: "Every treatment, and the consultants who provide it.",
          built: true,
        },
        {
          label: "How to choose the right consultant",
          href: "/consultants/choosing-a-consultant",
          description: "What actually matters when picking an oncologist.",
          covers: [
            "Clinical oncologist or medical oncologist — what the difference means for you",
            "Matching a consultant to your cancer type and treatment",
            "Location, travel and how often you'll attend",
            "What to do if you'd like to change consultant",
          ],
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
const locationCovers = [
  "What happens at this location — consultations, chemotherapy, radiotherapy, imaging or follow-up",
  "Which of our consultants work here",
  "Address, map and how to find the department",
  "Parking, drop-off and accessibility",
  "Contact details for this site",
];

const locations: NavSection = {
  id: "locations",
  label: "Locations",
  href: "/locations",
  summary:
    "The partnership works across several hospitals. Each page explains exactly what happens where, so you know what to expect before you travel.",
  size: "md",
  groups: [
    {
      title: "Where we practise",
      links: [
        // Descriptions name the provider and the town only. Which services run
        // at which building is not yet confirmed by the practice (see
        // src/content/locations.ts), and these lines are printed in the
        // mega-menu on every page — the wrong claim here sends someone to the
        // wrong hospital.
        {
          label: "Spire Dunedin Hospital, Reading",
          href: "/locations/spire-dunedin-reading",
          description: "Spire Healthcare, Reading.",
          covers: locationCovers,
        },
        {
          label: "Princess Margaret Hospital, Windsor",
          href: "/locations/princess-margaret-windsor",
          description: "Circle Health Group, Windsor.",
          covers: locationCovers,
        },
        {
          label: "GenesisCare Windsor",
          href: "/locations/genesiscare-windsor",
          description: "GenesisCare, Windsor.",
          covers: locationCovers,
        },
        {
          label: "GenesisCare Oxford",
          href: "/locations/genesiscare-oxford",
          description: "GenesisCare, Sandford, Oxford.",
          covers: locationCovers,
        },
        {
          label: "Royal Berkshire Hospital",
          href: "/locations/royal-berkshire-hospital",
          description: "The NHS trust where our consultants also hold posts.",
          covers: locationCovers,
        },
        {
          label: "Other treatment locations",
          href: "/locations/other-locations",
          description: "Imaging, homecare delivery and other services we work with.",
          covers: [
            "Imaging and diagnostic providers",
            "Homecare medicine delivery",
            "Other hospitals where individual consultants practise",
          ],
        },
      ],
    },
    {
      title: "Getting there",
      links: [
        {
          label: "Getting here",
          href: "/locations/getting-here",
          description: "Travel, transport and directions for every site.",
          covers: [
            "Driving routes and postcodes for each hospital",
            "Public transport and nearest stations",
            "Taxi and drop-off points",
            "Travel time between sites",
          ],
        },
        {
          label: "Parking and accessibility",
          href: "/locations/parking-and-accessibility",
          description: "Parking, step-free access and support on arrival.",
          covers: [
            "Parking at each site, including cost and blue badge spaces",
            "Step-free access and lifts",
            "Wheelchair availability and assistance on arrival",
            "Facilities for someone coming with you",
          ],
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
    "What you will pay, when you will know, and who to ask. Every quote is an estimate until your treatment plan is confirmed.",
  size: "md",
  groups: [
    {
      title: "Paying for treatment",
      links: [
        {
          label: "Consultation fees",
          href: "/tariffs/consultation-fees",
          description: "The cost of a first appointment and follow-ups.",
          covers: [
            "Initial consultation fee",
            "Follow-up consultation fee",
            "What the fee does and does not include",
            "How and when you are invoiced",
          ],
        },
        {
          label: "Self-pay treatment",
          href: "/tariffs/self-pay-treatment",
          description: "Paying for your own care, with a tailored package.",
          covers: [
            "How a self-pay package is built around your plan",
            "What is included in a package",
            "When you receive the full cost in writing",
            "Payment methods and timing",
          ],
        },
        {
          label: "Private medical insurance",
          href: "/tariffs/private-medical-insurance",
          description: "Working with your insurer, and what they usually cover.",
          covers: [
            "Insurers we work with",
            "What is usually covered and what is not",
            "How invoices are sent to your insurer",
            "What to check on your policy before starting",
          ],
        },
        {
          label: "Tariffs",
          href: "/tariffs",
          description: "How the partnership sets its fees.",
          built: true,
        },
      ],
    },
    {
      title: "Before you start",
      links: [
        {
          label: "Getting a treatment estimate",
          href: "/tariffs/treatment-estimate",
          description: "How to get a written estimate before treatment begins.",
          covers: [
            "How to request an estimate",
            "What the estimate covers",
            "Why estimates can change once treatment starts",
            "Who to contact with questions",
          ],
        },
        {
          label: "Insurance authorisation",
          href: "/tariffs/insurance-authorisation",
          description: "Getting your insurer to approve treatment in advance.",
          covers: [
            "Getting an authorisation code before your appointment",
            "Information your insurer will ask for",
            "Re-authorisation during a course of treatment",
            "What happens if authorisation is refused",
          ],
        },
        {
          label: "Excesses and shortfalls",
          href: "/tariffs/excesses-and-shortfalls",
          description: "What happens when insurance does not cover everything.",
          covers: [
            "What an excess is and when it is charged",
            "Why a shortfall can arise",
            "Who is liable for the balance",
            "How to query a shortfall with your insurer",
          ],
        },
        {
          label: "Payment questions",
          href: "/tariffs/payment-questions",
          description: "Billing queries and who handles them.",
          covers: [
            "Who to contact about an invoice",
            "How to pay",
            "Timescales for settling an account",
            "Requesting a copy invoice or statement",
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
  href: "/about",
  summary:
    "A partnership of ten independent consultant oncologists, working together across Berkshire and the surrounding area.",
  size: "md",
  groups: [
    {
      title: "The partnership",
      links: [
        {
          label: "About the partnership",
          href: "/about/the-partnership",
          description: "Who we are, and how a partnership of independent consultants works.",
          covers: [
            "How the partnership was formed and how it operates",
            "What it means that each consultant is independent",
            "How consultants work together on complex cases",
            "The areas we cover",
          ],
        },
        {
          label: "Our approach to care",
          href: "/about/our-approach",
          description: "How we work with patients, and what you can expect from us.",
          covers: [
            "Continuity — seeing the same consultant throughout",
            "How treatment decisions are made with you",
            "Working alongside your GP and NHS team",
            "Communication between appointments",
          ],
        },
        {
          label: "Our consultants",
          href: "/consultants",
          description: "The ten consultants who make up the partnership.",
          built: true,
        },
        {
          label: "NHS and private practice",
          href: "/about/nhs-and-private-practice",
          description: "How our consultants' NHS and private work fit together.",
          covers: [
            "Our consultants' NHS posts",
            "How private care runs alongside NHS treatment",
            "Moving between NHS and private care",
            "Sharing information with your NHS team",
          ],
        },
      ],
    },
    {
      title: "Standards",
      links: [
        {
          label: "Quality and governance",
          href: "/about/quality-and-governance",
          description: "Registration, audit and how we maintain standards.",
          covers: [
            "GMC registration and specialist accreditation",
            "Appraisal and revalidation",
            "Multidisciplinary team working",
            "Audit, outcomes and complaints",
          ],
        },
        {
          label: "Patient feedback",
          href: "/about/patient-feedback",
          description: "What patients tell us, and how to give feedback.",
          covers: [
            "How to leave feedback",
            "What patients have said",
            "How feedback changes what we do",
            "How to raise a concern or complaint",
          ],
        },
        {
          label: "Referring professionals",
          href: "/about/referring-professionals",
          description: "For GPs and consultants referring a patient to us.",
          covers: [
            "How to refer, and where to send a referral",
            "What to include in a referral letter",
            "Urgent referrals and typical response times",
            "Direct contact details for clinicians",
          ],
        },
        {
          label: "Careers and professional enquiries",
          href: "/about/careers",
          description: "Working with the partnership.",
          covers: [
            "Current opportunities",
            "Enquiries from consultants interested in joining",
            "Administrative and practice roles",
            "Who to contact",
          ],
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
          label: "Cancer information",
          href: "/resources/cancer-information",
          description: "Reliable, plain-English information about cancer and its treatment.",
          covers: [
            "Trustworthy sources of cancer information",
            "Understanding your diagnosis and staging",
            "Making sense of scans and test results",
            "How to judge information you find online",
          ],
        },
        {
          label: "Treatment preparation",
          href: "/resources/treatment-preparation",
          description: "Getting ready for chemotherapy, radiotherapy or surgery.",
          covers: [
            "Preparing for your first cycle or fraction",
            "What to bring and what to expect on the day",
            "Work, driving and daily life during treatment",
            "Diet, exercise and dental checks beforehand",
          ],
        },
        {
          label: "Managing side effects",
          href: "/resources/managing-side-effects",
          description: "What to expect, what helps, and when to call us.",
          covers: [
            "Common side effects and practical steps that help",
            "Warning signs that need urgent attention",
            "Who to contact, day and night",
            "Longer-term effects and follow-up",
          ],
        },
        {
          label: "Downloadable patient guides",
          href: "/resources/patient-guides",
          description: "Printable guides and information sheets.",
          covers: [
            "Guides by treatment type",
            "Appointment and question checklists",
            "Symptom and medication diaries",
            "Consultant-approved information sheets",
          ],
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          label: "Emotional and practical support",
          href: "/resources/emotional-and-practical-support",
          description: "Counselling, groups and help with everyday life.",
          covers: [
            "Counselling and psychological support",
            "Local support groups and centres",
            "Practical help at home",
            "Support with appearance, fatigue and sleep",
          ],
        },
        {
          label: "Support for carers and families",
          href: "/resources/carers-and-families",
          description: "Help for the people supporting someone through treatment.",
          covers: [
            "Support available to carers",
            "Talking to children about a diagnosis",
            "Carer's assessments and respite",
            "Looking after your own health",
          ],
        },
        {
          label: "Financial and benefits advice",
          href: "/resources/financial-and-benefits-advice",
          description: "Benefits, travel costs and financial help during treatment.",
          covers: [
            "Benefits you may be entitled to",
            "Help with travel and parking costs",
            "Work, sick pay and income protection",
            "Where to get free, independent advice",
          ],
        },
        {
          label: "External organisations",
          href: "/links",
          description: "Macmillan, Cancer Research UK and the other organisations we recommend.",
          built: true,
        },
        {
          label: "News and updates",
          href: "/resources/news",
          description: "Announcements from the partnership.",
          covers: [
            "Practice announcements",
            "New services and locations",
            "Consultant appointments",
            "Changes to how we work",
          ],
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
