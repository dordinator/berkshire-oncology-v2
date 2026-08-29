import { allNavLinks, navSections } from "./navigation";
import { locations } from "./locations";
import { getAllConsultants } from "./queries";
import { specialities } from "./specialities";
import { therapies } from "./therapies";

// ─────────────────────────────────────────────────────────────────────────────
// Site search index.
//
// Built once at module scope from the same content modules that drive the
// navigation, so a new consultant, cancer type, treatment or location becomes
// searchable the moment it is added — nothing to maintain by hand here.
//
// Keywords are deliberately conservative. A patient searching "bowel" must find
// the colorectal page, but we never invent a clinical synonym we are not certain
// of: a wrong equivalence on a cancer site is worse than a missed search hit.
// ─────────────────────────────────────────────────────────────────────────────

export type SearchKind = "consultant" | "cancer" | "treatment" | "location" | "page";

export interface SearchEntry {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  kind: SearchKind;
  keywords: string[];
}

/** Lower is more specific — used for de-duplication and as the score tie-break. */
const kindPriority: Record<SearchKind, number> = {
  consultant: 0,
  cancer: 1,
  treatment: 2,
  location: 3,
  page: 4,
};

export const kindLabels: Record<SearchKind, string> = {
  consultant: "Consultants",
  cancer: "Cancer types",
  treatment: "Treatments",
  location: "Locations",
  page: "Pages",
};

/** Group order in the results list, matching the specificity order above. */
export const kindOrder: SearchKind[] = ["consultant", "cancer", "treatment", "location", "page"];

// ── Text normalisation ───────────────────────────────────────────────────────

/**
 * Case- and diacritic-insensitive. Apostrophes are dropped rather than turned
 * into a space so "O'Donnell" and "odonnell" normalise to the same string;
 * every other separator becomes a single space.
 */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ── Keyword tables ───────────────────────────────────────────────────────────

/**
 * Synonyms for cancer types, keyed by speciality slug. Only terms that are
 * medically uncontroversial — everyday names for the same disease site, or
 * named subtypes of it. Anything we were unsure of is simply left out.
 */
const cancerKeywords: Record<string, string[]> = {
  brain: ["brain tumour"],
  "cancer-unknown-primary": ["cup", "unknown primary"],
  colorectal: ["bowel", "colon", "rectal", "rectum"],
  gynaecology: ["gynaecological", "gynecological", "ovarian", "womb", "uterine", "cervical"],
  "head-and-neck": ["throat", "mouth"],
  kidney: ["renal"],
  lymphoma: ["lymph", "hodgkin", "non-hodgkin"],
  oesophagus: ["oesophageal", "esophageal", "gullet"],
  pancreas: ["pancreatic"],
  skin: ["melanoma"],
  stomach: ["gastric"],
  testicular: ["testicle", "testis"],
  sarcoma: ["soft tissue"],
};

/** Everyday words for each treatment, keyed by therapy slug.
 *
 *  Three treatments stopped being pages of their own in the treatment-hub
 *  rebuild, but people still search for them, so their words are redistributed
 *  rather than dropped: "sact"/"systemic" to each of the four drug treatments it
 *  covers, "palliative" to radiotherapy (where that section now lives), and the
 *  trial words to the hub entry below — which carries the honest "ask your
 *  consultant" note. */
const sact = ["sact", "systemic", "systemic anti-cancer treatment"];

const treatmentKeywords: Record<string, string[]> = {
  chemotherapy: ["chemo", ...sact],
  immunotherapy: ["immuno", ...sact],
  "targeted-therapies": ["targeted therapy", "biological", ...sact],
  "hormone-therapy": ["hormonal", "endocrine", ...sact],
  radiotherapy: ["radiation", "palliative", "symptom control", "palliative radiotherapy"],
  brachytherapy: ["internal radiotherapy", "seeds", "implant"],
  "radioisotope-therapy": ["radionuclide", "radioiodine", "isotope"],
};

/** What people type when they mean money, wherever it sits under /tariffs. */
const feeKeywords = [
  "fees",
  "fee",
  "cost",
  "costs",
  "price",
  "prices",
  "pricing",
  "how much",
  "insurance",
  "insurer",
  "self pay",
  "billing",
  "invoice",
  "payment",
  "tariff",
];

/** What people type when they mean getting to a hospital. */
const locationKeywords = ["parking", "directions", "travel", "map", "getting here", "how to get there"];

/** Extra keywords for specific pages, matched on exact href. */
const pageKeywords: Record<string, string[]> = {
  "/": ["home", "berkshire oncology partnership"],
  "/contact": ["contact", "phone", "telephone", "email", "enquiry", "appointment", "book", "referral"],
  "/consultants": ["doctor", "doctors", "oncologist", "oncologists", "specialist", "find a consultant"],
  "/consultants/clinical-oncologists": ["clinical oncologist", "radiotherapy"],
  "/consultants/medical-oncologists": ["medical oncologist"],
  "/specialities": ["cancer types", "conditions", "specialities"],
  "/treatments": ["treatment", "therapies"],
  "/locations": [...locationKeywords, "hospitals", "where"],
  "/links": ["macmillan", "cancer research uk", "charity", "organisations", "support"],
  "/resources": ["support", "guides", "information"],
  "/patients/second-opinion": ["second opinion"],
  "/patients/newly-diagnosed": ["diagnosis", "just diagnosed"],
};

// ── Entry construction ───────────────────────────────────────────────────────

const consultantEntries: SearchEntry[] = getAllConsultants().map((c) => {
  // "Dr Helen O'Donnell" → surname "O'Donnell", plus a de-punctuated variant so
  // both "o'donnell" and "odonnell" hit.
  const parts = c.name.replace(/^Dr\.?\s+/i, "").split(/\s+/);
  const surname = parts[parts.length - 1] ?? c.name;
  return {
    id: `consultant:${c.slug}`,
    title: c.name,
    subtitle: c.role,
    href: `/consultants/${c.slug}`,
    kind: "consultant",
    keywords: [
      surname,
      surname.replace(/[^A-Za-z0-9]/g, ""),
      parts[0] ?? "",
      c.shortRole ?? "",
      "consultant",
      "oncologist",
    ].filter(Boolean),
  };
});

const cancerEntries: SearchEntry[] = specialities.map((s) => ({
  id: `cancer:${s.slug}`,
  title: s.title,
  href: `/specialities/${s.slug}`,
  kind: "cancer",
  keywords: [s.name, ...(cancerKeywords[s.slug] ?? [])],
}));

const treatmentEntries: SearchEntry[] = [
  ...therapies.map((t) => ({
    id: `treatment:${t.slug}`,
    title: t.title,
    subtitle: t.summary,
    href: `/treatments/${t.slug}`,
    kind: "treatment" as const,
    keywords: treatmentKeywords[t.slug] ?? [],
  })),
  // Trials have no page of their own — the practice's own material evidences no
  // research activity. Searching for one still needs to land somewhere honest,
  // so it goes to the hub, which carries the "ask your consultant" note.
  {
    id: "treatment:clinical-trials",
    title: "Clinical trials",
    subtitle: "Ask your consultant whether a trial may be suitable for you.",
    href: "/treatments#clinical-trials",
    kind: "treatment" as const,
    keywords: ["trial", "trials", "research", "study", "clinical trial"],
  },
];

const locationEntries: SearchEntry[] = locations.map((l) => ({
  id: `location:${l.slug}`,
  title: l.name,
  subtitle: l.provider ? `${l.area} — ${l.provider}` : l.area,
  href: `/locations/${l.slug}`,
  kind: "location",
  keywords: [l.area, l.provider ?? "", "hospital", ...locationKeywords].filter(Boolean),
}));

/** The eight section landing pages. */
const sectionEntries: SearchEntry[] = navSections.map((section) => ({
  id: `page:${section.href}`,
  title: section.label,
  subtitle: section.summary,
  href: section.href,
  kind: "page",
  keywords: pageKeywords[section.href] ?? [],
}));

/** Every destination in the information architecture. */
const navEntries: SearchEntry[] = allNavLinks.map((link) => ({
  id: `page:${link.href}`,
  title: link.label,
  subtitle: link.description ?? link.section.label,
  href: link.href,
  kind: "page",
  keywords: [link.section.label, ...(pageKeywords[link.href] ?? [])],
}));

/** Routes that exist but sit outside the section navigation. */
const extraEntries: SearchEntry[] = [
  {
    id: "page:/contact",
    title: "Contact us",
    subtitle: "Appointments, enquiries and how to reach the practice manager.",
    href: "/contact",
    kind: "page",
    keywords: pageKeywords["/contact"] ?? [],
  },
  {
    id: "page:/",
    title: "Home",
    href: "/",
    kind: "page",
    keywords: pageKeywords["/"] ?? [],
  },
];

/**
 * De-duplicate by href. A cancer type and its nav link describe the same page:
 * the more specific kind wins, but it inherits the other's keywords and any
 * description it lacked, so nothing searchable is lost.
 */
function buildIndex(): SearchEntry[] {
  const byHref = new Map<string, SearchEntry>();

  const all = [
    ...consultantEntries,
    ...cancerEntries,
    ...treatmentEntries,
    ...locationEntries,
    ...sectionEntries,
    ...navEntries,
    ...extraEntries,
  ];

  for (const entry of all) {
    const existing = byHref.get(entry.href);
    if (!existing) {
      byHref.set(entry.href, { ...entry, keywords: [...entry.keywords] });
      continue;
    }
    const winner = kindPriority[entry.kind] < kindPriority[existing.kind] ? entry : existing;
    const loser = winner === entry ? existing : entry;
    byHref.set(entry.href, {
      ...winner,
      subtitle: winner.subtitle ?? loser.subtitle,
      keywords: Array.from(new Set([...winner.keywords, ...loser.keywords])),
    });
  }

  // Money words apply to the whole fees section however deep the page sits.
  byHref.forEach((entry, href) => {
    if (
      href === "/tariffs" ||
      href.startsWith("/tariffs/") ||
      href.startsWith("/tariffs#")
    ) {
      entry.keywords = Array.from(new Set([...entry.keywords, ...feeKeywords]));
    }
  });

  return Array.from(byHref.values());
}

export const searchIndex: SearchEntry[] = buildIndex();

const entryByHref = new Map(searchIndex.map((e) => [e.href, e]));

export function getSearchEntry(href: string): SearchEntry | undefined {
  return entryByHref.get(href);
}

// ── Scoring ──────────────────────────────────────────────────────────────────

interface IndexedEntry {
  entry: SearchEntry;
  title: string;
  titleWords: string[];
  keywords: string[];
  haystack: string;
}

const indexed: IndexedEntry[] = searchIndex.map((entry) => {
  const title = normalise(entry.title);
  const keywords = entry.keywords.map(normalise).filter(Boolean);
  const subtitle = normalise(entry.subtitle ?? "");
  return {
    entry,
    title,
    titleWords: title.split(" ").filter(Boolean),
    keywords,
    haystack: [title, subtitle, keywords.join(" ")].join(" "),
  };
});

/**
 * Tiered scoring: exact title > title starts-with > a word in the title
 * starts-with > keyword match > substring anywhere. Multi-word queries get a
 * final fallback where every term simply has to appear somewhere.
 */
function scoreEntry(item: IndexedEntry, query: string, terms: string[]): number {
  if (item.title === query) return 100;
  if (item.title.startsWith(query)) return 80;
  if (item.titleWords.some((w) => w.startsWith(query))) return 60;

  if (item.keywords.some((k) => k === query)) return 55;
  if (item.keywords.some((k) => k.startsWith(query) || k.split(" ").some((w) => w.startsWith(query)))) {
    return 45;
  }

  if (item.title.includes(query)) return 30;
  if (item.haystack.includes(query)) return 20;

  if (terms.length > 1 && terms.every((t) => item.haystack.includes(t))) return 15;

  return 0;
}

/** Ranked matches for a free-text query. Returns [] for an empty query. */
export function search(query: string, limit = 12): SearchEntry[] {
  const q = normalise(query);
  if (!q) return [];
  const terms = q.split(" ").filter(Boolean);

  const hits: { entry: SearchEntry; score: number }[] = [];
  for (const item of indexed) {
    const score = scoreEntry(item, q, terms);
    if (score > 0) hits.push({ entry: item.entry, score });
  }

  hits.sort(
    (a, b) =>
      b.score - a.score ||
      kindPriority[a.entry.kind] - kindPriority[b.entry.kind] ||
      a.entry.title.localeCompare(b.entry.title),
  );

  return hits.slice(0, limit).map((h) => h.entry);
}

// ── Popular destinations (shown before anything is typed) ────────────────────

const popular: { href: string; title: string }[] = [
  { href: "/consultants", title: "Find a consultant" },
  { href: "/specialities", title: "Cancer types" },
  { href: "/tariffs", title: "Fees & insurance" },
  { href: "/locations", title: "Locations" },
  { href: "/contact", title: "Contact us" },
];

export const popularEntries: SearchEntry[] = popular.map(({ href, title }) => {
  const found = entryByHref.get(href);
  return found
    ? { ...found, title }
    : { id: `popular:${href}`, title, href, kind: "page" as const, keywords: [] };
});
