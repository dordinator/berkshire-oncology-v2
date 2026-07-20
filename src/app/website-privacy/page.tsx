import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import LegalLayout from "@/components/site/LegalLayout";
import { websitePrivacy } from "@/content/legal/website-privacy";

export const metadata: Metadata = pageMeta({
  title: websitePrivacy.title,
  description: websitePrivacy.description,
  path: "/website-privacy",
});

export default function Page() {
  return <LegalLayout doc={websitePrivacy} />;
}
