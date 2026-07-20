import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import LegalLayout from "@/components/site/LegalLayout";
import { terms } from "@/content/legal/terms";

export const metadata: Metadata = pageMeta({
  title: terms.title,
  description: terms.description,
  path: "/terms",
});

export default function Page() {
  return <LegalLayout doc={terms} />;
}
