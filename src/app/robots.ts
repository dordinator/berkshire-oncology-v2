import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  // Crawlers must be able to read the noindex response header and page metadata.
  // Do not advertise a sitemap or the live practice's hostname for the demo.
  if (process.env.SITE_NOINDEX === "true") {
    return { rules: { userAgent: "*", allow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
