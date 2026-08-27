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
import { getGroupForSlug } from "@/content/cancerGroups";
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
  if (!s) return null;

  const group = getGroupForSlug(s.slug);
  return {
    slug: s.slug,
    label: s.title ?? s.name,
    href: `/specialities?type=${group?.id ?? s.slug}#specialists`,
  };
}).filter(
  (c): c is { slug: string; label: string; href: string } => c !== null,
);

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
  title: "Private cancer consultants in Reading and Berkshire",
  description:
    `Find a private cancer specialist from Berkshire Oncology Partnership's ${consultants.length} consultant ` +
    "oncologists. Appointments are available in Reading and at hospitals across Berkshire and Oxford.",
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
function SectionHeading({
  title,
  id,
  copyKey,
  showRule = true,
}: {
  title: string;
  id: string;
  copyKey?: string;
  showRule?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {showRule && (
        <Reveal>
          <div aria-hidden className="h-px w-full bg-ink/10" />
        </Reveal>
      )}
      <Reveal delay={1}>
        <h2
          id={id}
          data-copy-key={copyKey}
          tabIndex={-1}
          className={`${showRule ? "mt-7 " : ""}home-section-title text-ink`}
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

function Lede({
  children,
  copyKey,
}: {
  children: React.ReactNode;
  copyKey?: string;
}) {
  return (
    <Reveal delay={2}>
      <p
        data-copy-key={copyKey}
        className="section-subtitle mt-7 max-w-3xl text-ink/80"
      >
        {children}
      </p>
    </Reveal>
  );
}

function Body({
  children,
  copyKey,
}: {
  children: React.ReactNode;
  copyKey?: string;
}) {
  return (
    <Reveal>
      <p
        data-copy-key={copyKey}
        className="mt-5 max-w-3xl text-[17px] leading-relaxed text-ink/80"
      >
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
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16 xl:gap-24">
            <div>
              <SectionHeading
                id="approach"
                title="What you can expect from your care"
                copyKey="approach.heading"
                showRule={false}
              />
              <Lede copyKey="approach.lede">
                At your first appointment, your consultant will review the
                information available and talk to you about your symptoms,
                diagnosis or referral. They will explain what is known, what may
                still need to be investigated and what the next steps may be.
              </Lede>
              <Body copyKey="approach.body">
                Where there are treatment options to consider, your consultant
                will explain their potential benefits, possible side effects
                and practical differences, and the reasons for their
                recommendation. You can always ask questions before deciding
                what happens next. Cases are often reviewed by multiple
                specialists so they can consider the diagnosis and treatment
                options together.
              </Body>
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/about/our-approach" variant="ghost">
                    <span data-copy-key="approach.action.care">
                      How we care for patients
                    </span>
                  </Button>
                  <Button href="/patients" variant="ghost">
                    <span data-copy-key="approach.action.patients">
                      Information for patients and families
                    </span>
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={1}>
              <ProofImage
                src="/home/approach.jpg"
                alt="A consultant writing up notes at a desk"
                cardTitle="Every consultant is on the GMC Specialist Register"
                cardBody={`All ${words(withGmc)} consultants hold full registration with a licence to practise. Their GMC numbers are published in their profiles so you can check the register.`}
                statValue={`Since ${establishedYear}`}
                statLabel="our longest-serving consultant has worked in Reading"
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
                  <span data-copy-key="cancers.label">Find your area of care</span>
                </p>
              </Reveal>
              <Reveal delay={1}>
                <h2
                  id="cancers"
                  data-copy-key="cancers.heading"
                  tabIndex={-1}
                  className="home-section-title mt-6 text-ink"
                >
                  Cancer types we treat
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <p
                  data-copy-key="cancers.intro"
                  className="section-subtitle mt-7 max-w-md text-ink/80"
                >
                  Cancer care is highly specialised. Our consultants cover{" "}
                  {specialities.length} cancer types between them, with each
                  focusing on particular areas. Choose a cancer type to see the
                  consultants who treat it.
                </p>
              </Reveal>
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/specialities" variant="ghost">
                    <span data-copy-key="cancers.action.all">
                      See all {specialities.length} cancer types
                    </span>
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
                title="Find a consultant"
                copyKey="consultants.heading"
                showRule={false}
              />
              <Reveal delay={2}>
                <p
                  data-copy-key="consultants.lede"
                  className="section-subtitle mt-7 max-w-md text-ink/85"
                >
                  Our team includes <Words n={clinicalOncologists.length} />{" "}
                  clinical oncologists and <Words n={medicalOncologists.length} />{" "}
                  medical oncologists. Clinical oncologists use radiotherapy
                  and cancer medicines; medical oncologists specialise in
                  treating cancer with medicines.
                </p>
              </Reveal>
              <Reveal>
                <p
                  data-copy-key="consultants.body"
                  className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/75"
                >
                  Each profile tells you which cancers a consultant treats,
                  which treatments they offer and where they see patients. It
                  also includes their GMC number, so you can check the medical
                  register directly.
                </p>
              </Reveal>
              <Reveal>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/consultants" variant="ghost">
                    <span data-copy-key="consultants.action.all">
                      View all consultants
                    </span>
                  </Button>
                  <Button href="/specialities" variant="ghost">
                    <span data-copy-key="consultants.action.cancer">
                      Search by cancer type
                    </span>
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* lg:relative, with the list absolutely filling it: otherwise the
                list is what decides the grid row height, h-full resolves to the
                list's own height and nothing is constrained. Out of flow, the
                text column sets the height and the list matches it exactly. */}
            {/* min-w-0 is load-bearing. A grid item defaults to min-width:auto,
                so it refuses to shrink below its content — and the list inside
                is now a 3000px-wide flex row on a phone. Without this the track
                grew to fit it, the scroller never constrained, and the whole
                page scrolled sideways instead of the strip. */}
            <Reveal delay={1} className="min-w-0 lg:relative">
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
                  title="Private care, connected to NHS expertise"
                  copyKey="nhs.heading"
                />
                <Lede copyKey="nhs.lede">
                  Most of our consultants also hold NHS posts at the Royal
                  Berkshire Hospital in Reading, home to the Berkshire Cancer
                  Centre. They bring that specialist experience to their
                  private practice.
                </Lede>
                <Body copyKey="nhs.body">
                  Choosing private care does not affect your right to NHS care.
                  Depending on what you need, you may receive some parts of your
                  diagnosis or treatment privately and others through the NHS.
                </Body>

                <Reveal>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Button href="/locations" variant="ghost">
                      <span data-copy-key="nhs.action.locations">
                        View treatment locations
                      </span>
                    </Button>
                    <Button
                      href="/about/nhs-and-private-practice"
                      variant="ghost"
                    >
                      <span data-copy-key="nhs.action.explainer">
                        How NHS and private care work
                      </span>
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
                      <span data-copy-key="nhs.map.region">
                        across Berkshire &amp; Oxfordshire
                      </span>
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
                data-copy-key="feedback.heading"
                tabIndex={-1}
                className="home-section-title mt-7 text-ink"
              >
                What patients tell us
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p
                data-copy-key="feedback.reviews"
                className="section-subtitle mt-7 text-ink/80"
              >
                You can find independent reviews of individual consultants on
                the hospital and healthcare platforms where they practise. Those
                reviews are published independently; we do not select or edit
                them.
              </p>
            </Reveal>
            <Reveal delay={2}>
              <p
                data-copy-key="feedback.direct"
                className="mt-5 text-[17px] leading-relaxed text-ink/80"
              >
                We also want to hear directly about your experience, good or
                bad. If something has gone wrong, please contact{" "}
                {site.contact.practiceManager} so the practice can look into it
                and respond.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-9">
                <Button href="/about/patient-feedback" variant="ghost">
                  <span data-copy-key="feedback.action">
                    Read or leave feedback
                  </span>
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
