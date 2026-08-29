"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./site/BrandLogo";
import { site, policyLinks } from "@/content/site";
import { navSections } from "@/content/navigation";
import { hasFooterContact } from "@/lib/footerContact";

// The eight sections of the information architecture, split across two columns
// so the footer stays readable. Labels and hrefs come from navigation.ts, so a
// rename there flows through here — the children stay in the navbar only.
const sectionLinks = navSections.map((s) => ({ label: s.label, href: s.href }));

const exploreLinks = [{ label: "Home", href: "/" }, ...sectionLinks.slice(0, 4)];
const practiceLinks = [...sectionLinks.slice(4), { label: "Contact", href: "/contact" }];

function tel(n: string) {
  return `tel:${n.replace(/\s+/g, "")}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const c = site.contact;
  const pathname = usePathname();
  const followsContact = hasFooterContact(pathname);

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-accent/25 via-lilac/10 to-transparent blur-3xl" />
      <div
        className={`container-wide relative ${
          followsContact ? "pb-20 pt-0 md:pb-28" : "py-20 md:py-28"
        }`}
      >
        {/* Five blocks now the link list is split in two, so the grid steps up
            gradually — one column on a phone, two, three, then all five once
            there is room for the contact pill to sit on a single line. */}
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1.15fr]">
          <div>
            <BrandLogo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
              {site.strapline}. A partnership of ten consultant oncologists based in
              Reading, Berkshire.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
            >
              Contact the practice
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Explore
            </h2>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Practice
            </h2>
            <ul className="mt-5 space-y-3">
              {practiceLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Policies
            </h2>
            <ul className="mt-5 space-y-3">
              {policyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Get in touch
            </h2>
            <address className="mt-5 space-y-3 text-sm not-italic text-white/65">
              <p>{c.addressLines.join(", ")}</p>
              <p>
                <a href={tel(c.phone)} className="transition-colors hover:text-white">
                  {c.phone}
                </a>
                <span className="text-white/30"> · </span>
                <a
                  href={tel(c.phoneMobile)}
                  className="transition-colors hover:text-white"
                >
                  {c.phoneMobile}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${c.email}`}
                  className="break-all transition-colors hover:text-white"
                >
                  {c.email}
                </a>
              </p>
              <p className="text-white/60">Practice Manager: {c.practiceManager}</p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center">
          <p>© {year} Berkshire Oncology Partnership. All Rights Reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Cookies
            </Link>
            <Link href="/accessibility" className="hover:text-white">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
