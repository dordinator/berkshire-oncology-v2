import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProfiledConsultantSlugs, getAllSpecialities } from "@/content/queries";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;

  const staticPaths = [
    "",
    "/consultants",
    "/specialities",
    "/tariffs",
    "/contact",
    "/links",
    "/privacy",
    "/website-privacy",
    "/cookies",
    "/terms",
    "/accessibility",
  ];

  const consultantPaths = getProfiledConsultantSlugs().map(
    (s) => `/consultants/${s}`,
  );
  const specialityPaths = getAllSpecialities().map((s) => `/specialities/${s.slug}`);

  return [...staticPaths, ...consultantPaths, ...specialityPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path.includes("/") && path.split("/").length > 2 ? 0.6 : 0.8,
  }));
}
