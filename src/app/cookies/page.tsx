import type { Metadata } from "next";
import { pageMeta } from "@/content/seo";
import LegalLayout from "@/components/site/LegalLayout";
import { cookies } from "@/content/legal/cookies";

export const metadata: Metadata = pageMeta({
  title: cookies.title,
  description: cookies.description,
  path: "/cookies",
});

export default function Page() {
  return <LegalLayout doc={cookies} />;
}
