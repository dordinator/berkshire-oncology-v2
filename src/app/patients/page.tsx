import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import { consultants } from "@/content/consultants";
import { journey, faqs } from "@/content/patientHub";
import {
  GraphicModeProvider,
  GraphicModeToggle,
} from "@/components/graphic/GraphicMode";
import GraphicModeFromUrl from "@/components/sections/patients/GraphicModeFromUrl";
import PathwayWaves from "@/components/sections/patients/PathwayWaves";
import PathwayCards from "@/components/sections/patients/PathwayCards";

// ─────────────────────────────────────────────────────────────────────────────
// Patients & Families — the front door.
//
// Someone reaching this page has usually just been told something frightening.
// The page is built around that: five sentences that might be theirs, each one
// opening where it stands, and then the practical answers underneath in the
// order people actually ask for them.
//
// Everything is on this one page on purpose. The child routes under /patients/
// are still outlines rather than copy, and sending a frightened person to an
// outline is worse than not linking at all — so the hub answers for itself and
// only links onward to pages that are genuinely finished.
//
// Copy lives in src/content/patientHub.ts, which carries the approval notes.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Patients and families",
  description:
    "Where to start with Berkshire Oncology Partnership — a new diagnosis, a second opinion, understanding treatment, arranging private care, or supporting someone through cancer.",
  path: "/patients",
});

const sections = [
  { id: "pathways", label: "Where to start" },
  { id: "how-it-works", label: "How private oncology works" },
  { id: "becoming-a-patient", label: "How to become a patient" },
  { id: "first-appointment", label: "Your first appointment" },
  { id: "care-team", label: "Your care team" },
  { id: "support", label: "Treatment support" },
  { id: "faqs", label: "Questions" },
];

const phoneHref = `tel:${site.contact.phone.replace(/\s+/g, "")}`;

function SectionHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <>
      <Reveal>
        <span className="eyebrow">
          <span aria-hidden className="h-px w-8 bg-ink-muted" /> {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={1}>
        <h2 className="heading-md mt-5 max-w-3xl">{title}</h2>
      </Reveal>
      {intro && (
        <Reveal delay={2}>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-muted">
            {intro}
          </p>
        </Reveal>
      )}
    </>
  );
}

export default function PatientsPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <GraphicModeProvider>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Patients & Families", path: "/patients" },
          ]),
          faqLd,
        ]}
      />

      <PageHeader
        eyebrow="Patients & Families"
        title="Wherever you are in this, there is a place to start."
        intro="Whether you have just been given a diagnosis, want a second opinion, are weighing up private care or are supporting someone you love, this page is the place to begin. Choose the line below that sounds most like you."
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Patients & Families" }]}
      >
        {/* On this page — so nobody has to scroll a long page to find the one
            practical answer they came for. */}
        <nav aria-label="On this page" className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-ink/10 bg-white/60 px-4 py-2 text-sm text-ink-muted backdrop-blur-sm transition-colors hover:border-accent/30 hover:bg-white hover:text-ink"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </PageHeader>

      {/* ── 1. The five ways in ───────────────────────────────────────────── */}
      <section
        id="pathways"
        className="relative scroll-mt-24 overflow-hidden py-20 md:py-28"
      >
        <PathwayWaves />
        <div className="container-wide relative z-10">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Where to start"
              title="Which of these sounds most like you?"
              intro="Open the one that fits. Each gives you the first practical steps and who to speak to — you do not need to read the others."
            />
          </div>
          <div className="mt-12 md:mt-16">
            <PathwayCards />
          </div>
        </div>
      </section>

      {/* ── 2. How private oncology works ─────────────────────────────────── */}
      <section
        id="how-it-works"
        className="scroll-mt-24 border-t border-black/[0.05] bg-canvas-soft/60 py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="How private oncology works"
              title="What being seen privately actually means."
              intro="Private oncology is not a different kind of medicine. It is the same consultants, working to the same standards, with more control over when and where you are seen."
            />

            <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-ink/85">
              <p>
                Berkshire Oncology Partnership is a partnership of ten consultant
                oncologists based in Reading. Every partner also holds an NHS
                consultant post at the Royal Berkshire Hospital, and all partners
                are appraised annually.
              </p>
              <p>
                Your care is led by a named consultant. You see that consultant
                at your appointments, and they remain responsible for your
                treatment plan and your follow-up rather than handing you between
                clinics.
              </p>
              <p>
                Treatment happens at the private hospitals and cancer centres
                where our consultants practise, chosen to suit the treatment
                itself and, where possible, your convenience.
              </p>
              <p>
                Care can be funded through private medical insurance or paid for
                directly. Both routes are set out in full on the tariffs pages.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/locations" variant="ghost">
                Where we practise
              </Button>
              <Button href="/tariffs" variant="ghost">
                Tariffs and fees
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. How to become a patient + the journey ──────────────────────── */}
      <section
        id="becoming-a-patient"
        className="scroll-mt-24 py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="How to become a patient"
              title="From your first enquiry to follow-up."
              intro="The route through is the same for everyone, whether you are insured or funding treatment yourself. This is what happens, in order."
            />
          </div>

          {/* The journey. A hairline runs down the left of the steps — the same
              gesture as the branching lines behind the pathway cards, holding
              the six stages together as one route rather than six boxes. */}
          <ol className="relative mx-auto mt-14 max-w-3xl md:mt-16">
            <span
              aria-hidden
              className="absolute left-[19px] top-2 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-accent/25 via-accent/15 to-transparent sm:block"
            />
            {journey.map((step, i) => (
              <li key={step.n}>
                <Reveal delay={i % 3}>
                  <div className="relative flex gap-5 pb-10 sm:gap-7 md:pb-12">
                    <span
                      aria-hidden
                      className="relative z-10 mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-accent/20 bg-white text-xs font-medium tracking-wide text-accent"
                    >
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-display text-xl leading-snug text-ink md:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted md:text-base">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal>
            <div className="mx-auto max-w-3xl">
              <Button href="/contact" variant="primary">
                Make an enquiry
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4. First appointment ──────────────────────────────────────────── */}
      <section
        id="first-appointment"
        className="scroll-mt-24 border-t border-black/[0.05] bg-canvas-soft/60 py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="What to expect"
              title="Your first appointment."
              intro="Most people arrive not knowing what they are allowed to ask. You are allowed to ask anything."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  h: "Bring what you have",
                  p: "Scans, reports, clinic letters and a list of your current medication. If you do not have them, come anyway — your consultant can request them.",
                },
                {
                  h: "Bring someone with you",
                  p: "A second person hears things you will not, and remembers questions you meant to ask. Most people find it helps.",
                },
                {
                  h: "Write your questions down",
                  p: "Beforehand, at home, when you are calm. Take the list in with you and work through it.",
                },
                {
                  h: "You will not be rushed",
                  p: "Your consultant will go through your history, examine you where appropriate, and explain how they see your situation before anything is decided.",
                },
              ].map((item, i) => (
                <Reveal key={item.h} delay={i % 2}>
                  <div className="card-soft h-full p-6 md:p-7">
                    <h3 className="font-display text-lg text-ink">{item.h}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                      {item.p}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-8 text-[15px] leading-relaxed text-ink-muted">
                If there is anything you need in order to attend — step-free
                access, parking close to the entrance, an interpreter — tell the
                practice team when you book and they will arrange it.{" "}
                <Link
                  href="/locations/parking-and-accessibility"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Parking and accessibility
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 5. Your care team ─────────────────────────────────────────────── */}
      <section id="care-team" className="scroll-mt-24 py-20 md:py-28">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Your care team"
              title="The ten consultants who make up the partnership."
              intro="Your care is led by one of them — the consultant whose specialism matches your diagnosis. These are their faces, so you know who you are coming to see."
            />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:mt-16 lg:grid-cols-5">
            {consultants.map((c, i) => (
              <Reveal key={c.slug} delay={i % 5}>
                <Link href={`/consultants/${c.slug}`} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 to-lilac/20">
                    {c.photo && (
                      <Image
                        src={c.photo}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-base leading-snug text-ink transition-colors group-hover:text-accent">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink-muted">
                    {c.shortRole ?? c.role}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button href="/consultants/by-cancer-type" variant="ghost">
                Find a consultant by cancer type
              </Button>
              <Button href="/consultants" variant="ghost">
                All consultants
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6. Treatment support and side effects ─────────────────────────── */}
      <section
        id="support"
        className="scroll-mt-24 border-t border-black/[0.05] bg-canvas-soft/60 py-20 md:py-28"
      >
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Treatment support and side effects"
              title="The part that happens between appointments."
              intro="Treatment affects far more than the hours you spend in clinic. Support with the rest of it is part of your care, not an extra."
            />

            <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-ink/85">
              <p>
                Side effects vary enormously between treatments and between
                people. Your consultant will talk through what to expect from
                your particular treatment, what can be done about it, and — the
                part worth writing down — who to contact and when.
              </p>
              <p>
                Alongside that sits the practical and emotional support: help
                with fatigue, appearance and sleep, counselling for you and for
                the people around you, financial and benefits advice, and the
                national organisations we work alongside.
              </p>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/resources" variant="ghost">
                Patient resources and support
              </Button>
              <Button href="/links" variant="ghost">
                Support organisations
              </Button>
            </div>

            {/* Anyone unwell tonight needs a number, not a page. */}
            <Reveal>
              <div className="card-soft mt-10 border-l-2 border-l-accent/40 p-6 md:p-7">
                <h3 className="font-display text-lg text-ink">
                  If you are unwell during treatment
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                  Follow the instructions given to you by the team delivering
                  your treatment, and use the contact number they gave you. If
                  you cannot find it, call the practice on{" "}
                  <a
                    href={phoneHref}
                    className="font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {site.contact.phone}
                  </a>
                  . In an emergency, call 999.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 7. FAQs ───────────────────────────────────────────────────────── */}
      <section id="faqs" className="scroll-mt-24 py-20 md:py-28">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Questions"
              title="Frequently asked questions."
            />

            <div className="mt-10 divide-y divide-black/[0.07] border-y border-black/[0.07]">
              {faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-accent md:text-xl">
                      {f.q}
                    </h3>
                    <span
                      aria-hidden
                      className="mt-1 flex h-7 w-7 flex-none items-center justify-center rounded-full border border-ink/10 text-ink-muted transition-all duration-300 group-open:rotate-45 group-open:border-accent/30 group-open:text-accent"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 3v10M3 8h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-7 text-[15px] leading-relaxed text-ink-muted md:text-base">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            <Reveal>
              <p className="mt-8 text-[15px] leading-relaxed text-ink-muted">
                If your question is not here, ask it directly — the practice team
                would far rather you called than guessed.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 8. Closing actions ────────────────────────────────────────────── */}
      <section className="border-t border-black/[0.05] bg-canvas-soft/60 py-20 md:py-28">
        <div className="container-wide">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="heading-md max-w-2xl">
                Three ways to take the next step.
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
              {[
                {
                  h: "Find a consultant",
                  p: "Search by cancer type or by treatment to find the consultant who specialises in your diagnosis.",
                  href: "/consultants/by-cancer-type",
                  cta: "Find a consultant",
                },
                {
                  h: "Make an enquiry",
                  p: "Send us your details and a short note about your situation, and the practice team will come back to you.",
                  href: "/contact",
                  cta: "Contact the practice",
                },
                {
                  h: "Call the practice team",
                  p: `Speak to ${site.contact.practiceManager}, our practice manager, if you would rather talk it through with someone.`,
                  href: phoneHref,
                  cta: site.contact.phone,
                  external: true,
                },
              ].map((card, i) => (
                <Reveal key={card.h} delay={i}>
                  <div className="card-soft flex h-full flex-col p-7 md:p-8">
                    <h3 className="font-display text-xl text-ink">{card.h}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                      {card.p}
                    </p>
                    <div className="mt-auto pt-7">
                      {card.external ? (
                        <a
                          href={card.href}
                          className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-ink"
                        >
                          {card.cta}
                        </a>
                      ) : (
                        <Link
                          href={card.href}
                          className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-ink"
                        >
                          {card.cta}
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M3 8h10M9 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Kept from the previous page — the warmest thing on it. */}
            <Reveal>
              <div className="card-soft mt-8 p-6 md:p-8">
                <h2 className="font-display text-xl text-ink md:text-2xl">
                  Not sure where to start?
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
                  You do not need to know the right question. Our practice
                  manager, {site.contact.practiceManager}, can talk things
                  through and arrange an appointment with the right consultant.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button href="/contact" variant="primary">
                    Contact the practice
                  </Button>
                  <a
                    href={phoneHref}
                    className="rounded-full border border-ink/15 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
                  >
                    {site.contact.phone}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/*
        The shared graphic toggle, parked out of the reading column and faint
        until touched. Nobody arriving here frightened should feel there is a
        setting they are expected to have an opinion about — but the partnership
        needs to see all three levels to choose one, and the choice persists
        across the cancer pages that use the same context.
      */}
      <GraphicModeFromUrl />
      <div className="pointer-events-none fixed bottom-4 right-4 z-[120] opacity-40 transition-opacity duration-300 focus-within:opacity-100 hover:opacity-100 md:bottom-5 md:right-5">
        <GraphicModeToggle className="pointer-events-auto drop-shadow-[0_16px_40px_rgba(6,28,70,0.28)]" />
      </div>
    </GraphicModeProvider>
  );
}
