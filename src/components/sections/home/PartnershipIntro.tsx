import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

// ─────────────────────────────────────────────────────────────────────────────
// The first thing after the hero: photograph on one side, the welcome and the
// partnership's argument on the other, with the detail folded into disclosure
// rows beneath.
//
// The rows are native <details>/<summary>. No state, no JavaScript, keyboard
// and screen-reader support for free, and they still open if the bundle never
// arrives — worth more here than a bespoke accordion would be.
// ─────────────────────────────────────────────────────────────────────────────

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
              className="home-section-title text-ink"
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
              className="section-subtitle mt-7 max-w-xl text-ink/80"
            >
              A cancer diagnosis can leave you with a lot to take in. One useful
              first step is finding a consultant who regularly treats your type
              of cancer. You can choose who you see privately, and you do not
              have to make that choice alone.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p
              data-copy-key="partnership.body"
              className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed"
            >
              If you are unsure who to choose, our experienced practice team
              will ask about your diagnosis or referral and help you find the
              right consultant for you. Our ten consultant oncologists are
              based in Reading, Berkshire, and cover a broad range of cancer
              types and treatments. You can look through their profiles
              yourself or ask the practice team to help, then book an
              appointment when you are ready.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-10 space-y-2.5">
              <Row
                title="If you are also receiving NHS care"
                copyKey="partnership.row.nhs.title"
              >
                <span data-copy-key="partnership.row.nhs.body">
                  All members of the partnership hold NHS consultant posts at
                  Royal Berkshire Hospital, where the Berkshire Cancer Centre
                  is based. If you are already receiving NHS care and are
                  considering a private appointment, contact the practice team
                  to discuss your circumstances.
                </span>
              </Row>

              <Row
                title="Where you can see our consultants"
                copyKey="partnership.row.locations.title"
              >
                Our consultants practise at hospitals and cancer centres in
                Reading, Windsor and Oxford. The location available to you will
                depend on your consultant and the care you need.{" "}
                <Link
                  href="/locations"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  View all locations
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
