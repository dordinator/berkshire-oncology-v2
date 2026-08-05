import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import PatientsHero from "@/components/sections/patients/PatientsHero";
import PatientPathwayScroll from "@/components/sections/patients/PatientPathwayScroll";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import { faqs } from "@/content/patientHub";

export const metadata: Metadata = pageMeta({
  title: "Patients and families",
  description:
    "A clear place to start with Berkshire Oncology Partnership — for a new diagnosis, a second opinion, private treatment, ongoing care or supporting someone with cancer.",
  path: "/patients",
});

const practicalLinks = [
  {
    eyebrow: "Before you arrive",
    title: "Your first appointment",
    body: "What to bring, how to prepare, and what you can expect to discuss with your consultant.",
    href: "#first-appointment",
    cta: "Prepare for your appointment",
  },
  {
    eyebrow: "Common questions",
    title: "Clear answers",
    body: "Referrals, choosing a consultant, locations, private treatment and working alongside NHS care.",
    href: "#faqs",
    cta: "Read the FAQs",
  },
  {
    eyebrow: "Along the way",
    title: "Resources and support",
    body: "Practical, emotional and financial support for patients, families, friends and carers.",
    href: "#support",
    cta: "Find support",
  },
];

const journey = [
  {
    title: "Talk with a specialist",
    body: "Tell the practice team a little about your situation. They will help identify the consultant best placed to see you.",
  },
  {
    title: "Understand your options",
    body: "Your consultant reviews your history and records, explains what they see, and makes space for your questions.",
  },
  {
    title: "Make a plan",
    body: "The options and recommendation are set out clearly. Nothing proceeds until you understand and agree the next step.",
  },
  {
    title: "Stay supported",
    body: "Treatment and follow-up remain under your consultant’s care, with a clear route back when you need help.",
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

      <PatientsHero />
      <PatientPathwayScroll />

      <section
        id="practical-information"
        className="scroll-mt-24 bg-[#e7edf1] py-24 md:py-32"
      >
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <Reveal>
              <div>
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> Practical
                  information
                </span>
                <p className="mt-8 max-w-sm text-lg leading-relaxed text-ink-muted">
                  Useful detail, kept separate from the bigger decisions so it is
                  easy to find when you need it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <h2 className="font-display text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.97] tracking-[-0.055em] text-ink">
                The details that make the next step easier.
              </h2>
            </Reveal>
          </div>

          <div className="mt-16 grid border-y border-ink/15 md:mt-20 md:grid-cols-3">
            {practicalLinks.map((item, index) => (
              <Reveal key={item.title} delay={index}>
                <Link
                  href={item.href}
                  className="group flex min-h-[300px] flex-col border-b border-ink/15 p-7 transition-colors hover:bg-white/30 md:border-b-0 md:border-r md:p-9 md:last:border-r-0"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                    {item.eyebrow}
                  </span>
                  <h3 className="mt-7 font-display text-3xl font-semibold leading-tight tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                  <span className="mt-auto flex items-center gap-3 pt-8 text-sm font-medium text-ink">
                    {item.cta}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" className="scroll-mt-24 bg-[#f8f8f4] py-24 md:py-32">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
            <Reveal>
              <div>
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> The shape
                  of care
                </span>
                <h2 className="mt-6 max-w-2xl font-display text-[clamp(2.8rem,4.8vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-ink">
                  A clear route, without pretending every journey is the same.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <p className="max-w-xl text-lg leading-relaxed text-ink-muted lg:pb-2">
                These moments often overlap and the order can change. What stays
                consistent is a named consultant, clear decisions, and a route
                back to the team.
              </p>
            </Reveal>
          </div>

          <div className="relative mt-16 grid gap-10 md:mt-24 md:grid-cols-4 md:gap-6">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-2 hidden h-px bg-ink/15 md:block"
            />
            {journey.map((step, index) => (
              <Reveal key={step.title} delay={index}>
                <article className="relative border-t border-ink/15 pt-7 md:border-t-0 md:pt-9">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[-5px] hidden h-3 w-3 rounded-full border-[3px] border-[#f8f8f4] bg-[#8ca49a] shadow-[0_0_0_1px_rgba(6,28,70,0.15)] md:block"
                  />
                  <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
                    {step.body}
                  </p>
                </article>
              </Reveal>
            ))}
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

      <section id="support" className="scroll-mt-24 bg-ink py-24 text-white md:py-32">
        <div className="container-wide">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-24">
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
                  <Link
                    href="/links"
                    className="inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10"
                  >
                    Support organisations <span aria-hidden>→</span>
                  </Link>
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
                <span className="eyebrow">
                  <span aria-hidden className="h-px w-8 bg-ink-muted" /> Your next
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
                  <Button href="/contact" variant="primary">
                    Contact the practice team
                  </Button>
                  <a
                    href={phoneHref}
                    className="rounded-full border border-ink/20 bg-white/25 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-white/45"
                  >
                    {site.contact.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
