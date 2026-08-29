"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const routes = [
  {
    id: "newly-diagnosed",
    label: "I’m newly diagnosed",
    statement: "Find the consultants who treat your cancer type.",
    body: "Use the diagnosis shown in your clinic letter or report. If you are unsure which category it belongs to, the practice team can help.",
    points: [
      "Choose the cancer type you have been diagnosed with",
      "See the consultants who treat it",
      "Review their experience and where they practise",
    ],
    action: { label: "Browse cancer types and consultants", href: "/specialities" },
    tone: "bg-[#dce6e1]",
  },
  {
    id: "second-opinion",
    label: "I’m looking for a second opinion",
    statement: "A second opinion can review your diagnosis, treatment plan or both.",
    body: "It may confirm what you have already been told or provide a different view. Arranging one can take time, so speak to your current team before changing any tests, appointments or treatment.",
    points: [
      "Decide what you would like the consultant to review",
      "Ask your current team for relevant letters, test results and imaging",
      "Keep existing appointments unless your clinical team advises otherwise",
    ],
    action: { label: "Contact the practice", href: "/contact" },
    tone: "bg-[#e6edf3]",
  },
  {
    id: "private-treatment",
    label: "I’m looking for private treatment",
    statement: "Start with a consultation and a clear understanding of the likely costs.",
    body: "Private care may be self-funded or paid through medical insurance. Any treatment recommendation depends on your diagnosis and a consultant’s review of your clinical information.",
    points: [
      "Ask your insurer whether a referral and authorisation are required",
      "Request a written estimate and check what it includes",
      "Confirm where consultations and any agreed treatment would take place",
    ],
    action: { label: "Understand fees and insurance", href: "/tariffs" },
    tone: "bg-[#f0ece2]",
  },
  {
    id: "receiving-treatment",
    label: "I’m already receiving treatment",
    statement: "Use the urgent contact details from your treating team if you feel unwell.",
    body: "For new or worsening symptoms, use the urgent number on your treatment record or alert card. Call NHS 111 if you cannot find that number. Call 999 in a life-threatening emergency.",
    points: [
      "Keep your treatment team’s urgent number easy to find",
      "Contact your treating team about symptoms or side effects",
      "Contact the practice team about appointments or paperwork",
    ],
    action: { label: "Find trusted support services", href: "/resources" },
    tone: "bg-[#dce5ed]",
  },
  {
    id: "supporting-someone",
    label: "I’m supporting someone with cancer",
    statement: "Ask what support the person wants and how they would like you to be involved.",
    body: "You can help prepare questions, attend appointments if they would like you there and support practical tasks. Healthcare professionals need the patient’s permission before sharing details about their care.",
    points: [
      "Agree what they would like help with",
      "Write down questions together before an appointment",
      "Look for practical and emotional support for yourself as well",
    ],
    action: { label: "Find support services for carers", href: "/resources" },
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
        <header className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-[clamp(2.8rem,5.1vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
            Find the route that sounds most like you.
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-ink-muted md:text-xl">
            Each route explains what you can do next and what information may be
            useful.
          </p>
        </header>

        <div className="mt-20 grid items-start gap-14 md:mt-24 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
          {/* A viewport-tall sticky box with the nav flex-centred inside it,
              rather than pinned near the top: the route list rides the middle
              of the screen for the whole length of the sheets. Same pattern as
              the home page's chapter columns. */}
          <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
            <nav aria-label="Patient starting points">
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
              // data-fx="rise": each route sheet rises and settles as it
              // arrives — this column is 39% of the page and was the only
              // stretch with no scroll life at all. Safe against the sticky
              // aside: that lives in the SIBLING grid column, so no tween here
              // ever puts a transform on one of its ancestors.
              <article
                key={route.id}
                id={route.id}
                aria-labelledby={`${route.id}-title`}
                data-patient-route
                data-fx="rise"
                className={`flex scroll-mt-32 overflow-hidden rounded-[2.25rem] border border-ink/[0.06] p-7 will-change-transform sm:p-9 md:min-h-[570px] md:rounded-[3rem] md:p-12 lg:p-14 ${route.tone}`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div>
                    <h3
                      id={`${route.id}-title`}
                      className="max-w-3xl font-display text-[clamp(2.25rem,3.5vw,3.9rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-ink"
                    >
                      {route.statement}
                    </h3>
                    <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink/75 md:text-lg">
                      {route.body}
                    </p>
                  </div>

                  <div className="mt-12 md:mt-auto md:pt-12">
                    <div className="grid gap-8 border-t border-ink/15 pt-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <ul className="space-y-3">
                        {route.points.map((point) => (
                          <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
                            <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 flex-none rounded-full bg-[#769187]" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={route.action.href}
                        className="group inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-white/30 focus-visible:border-ink/40 focus-visible:bg-white/30"
                      >
                        {route.action.label}
                        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
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
