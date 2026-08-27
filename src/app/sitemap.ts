import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProfiledConsultantSlugs, getAllSpecialities } from "@/content/queries";
import { allNavRoutes, navSections, scaffoldedSectionRoots } from "@/content/navigation";

// Routes that exist outside the information architecture — the home page, the
// contact page and the legal/policy pages. Everything else is derived, so a new
// destination added to navigation.ts appears here automatically.
const standalonePaths = [
  "",
  "/contact",
  "/privacy",
  "/website-privacy",
  "/cookies",
  "/terms",
  "/accessibility",
];

// The consultant browse pages, which sit alongside /consultants/[slug].
const consultantBrowsePaths = [
  "/consultants/clinical-oncologists",
  "/consultants/medical-oncologists",
  "/consultants/by-treatment",
  "/consultants/profiles",
  "/consultants/choosing-a-consultant",
];

// The eight section landing pages rank above their children. Not all of them
// appear in allNavRoutes() — /specialities, for instance, is a section root
// whose menu links all point at its children — so they are added explicitly.
// Paths that 301 elsewhere and so must not be advertised as destinations. A
// sitemap that lists a redirect asks a crawler to follow a hop for no reason,
// and dilutes the target it lands on. /about is the merged home page now.
const redirectedPaths = new Set(["/about"]);

const sectionRootPaths = [
  ...navSections.map((s) => s.href),
  ...scaffoldedSectionRoots,
].filter((p) => !redirectedPaths.has(p));
const sectionRoots = new Set<string>(sectionRootPaths);

function priorityFor(path: string): number {
  if (path === "") return 1;
  if (sectionRoots.has(path)) return 0.9;
  // "/contact" -> ["", "contact"]; "/treatments/chemotherapy" -> 3 segments.
  return path.split("/").length > 2 ? 0.6 : 0.8;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;

  const consultantPaths = getProfiledConsultantSlugs().map(
    (s) => `/consultants/${s}`,
  );
  const specialityPaths = getAllSpecialities().map((s) => `/specialities/${s.slug}`);

  // These lists overlap heavily — allNavRoutes() already contains /consultants,
  // /tariffs, /links and the browse pages — so the Set does the deduplication.
  //
  // Fragments are stripped first. Some navigation links point at a section
  // within a page rather than a page of its own (palliative radiotherapy lives
  // under /treatments/radiotherapy), and a sitemap entry carrying a #fragment
  // is not a distinct URL — it would just duplicate its parent. Stripping
  // before the Set means the parent is listed exactly once.
  const paths = new Set<string>(
    [
      ...standalonePaths,
      ...sectionRootPaths,
      ...allNavRoutes(),
      ...consultantBrowsePaths,
      ...consultantPaths,
      ...specialityPaths,
    ]
      .map((path) => path.split("#")[0])
      .filter((path) => !redirectedPaths.has(path)),
  );

  // Array.from rather than a spread: tsconfig sets no `target`, so tsc defaults
  // to ES5 and rejects spreading a Set without downlevelIteration.
  return Array.from(paths).map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: priorityFor(path),
  }));
}
