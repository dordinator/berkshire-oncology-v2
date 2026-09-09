import CareLocationsJourney from "@/components/locations/CareLocationsJourney";

export default function ConsultantLocationsJourney({ consultantName, locationSlugs }: {
  consultantName: string;
  locationSlugs: string[];
}) {
  return <CareLocationsJourney
    title={`Where ${consultantName} works.`}
    introduction={`${consultantName} practises at these sites. The right place depends on the consultation and care you need.`}
    locationSlugs={locationSlugs}
    className="consultant-locations-section consultant-section-rhythm"
  />;
}
