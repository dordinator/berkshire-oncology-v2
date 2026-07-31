import type { Metadata } from "next";
import Link from "next/link";
import SectionPage, { sectionPageMeta } from "@/components/site/SectionPage";
import Reveal from "@/components/ui/Reveal";

const PATH = "/consultants/choosing-a-consultant";

export const metadata: Metadata = sectionPageMeta(PATH);

// The two definitions below are the only clinical statements on this page, and
// they match the wording used on the two role pages exactly. Everything else
// this page will cover is still being written with the consultants.
const roles = [
  {
    title: "Consultant clinical oncologist",
    body: "A consultant clinical oncologist treats cancer with radiotherapy as well as with drug treatments such as chemotherapy. Which of those is used, and in what order, depends on the type of cancer and on the plan agreed with you.",
    href: "/consultants/clinical-oncologists",
    cta: "See our clinical oncologists",
  },
  {
    title: "Consultant medical oncologist",
    body: "A consultant medical oncologist specialises in the drug treatments for cancer — chemotherapy, immunotherapy, targeted and hormone therapies. Where radiotherapy is also part of a treatment plan, it is planned and given by a clinical oncologist.",
    href: "/consultants/medical-oncologists",
    cta: "See our medical oncologists",
  },
];

export default function ChoosingAConsultantPage() {
  return (
    <SectionPage
      href={PATH}
      // The first bullet of the outline is answered in full below, so it is not
      // also listed as something still to be written.
      omitCovers={[
        "Clinical oncologist or medical oncologist — what the difference means for you",
      ]}
    >
      <Reveal>
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          Clinical oncologist or medical oncologist?
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
          Both are consultant oncologists. The difference is in the treatments
          they deliver.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {roles.map((r) => (
            <div
              key={r.href}
              className="flex flex-col rounded-3xl border border-black/[0.06] bg-white p-6"
            >
              <h3 className="font-display text-xl text-ink">{r.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/80">
                {r.body}
              </p>
              <Link
                href={r.href}
                className="group mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
              >
                {r.cta}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </SectionPage>
  );
}
