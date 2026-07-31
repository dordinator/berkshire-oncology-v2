import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import { allNavLinks, getNavLink } from "@/content/navigation";

// Every page under /patients/ is driven by the information architecture in
// src/content/navigation.ts — add a link there and the route appears here.
// Links that sit in this section but point elsewhere (e.g. "Patient resources
// and support" → /resources) are filtered out by the href prefix.
const PREFIX = "/patients/";

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

export default function PatientsSectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const href = `${PREFIX}${params.slug}`;
  if (!getNavLink(href)) notFound();

  // This page promises "who to contact about side effects, and when to call
  // urgently" and the copy isn't written yet. Until it is, the page must still
  // give someone who is unwell tonight somewhere to go.
  return (
    <SectionPage href={href} urgent={params.slug === "receiving-treatment"} />
  );
}
