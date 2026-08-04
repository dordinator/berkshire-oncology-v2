import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/site/JsonLd";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import HomeHero from "@/components/sections/home/HomeHero";
import PartnershipIntro from "@/components/sections/home/PartnershipIntro";
import ProofImage from "@/components/sections/home/ProofImage";
import WaveField from "@/components/graphic/WaveField";
import RegionMap from "@/components/site/RegionMap";
import { pageMeta, organizationLd } from "@/content/seo";
import { site } from "@/content/site";
import { hospitals } from "@/content/hospitals";
import ConsultantScroller from "@/components/sections/home/ConsultantScroller";
import CancerCards from "@/components/sections/home/CancerCards";
import HospitalStrip from "@/components/sections/home/HospitalStrip";
import TestimonialCards from "@/components/sections/home/TestimonialCards";
import ProfessionalRoutes from "@/components/sections/home/ProfessionalRoutes";
import CloseBand from "@/components/sections/home/CloseBand";
import {
  getAllConsultants,
  getAllSpecialities,
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
// The sections follow the About group in src/content/navigation.ts, in the same
// order, so the page and the menu describe the same thing. It is no longer a
// one-to-one mirror: quality and governance is six checkable facts, which is a
// page rather than something to scroll past, so it lives only at
// /about/quality-and-governance now — the menu still reaches it, and the home
// page keeps the headline fact of it on the GMC card in "Our approach to care".
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
const specialities = getAllSpecialities();

/**
 * The six cards in "Cancers we treat", ordered by how common the cancer is in
 * the UK rather than by how many of our consultants list it. Ranking by
 * internal coverage put bladder and kidney above bowel and lung, which is not
 * what a newly diagnosed reader is scanning for — they arrive already knowing
 * the name of their own diagnosis. Labels come from the speciality data so they
 * cannot drift; only the order and the selection are set here.
 */
const CARD_ORDER = ["breast", "prostate", "lung", "colorectal", "skin", "lymphoma"];

const topCancers = CARD_ORDER.map((slug) => {
  const s = specialities.find((x) => x.slug === slug);
  return s ? { slug: s.slug, label: s.title ?? s.name } : null;
}).filter((c): c is { slug: string; label: string } => c !== null);

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
 * Section heading: a rule, then the title.
 *
 * There was a numeral and a category label on either end of that rule. Both
 * were decorative — the numeral counted sections nobody is counting, and the
 * label restated the heading a line below it in different words. The rule does
 * the only job that was actually needed, which is to mark where one section
 * stops and the next begins.
 */
function SectionHeading({ title, id }: { title: string; id: string }) {
  return (
    <div className="max-w-3xl">
      <Reveal>
        <div aria-hidden className="h-px w-full bg-ink/10" />
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

export default function Home() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <>
      <JsonLd data={organizationLd()} />

      <HomeHero />

      {/* ── 01 · About the partnership ─────────────────────────────────────── */}
      <PartnershipIntro />

      {/* The bottom padding is what keeps the photograph above off the gold.
          Sections are spaced by their own top margins (see Section), so the
          last one before the band contributed nothing below itself and the
          image's lower edge landed within a few pixels of the colour — it read
          as sitting on the band rather than above it. This mirrors the same
          rhythm on the other side. */}
      <div className="container-wide pb-24 md:pb-36">
        {/* ── 02 · Our approach to care ─────────────────────────────────────── */}
        <Section>
          {/* Heading inside the left column, as in section 03, so the
              photograph starts level with it rather than a grid gap below. */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16 xl:gap-24">
            <div>
              <SectionHeading
                id="approach"
                title="Our approach to care"
              />
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

      </div>

      {/* ── Cancers we treat ────────────────────────────────────────────────
          A full-bleed coloured band with its own sticky behaviour — the one
          place on the page where the background changes. It carries its own
          container and vertical rhythm, and sits outside the page container so
          the colour reaches both edges without a 100vw trick. */}
      <CancerCards
          cards={topCancers}
          intro={
            <>
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  What we treat
                </p>
              </Reveal>
              <Reveal delay={1}>
                <h2
                  id="cancers"
                  tabIndex={-1}
                  className="mt-6 scroll-mt-28 font-display text-[2.1rem] leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.2rem]"
                >
                  Cancers we treat
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
                  Our consultants treat {specialities.length} cancer types
                  between them, each concentrating on a few rather than covering
                  everything. Start from your own diagnosis and it will take you
                  to the consultants who treat it.
                </p>
              </Reveal>
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/specialities" variant="ghost">
                    All {specialities.length} cancer types
                  </Button>
                </div>
              </Reveal>
          </>
        }
      />

      <div className="container-wide pb-28 md:pb-40">
        {/* ── 03 · Our consultants ──────────────────────────────────────────── */}
        <Section>
          {/* The heading sits inside the left column rather than above the
              grid, so the scrolling list starts level with "Our consultants"
              and finishes level with the buttons. The right column stretches to
              whatever height the left one turns out to be. */}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
            <div>
              <SectionHeading
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
        {/* Was three stacked paragraphs — the longest unbroken run of text on
            the page, and the reason the node motif was put behind it. The
            argument is now carried by the row of hospitals rather than by prose:
            four private sites and the NHS trust, side by side, which is what
            "NHS and private practice" actually means here. The copy is cut to
            the two things that row cannot say by itself. */}
        <div className="relative isolate">
          <WaveField className="-z-10" />
          <Section>
            {/* Copy on the left, the region on the right. The heading sits
                inside the left column rather than above both, so the map starts
                level with the rule instead of a hundred pixels below it — the
                dead space beside the heading was the only thing keeping the two
                halves from reading as one block. The map is desaturated because
                at this size a full-colour one is the loudest thing on a page
                that is otherwise navy on off-white, and the point of it is the
                shape of the area, not its cartography. */}
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start lg:gap-16">
              <div>
                <SectionHeading
                  id="nhs-and-private"
                  title="NHS and private practice"
                />
                <Lede>
                  Our consultants are NHS cancer specialists who also see
                  patients privately, most of them from posts at the Royal
                  Berkshire Hospital in Reading, where the Berkshire Cancer
                  Centre is based.
                </Lede>
                <Body>
                  Private care does not jump an NHS queue, and it does not put
                  NHS treatment at risk — patients move between the two,
                  sometimes more than once, and are entitled to.
                </Body>

                <Reveal>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/locations" variant="ghost">
                      All locations
                    </Button>
                    <Button
                      href="/about/nhs-and-private-practice"
                      variant="ghost"
                    >
                      NHS and private practice
                    </Button>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={2}>
                {/* No top margin, unlike the copy beside it: the rule that opens
                    the heading has none either, so this starts level with it. */}
                <div className="relative overflow-hidden rounded-3xl border border-ink/[0.08] shadow-[0_12px_40px_-16px_rgba(6,28,70,0.18)]">
                  <RegionMap className="h-[280px] grayscale md:h-[360px]" />

                  {/* Counted from hospitals.ts, so it cannot drift from the row
                      of sites directly beneath it. */}
                  <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/95 px-5 py-3.5 shadow-lg backdrop-blur">
                    <p className="font-display text-2xl leading-none text-ink">
                      {hospitals.length}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-tight text-ink-muted">
                      hospitals and cancer centres
                      <br />
                      across Berkshire &amp; Oxford
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-11">
              <HospitalStrip />
            </div>
          </Section>
        </div>

        {/* Quality and governance used to sit here, as section 05. It moved to
            /about/quality-and-governance whole — six checkable facts is a page,
            not a scroll-past, and this page already carries the headline one
            (the GMC card in "Our approach to care"). The route above it in the
            menu still reaches it; only the home page stopped restating it. */}

      </div>

      {/* ── 06 · Patient feedback ───────────────────────────────────────────
          Mirrors the cancers chapter — text right, cards left — so it sits
          outside the page container for the same reason that one does: the card
          column runs close to the edge, and a 100vw trick would overflow by the
          scrollbar's width.

          Note this replaced copy that argued the opposite case: the section used
          to say the practice would rather publish nothing than publish a
          selected quotation, on the grounds that testimonials chosen by a
          practice describe its choices rather than its care. Publishing
          testimonials is a perfectly normal decision, but it is a different
          editorial position from the one the page held, so the old paragraphs
          could not simply sit above the new cards. */}
      <TestimonialCards
        intro={
          <>
            <Reveal>
              <div aria-hidden className="h-px w-full bg-ink/10" />
            </Reveal>
            <Reveal delay={1}>
              <h2
                id="feedback"
                tabIndex={-1}
                className="mt-7 scroll-mt-28 font-display text-3xl leading-[1.14] tracking-tight text-ink md:text-[2.6rem]"
              >
                Patient feedback
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-7 text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
                Individual consultants are reviewed on the hospital and provider
                platforms where they practise, and those reviews are not ours to
                edit. Feedback of any kind — through the practice, through your
                hospital, or on a public platform — is read and acted on.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-5 text-[17px] leading-relaxed text-ink/80">
                If something has gone wrong, please do not leave it to a review.
                Tell {site.contact.practiceManager} directly and it will be
                looked into.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-9">
                <Button href="/about/patient-feedback" variant="ghost">
                  Patient feedback
                </Button>
              </div>
            </Reveal>
          </>
        }
      />

      {/* ── 07 · Referrals, careers and professional enquiries ─────────────
          Was two sections, back to back, in the same shape: "Referring
          professionals" and "Careers or professional enquiries". One audience
          really — people contacting the practice who are not patients — so the
          three things they might want are the structure now, one card each.

          Outside the page container because it carries its own, slightly wider
          one — three cards side by side want more room than a column of prose.
          See ProfessionalRoutes for the rest. */}
      <ProfessionalRoutes />

      {/* ── Close ─────────────────────────────────────────────────────────
          The band and the site footer are both bg-ink, so how they meet is a
          real decision rather than a detail. CloseBand carries three answers
          behind a temporary toggle. */}
      <CloseBand />
    </>
  );
}
