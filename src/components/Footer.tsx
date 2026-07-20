"use client";

import Link from "next/link";
import BrandLogo from "./site/BrandLogo";
import { site, policyLinks } from "@/content/site";

const practice = [
  { label: "Home", href: "/" },
  { label: "Our Consultants", href: "/consultants" },
  { label: "Specialities", href: "/specialities" },
  { label: "Tariffs", href: "/tariffs" },
  { label: "Contact", href: "/contact" },
  { label: "Useful Links", href: "/links" },
];

function tel(n: string) {
  return `tel:${n.replace(/\s+/g, "")}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const c = site.contact;

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[480px] w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-accent/25 via-lilac/10 to-transparent blur-3xl" />
      <div className="container-wide relative py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
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
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Practice
            </h4>
            <ul className="mt-5 space-y-3">
              {practice.map((l) => (
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
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Policies
            </h4>
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
            <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Get in touch
            </h4>
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
              <p className="text-white/40">Practice Manager: {c.practiceManager}</p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/45 md:flex-row md:items-center">
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
