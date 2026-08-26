import type { Metadata } from "next";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ResourceSearchLanding from "@/components/sections/resources/ResourceSearchLanding";

// ─────────────────────────────────────────────────────────────────────────────
// Resources and support — full-screen search over the partnership's curated
// external organisations and services. This file is also /resources:
// src/app/resources/page.tsx re-exports it.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Resources and support",
  description:
    "Trusted charities, support services, hospitals and treatment locations recommended by Berkshire Oncology.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />
      <div className="overflow-x-clip">
        <ResourceSearchLanding />
      </div>
    </>
  );
}
