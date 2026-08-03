import type { Metadata } from "next";
import { site } from "@/content/site";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ContactForm from "@/components/site/ContactForm";
import ContactActions from "@/components/site/ContactActions";
import MapEmbed from "@/components/site/MapEmbed";
import ParticleField from "@/components/graphic/ParticleField";
import { IconPin, IconPhone, IconMail, IconUser } from "@/components/ui/Icons";

export const metadata: Metadata = pageMeta({
  title: "Contact Us",
  description:
    "Contact Berkshire Oncology Partnership — 13 Bath Rd, Reading, Berkshire RG1 6HH. Telephone 0118 959 8866 or email the practice.",
  path: "/contact",
});

export default function ContactPage() {
  const c = site.contact;
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;

  return (
    <>
      {/* The breadcrumb trail is still emitted for search engines. It just
          isn't drawn on the page any more: a visible "Home / Contact" above an
          eyebrow reading "CONTACT" above a heading about getting in touch said
          the same thing three times before the page had told anyone anything.
          Same call the tariffs page already makes. */}
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-soft/70 via-canvas to-canvas">
        {/* More amplitude than the tariffs hero, and sized so the tail fades out
            right where the cards begin rather than trailing into dead space
            below them. */}
        <ParticleField
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] w-full sm:h-[600px] md:h-[720px]"
          ampScale={1.18}
          layers={12}
          layerGap={16}
        />

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="container-wide relative z-10 pt-28 text-center md:pt-36">
          {/* The second line is too long for one line on a phone, and both the
              natural wrap ("best." alone) and text-wrap:balance ("However"
              alone) strand a fragment. The only breakable space is the one in
              the middle, so it always splits "However suits / you best." and
              still sits on one line from sm up. */}
          <h1 className="mx-auto max-w-4xl font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl">
            <span className="block">Get in touch.</span>
            <span className="block text-gradient">However&nbsp;suits you&nbsp;best.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-balance text-[17px] leading-relaxed text-ink/75 md:text-lg">
            Call the practice, send an email, or use the form below — whichever
            you find easiest.
          </p>

          {/* The two actions sit in the hero rather than buried in a list
              further down. Most people arriving here are on a phone and want to
              ring someone. */}
          <ContactActions className="mt-9" />
        </div>

        {/* ── Details, map and form ─────────────────────────────────────────── */}
        {/* Grid children stretch to the row height by default. The map takes
            flex-1 (so it absorbs whatever height the form needs) and the form
            card takes h-full (so it fills if the left column is the taller of
            the two). Between them the two columns always end level, whichever
            side happens to be longer. */}
        <div className="container-wide relative z-10 grid gap-12 pb-16 pt-16 md:pb-24 md:pt-20 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            {/* min-w-0 on every value cell is what stops the long practice email
                from forcing the card wider than the grid column. */}
            <dl className="card-soft divide-y divide-black/[0.05] overflow-hidden">
              <div className="flex gap-4 p-5 md:p-6">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/[0.07] text-accent">
                  <IconPin className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Address
                  </dt>
                  <dd className="mt-1.5 not-italic text-ink">
                    {c.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 p-5 md:p-6">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/[0.07] text-accent">
                  <IconPhone className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Telephone
                  </dt>
                  <dd className="mt-1.5 text-ink">
                    <a
                      href={tel(c.phone)}
                      className="block py-1 transition-colors hover:text-accent"
                    >
                      {c.phone}
                    </a>
                    <a
                      href={tel(c.phoneMobile)}
                      className="block py-1 transition-colors hover:text-accent"
                    >
                      {c.phoneMobile}{" "}
                      <span className="text-ink-muted">(mobile)</span>
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 p-5 md:p-6">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/[0.07] text-accent">
                  <IconMail className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Email
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={`mailto:${c.email}`}
                      className="block py-1 text-accent [overflow-wrap:anywhere] hover:underline"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 p-5 md:p-6">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/[0.07] text-accent">
                  <IconUser className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Practice Manager
                  </dt>
                  <dd className="mt-1.5 text-ink">{c.practiceManager}</dd>
                </div>
              </div>
            </dl>

            {/* Stacked on mobile there's no row height to fill, so flex-1
                collapses the map to its floor — hence the taller floor there.
                From lg the floor drops back so the form is free to drive the
                row height and the two columns end level. */}
            <div className="mt-6 min-h-[16rem] flex-1 overflow-hidden rounded-3xl border border-black/[0.06] lg:min-h-[13rem]">
              <MapEmbed
                lat={c.geo.lat}
                lng={c.geo.lng}
                label="Berkshire Oncology Partnership, 13 Bath Rd, Reading RG1 6HH"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
