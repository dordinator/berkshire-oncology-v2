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
  copyKey,
  children,
}: {
  title: string;
  copyKey?: string;
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
        <span data-copy-key={copyKey}>{title}</span>
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
          <Reveal delay={1}>
            <h2
              id="partnership"
              tabIndex={-1}
              className="scroll-mt-28 font-display text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              <span data-copy-key="partnership.heading.line1">
                Specialist cancer care,
              </span>
              <br />
              <span data-copy-key="partnership.heading.line2">
                led by your consultant.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <p
              data-copy-key="partnership.intro"
              className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed"
            >
              A cancer diagnosis can leave you with a lot to take in. One useful
              first step is to find an oncologist who regularly treats your type
              of cancer. You can choose who you see privately, and you do not
              need to work out the right person on your own.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p
              data-copy-key="partnership.body"
              className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed"
            >
              We are ten consultant oncologists working together in Reading.
              Each consultant has their own specialist areas and remains
              responsible for their own patients. Our practice team can listen
              to what you need, help you find the right consultant and arrange
              an appointment.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-10 space-y-2.5">
              <Row
                title="Your consultant stays with you"
                copyKey="partnership.row.continuity.title"
              >
                <span data-copy-key="partnership.row.continuity.body">
                  The consultant you meet at your first appointment will explain
                  your diagnosis, talk through your options and remain responsible
                  for your treatment. You will know who is leading your care and
                  who to speak to when you have questions.
                </span>{" "}
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
              <Row
                title="Private care from NHS cancer specialists"
                copyKey="partnership.row.nhs.title"
              >
                <span data-copy-key="partnership.row.nhs.body">
                  Most of our consultants hold NHS posts at the Royal Berkshire
                  Hospital, home to the Berkshire Cancer Centre. Choosing a
                  private appointment does not affect your right to NHS care. Some
                  patients move between private and NHS services during their
                  diagnosis or treatment.
                </span>{" "}
                <Link
                  href="/about/nhs-and-private-practice"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  NHS and private practice
                </Link>
                .
              </Row>

              <Row
                title={`Appointments at ${hospitals.length} hospitals and cancer centres`}
                copyKey="partnership.row.locations.title"
              >
                Our consultants see patients at {hospitalSentence}. The
                practice office is at{" "}
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
