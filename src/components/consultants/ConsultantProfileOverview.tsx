import Image from "next/image";
import Link from "next/link";
import type { Consultant, Speciality } from "@/content/types";
import { journeyStops } from "@/content/journey";
import { cancerTypeHref, consultantAppointmentHref } from "@/content/routes";
import { site } from "@/content/site";
import ProfileSectionNav from "./ProfileSectionNav";
import styles from "./ConsultantProfileOverview.module.css";

// Concise summaries of the maintained profiles, rather than new clinical claims.
const summaries: Record<string, string> = {
  "joss-adams": "Specialist care for breast cancer, lung cancer and lymphoma.",
  "madhumita-bhattacharyya": "Specialist care for melanoma, breast and ovarian cancers.",
  "nicola-dallas": "Specialist care for urological, head and neck and thyroid cancers.",
  "ruth-davis": "Specialist care for breast cancer and adult brain and spinal tumours.",
  "gelareh-eslamian": "Specialist care for breast and upper gastrointestinal cancers.",
  "alice-freebairn": "Specialist care for colorectal, head and neck and non-melanomatous skin cancers.",
  "esme-hill": "Specialist care for upper gastrointestinal, liver and pancreatic cancers.",
  "ayman-madi": "Specialist care for breast and colorectal cancers.",
  "helen-odonnell": "Specialist care for gynaecological and urological cancers.",
  "paul-rogers": "Specialist care for prostate, testicular, kidney, bladder and urothelial tract cancers.",
};

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function ConsultantProfileOverview({ consultant: c, referenceName, intro, specialities, locationSlugs, hasTreatments }: {
  consultant: Consultant;
  referenceName: string;
  intro: string;
  specialities: Speciality[];
  locationSlugs: string[];
  hasTreatments: boolean;
}) {
  const locations = locationSlugs.flatMap(slug => {
    const stop = journeyStops.find(item => item.slug === slug);
    return stop ? [stop] : [];
  });
  const expertise = specialities.map(speciality => ({
    // Ruth's reviewed profile explicitly includes adult spinal tumours.
    label: c.slug === "ruth-davis" && speciality.slug === "brain"
      ? "Brain & spinal tumours"
      : speciality.title.replace(/\bCancer\b/g, "cancer"),
    href: cancerTypeHref(speciality.slug, "cancer-journey"),
    slug: speciality.slug,
  })).sort((a, b) => c.slug === "ruth-davis" ? Number(b.slug === "breast") - Number(a.slug === "breast") : 0);
  const navItems = [
    { id: "overview", label: "Overview" },
    ...(expertise.length ? [{ id: "cancer-expertise", label: "Cancer expertise" }] : []),
    ...(hasTreatments ? [{ id: "treatments", label: "Treatments" }] : []),
    ...(locations.length ? [{ id: "locations", label: "Locations" }] : []),
    { id: "fees", label: "Fees" },
    { id: "about", label: "About" },
    { id: "reviews", label: "Reviews" },
  ];
  return (
    <section id="overview" data-anchor-align="viewport" className={styles.overview} aria-label={`${c.name} at a glance`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.media}>
            <div className={styles.photo}>
              {c.photo ? <Image src={c.photo} alt={c.name} fill priority sizes="(min-width: 1100px) 28vw, (min-width: 700px) 35vw, 30vw" /> : <span className={styles.initials}>{c.name.replace(/^Dr\s/, "").slice(0, 1)}</span>}
            </div>
            <div id="reviews" className={styles.reviews} aria-label="Patient reviews">
              <div className={styles.rating} aria-hidden="true">
                <span className={styles.stars}>{Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 24 24" fill="none"><path d="m12 2 3 6.3 7 .9-5.1 4.9 1.3 6.9-6.2-3.3L5.8 21l1.3-6.9L2 9.2l7-.9L12 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>)}</span>
                <span>— / 5</span>
              </div>
              <p>Awaiting verified reviews</p>
            </div>
          </div>
          <div className={styles.identity}>
            <header className={styles.identityHeader}>
              <h1>{c.name}</h1>
              <p className={styles.role}>{c.role}</p>
              <div className={styles.credentials}>
                {c.qualifications && <p>{c.qualifications}</p>}
                {c.gmc && <p>GMC {c.gmc}</p>}
              </div>
            </header>
            <p className={styles.intro}>{summaries[c.slug] ?? intro}</p>
            {expertise.length > 0 && <div id="cancer-expertise" className={styles.expertise}>
              <h2>Cancer expertise</h2>
              <ul>{expertise.map(item => <li key={item.slug}><Link href={item.href}><span>{item.label}</span><Arrow /></Link></li>)}</ul>
              {hasTreatments && <a href="#treatments" className={styles.textLink}>Explore treatment expertise <Arrow /></a>}
            </div>}
          </div>
          <aside className={styles.appointments} aria-labelledby="profile-appointments-heading">
            <div className={styles.booking}>
              <h2 id="profile-appointments-heading">Appointments with {referenceName}</h2>
              <Link href={consultantAppointmentHref(c.slug)} className={styles.appointmentButton}><span>Request an appointment with {referenceName}</span><Arrow /></Link>
              <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className={styles.phone}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-2.5a1 1 0 0 0-.8-1l-3.2-.7a1 1 0 0 0-1 .4l-1.4 1.6a15 15 0 0 1-8.4-8.4L7.8 8a1 1 0 0 0 .4-1l-.7-3.2a1 1 0 0 0-1-.8Z" /></svg>
                <span><span className="sr-only">Call the practice on </span>{site.contact.phone}</span>
              </a>
            </div>
            <div id="fees" className={styles.fees}>
              <h2>Consultation fees</h2>
              <dl><div><dt>Initial consultation</dt><dd>On request</dd></div><div><dt>Follow-up</dt><dd>On request</dd></div></dl>
              <Link href="/tariffs" className={styles.textLink}>Fees &amp; insurance <Arrow /></Link>
            </div>
            {locations.length > 0 && <div className={styles.locations}>
              <h2>Locations</h2>
              <ul>{locations.map(stop => <li key={stop.slug}>
                <a href={`#location-${stop.slug}`} aria-label={`View ${stop.name}, ${stop.area}${stop.nhs ? ", NHS" : ""}`}><span><span className={styles.locationName}>{stop.name}</span><span className={styles.town}>{stop.area}{stop.nhs ? " · NHS" : ""}</span></span><Arrow /></a>
              </li>)}</ul>
            </div>}
          </aside>
        </div>
        <ProfileSectionNav items={navItems} />
      </div>
    </section>
  );
}
