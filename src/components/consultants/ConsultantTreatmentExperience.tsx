"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type ConsultantTreatmentExperienceItem = {
  title: string;
  description: string;
  links: { label: string; href: string }[];
};

type ConsultantTreatmentExperienceProps = {
  consultantName: string;
  items: ConsultantTreatmentExperienceItem[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

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

export default function ConsultantTreatmentExperience({
  consultantName,
  items,
}: ConsultantTreatmentExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const manualSelectionUntil = useRef(0);
  const [openItem, setOpenItem] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || items.length < 2) return;

    let animationFrame = 0;
    const updateFromScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (
          !section ||
          window.innerWidth < 1024 ||
          Date.now() < manualSelectionUntil.current
        ) {
          return;
        }

        const bounds = section.getBoundingClientRect();
        const lockedDistance = Math.max(1, bounds.height - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -bounds.top / lockedDistance));
        const nextItem = Math.min(
          items.length - 1,
          Math.floor(progress * items.length),
        );
        setOpenItem((current) => (current === nextItem ? current : nextItem));
      });
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [items.length, reduceMotion]);

  function chooseItem(index: number) {
    manualSelectionUntil.current = Date.now() + 1400;
    setOpenItem(index);
  }

  return (
    <section
      id="treatments"
      data-anchor-align="viewport"
      ref={sectionRef}
      data-treatment-count={Math.min(items.length, 6)}
      className="consultant-treatment-section relative scroll-mt-24 bg-paper-soft text-ink"
    >
      <div className="consultant-treatment-stage site-gutter w-full lg:sticky lg:top-0 lg:flex lg:items-center">
        <div className="grid w-full gap-12 lg:grid-cols-[0.4fr_0.6fr] lg:items-center lg:gap-[5vw]">
          <div>
            <h2 className="type-feature-title max-w-[9ch] text-ink">
              Treatment experience.
            </h2>
            <p className="type-section-lede mt-6 max-w-md text-ink-muted">
              These are the treatment approaches listed in {consultantName}&rsquo;s
              profile. The right approach depends on your diagnosis and a
              clinical review.
            </p>
            <p className="type-supporting mt-6 max-w-sm text-ink-muted">
              You do not need to decide between them before arranging a
              consultation.
            </p>
          </div>

          <div className="border-t border-ink/15">
            {items.map((item, index) => {
              const open = openItem === index;
              const panelId = `consultant-treatment-panel-${index}`;

              return (
                <motion.article
                  key={item.title}
                  layout="position"
                  transition={{
                    layout: { duration: reduceMotion ? 0 : 0.58, ease: EASE },
                  }}
                  className="border-b border-ink/15"
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => chooseItem(index)}
                    className="group grid w-full grid-cols-[28px_minmax(0,1fr)_32px] items-start gap-4 py-7 text-left md:grid-cols-[34px_minmax(0,1fr)_36px] md:gap-6 md:py-9"
                  >
                    <span className="type-label pt-1 tabular-nums text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="type-card-title text-ink">
                      {item.title}
                    </span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-lg leading-none text-ink transition-colors group-hover:border-ink/15"
                      aria-hidden
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0, y: 8 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -5 }}
                        transition={{
                          height: { duration: reduceMotion ? 0 : 0.62, ease: EASE },
                          opacity: { duration: reduceMotion ? 0 : 0.4, ease: EASE },
                          y: { duration: reduceMotion ? 0 : 0.48, ease: EASE },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 pb-8 md:grid-cols-[34px_minmax(0,1fr)] md:gap-6 md:pb-10">
                          <span aria-hidden />
                          <div>
                            <p className="type-body max-w-2xl text-ink-muted">
                              {item.description}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                              {item.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="type-button group/link inline-flex items-center gap-3 text-ink underline decoration-ink/20 underline-offset-[7px] transition-colors hover:decoration-ink"
                                >
                                  {link.label}
                                  <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                                    <Arrow />
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
