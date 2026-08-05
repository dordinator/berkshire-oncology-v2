"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const routes = [
  {
    id: "newly-diagnosed",
    label: "I’m newly diagnosed",
    eyebrow: "A diagnosis has been confirmed",
    statement: "You do not need to have everything in order before you call.",
    body: "The practice team will take a few details, identify the consultant whose specialism matches your diagnosis, and explain what is needed for a first appointment.",
    points: [
      "Share any scans, reports or letters you already have",
      "Tell us which team is currently looking after you",
      "Have your insurance details nearby if you are insured",
    ],
    action: { label: "Newly diagnosed: what happens next", href: "/patients/newly-diagnosed" },
    tone: "bg-[#dce6e1]",
  },
  {
    id: "second-opinion",
    label: "I’m looking for a second opinion",
    eyebrow: "An independent specialist view",
    statement: "A second opinion is a normal part of making a careful decision.",
    body: "Our consultants can review a diagnosis, a proposed treatment plan, or both. The most useful appointment begins with the same records and imaging your current team has seen.",
    points: [
      "Tell us what you would like reviewed",
      "Share the hospital and team that hold your records",
      "The practice team will explain how to transfer what is needed",
    ],
    action: { label: "How to arrange a second opinion", href: "/patients/second-opinion" },
    tone: "bg-[#e6edf3]",
  },
  {
    id: "private-treatment",
    label: "I’m looking for private treatment",
    eyebrow: "Private care, clearly explained",
    statement: "Start with the consultant and the care you need—not the paperwork.",
    body: "Care can be funded through private medical insurance or paid for directly. The practice team will explain the route, where appointments and treatment can happen, and how fees are confirmed before you proceed.",
    points: [
      "Find the consultant who specialises in your diagnosis",
      "Understand self-funding and insured routes",
      "Request consultant-specific tariff information",
    ],
    action: { label: "Explore private treatment", href: "/patients/private-treatment" },
    tone: "bg-[#f0ece2]",
  },
  {
    id: "receiving-treatment",
    label: "I’m already receiving treatment",
    eyebrow: "Support between appointments",
    statement: "Knowing who to contact is part of feeling supported.",
    body: "Your treatment team will give you the right route for urgent clinical concerns. The practice team can help with appointments, paperwork and questions about the wider organisation of your care.",
    points: [
      "Keep your treatment team’s urgent contact number close",
      "Ask early if an appointment needs to change",
      "Use the support resources selected for patients in treatment",
    ],
    action: { label: "Support while receiving treatment", href: "/patients/receiving-treatment" },
    tone: "bg-[#dce5ed]",
  },
  {
    id: "supporting-someone",
    label: "I’m supporting someone with cancer",
    eyebrow: "For families, friends and carers",
    statement: "You are part of the picture, and you are allowed to need support too.",
    body: "You can help prepare questions, attend appointments where the patient wants you there, and make the practical parts of treatment more manageable. Support is also available for you.",
    points: [
      "Write down questions together before an appointment",
      "Ask the patient how they would like you to be involved",
      "Make space for your own practical and emotional support",
    ],
    action: { label: "Guidance for supporting someone", href: "/patients/supporting-someone" },
    tone: "bg-[#d7e1dc]",
  },
] as const;

export default function PatientPathwayScroll() {
  const [active, setActive] = useState<string>(routes[0].id);

  useEffect(() => {
    const elements = routes
      .map((route) => document.getElementById(route.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-18% 0px -52% 0px", threshold: [0, 0.2, 0.5, 0.8] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="start-here"
      className="relative z-20 -mt-14 scroll-mt-24 rounded-t-[2.5rem] bg-white pb-24 pt-24 md:-mt-20 md:rounded-t-[3.5rem] md:pb-32 md:pt-32"
    >
      <div className="container-wide">
        <div className="grid gap-8 border-b border-ink/10 pb-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-16 md:pb-20">
          <span className="eyebrow">
            <span aria-hidden className="h-px w-8 bg-ink-muted" /> Start here
          </span>
          <div>
            <h2 className="font-display text-[clamp(2.8rem,5.1vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
              Find the route that sounds most like you.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
              Each route gives you a useful first step. You do not need to read
              all five, and you do not need to know the right clinical language.
            </p>
          </div>
        </div>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20 md:mt-20">
          <aside className="hidden lg:sticky lg:top-32 lg:block">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              Your starting point
            </p>
            <nav aria-label="Patient starting points" className="mt-6">
              {routes.map((route) => {
                const selected = active === route.id;
                return (
                  <Link
                    key={route.id}
                    href={`#${route.id}`}
                    aria-current={selected ? "location" : undefined}
                    className={`block border-b py-4 text-[15px] leading-snug transition-colors ${
                      selected
                        ? "border-ink font-medium text-ink"
                        : "border-ink/10 text-ink-muted hover:border-ink/30 hover:text-ink"
                    }`}
                  >
                    {route.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-12 md:space-y-20">
            {routes.map((route) => (
              <article
                key={route.id}
                id={route.id}
                data-patient-route
                className={`scroll-mt-32 overflow-hidden rounded-[2.25rem] border border-ink/[0.06] p-7 sm:p-9 md:min-h-[570px] md:rounded-[3rem] md:p-12 lg:p-14 ${route.tone}`}
              >
                <div className="flex min-h-full flex-col">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.19em] text-ink-muted">
                      {route.eyebrow}
                    </p>
                    <h3 className="mt-6 max-w-3xl font-display text-[clamp(2.25rem,4.1vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink">
                      {route.statement}
                    </h3>
                    <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink/75 md:text-lg">
                      {route.body}
                    </p>
                  </div>

                  <div className="mt-12 grid gap-8 border-t border-ink/15 pt-7 md:mt-auto md:grid-cols-[1fr_auto] md:items-end">
                    <ul className="space-y-3">
                      {route.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm leading-relaxed text-ink/70">
                          <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 flex-none rounded-full bg-[#769187]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={route.action.href}
                      className="group inline-flex items-center gap-3 text-sm font-medium text-ink"
                    >
                      {route.action.label}
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
