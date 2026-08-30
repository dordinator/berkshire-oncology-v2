import Link from "next/link";
import type { LegalDoc } from "@/content/types";
import { breadcrumbLd } from "@/content/seo";
import { policyLinks } from "@/content/site";
import JsonLd from "./JsonLd";

// ─────────────────────────────────────────────────────────────────────────────
// Shared frame for the five legal documents, patterned on how the larger
// oncology providers present theirs rather than on the site's clinical pages:
//
// - HCA Healthcare UK: a full-bleed navy band with a plain title, then the
//   document on white. The band is what tells you you've left the brochure.
// - The US Oncology Network: an "In this section" rail listing the sibling
//   legal documents, and the document's date shown at the top rather than
//   buried in the closing paragraphs.
// - New York Proton Center: one quiet, uninterrupted reading column.
//
// The document body itself is rendered verbatim from content/legal — nothing
// in this component adds to or paraphrases the practice's legal wording. The
// only text this layout contributes is labels: "Legal information", "Last
// updated", "In this section".
//
// No visible breadcrumb or "LEGAL" eyebrow-over-title stack — same call as the
// contact page; the JSON-LD breadcrumb still ships for search.
// ─────────────────────────────────────────────────────────────────────────────

export default function LegalLayout({ doc }: { doc: LegalDoc }) {
  const current = `/${doc.slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: doc.title, path: current },
        ])}
      />

      {/* ── Title band ── ink navy, as HCA do it; same surface as the footer,
          so the site's palest pages open on its darkest brand colour. */}
      <header className="bg-ink pb-14 pt-32 md:pb-20 md:pt-44">
        <div className="container-wide">
          <p className="type-label flex items-center gap-3 text-white/50">
            <span aria-hidden className="h-px w-8 bg-gold/70" />
            Legal information
          </p>
          <h1 className="type-page-hero mt-5 max-w-4xl text-white">
            {doc.title}
          </h1>
          {doc.updated && (
            <p className="type-body mt-6 text-white/60">
              Last updated: <span className="text-white/85">{doc.updated}</span>
            </p>
          )}
        </div>
      </header>

      <section className="bg-canvas py-12 md:py-20">
        <div className="container-wide lg:grid lg:grid-cols-[16rem,1fr] lg:gap-16">
          {/* ── Sibling documents ── a chip row on phones, a sticky rail from
              lg. Both list the same five documents the footer's Policies group
              links to, so a reader can move between them without going back
              down there. */}
          <nav aria-label="Legal documents" className="mb-8 lg:mb-0">
            {/* Phone: horizontal chips. The overflow scrolls inside this strip
                so the page itself never scrolls sideways. */}
            <div className="site-gutter-bleed overflow-x-auto lg:hidden">
              <ul className="flex w-max gap-2 pb-1">
                {policyLinks.map((l) => {
                  const active = l.href === current;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                          active
                            ? "border-ink bg-ink font-medium text-white"
                            : "border-black/10 bg-white/70 text-ink-muted"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Desktop: the US Oncology-style rail. */}
            <div className="hidden lg:sticky lg:top-28 lg:block">
              <p
                aria-hidden
                className="type-label text-ink-muted"
              >
                In this section
              </p>
              <ul className="mt-4 space-y-1 border-l border-black/[0.08]">
                {policyLinks.map((l) => {
                  const active = l.href === current;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`type-body -ml-px block border-l-2 py-1.5 pl-4 transition-colors ${
                          active
                            ? "border-accent font-medium text-ink"
                            : "border-transparent text-ink-muted hover:border-black/20 hover:text-ink"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* ── The document, verbatim ── */}
          <article className="min-w-0 max-w-3xl">
            <div
              className="legal-prose"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </article>
        </div>
      </section>
    </>
  );
}
