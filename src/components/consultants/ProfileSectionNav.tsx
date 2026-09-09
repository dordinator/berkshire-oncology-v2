"use client";

import { useEffect, useState } from "react";
import styles from "./ConsultantProfileOverview.module.css";

export default function ProfileSectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState("overview");
  useEffect(() => {
    const readHash = () => setActive(window.location.hash.slice(1) || "overview");
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => { window.removeEventListener("hashchange", readHash); window.removeEventListener("popstate", readHash); };
  }, []);
  return <nav className={styles.sectionNav} aria-label="Consultant profile sections"><ul>{items.map(item => <li key={item.id}><a href={`#${item.id}`} onClick={() => setActive(item.id)} aria-current={active === item.id ? "location" : undefined}>{item.label}</a></li>)}</ul></nav>;
}
