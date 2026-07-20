import type { Metadata } from "next";
import { site } from "@/content/site";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";
import MapEmbed from "@/components/site/MapEmbed";

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
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageHeader
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]}
        eyebrow="Contact"
        title={
          <>
            How to <span className="text-gradient">get in touch.</span>
          </>
        }
        intro="Contact the practice to arrange a consultation, ask a question or request a tariff. We'll respond as soon as possible."
      />
      <section className="bg-canvas py-16 md:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="card-soft p-6 md:p-8">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Address
                  </dt>
                  <dd className="mt-2 text-ink">
                    {c.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Telephone
                  </dt>
                  <dd className="mt-2 space-y-1 text-ink">
                    <a href={tel(c.phone)} className="block hover:text-accent">
                      {c.phone}
                    </a>
                    <a href={tel(c.phoneMobile)} className="block hover:text-accent">
                      {c.phoneMobile} (mobile)
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Email
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${c.email}`}
                      className="break-all text-accent hover:underline"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Practice Manager
                  </dt>
                  <dd className="mt-2 text-ink">{c.practiceManager}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 h-72 overflow-hidden rounded-3xl border border-black/[0.06] md:h-80">
              <MapEmbed
                lat={c.geo.lat}
                lng={c.geo.lng}
                label="Berkshire Oncology Partnership, 13 Bath Rd, Reading RG1 6HH"
              />
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
