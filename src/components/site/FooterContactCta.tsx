"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { shouldRenderSharedFooterContact } from "@/lib/footerContact";

function Arrow() {
  return (
    <svg viewBox="0 0 18 18" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3.5 9h11M10.5 5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContactRoute({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group -mx-3 flex min-h-[6.25rem] items-center justify-between gap-5 border-t border-ink/10 px-3 py-5 text-left last:border-b"
    >
      <span className="min-w-0">
        <span className="type-card-title block text-ink">
          {title}
        </span>
        <span className="type-supporting mt-2 block max-w-md text-ink-muted">
          {description}
        </span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-ink/30 text-gold-ink transition-all duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
        <Arrow />
      </span>
    </Link>
  );
}

export default function FooterContactCta() {
  const pathname = usePathname();

  if (!shouldRenderSharedFooterContact(pathname)) return null;

  const phoneHref = `tel:${site.contact.phone.replace(/\s+/g, "")}`;

  return (
    <section
      id="contact-next-step"
      data-anchor-align="viewport"
      className="flex scroll-mt-24 items-center bg-ink pb-12 pt-28 text-white"
    >
      <div className="container-wide w-full">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(25rem,0.72fr)] lg:items-center lg:gap-[7vw]">
          <Reveal>
            <div className="max-w-4xl">
              <h2 className="type-editorial-hero [text-shadow:0_2px_24px_rgba(6,28,70,0.45)]">
                You do not need to work out the next step alone.
              </h2>
              <p className="type-hero-lede mt-7 max-w-2xl text-white/78">
                Tell us what you know and the practice team can help you decide who
                to speak to.
              </p>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="rounded-[2rem] border border-white/55 bg-paper/95 p-6 text-ink shadow-[0_32px_90px_-28px_rgba(6,28,70,0.55)] backdrop-blur-md sm:p-8 lg:p-10">
              <p className="type-supporting text-ink-muted">
                What would help now?
              </p>
              <div className="mt-4">
                <ContactRoute
                  href="/contact?intent=consultation#next-step"
                  title="Arrange a consultation"
                  description="Request an appointment and share the details you have."
                />
                <ContactRoute
                  href="/contact?intent=guidance#next-step"
                  title="I’m not sure what happens next"
                  description="Ask the practice team what to do next. You do not need to choose a consultant or treatment first."
                />
              </div>
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t border-ink/10 pt-5">
                <span className="text-xs leading-relaxed text-ink-muted">
                  Prefer to speak to someone?
                </span>
                <a
                  href={phoneHref}
                  className="font-display text-xl font-semibold text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-gold-ink"
                >
                  {site.contact.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
