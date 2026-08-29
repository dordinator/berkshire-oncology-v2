import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import EditablePageText from "@/components/editing/EditablePageText";
import PatientsHero from "@/components/sections/patients/PatientsHero";
import PatientPathwayScroll from "@/components/sections/patients/PatientPathwayScroll";
// The scroll choreography built for /resources — markup-free and generic, it
// wires whatever data-fx hooks it finds. Mounted here WITHOUT IntensityStage,
// so it runs at its default level 2 "Flowing": everything scrubbed, nothing
// hijacked, and no review switcher on a patient-facing page.
import PageMotion from "@/components/sections/resources/PageMotion";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { allNavLinks } from "@/content/navigation";
import { site } from "@/content/site";
import { faqs } from "@/content/patientHub";

export const metadata: Metadata = pageMeta({
  title: "Patients and families",
  description:
    "A clear place to start with Berkshire Oncology Partnership — for a new diagnosis, a second opinion, private treatment, ongoing care or supporting someone with cancer.",
  path: "/patients",
});

// Rendered by the practical card. `body`/`cta` from the old three-column grid
// were dropped with it — the card names the destination, the destination
// explains itself.
const practicalLinks = [
  {
    eyebrow: "Before you arrive",
    title: "Your first appointment",
    href: "#first-appointment",
  },
  {
    eyebrow: "Common questions",
    title: "Clear answers",
    href: "#faqs",
  },
  {
    eyebrow: "Along the way",
    title: "Resources and support",
    href: "#support",
  },
];

const appointmentPoints = [
  {
    title: "Bring what you have",
    body: "Scans, reports, clinic letters and a list of your current medication. If you do not have them, come anyway.",
  },
  {
    title: "Bring someone you trust",
    body: "A second person can hear things you miss, remember questions, and help you reflect afterwards.",
  },
  {
    title: "Write your questions down",
    body: "Make a list at home, when you are calm, and take it into the appointment with you.",
  },
  {
    title: "Expect a conversation",
    body: "Your consultant will explain how they see your situation before any decision is made.",
  },
];

const phoneHref = `tel:${site.contact.phone.replace(/\s+/g, "")}`;

// The support section's expandable rows — read from the IA rather than
// written here, so the titles, descriptions and destinations stay in step
// with the resources pages they open onto.
const supportTopics = [
  "/resources/managing-side-effects",
  "/resources/emotional-and-practical-support",
]
  .map((href) => allNavLinks.find((link) => link.href === href))
  .filter((link): link is NonNullable<typeof link> => Boolean(link));

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
      <EditablePageText storageKey="patients-page-v1">
        <PatientsHero />
        <PatientPathwayScroll />

      {/* The hero's composition, mirrored: panel + photograph + question card
          on the LEFT, text on the RIGHT, and the three practical destinations
          carried by the card the way the hero's five routes are — the two
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
              {/* The home page's chapter gold — the hero's panel is sage, so
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
                className="absolute bottom-3 right-0 w-[82%] rounded-[2rem] border border-ink/10 bg-[#fbfaf5] p-3 shadow-[0_30px_80px_-35px_rgba(6,28,70,0.35)] sm:p-4 lg:w-[76%]"
              >
                <div className="flex items-center justify-between border-b border-ink/10 px-2 pb-3">
                  <p className="font-display text-lg">What would help right now?</p>
                  <span className="hidden text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:block">
                    Three places
                  </span>
                </div>

                <div className="divide-y divide-ink/10">
                  {practicalLinks.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 px-2 py-3 text-sm text-ink transition-colors hover:text-accent"
                    >
                      <span
                        aria-hidden
                        className={`h-2.5 w-2.5 flex-none rounded-full ${
                          index === 0 ? "bg-[#8ca49a]" : "border border-ink/20"
                        }`}
                      />
                      {/* Eyebrow at every width — "Clear answers" alone is not
                          a self-describing link name, least of all on the
                          phones where most of this site's traffic lives. */}
                      <span className="min-w-0 flex-1">
                        <span className="block">{item.title}</span>
                        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                          {item.eyebrow}
                        </span>
                      </span>
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
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> Practical
                  information
                </span>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-6 max-w-xl font-display text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.97] tracking-[-0.055em] text-ink">
                  The details that make the next step easier.
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
                  Useful detail, kept separate from the bigger decisions so it is
                  easy to find when you need it.
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
          <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
            <Reveal>
              <div>
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> Your first
                  appointment
                </span>
                <h2 className="mt-7 max-w-xl font-display text-[clamp(3rem,5.3vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
                  Bring what you have. Bring someone you trust.
                </h2>
                <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-muted">
                  Most people arrive with questions and some uncertainty. That
                  is a completely reasonable place to begin.
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
                tell the practice team when you book. See our{" "}
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
        id="support"
        className="relative scroll-mt-24 overflow-clip bg-ink py-24 text-white md:py-32"
      >
        <div className="container-wide relative">
          {/* items-start, not items-end: with the rows in play the right
              column grew taller than the heading, and end-alignment left it
              floating high above the eyebrow. Both columns now open on the
              same line — rule level with eyebrow — and with two rows their
              feet land close together too. */}
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-24">
            <Reveal>
              <div>
                <span className="eyebrow text-white/55">
                  <span aria-hidden className="h-px w-8 bg-white/35" /> Patients,
                  families and carers
                </span>
                <h2 className="mt-7 max-w-4xl font-display text-[clamp(3rem,5.6vw,6.2rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
                  Good care includes the part that happens between appointments.
                </h2>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="border-t border-white/20 pt-7">
                <p className="text-lg leading-relaxed text-white/70">
                  Find help with side effects, fatigue and sleep, emotional
                  wellbeing, financial questions, caring responsibilities and
                  the practical impact of treatment.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/resources" variant="light">
                    Patient resources and support
                  </Button>
                  {/* focus-visible mirrors hover: rounded-full opts this out
                      of the global underline rule, so without these the
                      keyboard indicator was nothing at all. */}
                  <Link
                    href="/links"
                    className="inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:border-white/60 focus-visible:bg-white/10"
                  >
                    Support organisations <span aria-hidden>→</span>
                  </Link>
                </div>

                {/* The four support areas as expandable rows, read from the
                    IA — each opens to its own description and on to its page.
                    The + is the FAQ section's device in this room's material,
                    and the stack fills the column the glass panels used to
                    only decorate. */}
                <div className="mt-10 space-y-3">
                  {supportTopics.map((topic) => (
                    <details
                      key={topic.href}
                      className="group rounded-2xl border border-white/10 bg-white/[0.06]"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 [&::-webkit-details-marker]:hidden">
                        <span className="font-display text-lg font-semibold leading-snug text-white md:text-xl">
                          {topic.label}
                        </span>
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-5 w-5 flex-none text-white/60 transition-transform duration-300 group-open:rotate-45"
                        >
                          <path
                            d="M8 2v12M2 8h12"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </summary>
                      <div className="px-6 pb-5">
                        {topic.description && (
                          <p className="max-w-md text-[15px] leading-relaxed text-white/65">
                            {topic.description}
                          </p>
                        )}
                        <Link
                          href={topic.href}
                          aria-label={`Read more: ${topic.label}`}
                          className="group/link mt-3 inline-flex items-center gap-2 text-sm font-medium text-white"
                        >
                          Read more
                          <span
                            aria-hidden
                            className="transition-transform group-hover/link:translate-x-1"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="faqs" className="scroll-mt-24 bg-white py-24 md:py-32">
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <Reveal>
              <div>
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> Questions
                </span>
                <h2 className="mt-7 font-display text-[clamp(3rem,4.7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink">
                  The things people ask us most often.
                </h2>
                <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
                  If your question is not here, the practice team would rather
                  you asked than guessed.
                </p>
              </div>
            </Reveal>

            <div className="border-t border-ink/15">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-ink/15">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-8 py-7 [&::-webkit-details-marker]:hidden">
                    <h3 className="max-w-2xl font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-accent md:text-2xl">
                      {faq.q}
                    </h3>
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full border border-ink/15 text-lg text-ink-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-8 text-[15px] leading-relaxed text-ink-muted md:text-base">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#c8d6cf] py-24 md:py-28">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-24">
            <Reveal>
              <div>
                {/* ink-soft override: the shared eyebrow grey measures 3.72:1
                    on this sage band — under the AA floor at 12px. */}
                <span className="eyebrow text-ink-soft">
                  <span aria-hidden className="h-px w-8 bg-ink-soft" /> Your next
                  step
                </span>
                <h2 className="mt-7 max-w-4xl font-display text-[clamp(3.2rem,5.9vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-ink">
                  Not sure where to begin?
                </h2>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="border-t border-ink/20 pt-7">
                <p className="text-lg leading-relaxed text-ink/70">
                  You do not need to know the right question. The practice team
                  can talk things through and help you find the right consultant.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/contact#guidance" variant="primary">
                    Contact the practice team
                  </Button>
                  <a
                    href={phoneHref}
                    className="rounded-full border border-ink/20 bg-white/25 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-white/45 focus-visible:border-ink/45 focus-visible:bg-white/45"
                  >
                    {site.contact.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      </EditablePageText>
    </>
  );
}
