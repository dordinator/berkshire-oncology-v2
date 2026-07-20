import type { LegalDoc } from "@/content/types";
import { breadcrumbLd } from "@/content/seo";
import PageHeader from "./PageHeader";
import JsonLd from "./JsonLd";

export default function LegalLayout({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: doc.title, path: `/${doc.slug}` },
        ])}
      />
      <PageHeader
        breadcrumbs={[{ name: "Home", href: "/" }, { name: doc.title }]}
        eyebrow="Legal"
        title={doc.title}
        intro={doc.updated ? `Last updated: ${doc.updated}` : undefined}
      />
      <section className="bg-canvas py-16 md:py-24">
        <div className="container-narrow">
          <div
            className="legal-prose"
            dangerouslySetInnerHTML={{ __html: doc.html }}
          />
        </div>
      </section>
    </>
  );
}
