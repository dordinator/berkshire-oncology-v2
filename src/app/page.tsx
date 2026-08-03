import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import HomeHero from "@/components/sections/home/HomeHero";
import PartnershipIntro from "@/components/sections/home/PartnershipIntro";
import ProofImage from "@/components/sections/home/ProofImage";
import PartnershipField from "@/components/sections/about/PartnershipField";
import { pageMeta, organizationLd } from "@/content/seo";
import { site } from "@/content/site";
import ConsultantScroller from "@/components/sections/home/ConsultantScroller";
import {
  getAllConsultants,
  getSpecialitiesForConsultant,
} from "@/content/queries";

// ─────────────────────────────────────────────────────────────────────────────
// Home — which is also About.
//
// On a ten-consultant practice these were always going to be the same page: a
// separate "about us" would only have repeated the home page in a quieter
// voice. /about now 301s here (see next.config.mjs) and this is the canonical
// URL. The navigation still offers "About Us"; it lands here.
//
// The eight sections mirror the About group in src/content/navigation.ts
// exactly, so the page and the menu describe the same thing in the same order.
// Two earlier sections — the cancer-type list and the treatment locations —
// are folded into the opening section's disclosure rows rather than dropped,
// since both still matter to a patient arriving cold.
//
// Two rules govern the copy.
//
// 1. Every figure is counted from the content modules, never typed by hand, so
//    it cannot drift when an eleventh consultant joins or a location changes.
//
// 2. Nothing practice-specific is asserted unless it is already in the repo.
//    Where the practice has to supply the substance — how the partnership was
//    founded, what patients actually say, how quickly referrals are answered,
//    what roles are open — the page says what the section will cover and routes
//    the reader to a human, exactly as the scaffolded pages under /about/* do.
//    General facts about UK medical regulation (the Specialist Register, annual
//    appraisal, five-yearly revalidation, CQC registration of independent
//    hospitals) are true of every licensed consultant in the country and are
//    stated as such — never dressed up as something particular to this
//    partnership.
// ─────────────────────────────────────────────────────────────────────────────

const consultants = getAllConsultants();

/** Sub-speciality names per consultant, resolved once for the client list. */
const specialitiesBySlug: Record<string, string[]> = Object.fromEntries(
  consultants.map((c) => [
    c.slug,
    getSpecialitiesForConsultant(c.slug).map((x) => x.speciality.name),
  ]),
);

const clinicalOncologists = consultants.filter(
  (c) => c.role === "Consultant Clinical Oncologist",
);
const medicalOncologists = consultants.filter(
  (c) => c.role === "Consultant Medical Oncologist",
);

/** The year the longest-serving partner became a consultant in Reading. */
const establishedYear = Math.min(
  ...consultants
    .map((c) => c.consultantInReadingSince)
    .filter((y): y is number => typeof y === "number"),
);

const withGmc = consultants.filter((c) => c.gmc).length;
const withDisclosures = consultants.filter(
  (c) => c.disclosures && c.disclosures.length > 0,
).length;

/**
 * Small counts read better spelled out in running prose — "Seven consultant
 * clinical oncologists", not "7 consultant clinical oncologists". The figures
 * stay derived; only their presentation changes. Anything larger than twenty
 * falls back to the numeral, which is also the correct style.
 */
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function words(n: number) {
  return NUMBER_WORDS[n] ?? String(n);
}

function Words({ n, capital = false }: { n: number; capital?: boolean }) {
  const w = words(n);
  return <>{capital ? w.charAt(0).toUpperCase() + w.slice(1) : w}</>;
}

export const metadata: Metadata = pageMeta({
  title: "Private oncology care in Reading and Berkshire",
  description:
    `Berkshire Oncology Partnership is a partnership of ${consultants.length} independent consultant ` +
    "clinical and medical oncologists providing private cancer diagnosis, treatment and care across " +
    "Berkshire and the surrounding area, in both NHS and private practice.",
  path: "/",
});

// ── local building blocks ────────────────────────────────────────────────────

/**
 * Numbered section heading. The numeral is decorative — it gives a long page a
 * sense of progress without a sticky rail — so it is hidden from screen readers
 * and the heading itself carries the whole meaning.
 */
function SectionHeading({
  n,
  eyebrow,
  title,
  id,
}: {
  n: string;
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span
            aria-hidden
            className="font-display text-sm tabular-nums text-ink-muted/60"
          >
            {n}
          </span>
          <span aria-hidden className="h-px flex-1 bg-ink/10" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
            {eyebrow}
          </span>
        </div>
      </Reveal>
      <Reveal delay={1}>
        <h2
          id={id}
          tabIndex={-1}
          className="mt-7 scroll-mt-28 font-display text-3xl leading-[1.14] tracking-tight text-ink md:text-[2.6rem]"
        >
          {title}
        </h2>
      </Reveal>
    </div>
  );
}

/** Consistent vertical rhythm between the page's sections. */
function Section({ children }: { children: React.ReactNode }) {
  return <section className="mt-24 md:mt-36">{children}</section>;
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <Reveal delay={2}>
      <p className="mt-7 max-w-3xl text-lg leading-relaxed text-ink/85 md:text-xl md:leading-relaxed">
        {children}
      </p>
    </Reveal>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-ink/75">
        {children}
      </p>
    </Reveal>
  );
}

/**
 * Points the practice still has to supply. Naming them is more useful to a
 * reader than silence, and more honest than inventing an answer.
 */
function ToCover({ items }: { items: string[] }) {
  return (
    <Reveal>
      <ul className="mt-8 grid max-w-3xl gap-x-10 gap-y-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-relaxed text-ink/70"
          >
            <span
              aria-hidden
              className="mt-[0.62em] h-px w-4 shrink-0 bg-ink-muted/50"
            />
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

const governance = [
  {
    t: "GMC registration",
    d: `All ${words(withGmc)} of our consultants hold full registration with a licence to practise and are on the GMC's Specialist Register. Every GMC number is published on this page and on the consultant's own profile, so the register can be searched independently.`,
  },
  {
    t: "Appraisal and revalidation",
    d: "Every licensed doctor in the UK is appraised annually against the GMC's Good Medical Practice and revalidates every five years on the recommendation of a Responsible Officer. Revalidation covers the whole of a doctor's practice, NHS and private alike.",
  },
  {
    t: "Multidisciplinary review",
    d: "Cancer treatment decisions are made in multidisciplinary team meetings, where surgeons, oncologists, radiologists, pathologists and specialist nurses review a case together. Our consultants take part in these MDTs through their NHS posts.",
  },
  {
    t: "Declarations of interest",
    d: `${words(withDisclosures).replace(/^./, (c) => c.toUpperCase())} of our ${words(consultants.length)} consultants publish their professional and financial interests in full on their own profile — including industry relationships and investments. We would rather you read them than wonder about them.`,
  },
  {
    t: "Regulated premises",
    d: "Treatment is given at independent hospitals and cancer centres registered with and inspected by the Care Quality Commission, and at the Royal Berkshire Hospital. Every site's inspection reports are published by the CQC.",
  },
  {
    t: "Concerns and complaints",
    d: `A concern about your care should reach us directly and quickly. Our practice manager, ${site.contact.practiceManager}, is the first point of contact and will tell you how a complaint will be handled and by whom.`,
  },
];

export default function Home() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <>
      <JsonLd data={organizationLd()} />

      <HomeHero />

      {/* ── 01 · About the partnership ─────────────────────────────────────── */}
      <PartnershipIntro />

      <div className="container-wide pb-28 md:pb-40">
        {/* ── 02 · Our approach to care ─────────────────────────────────────── */}
        <Section>
          <SectionHeading
            n="02"
            eyebrow="How we work"
            id="approach"
            title="Our approach to care"
          />

          <div className="mt-10 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16 xl:gap-24">
            <div>
              <Lede>
                In private practice every patient is under the care of a named
                consultant. That consultant sees you at your first appointment,
                explains the diagnosis, sets out the options and remains
                responsible for your treatment. You are not passed between
                clinicians as your case moves along.
              </Lede>
              <Body>
                Treatment decisions in cancer are rarely a single obvious
                answer. More often there are two or three defensible options
                that differ in what they ask of you, what they offer and what
                they risk. Our consultants set those out in plain terms and
                decide with you rather than for you. Where another opinion would
                help, a case is discussed with colleagues in the partnership or
                at a multidisciplinary team meeting.
              </Body>
              <ToCover
                items={[
                  "What happens at a first appointment",
                  "How treatment decisions are made with you",
                  "Working alongside your GP and NHS team",
                  "Reaching us between appointments",
                ]}
              />
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/about/our-approach" variant="ghost">
                    Our approach to care
                  </Button>
                  <Button href="/patients" variant="ghost">
                    Patients &amp; families
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={1}>
              <ProofImage
                src="/home/approach.jpg"
                alt="A consultant writing up notes at a desk"
                cardTitle="On the GMC Specialist Register"
                cardBody={`All ${words(withGmc)} of our consultants hold full registration with a licence to practise. Every GMC number is published on this page.`}
                statValue={`Since ${establishedYear}`}
                statLabel="consultant care in Reading"
              />
            </Reveal>
          </div>
        </Section>

        {/* ── 03 · Our consultants ──────────────────────────────────────────── */}
        <Section>
          {/* The heading sits inside the left column rather than above the
              grid, so the scrolling list starts level with "Our consultants"
              and finishes level with the buttons. The right column stretches to
              whatever height the left one turns out to be. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
            <div>
              <SectionHeading
                n="03"
                eyebrow="The people"
                id="consultants"
                title="Our consultants"
              />
              <Reveal delay={2}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-ink/85 md:text-xl md:leading-relaxed">
                  <Words n={clinicalOncologists.length} capital /> consultant
                  clinical oncologists and{" "}
                  <Words n={medicalOncologists.length} /> consultant medical
                  oncologists. Clinical oncologists treat cancer with
                  radiotherapy as well as with drug treatments; medical
                  oncologists specialise in the drug treatments.
                </p>
              </Reveal>
              <Reveal>
                <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75">
                  Between them the partnership covers both halves of
                  non-surgical cancer care. Every consultant holds full
                  registration with the General Medical Council, and their GMC
                  number is listed so anyone can check the register directly.
                </p>
              </Reveal>
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/consultants" variant="ghost">
                    Find a consultant
                  </Button>
                  <Button href="/consultants/by-cancer-type" variant="ghost">
                    Browse by cancer type
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* lg:relative, with the list absolutely filling it: otherwise the
                list is what decides the grid row height, h-full resolves to the
                list's own height and nothing is constrained. Out of flow, the
                text column sets the height and the list matches it exactly. */}
            <Reveal delay={1} className="lg:relative">
              <ConsultantScroller
                consultants={consultants}
                specialities={specialitiesBySlug}
              />
            </Reveal>
          </div>
        </Section>

        {/* ── 04 · NHS and private practice ─────────────────────────────────── */}
        {/* The motif lives behind this section: the opening two now carry
            photographs, and this one is the longest run of unbroken text. */}
        <div className="relative isolate">
          <PartnershipField className="-z-10 opacity-75" />
          <Section>
            <SectionHeading
              n="04"
              eyebrow="How it fits together"
              id="nhs-and-private"
              title="NHS and private practice"
            />
          <Lede>
            Our consultants are NHS cancer specialists who also see patients
            privately. Most hold substantive posts at the Royal Berkshire
            Hospital in Reading, where the Berkshire Cancer Centre is based, and
            several hold clinical leadership roles there — acute oncology,
            clinical governance, chemotherapy leadership, and the supervision of
            oncology trainees.
          </Lede>
          <Body>
            This is the ordinary arrangement in British cancer care, and it is
            worth being plain about what it does and does not mean. It means the
            consultant you see privately is the same specialist, working to the
            same national standards, who would treat you in the NHS. It does not
            mean private care jumps an NHS queue, and it does not put NHS
            treatment at risk: patients move between the two, sometimes more than
            once, and are entitled to do so.
          </Body>
          <Body>
            Many of our consultants are principal investigators on national
            clinical trials, and will refer patients to trials elsewhere —
            including the Royal Marsden and University College Hospital — where
            that is the better option.
          </Body>
          <ToCover
            items={[
              "Moving between NHS and private care",
              "How information is shared with your NHS team",
              "What private care does and does not change",
              "Access to clinical trials",
            ]}
          />
            <Reveal>
              <div className="mt-9">
                <Button href="/about/nhs-and-private-practice" variant="ghost">
                  NHS and private practice
                </Button>
              </div>
            </Reveal>
          </Section>
        </div>

        {/* ── 05 · Quality and governance ───────────────────────────────────── */}
        <Section>
          <SectionHeading
            n="05"
            eyebrow="Standards"
            id="governance"
            title="Quality and governance"
          />
          <Lede>
            Trust in a medical organisation should rest on things a patient can
            check. The following can be checked.
          </Lede>

          <Reveal>
            <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
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

          <Reveal>
            <div className="mt-11">
              <Button href="/about/quality-and-governance" variant="ghost">
                Quality and governance in full
              </Button>
            </div>
          </Reveal>
        </Section>

        {/* ── 06 · Patient feedback ─────────────────────────────────────────── */}
        <Section>
          <SectionHeading
            n="06"
            eyebrow="What patients tell us"
            id="feedback"
            title="Patient feedback"
          />
          <Lede>
            We would rather publish nothing here than publish a selected
            quotation. Testimonials chosen by a practice tell you about the
            practice&rsquo;s choices, not about its care — so this page carries
            none.
          </Lede>
          <Body>
            What we can tell you is where independent feedback lives and how to
            add yours. Individual consultants are reviewed on the hospital and
            provider platforms where they practise, and those reviews are not
            ours to edit. If you have been treated by one of our consultants,
            feedback of any kind — through the practice, through your hospital,
            or on a public platform — is read and acted on.
          </Body>
          <Body>
            If something has gone wrong, please do not leave it to a review. Tell{" "}
            {site.contact.practiceManager} directly and it will be looked into.
          </Body>
          <ToCover
            items={[
              "Where to leave feedback about your care",
              "How feedback is reviewed and acted on",
              "How to raise a concern or complaint",
              "Independent review platforms",
            ]}
          />
          <Reveal>
            <div className="mt-9">
              <Button href="/about/patient-feedback" variant="ghost">
                Patient feedback
              </Button>
            </div>
          </Reveal>
        </Section>

        {/* ── 07 · Referring professionals ──────────────────────────────────── */}
        <Section>
          <SectionHeading
            n="07"
            eyebrow="For professionals"
            id="referrals"
            title="Referring professionals"
          />
          <Lede>
            Referrals come through the practice office, which will match the
            referral to the consultant whose sub-specialty fits — or tell you
            promptly if the partnership is not the right destination.
          </Lede>
          <Body>
            If you know which consultant you want, name them and the referral
            goes straight to them. If you do not, a line describing the
            presentation and the working diagnosis is enough for us to route it.
            For anything urgent, please telephone rather than write.
          </Body>

          <Reveal>
            <div className="mt-11 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
              {[
                {
                  label: "Referrals and enquiries",
                  value: site.contact.phone,
                  href: `tel:${tel}`,
                },
                {
                  label: "By email",
                  value: site.contact.email,
                  href: `mailto:${site.contact.email}`,
                },
                {
                  label: "Practice manager",
                  value: site.contact.practiceManager,
                },
              ].map((c) => (
                <div key={c.label} className="bg-canvas px-6 py-7">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
                    {c.label}
                  </div>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="mt-3 block break-words font-display text-lg text-ink transition-colors hover:text-accent"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <div className="mt-3 font-display text-lg text-ink">
                      {c.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <ToCover
            items={[
              "What to include in a referral letter",
              "Where to send written referrals",
              "Urgent referrals and how they are handled",
              "Direct contact details for clinicians",
            ]}
          />
          <Reveal>
            <div className="mt-9">
              <Button href="/about/referring-professionals" variant="ghost">
                Information for referring professionals
              </Button>
            </div>
          </Reveal>
        </Section>

        {/* ── 08 · Careers or professional enquiries ────────────────────────── */}
        <Section>
          <SectionHeading
            n="08"
            eyebrow="Working with us"
            id="careers"
            title="Careers or professional enquiries"
          />
          <Lede>
            The partnership is a group of independent practitioners rather than
            an employer, so enquiries take two forms: consultants interested in
            joining, and people interested in the practice roles that support
            them.
          </Lede>
          <Body>
            A consultant oncologist considering private practice in Berkshire is
            welcome to get in touch, whether or not anything is advertised —
            those conversations usually begin informally. Administrative and
            practice vacancies, when there are any, are handled by the practice
            office.
          </Body>
          <ToCover
            items={[
              "Current opportunities",
              "Enquiries from consultants interested in joining",
              "Administrative and practice roles",
              "Who to contact",
            ]}
          />
          <Reveal>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/about/careers" variant="ghost">
                Careers and professional enquiries
              </Button>
              <Button href="/contact" variant="ghost">
                Contact the practice
              </Button>
            </div>
          </Reveal>
        </Section>

        {/* ── Close ─────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="mt-24 border-t border-ink/10 pt-14 md:mt-36 md:pt-20">
            <h2 className="max-w-2xl font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
              Speak to the practice.
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/75">
              Enquiries about the partnership, appointments and referrals all
              come through {site.contact.practiceManager}, who can point you to
              the right consultant.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/contact" variant="primary">
                Contact the practice
              </Button>
              <a
                href={`tel:${tel}`}
                className="rounded-full border border-ink/15 px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-ink/[0.03]"
              >
                {site.contact.phone}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
