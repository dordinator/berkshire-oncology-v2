"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import BrandLogo from "./site/BrandLogo";
import { getAllSpecialities } from "@/content/queries";

const specialities = getAllSpecialities();

const mainLinks: { label: string; href: string; dropdown?: boolean }[] = [
  { label: "Home", href: "/" },
  { label: "Consultants", href: "/consultants" },
  { label: "Specialities", href: "/specialities", dropdown: true },
  { label: "Tariffs", href: "/tariffs" },
  { label: "Links", href: "/links" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);
  const [mobileSpecOpen, setMobileSpecOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
    >
      <nav
        className={`flex w-full max-w-[1400px] items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
          scrolled
            ? "border border-black/[0.06] bg-white/70 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <Link href="/" aria-label="Berkshire Oncology Partnership — home">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) =>
            l.dropdown ? (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => setSpecOpen(true)}
                onMouseLeave={() => setSpecOpen(false)}
              >
                <Link
                  href={l.href}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
                >
                  {l.label}
                  <svg
                    className={`h-3.5 w-3.5 transition-transform ${specOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <AnimatePresence>
                  {specOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                    >
                      <div className="grid grid-cols-2 gap-1 rounded-3xl border border-black/[0.06] bg-white/90 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                        {specialities.map((s) => (
                          <Link
                            key={s.slug}
                            href={`/specialities/${s.slug}`}
                            className="rounded-2xl px-4 py-2.5 text-sm text-ink/75 transition-colors hover:bg-accent/[0.06] hover:text-ink"
                          >
                            {s.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                {l.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden lg:block">
          <Button href="/contact" variant="primary" arrow>
            Contact us
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 lg:hidden"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-0.5 w-5 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-5 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-4 top-20 max-h-[80vh] overflow-y-auto rounded-3xl border border-black/[0.06] bg-white/95 p-4 shadow-xl backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base text-ink/80 hover:bg-ink/[0.04]"
              >
                Home
              </Link>
              <Link
                href="/consultants"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base text-ink/80 hover:bg-ink/[0.04]"
              >
                Consultants
              </Link>

              <button
                onClick={() => setMobileSpecOpen((v) => !v)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-left text-base text-ink/80 hover:bg-ink/[0.04]"
              >
                Specialities
                <svg
                  className={`h-4 w-4 transition-transform ${mobileSpecOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <AnimatePresence>
                {mobileSpecOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-0.5 px-2 pb-2">
                      <Link
                        href="/specialities"
                        onClick={() => setOpen(false)}
                        className="col-span-2 rounded-xl px-3 py-2 text-sm font-medium text-accent hover:bg-accent/[0.06]"
                      >
                        All specialities
                      </Link>
                      {specialities.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/specialities/${s.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded-xl px-3 py-2 text-sm text-ink/70 hover:bg-ink/[0.04]"
                        >
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href="/tariffs"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base text-ink/80 hover:bg-ink/[0.04]"
              >
                Tariffs
              </Link>
              <Link
                href="/links"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-base text-ink/80 hover:bg-ink/[0.04]"
              >
                Links
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-ink px-4 py-3 text-center text-base font-medium text-white"
              >
                Contact us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
