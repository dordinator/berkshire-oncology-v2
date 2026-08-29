import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import PatientsHero from "@/components/sections/patients/PatientsHero";
import PatientPathwayScroll from "@/components/sections/patients/PatientPathwayScroll";
// The scroll choreography built for /resources is markup-free and generic. It
// wires whatever data-fx hooks it finds. Mounted here WITHOUT IntensityStage,
// so it runs at its default level 2 "Flowing": everything scrubbed, nothing
// hijacked, and no review switcher on a patient-facing page.
import PageMotion from "@/components/sections/resources/PageMotion";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { faqs } from "@/content/patientHub";

export const metadata: Metadata = pageMeta({
  title: "Patients and families",
  description:
    "A clear place to start with Berkshire Oncology Partnership for a new diagnosis, a second opinion, private treatment, ongoing care or supporting someone with cancer.",
  path: "/patients",
});

// Rendered by the practical card. `body`/`cta` from the old three-column grid
// were dropped with it. The card names the destination, and the destination
// explains itself.
const practicalLinks = [
  {
    title: "Your first appointment",
    href: "#first-appointment",
  },
  {
    title: "Frequently asked questions",
    href: "#faqs",
  },
  {
    title: "Resources and support",
    href: "/resources",
  },
];

const appointmentPoints = [
  {
    title: "Clinical information",
    body: "Bring any clinic letters, scan reports or test results you already have.",
  },
  {
    title: "Current medicines",
    body: "Bring an up-to-date list, including prescribed medicines, vitamins and supplements.",
  },
  {
    title: "Questions to ask",
    body: "Write down what you would like the consultant to explain or discuss.",
  },
  {
    title: "Someone you trust",
    body: "If you would like to, bring a friend or relative to listen, take notes and help you remember questions.",
  },
];

export default function PatientsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Patients & Families", path: "/patients" },
          ]),
          faqLd,
        ]}
      />

      <PageMotion />
      <PatientsHero />
      <PatientPathwayScroll />

      {/* The hero's composition, mirrored: panel + photograph + question card
          on the LEFT, text on the RIGHT, and the three practical destinations
          carried by the card the way the hero's five routes are. The two
          bookend compositions rhyme without repeating. data-drift-band scopes
          the panel's scrubbed travel to this section. */}
      <section
        id="practical-information"
        data-drift-band
        className="scroll-mt-24 overflow-clip bg-[#e7edf1] py-24 md:py-32"
      >
        <div className="container-wide">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <div className="relative order-2 min-h-[560px] py-6 lg:order-1 lg:min-h-[660px]">
              {/* The home page's chapter gold. The hero's panel is sage, so
                  the two bookend compositions each get their own colour. */}
              <div
                aria-hidden
                data-fx="drift"
                data-drift="0.5"
                className="absolute bottom-[8%] right-[4%] top-[2%] w-[47%] rounded-[2.5rem] bg-[#f3dca2]"
              />

              <div
                data-parallax-frame
                className="absolute left-0 top-[7%] h-[69%] w-[64%] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-white shadow-[0_35px_90px_-40px_rgba(6,28,70,0.35)]"
              >
                {/* Taller than its frame so the parallax never shows an edge. */}
                <div
                  data-fx="parallax"
                  className="absolute inset-x-0 -top-[16%] h-[132%]"
                >
                  <Image
                    src="/home/approach.jpg"
                    alt="A consultant writing up notes after a clinic"
                    fill
                    sizes="(max-width: 1024px) 68vw, 38vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div
                data-fx="rise"
                className="absolute bottom-4 right-0 w-[92%] rounded-[2.25rem] border border-ink/10 bg-[#fbfaf5] p-4 shadow-[0_30px_80px_-35px_rgba(6,28,70,0.35)] sm:bottom-5 sm:p-5 lg:w-[88%]"
              >
                <div className="flex items-center border-b border-ink/10 px-3 pb-4">
                  <p className="font-display text-xl">What would help right now?</p>
                </div>

                <div className="divide-y divide-ink/10">
                  {practicalLinks.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-4 px-3 py-4 text-[15px] text-ink transition-colors hover:text-accent"
                    >
                      <span
                        aria-hidden
                        className={`h-3 w-3 flex-none rounded-full ${
                          index === 0 ? "bg-[#8ca49a]" : "border border-ink/20"
                        }`}
                      />
                      <span className="min-w-0 flex-1">{item.title}</span>
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Reveal>
                <h2 className="max-w-xl font-display text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.97] tracking-[-0.055em] text-ink">
                  Find the practical information you need.
                </h2>
              </Reveal>
              <Reveal delay={1}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
                  Prepare for your first appointment, read answers to common
                  questions or find support during treatment and beyond.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section
        id="first-appointment"
        className="scroll-mt-24 bg-[#f0ece2] py-24 md:py-32"
      >
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-24">
            <Reveal>
              <div>
                <h2 className="max-w-xl font-display text-[clamp(3rem,5.3vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
                  How to prepare for your first appointment.
                </h2>
                <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-muted">
                  Bring the information you already have and the questions you
                  want to ask. You can also bring someone you trust.
                </p>
              </div>
            </Reveal>

            <div className="border-t border-ink/20">
              {appointmentPoints.map((item, index) => (
                <Reveal key={item.title} delay={index % 2}>
                  <article className="grid gap-3 border-b border-ink/20 py-8 sm:grid-cols-[0.8fr_1.2fr] sm:gap-8 md:py-10">
                    <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </article>
                </Reveal>
              ))}
              <p className="pt-7 text-sm leading-relaxed text-ink-muted">
                If you need step-free access, nearby parking or an interpreter,
                tell the practice team when you book. Read our{" "}
                <Link
                  href="/locations/parking-and-accessibility"
                  className="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  parking and accessibility information
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="faqs"
        aria-labelledby="patients-faq-heading"
        className="flex min-h-svh scroll-mt-24 items-center bg-white py-24 md:py-28"
      >
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-20 xl:gap-28">
            <Reveal>
              <div className="text-center">
                <h2
                  id="patients-faq-heading"
                  className="mx-auto max-w-[11ch] font-display text-[clamp(2.75rem,4.7vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-ink"
                >
                  The things people ask us most often.
                </h2>
                <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-ink/75 sm:text-[17px]">
                  If your question is not here, the practice team would rather
                  you asked than guessed.
                </p>
              </div>
            </Reveal>

            <div className="overflow-hidden rounded-[1.75rem] border border-ink/[0.09] bg-white px-5 shadow-[0_24px_80px_-48px_rgba(6,28,70,0.34)] sm:rounded-[2rem] sm:px-8">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  name="patients-faq"
                  className="group border-b border-ink/[0.09] last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden sm:py-6">
                    <h3 className="max-w-2xl font-display text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent sm:text-xl">
                      {faq.q}
                    </h3>
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 text-xl font-normal text-ink transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="max-w-2xl pb-6 pr-12">
                    <p className="text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
                      {faq.a}
                    </p>
                    {faq.link && (
                      <Link
                        href={faq.link.href}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        {faq.link.label}
                        <span aria-hidden>→</span>
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
