import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import { allNavLinks, getNavLink } from "@/content/navigation";

// Every page under /about/ is driven by the information architecture in
// src/content/navigation.ts. Links in this section that point elsewhere
// (e.g. "Our consultants" → /consultants) are filtered out by the href prefix.
const PREFIX = "/about/";

/**
 * Slugs that have their own static route because they carry real content, and
 * so must not also be generated here — two routes claiming one path is a build
 * error, and the static one is the one that should win.
 */
const HAS_OWN_ROUTE = new Set(["quality-and-governance"]);

function slugs(): string[] {
  const found = new Set<string>();
  for (const link of allNavLinks) {
    if (!link.href.startsWith(PREFIX)) continue;
    const slug = link.href.slice(PREFIX.length);
    if (slug && !slug.includes("/") && !HAS_OWN_ROUTE.has(slug)) found.add(slug);
  }
  return Array.from(found);
}

export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const href = `${PREFIX}${params.slug}`;
  if (!getNavLink(href)) return {};
  return sectionPageMeta(href);
}

export default function AboutSectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const href = `${PREFIX}${params.slug}`;
  if (!getNavLink(href)) notFound();

  return <SectionPage href={href} />;
}
