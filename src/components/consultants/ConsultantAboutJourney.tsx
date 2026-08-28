"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

export type ConsultantAboutChapter = {
  label: string;
  heading: string;
  paragraphs: string[];
};

type ConsultantAboutJourneyProps = {
  chapters: ConsultantAboutChapter[];
  consultantName: string;
  expertise: { href: string; title: string }[];
  title: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Plus({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative h-4 w-4 shrink-0 text-ink"
    >
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
    </motion.span>
  );
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 12h15M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ConsultantAboutJourney({
  chapters,
  consultantName,
  expertise,
  title,
}: ConsultantAboutJourneyProps) {
  const summaryChapter = chapters[0];
  const detailChapters = chapters.slice(1);
  const expertiseIndex = detailChapters.length;
  const [activePanel, setActivePanel] = useState(expertiseIndex);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function openHashPanel() {
      if (window.location.hash === "#cancer-expertise") {
        setActivePanel(expertiseIndex);
      }
    }

    openHashPanel();
    window.addEventListener("hashchange", openHashPanel);
    return () => window.removeEventListener("hashchange", openHashPanel);
  }, [expertiseIndex]);

  return (
    <section
      id="about"
      className="consultant-about-section consultant-section-rhythm scroll-mt-24 bg-[#f7f5f1] text-ink lg:flex lg:items-center"
    >
      <div className="grid w-full gap-14 px-5 sm:px-8 md:px-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-[5vw] lg:px-[5vw]">
        <div>
          <h2 className="max-w-[10ch] font-display text-[clamp(3.35rem,5vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            {title}
          </h2>
          {summaryChapter && (
            <div className="mt-8 max-w-[37rem] space-y-5 text-[17px] leading-[1.75] text-ink-muted md:text-[18px]">
              {summaryChapter.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2.5rem] bg-[#dfe9f5] px-6 py-8 md:px-9 md:py-9 lg:px-10 xl:px-12">
          <div className="border-t border-ink/20">
            {detailChapters.map((chapter, index) => {
              const isActive = activePanel === index;
              const panelId = `consultant-about-panel-${index}`;

              return (
                <motion.article
                  layout={!reduceMotion}
                  key={chapter.label}
                  transition={{ duration: reduceMotion ? 0 : 0.58, ease: EASE }}
                  className="border-b border-ink/20"
                >
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    aria-label={`Show ${chapter.heading}`}
                    onClick={() => setActivePanel(index)}
                    className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-6 text-left md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-6 md:py-7"
                  >
                    <span className="text-[12px] font-medium tracking-[0.08em] text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-1 md:text-[2rem]">
                      {chapter.label}
                    </span>
                    <Plus open={isActive} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={panelId}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.55,
                          ease: EASE,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 pb-8 pl-[4.15rem] pr-5 text-[15px] leading-[1.7] text-ink-muted md:pl-[5.75rem] md:pr-10 md:text-[16px]">
                          {chapter.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}

            <motion.article
              id="cancer-expertise"
              layout={!reduceMotion}
              transition={{ duration: reduceMotion ? 0 : 0.58, ease: EASE }}
              className="scroll-mt-24 border-b border-ink/20"
            >
            <button
              type="button"
              aria-expanded={activePanel === expertiseIndex}
              aria-controls="consultant-about-panel-expertise"
              onClick={() => setActivePanel(expertiseIndex)}
              className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-6 text-left md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-6 md:py-7"
            >
              <span className="text-[12px] font-medium tracking-[0.08em] text-ink-muted">
                {String(expertiseIndex + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[1.65rem] font-semibold leading-tight tracking-[-0.03em] transition-transform duration-500 group-hover:translate-x-1 md:text-[2rem]">
                Cancer expertise
              </span>
              <Plus open={activePanel === expertiseIndex} />
            </button>

            <AnimatePresence initial={false}>
              {activePanel === expertiseIndex && (
                <motion.div
                  id="consultant-about-panel-expertise"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: EASE,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-8 pl-[4.15rem] pr-5 md:pl-[5.75rem] md:pr-10">
                    <p className="text-[15px] leading-[1.7] text-ink-muted md:text-[16px]">
                      {consultantName} works with people affected by these cancer
                      types. Each page explains the wider care pathway.
                    </p>
                    <div className="mt-5 grid border-t border-ink/15 sm:grid-cols-2 sm:gap-x-8">
                      {expertise.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group flex items-center justify-between gap-4 border-b border-ink/15 py-3.5 font-display text-lg font-semibold leading-tight tracking-[-0.02em] transition-colors hover:text-accent"
                        >
                          {item.title}
                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            <Arrow />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
