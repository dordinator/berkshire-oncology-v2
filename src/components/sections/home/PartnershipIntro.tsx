import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { hospitals } from "@/content/hospitals";

// ─────────────────────────────────────────────────────────────────────────────
// The first thing after the hero: photograph on one side, the welcome and the
// partnership's argument on the other, with the detail folded into disclosure
// rows beneath.
//
// The rows are native <details>/<summary>. No state, no JavaScript, keyboard
// and screen-reader support for free, and they still open if the bundle never
// arrives — worth more here than a bespoke accordion would be.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "Spire Dunedin Hospital (Reading), … and Royal Berkshire Hospital (Reading)".
 * Built from the data rather than typed out, so adding or losing a site changes
 * this sentence and the count above it together.
 */
const hospitalSentence = hospitals
  .map((h) => `${h.name} (${h.location.replace(" (NHS)", "")})`)
  .reduce(
    (acc, name, i, arr) =>
      i === 0 ? name : i === arr.length - 1 ? `${acc} and ${name}` : `${acc}, ${name}`,
    "",
  );

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    // A shared `name` makes these an exclusive accordion: opening one closes
    // the rest, handled by the browser rather than by state. Browsers without
    // support (pre-Chrome 120 / Safari 17.2) simply allow several open at once,
    // which is the old behaviour rather than a broken one.
    <details
      name="partnership-detail"
      className="group rounded-2xl bg-canvas-soft/70 transition-colors open:bg-canvas-soft"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-display text-lg leading-snug text-ink marker:content-none [&::-webkit-details-marker]:hidden md:text-xl">
        {title}
        <span
          aria-hidden
          className="relative h-4 w-4 shrink-0 text-ink-muted"
        >
          <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
          {/* The vertical stroke collapses into the horizontal one, so + becomes − */}
          <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0 motion-reduce:transition-none" />
        </span>
      </summary>
      <div className="px-6 pb-6 text-[15px] leading-relaxed text-ink/75">
        {children}
      </div>
    </details>
  );
}

export default function PartnershipIntro() {
  return (
    <section className="container-wide pt-20 md:pt-28">
      {/* The image column takes a slightly larger share of the row and a
          taller frame from lg — 3/4 rather than 4/5 — so the photograph reads
          as the section's equal half rather than its thumbnail. */}
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <Reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-canvas-soft sm:aspect-[4/3] lg:aspect-[3/4]">
            <Image
              src="/home/partnership.jpg"
              alt="A consultation in progress — a clinician talking a patient through her care in a clinic room"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            {/* HCA puts a welcome line in this slot; here it carries the
                section's name instead, so the eight section titles on the page
                match the eight in the About menu exactly. */}
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
              About the partnership
            </p>
          </Reveal>

          <Reveal delay={1}>
            <h2
              id="partnership"
              tabIndex={-1}
              className="mt-6 scroll-mt-28 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Who treats you is your choice.
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
              You can choose which oncologist treats you. Not everyone realises
              that, and it is a choice worth making carefully: cancer care is
              sub-specialised, and the consultant who treats prostate cancer
              week in, week out is rarely the one who treats lymphoma.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
              Berkshire Oncology Partnership is ten consultant oncologists
              practising together in Reading. Each keeps their own patients and
              their own clinical judgement; what they share is one office, one
              route in, and colleagues who cover the cancers they do not. You
              get a named consultant who stays with your case, and the range of
              a far larger unit behind them.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-10 space-y-2.5">
              <Row title="One named consultant, start to finish">
                The consultant you meet at your first appointment explains the
                diagnosis, sets out the options and stays responsible for your
                treatment. You are not handed between clinicians as the case
                moves on, and you always know whose name is on it.{" "}
                <Link
                  href="/about/our-approach"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  How we work
                </Link>
                .
              </Row>

              {/* Three rows, not four: the sub-specialisation point this list
                  used to make is already made twice on this page — in the
                  paragraph above and by the whole "Cancers we treat" section
                  below it. */}
              <Row title="The same specialists you would meet on the NHS">
                Most of our consultants hold NHS posts at the Royal Berkshire
                Hospital, where the Berkshire Cancer Centre is based. Private
                care does not jump an NHS queue and does not put NHS treatment at
                risk — patients move between the two and are entitled to.{" "}
                <Link
                  href="/about/nhs-and-private-practice"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  NHS and private practice
                </Link>
                .
              </Row>

              <Row title={`${hospitals.length} hospitals and cancer centres`}>
                Consultations and treatment take place across Berkshire and into
                Oxfordshire — {hospitalSentence}. The practice office is at{" "}
                {site.contact.addressLines[0]}, {site.contact.addressLines[1]}.{" "}
                <Link
                  href="/locations"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  All locations
                </Link>
                .
              </Row>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
