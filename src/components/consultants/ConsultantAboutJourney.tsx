"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

export type ConsultantAboutChapter = {
  label: string;
  heading: string;
  paragraphs: string[];
};

type ConsultantAboutJourneyProps = {
  chapters: ConsultantAboutChapter[];
  introduction: string;
  title: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function Plus({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative h-5 w-5 shrink-0 text-ink">
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
      <motion.span
        animate={{ opacity: open ? 0 : 1, scaleY: open ? 0 : 1 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current"
      />
    </span>
  );
}

export default function ConsultantAboutJourney({
  chapters,
  introduction,
  title,
}: ConsultantAboutJourneyProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const nextChapter = Math.min(
      chapters.length - 1,
      Math.floor(latest * chapters.length),
    );

    setActiveChapter((current) =>
      current === nextChapter ? current : nextChapter,
    );
  });

  const moveToChapter = (index: number) => {
    setActiveChapter(index);

    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const scene = sceneRef.current;
    if (!scene) return;

    const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    const scrollableDistance = scene.offsetHeight - window.innerHeight;
    const chapterProgress = (index + 0.5) / chapters.length;

    window.scrollTo({
      top: sceneTop + scrollableDistance * chapterProgress,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      ref={sceneRef}
      id="about"
      className="relative scroll-mt-24 bg-[#f8f5ef] lg:h-[280svh]"
    >
      <div className="container-wide py-16 md:py-20 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:pb-8 lg:pt-28">
        <div className="grid w-full gap-12 lg:max-h-[650px] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16 xl:gap-20">
          <aside className="flex items-center">
            <div>
              <h2 className="max-w-[8ch] font-display text-[48px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl lg:max-w-none lg:whitespace-nowrap lg:text-[58px] xl:text-[64px]">
                {title}
              </h2>

              <p className="mt-6 max-w-[330px] text-[16px] leading-[1.7] text-ink-muted md:text-[18px]">
                {introduction}
              </p>

              <div
                className="mt-8 flex items-center gap-3 lg:mt-10 lg:flex-col lg:items-start lg:gap-1"
                aria-label="About section progress"
              >
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.label}
                    type="button"
                    aria-label={`Move to ${chapter.label}`}
                    aria-current={activeChapter === index ? "step" : undefined}
                    onClick={() => moveToChapter(index)}
                    className="group flex h-5 items-center"
                  >
                    <span
                      className={`block rounded-full transition-[width,background-color] duration-500 ease-smooth motion-reduce:transition-none ${
                        activeChapter === index
                          ? "h-1 w-36 bg-ink"
                          : "h-[3px] w-14 bg-[#b9c4ca] group-hover:w-20 group-hover:bg-ink/55 md:w-16"
                      }`}
                    />
                    <span className="sr-only">{chapter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[2.5rem] bg-[#dfe9e4] px-6 py-8 md:px-10 md:py-10 lg:flex lg:h-[min(650px,calc(100svh-9rem))] lg:flex-col lg:justify-center lg:px-12 lg:py-10 xl:px-14">
            <div className="border-t border-ink/15">
              {chapters.map((chapter, index) => {
                const isActive = activeChapter === index;
                const panelId = `consultant-about-panel-${index}`;

                return (
                  <motion.article
                    layout={!reduceMotion}
                    key={chapter.label}
                    transition={{
                      duration: reduceMotion ? 0 : 0.55,
                      ease: EASE,
                    }}
                    className="border-b border-ink/15"
                  >
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={panelId}
                      onClick={() => moveToChapter(index)}
                      className="group flex w-full items-center justify-between gap-8 py-6 text-left md:py-7"
                    >
                      <span className="font-display text-[30px] font-medium leading-tight tracking-[-0.035em] text-ink transition-transform duration-500 group-hover:translate-x-1 md:text-[38px] lg:text-[40px]">
                        {chapter.label}
                      </span>
                      <Plus open={isActive} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          id={panelId}
                          initial={
                            reduceMotion ? false : { height: 0, opacity: 0 }
                          }
                          animate={{ height: "auto", opacity: 1 }}
                          exit={
                            reduceMotion
                              ? undefined
                              : { height: 0, opacity: 0 }
                          }
                          transition={{
                            duration: reduceMotion ? 0 : 0.5,
                            ease: EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="max-w-[680px] space-y-5 pb-8 pr-6 text-[16px] leading-[1.75] text-ink/72 md:pb-10 md:pr-14 md:text-[18px] lg:text-[19px]">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
