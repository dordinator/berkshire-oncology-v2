import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import { allNavLinks, getNavLink } from "@/content/navigation";

// Every page under /resources/ is driven by the information architecture in
// src/content/navigation.ts. Links in this section that point elsewhere
// (e.g. "External organisations" → /links) are filtered out by the href prefix.
const PREFIX = "/resources/";

function slugs(): string[] {
  const found = new Set<string>();
  for (const link of allNavLinks) {
    if (!link.href.startsWith(PREFIX)) continue;
    const slug = link.href.slice(PREFIX.length);
    if (slug && !slug.includes("/")) found.add(slug);
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

export default function ResourcesSectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const href = `${PREFIX}${params.slug}`;
  if (!getNavLink(href)) notFound();

  // "Warning signs that need urgent attention" and "who to contact, day and
  // night" are promised on this page. Until the copy exists, the standing
  // urgent route stands in for it rather than leaving an office landline.
  return (
    <SectionPage href={href} urgent={params.slug === "managing-side-effects"} />
  );
}
