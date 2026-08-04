import type { Metadata } from "next";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import Reveal from "@/components/ui/Reveal";
import { governance } from "@/content/governance";

// ─────────────────────────────────────────────────────────────────────────────
// /about/quality-and-governance
//
// A static route rather than another pass through about/[slug], which renders
// every page in this group as a scaffold with no body. This one now has real
// content, so it needs somewhere to put it. Next resolves a static segment
// ahead of a dynamic one, and [slug] excludes this slug from its
// generateStaticParams so the two cannot both claim the path at build time.
//
// The copy arrived here from the home page, which is where it was written and
// where it was the only copy of it on the site.
// ─────────────────────────────────────────────────────────────────────────────

const HREF = "/about/quality-and-governance";

export const metadata: Metadata = sectionPageMeta(HREF);

export default function QualityAndGovernancePage() {
  return (
    <SectionPage
      href={HREF}
      intro="Trust in a medical organisation should rest on things a patient can check. The following can be checked."
      // Audit and outcomes are deliberately not in this list: nothing in the
      // repo supports a claim about either, so that bullet stays in the outline
      // as work still to do rather than being quietly marked answered.
      omitCovers={[
        "GMC registration and specialist accreditation",
        "Appraisal and revalidation",
        "Multidisciplinary team working",
      ]}
    >
      <Reveal>
        <dl className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {governance.map((item) => (
            <div key={item.t}>
              <dt className="font-display text-xl leading-snug text-ink">
                {item.t}
              </dt>
              <dd className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink/75">
                {item.d}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </SectionPage>
  );
}
