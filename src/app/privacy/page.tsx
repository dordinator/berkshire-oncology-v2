import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import LegalLayout from "@/components/site/LegalLayout";
import { privacyNotice } from "@/content/legal/privacy-notice";

export const metadata: Metadata = pageMeta({
  title: privacyNotice.title,
  description: privacyNotice.description,
  path: "/privacy",
});

export default function Page() {
  return <LegalLayout doc={privacyNotice} />;
}
