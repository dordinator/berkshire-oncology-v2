import type { Metadata } from "next";
import { getAllConsultants } from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import ConsultantCard from "@/components/site/ConsultantCard";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// The partners whose role is Consultant Clinical Oncologist, filtered straight
// from the consultant data so the list can never drift from the profiles.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE = "Consultant Clinical Oncologist";
const PATH = "/consultants/clinical-oncologists";

export const metadata: Metadata = pageMeta({
  title: "Consultant Clinical Oncologists",
  description:
    "Consultant clinical oncologists at Berkshire Oncology Partnership in Reading — specialists who treat cancer with radiotherapy as well as with drug treatments.",
  path: PATH,
});

export default function ClinicalOncologistsPage() {
  const all = getAllConsultants();
  const list = all.filter((c) => c.role === ROLE);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
          { name: "Consultant clinical oncologists", path: PATH },
        ])}
      />

      <PageHeader
        eyebrow="Consultants"
        title="Consultant clinical oncologists"
        intro="A consultant clinical oncologist treats cancer with radiotherapy as well as with drug treatments such as chemotherapy. Which of those is used, and in what order, depends on the type of cancer and on the plan agreed with you."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Consultants", href: "/consultants" },
          { name: "Consultant clinical oncologists" },
        ]}
      />

      <section className="container-wide pb-24 pt-14 md:pb-32 md:pt-20">
        <Reveal>
          <p className="eyebrow">
            <span className="h-px w-8 bg-ink-muted" />
            {list.length} of our {all.length} consultants
          </p>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {list.map((c, i) => (
            <Reveal key={c.slug} delay={i % 3}>
              <ConsultantCard consultant={c} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="card-soft mt-14 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              Looking for a medical oncologist?
            </h2>
            <p className="type-body mt-3 max-w-xl text-ink-muted">
              A consultant medical oncologist specialises in the drug treatments
              for cancer. If you are not sure which you need, browsing by cancer
              type is usually the quickest route.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/consultants/medical-oncologists" variant="primary">
                Medical oncologists
              </Button>
              <Button href="/specialities" variant="ghost">
                Browse by cancer type
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
