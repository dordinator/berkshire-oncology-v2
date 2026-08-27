"use client";

import { useEffect, useRef, useState } from "react";

export type ConsultantAboutChapter = {
  label: string;
  heading: string;
  paragraphs: string[];
  tint?: boolean;
};

type ConsultantAboutJourneyProps = {
  chapters: ConsultantAboutChapter[];
};

export default function ConsultantAboutJourney({
  chapters,
}: ConsultantAboutJourneyProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observers = chapterRefs.current.map((chapter, index) => {
      if (!chapter) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveChapter(index);
        },
        {
          rootMargin: "-34% 0px -52% 0px",
          threshold: 0,
        },
      );

      observer.observe(chapter);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [chapters.length]);

  const moveToChapter = (index: number) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    chapterRefs.current[index]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <section
      id="about"
      className="scroll-mt-24 overflow-x-clip bg-[#f8f5ef]"
    >
      <div className="container-wide grid gap-4 lg:grid-cols-[0.38fr_0.62fr] lg:gap-20 xl:gap-28">
        <aside className="py-16 md:py-20 lg:py-0">
          <div className="lg:sticky lg:top-[32svh] lg:pb-[28svh]">
            <h2 className="max-w-md font-display text-[48px] font-medium leading-[0.98] tracking-[-0.045em] text-ink md:text-6xl lg:text-[68px]">
              About.
            </h2>

            <div
              className="mt-8 flex items-center gap-3 lg:mt-10 lg:flex-col lg:items-start lg:gap-4"
              aria-label="About section progress"
            >
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.label}
                  type="button"
                  aria-label={`Move to ${chapter.label}`}
                  aria-current={activeChapter === index ? "step" : undefined}
                  onClick={() => moveToChapter(index)}
                  className="group flex h-7 items-center"
                >
                  <span
                    className={`block rounded-full transition-[width,background-color] duration-500 ease-smooth motion-reduce:transition-none ${
                      activeChapter === index
                        ? "h-1 w-32 bg-ink md:w-36"
                        : "h-[3px] w-14 bg-[#b9c4ca] group-hover:w-20 group-hover:bg-ink/55 md:w-16"
                    }`}
                  />
                  <span className="sr-only">{chapter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {chapters.map((chapter, index) => (
            <section
              key={chapter.label}
              ref={(element) => {
                chapterRefs.current[index] = element;
              }}
              data-about-chapter={chapter.label}
              data-active={activeChapter === index ? "true" : "false"}
              className={`relative isolate flex scroll-mt-32 items-center py-16 md:py-20 lg:min-h-[72svh] lg:py-28 ${
                chapter.tint
                  ? "lg:min-h-[88svh] lg:before:absolute lg:before:inset-y-0 lg:before:-left-[8vw] lg:before:right-[calc(50%-50vw)] lg:before:-z-10 lg:before:rounded-tl-[140px] lg:before:bg-[#dce9e4]"
                  : ""
              }`}
            >
              <div className="relative max-w-[760px]">
                <h3 className="font-display text-[36px] font-medium leading-[1.02] tracking-[-0.035em] text-ink md:text-[46px]">
                  {chapter.heading}
                </h3>
                <div className="mt-7 space-y-6 text-[18px] leading-[1.75] text-ink/72 md:text-[21px] md:leading-[1.7]">
                  {chapter.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
