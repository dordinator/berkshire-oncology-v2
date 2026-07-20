import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import LegalLayout from "@/components/site/LegalLayout";
import { accessibility } from "@/content/legal/accessibility";

export const metadata: Metadata = pageMeta({
  title: accessibility.title,
  description: accessibility.description,
  path: "/accessibility",
});

export default function Page() {
  return <LegalLayout doc={accessibility} />;
}
