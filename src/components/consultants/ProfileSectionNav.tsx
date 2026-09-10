"use client";

import { useEffect, useState } from "react";
import styles from "./ConsultantProfileOverview.module.css";

type SectionId = "about" | "treatments" | "locations" | "fees" | "reviews";
export type ProfileSectionNavItem = { id: SectionId; label: string };

function SectionIcon({ section }: { section: SectionId }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {section === "about" && <><circle cx="16" cy="9" r="5" /><path d="M5 28v-3c0-5 5-8 11-8s11 3 11 8v3H5Z" /></>}
      {section === "treatments" && <path d="m6.5 15.5 9-9a7.1 7.1 0 0 1 10 10l-9 9a7.1 7.1 0 0 1-10-10ZM11 11l10 10" />}
      {section === "locations" && <><path d="m3 7 8-4 10 4 8-4v23l-8 4-10-4-8 4V7Zm8-4v23M21 7v23" /><path d="m7 18 5-4 8 5 5-5" strokeDasharray="2 3" /></>}
      {section === "fees" && <><path d="M6 3h20v27l-4-3-3 3-3-3-3 3-3-3-4 3V3Z" /><path d="M21 10c-1-3-7-3-7 1v9m-3-6h8m-8 7h11" /></>}
      {section === "reviews" && <path d="M4 6h10v9c0 7-3 11-9 13v-5c3-1 4-3 4-6H4V6Zm15 0h10v9c0 7-3 11-9 13v-5c3-1 4-3 4-6h-5V6Z" />}
    </svg>
  );
}

export default function ProfileSectionNav({ items }: { items: ProfileSectionNavItem[] }) {
  const [active, setActive] = useState<SectionId>("about");
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.slice(1);
      const section = hash.startsWith("location-") ? "locations" : hash;
      setActive(items.find(item => item.id === section)?.id ?? "about");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, [items]);
  return (
    <nav className={styles.sectionNav} aria-label="Consultant profile sections">
      <ul>{items.map(item => (
        <li key={item.id}>
          <a href={`#${item.id}`} onClick={() => setActive(item.id)} aria-current={active === item.id ? "location" : undefined}>
            <SectionIcon section={item.id} /><span>{item.label}</span>
          </a>
        </li>
      ))}</ul>
    </nav>
  );
}
