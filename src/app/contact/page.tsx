import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ContactConceptHero from "@/components/sections/contact/ContactConceptHero";

export const metadata = pageMeta({
  title: "Contact Us",
  description:
    "Contact Berkshire Oncology Partnership to arrange a consultation, ask the practice for guidance, access the patient portal, make a referral or send a professional enquiry.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <ContactConceptHero />
    </>
  );
}
