import type { Metadata } from "next";
import { getAllConsultants } from "@/content/queries";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import ConsultantCard from "@/components/site/ConsultantCard";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────────────────
// The partners whose role is Consultant Medical Oncologist, filtered straight
// from the consultant data so the list can never drift from the profiles.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE = "Consultant Medical Oncologist";
const PATH = "/consultants/medical-oncologists";

export const metadata: Metadata = pageMeta({
  title: "Consultant Medical Oncologists",
  description:
    "Consultant medical oncologists at Berkshire Oncology Partnership in Reading — specialists in the drug treatments for cancer, including chemotherapy and immunotherapy.",
  path: PATH,
});

export default function MedicalOncologistsPage() {
  const all = getAllConsultants();
  const list = all.filter((c) => c.role === ROLE);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Consultants", path: "/consultants" },
          { name: "Consultant medical oncologists", path: PATH },
        ])}
      />

      <PageHeader
        eyebrow="Consultants"
        title="Consultant medical oncologists"
        intro="A consultant medical oncologist specialises in the drug treatments for cancer — chemotherapy, immunotherapy, targeted and hormone therapies. Where radiotherapy is also part of a treatment plan, it is planned and given by a clinical oncologist."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Consultants", href: "/consultants" },
          { name: "Consultant medical oncologists" },
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
              Looking for a clinical oncologist?
            </h2>
            <p className="type-body mt-3 max-w-xl text-ink-muted">
              A consultant clinical oncologist treats cancer with radiotherapy as
              well as with drug treatments. If you are not sure which you need,
              browsing by cancer type is usually the quickest route.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/consultants/clinical-oncologists" variant="primary">
                Clinical oncologists
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
