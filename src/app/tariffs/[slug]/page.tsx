import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import { allNavLinks } from "@/content/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// The Fees & Insurance children, scaffolded from the navigation.
//
// The section also links to /tariffs itself, which is a real page with its own
// route — filtering on the trailing slash keeps it out of the params list so it
// never produces an empty slug here.
//
// No page under this route states a fee, a percentage, an insurer or a
// timescale: those come from the practice, and until they are confirmed the
// scaffold says what the page will cover rather than guessing.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = "/tariffs/";

const slugs = Array.from(
  new Set(
    allNavLinks
      .map((l) => l.href)
      .filter((href) => href.startsWith(PREFIX))
      .map((href) => href.slice(PREFIX.length))
      .filter((slug) => slug.length > 0 && !slug.includes("/")),
  ),
);

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  if (!slugs.includes(params.slug)) return {};
  return sectionPageMeta(`${PREFIX}${params.slug}`);
}

export default function TariffsSectionPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!slugs.includes(params.slug)) notFound();
  return <SectionPage href={`${PREFIX}${params.slug}`} />;
}
