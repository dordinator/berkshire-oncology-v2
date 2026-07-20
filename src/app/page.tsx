import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/home/Intro";
import Hospitals from "@/components/sections/home/Hospitals";
import SpecialitiesPreview from "@/components/sections/home/SpecialitiesPreview";
import ContactCta from "@/components/sections/home/ContactCta";
import JsonLd from "@/components/site/JsonLd";
import { organizationLd } from "@/content/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={organizationLd()} />
      <Hero />
      <Intro />
      <SpecialitiesPreview />
      <Hospitals />
      <ContactCta />
    </>
  );
}
