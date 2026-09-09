import Image from "next/image";
import Link from "next/link";
import type { Consultant, Speciality } from "@/content/types";
import { cancerTypeHref, consultantAppointmentHref } from "@/content/routes";
import { site } from "@/content/site";
import ProfileSectionNav, { type ProfileSectionNavItem } from "./ProfileSectionNav";
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

export default function ConsultantProfileOverview({ consultant: c, intro, specialities, hasLocations }: {
  consultant: Consultant;
  intro: string;
  specialities: Speciality[];
  hasLocations: boolean;
}) {
  const expertise = specialities.map(speciality => ({
    // Ruth's reviewed profile explicitly includes adult spinal tumours.
    label: c.slug === "ruth-davis" && speciality.slug === "brain"
      ? "Brain & spinal tumours"
      : speciality.title.replace(/\bCancer\b/g, "cancer"),
    href: cancerTypeHref(speciality.slug, "cancer-journey"),
    slug: speciality.slug,
  })).sort((a, b) => c.slug === "ruth-davis" ? Number(b.slug === "breast") - Number(a.slug === "breast") : 0);
  const navItems: ProfileSectionNavItem[] = [
    { id: "about", label: "About" },
    ...(hasLocations ? [{ id: "locations" as const, label: "Locations" }] : []),
    { id: "fees", label: "Fees" },
    { id: "reviews", label: "Reviews" },
  ];
  return (
    <section id="overview" data-anchor-align="viewport" className={styles.overview} aria-label={`${c.name} at a glance`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.photo}>
            {c.photo ? <Image src={c.photo} alt={c.name} fill priority sizes="(min-width: 1100px) 25vw, (min-width: 700px) 34vw, 32vw" /> : <span className={styles.initials}>{c.name.replace(/^Dr\s/, "").slice(0, 1)}</span>}
          </div>
          <div className={styles.identity}>
            <header className={styles.identityHeader}>
              <h1>{c.name}</h1>
              <p className={styles.role}>{c.role}</p>
              <div className={styles.credentials}>
                {c.qualifications && <p>{c.qualifications}</p>}
              </div>
            </header>
            {expertise.length > 0 && <div id="cancer-expertise" className={styles.expertise}>
              <h2>Cancer expertise</h2>
              <p className={styles.intro}>{summaries[c.slug] ?? intro}</p>
              <ul>{expertise.map(item => <li key={item.slug}><Link href={item.href}><span>{item.label}</span><Arrow /></Link></li>)}</ul>
            </div>}
          </div>
          <aside className={styles.appointments} aria-labelledby="profile-appointments-heading">
            <div className={styles.booking}>
              <h2 id="profile-appointments-heading">Speak to the practice</h2>
              <Link href={consultantAppointmentHref(c.slug)} className={styles.appointmentButton} aria-label={`Request an appointment with ${c.name}`}><span>Request an appointment</span><Arrow /></Link>
              <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className={styles.phone} aria-label={`Call to book with ${c.name} on ${site.contact.phone}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6.5 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-2.5a1 1 0 0 0-.8-1l-3.2-.7a1 1 0 0 0-1 .4l-1.4 1.6a15 15 0 0 1-8.4-8.4L7.8 8a1 1 0 0 0 .4-1l-.7-3.2a1 1 0 0 0-1-.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                <span>Call to book</span>
              </a>
            </div>
            <div id="reviews" className={styles.reviews} aria-labelledby="profile-reviews-heading">
              <h3 id="profile-reviews-heading">Patient reviews</h3>
              <div className={styles.rating} aria-hidden="true">
                <span className={styles.stars}>{Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 24 24" fill="none"><path d="m12 2 3 6.3 7 .9-5.1 4.9 1.3 6.9-6.2-3.3L5.8 21l1.3-6.9L2 9.2l7-.9L12 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>)}</span>
                <span>— / 5</span>
              </div>
              <p>Awaiting verified reviews</p>
            </div>
          </aside>
          <ProfileSectionNav items={navItems} />
        </div>
      </div>
    </section>
  );
}
