import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { getAllSpecialities } from "@/content/queries";
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

const specialities = getAllSpecialities();

function Row({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl bg-canvas-soft/70 transition-colors open:bg-canvas-soft">
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
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <Reveal>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-canvas-soft sm:aspect-[4/3] lg:aspect-[4/5]">
            <Image
              src="/home/partnership.jpg"
              alt="Two clinicians in discussion in a hospital corridor"
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
              className="mt-6 scroll-mt-28 font-display text-[2.1rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
            >
              Ten consultants, and one who is yours.
            </h2>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
              Berkshire Oncology Partnership is a group of ten independent
              consultant oncologists who treat cancer in and around Reading.
              Each is a practitioner in their own right, responsible for their
              own patients and their own practice.
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80 md:text-lg md:leading-relaxed">
              Cancer care is sub-specialised — the consultant who manages
              prostate cancer week in, week out is rarely the one who manages
              lymphoma. A partnership covers that ground, while still giving
              every patient one named doctor who knows their case and stays with
              it.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-10 space-y-2.5">
              <Row title="Independent practitioners, one practice">
                The partnership does not employ its consultants and does not
                direct their clinical decisions. What it provides is everything
                around the medicine: a shared administrative office, one point of
                contact for patients and referrers, and colleagues whose
                sub-specialist knowledge sits alongside their own.
              </Row>

              <Row title="Expertise across every common cancer">
                Between them our consultants treat {specialities.length} cancer
                types, with both halves of non-surgical cancer care covered —
                radiotherapy and the drug treatments.{" "}
                <Link
                  href="/specialities"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  See the full range
                </Link>
                , or{" "}
                <Link
                  href="/consultants/by-cancer-type"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  find a consultant by cancer type
                </Link>
                .
              </Row>

              <Row title="Where we practise">
                Our administrative office is at {site.contact.addressLines[0]},{" "}
                {site.contact.addressLines[1]}. Consultations and treatment take
                place at {hospitals.length} hospitals and cancer centres across
                Berkshire and into Oxfordshire, each providing the facilities,
                nursing and pharmacy for the treatment given there.{" "}
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
