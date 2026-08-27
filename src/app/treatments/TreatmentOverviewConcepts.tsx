"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import ChapterTint from "@/components/sections/home/ChapterTint";

interface TreatmentItem {
  slug: string;
  title: string;
  summary: string;
}

interface TreatmentGroup {
  id: "medicine" | "radiotherapy";
  number: string;
  title: string;
  description: string;
  treatments: TreatmentItem[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className={`h-4 w-4 ${className}`}
      aria-hidden
    >
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

function FamilyCardContent({
  group,
  isMedicine,
}: {
  group: TreatmentGroup;
  isMedicine: boolean;
}) {
  const linkClass =
    "group mt-auto w-fit items-center gap-4 pt-5 text-sm font-medium text-ink underline decoration-ink/25 underline-offset-[7px] transition-colors hover:decoration-ink";

  return (
    <div className="flex h-full flex-col p-8 md:p-10 xl:p-11">
      <h3 className="font-display text-[clamp(2rem,2.55vw,3rem)] font-semibold leading-none tracking-[-0.045em] text-ink">
        {group.title}
      </h3>
      <p className="mt-4 max-w-[38rem] text-[15px] leading-[1.65] text-ink-muted md:text-[16px]">
        {group.description}
      </p>
      {isMedicine ? (
        <Link href="#medicine-treatments" className={`inline-flex ${linkClass}`}>
          Explore medicine treatments
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : (
        <>
          <Link
            href="#radiotherapy-treatments"
            className={`hidden lg:inline-flex ${linkClass}`}
          >
            Explore radiotherapy
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#radiotherapy-treatments-mobile"
            className={`inline-flex lg:hidden ${linkClass}`}
          >
            Explore radiotherapy
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </>
      )}
    </div>
  );
}

function MedicineRows({
  treatments,
  activeIndex,
  onSelect,
}: {
  treatments: TreatmentItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div data-medicine-rows className="border-t border-ink/15">
      {treatments.map((treatment, index) => {
        const isActive = activeIndex === index;
        const panelId = `medicine-panel-${index}`;

        return (
          <motion.article
            layout={!reduce}
            key={treatment.slug}
            transition={{ duration: reduce ? 0 : 0.58, ease: EASE }}
            className="border-b border-ink/15"
          >
            <button
              type="button"
              aria-expanded={isActive}
              aria-controls={panelId}
              onClick={() => onSelect(index)}
              className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 py-5 text-left md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-6 md:py-6"
            >
              <span
                className={`text-[12px] font-medium tracking-[0.08em] transition-colors duration-500 ${
                  isActive ? "text-[#6e9388]" : "text-ink-muted"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-ink transition-transform duration-500 group-hover:translate-x-1 md:text-[2rem]">
                {treatment.title}
              </span>
              <Plus open={isActive} />
            </button>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  id={panelId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-7 pl-[4.5rem] pr-8 md:pb-8 md:pl-[5.5rem]">
                    <p className="max-w-[38rem] text-[15px] leading-[1.7] text-ink-muted md:text-[16px]">
                      {treatment.summary}
                    </p>
                    <Link
                      href={`/treatments/${treatment.slug}`}
                      className="group mt-5 inline-flex items-center gap-4 text-sm font-medium text-ink underline decoration-ink/25 underline-offset-[7px] hover:decoration-ink"
                    >
                      Understand {treatment.title.toLowerCase()}
                      <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        );
      })}
    </div>
  );
}

function RadiotherapyRows({ treatments }: { treatments: TreatmentItem[] }) {
  return (
    <div className="border-t border-ink/15">
      {treatments.map((treatment) => (
        <Link
          key={treatment.slug}
          href={`/treatments/${treatment.slug}`}
          className="group flex items-center justify-between gap-8 border-b border-ink/15 py-5"
        >
          <span className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.025em] text-ink transition-transform duration-300 group-hover:translate-x-1 xl:text-[1.55rem]">
            {treatment.title}
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-white">
            <Arrow />
          </span>
        </Link>
      ))}
    </div>
  );
}

function OverviewCopy() {
  return (
    <div>
      <h2 className="max-w-[10ch] font-display text-[clamp(3.5rem,5vw,5.7rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
        Two ways treatment may work.
      </h2>
      <p className="mt-8 max-w-[34rem] text-[17px] leading-[1.75] text-ink-muted md:text-[19px]">
        Treatments may use medicines or radiotherapy. Your consultant will
        explain which approach, if any, may fit your situation.
      </p>
    </div>
  );
}

function MedicineCopy() {
  return (
    <div>
      <h2 className="max-w-[10ch] font-display text-[clamp(3.35rem,4.7vw,5.35rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
        Different medicines do different jobs.
      </h2>
      <p className="mt-8 max-w-[34rem] text-[17px] leading-[1.75] text-ink-muted md:text-[18px]">
        Medicines can act on cancer cells, hormones or the immune system in
        different ways.
      </p>
      <p className="mt-7 max-w-[30rem] text-[15px] leading-[1.7] text-ink-muted">
        Your consultant will explain what may be relevant to you.
      </p>
    </div>
  );
}

function MobileTreatmentOverview({
  medicine,
  radiotherapy,
  activeIndex,
  onSelect,
}: {
  medicine: TreatmentGroup;
  radiotherapy: TreatmentGroup;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="container-wide pb-24 pt-48 md:pb-28 md:pt-44 lg:hidden">
      <OverviewCopy />

      <div className="mt-14 grid gap-5">
        <article className="min-h-[285px] rounded-[2.5rem] bg-[#dfe9e4]">
          <FamilyCardContent group={medicine} isMedicine />
        </article>
        <article className="min-h-[285px] rounded-[2.5rem] bg-[#dfe9f5]">
          <FamilyCardContent group={radiotherapy} isMedicine={false} />
        </article>
      </div>

      <div className="pt-28">
        <MedicineCopy />
        <div className="mt-12 rounded-[2.5rem] bg-[#dfe9e4] px-6 py-7 md:px-9 md:py-9">
          <MedicineRows
            treatments={medicine.treatments}
            activeIndex={activeIndex}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default function TreatmentOverviewConcepts({
  groups,
}: {
  groups: TreatmentGroup[];
}) {
  const medicine = groups.find((group) => group.id === "medicine");
  const radiotherapy = groups.find((group) => group.id === "radiotherapy");
  const sceneRef = useRef<HTMLElement>(null);
  const manualProgressRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [radiotherapyActive, setRadiotherapyActive] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 82,
    damping: 27,
    restDelta: 0.001,
  });

  const overviewOpacity = useTransform(smoothProgress, [0.06, 0.11], [1, 0]);
  const overviewY = useTransform(smoothProgress, [0.06, 0.12], [0, -24]);
  const medicineOpacity = useTransform(smoothProgress, [0.1, 0.19], [0, 1]);
  const medicineY = useTransform(smoothProgress, [0.1, 0.19], [28, 0]);
  const panelBottom = useTransform(
    smoothProgress,
    [0.1, 0.24],
    ["52%", "0%"],
  );
  const panelLeft = useTransform(
    smoothProgress,
    [0.1, 0.24],
    ["0%", "-15%"],
  );
  const panelRight = useTransform(
    smoothProgress,
    [0.1, 0.24],
    ["0%", "-4%"],
  );
  const blueOpacity = useTransform(smoothProgress, [0.05, 0.12], [1, 0]);
  const blueY = useTransform(smoothProgress, [0.05, 0.14], [0, 120]);
  const overviewPanelOpacity = useTransform(
    smoothProgress,
    [0.05, 0.11],
    [1, 0],
  );
  const medicinePanelOpacity = useTransform(
    smoothProgress,
    [0.1, 0.18],
    [0, 1],
  );
  const medicineSceneY = useTransform(
    smoothProgress,
    [0.68, 0.86],
    ["0vh", "-100vh"],
  );
  const radiotherapyY = useTransform(
    smoothProgress,
    [0.68, 0.86],
    ["100vh", "0vh"],
  );

  const selectMedicine = (index: number) => {
    manualProgressRef.current = scrollYProgress.get();
    setActiveIndex(index);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setRadiotherapyActive(latest >= 0.74);

    if (manualProgressRef.current !== null) {
      if (Math.abs(latest - manualProgressRef.current) < 0.012) return;
      manualProgressRef.current = null;
    }

    if (!medicine || latest < 0.28 || latest >= 0.7) return;

    const step = (0.7 - 0.28) / medicine.treatments.length;
    const nextIndex = Math.min(
      medicine.treatments.length - 1,
      Math.floor((latest - 0.28) / step),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  if (!medicine || !radiotherapy) return null;

  return (
    <section
      ref={sceneRef}
      id="treatment-index"
      className="relative scroll-mt-24 lg:h-[620vh]"
    >
      <ChapterTint
        colour="#e7eeeb"
        triggerSelector="[data-treatment-tint-trigger]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-[40vh] top-0"
      >
        <div className="sticky top-0 h-screen">
          <span
            data-treatment-tint-trigger
            className="absolute left-0 top-1/2 h-px w-px"
          />
        </div>
      </div>
      <span
        id="medicine-treatments"
        aria-hidden
        className="pointer-events-none absolute left-0 top-[76rem] scroll-mt-24 lg:top-[20%]"
      />
      <span
        id="radiotherapy-treatments"
        aria-hidden
        className="pointer-events-none absolute left-0 top-[82%] hidden scroll-mt-24 lg:block"
      />

      <MobileTreatmentOverview
        medicine={medicine}
        radiotherapy={radiotherapy}
        activeIndex={activeIndex}
        onSelect={selectMedicine}
      />

      <div className="sticky top-0 hidden h-screen overflow-hidden lg:block">
        <motion.div
          data-treatment-medicine-scene
          style={{
            y: reduce
              ? radiotherapyActive
                ? "-100vh"
                : "0vh"
              : medicineSceneY,
          }}
          className={`absolute inset-0 z-10 will-change-transform ${
            radiotherapyActive ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          <div className="container-wide flex h-full items-center pb-8 pt-28">
            <div className="grid h-full max-h-[620px] w-full grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-20 xl:gap-24">
              <div className="relative h-full">
                <motion.div
                  style={{
                    opacity: reduce ? 1 : overviewOpacity,
                    y: reduce ? 0 : overviewY,
                  }}
                  className="absolute inset-0 flex items-center"
                >
                  <OverviewCopy />
                </motion.div>
                <motion.div
                  style={{
                    opacity: reduce ? 0 : medicineOpacity,
                    y: reduce ? 0 : medicineY,
                  }}
                  className="absolute inset-0 flex items-center"
                >
                  <MedicineCopy />
                </motion.div>
              </div>

              <div className="relative h-full">
                <motion.article
                  data-treatment-morph-panel
                  style={{
                    bottom: reduce ? "52%" : panelBottom,
                    left: reduce ? "0%" : panelLeft,
                    right: reduce ? "0%" : panelRight,
                  }}
                  className="absolute top-0 overflow-hidden rounded-[2.5rem] bg-[#dfe9e4]"
                >
                  <motion.div
                    style={{ opacity: reduce ? 1 : overviewPanelOpacity }}
                    className="absolute inset-0"
                  >
                    <FamilyCardContent group={medicine} isMedicine />
                  </motion.div>

                  <motion.div
                    style={{ opacity: reduce ? 0 : medicinePanelOpacity }}
                    className="absolute inset-0 flex flex-col justify-center px-10 py-7 xl:px-12 xl:py-8"
                  >
                    <MedicineRows
                      treatments={medicine.treatments}
                      activeIndex={activeIndex}
                      onSelect={selectMedicine}
                    />
                  </motion.div>
                </motion.article>

                <motion.article
                  style={{
                    opacity: reduce ? 1 : blueOpacity,
                    y: reduce ? 0 : blueY,
                  }}
                  className="absolute inset-x-0 bottom-0 top-[52%] overflow-hidden rounded-[2.5rem] bg-[#dfe9f5]"
                >
                  <FamilyCardContent group={radiotherapy} isMedicine={false} />
                </motion.article>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          data-radiotherapy-scene
          style={{
            y: reduce
              ? radiotherapyActive
                ? "0vh"
                : "100vh"
              : radiotherapyY,
          }}
          className={`absolute inset-0 z-20 will-change-transform ${
            radiotherapyActive ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div className="container-wide flex h-full items-center pb-8 pt-28">
            <div className="grid h-full max-h-[620px] w-full items-center gap-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-24">
              <motion.figure
                className="relative h-[min(560px,100%)] overflow-hidden rounded-[2.5rem] bg-[#cbdbe8] shadow-[0_35px_90px_-42px_rgba(6,28,70,0.34)]"
              >
                <div className="absolute inset-0">
                  <Image
                    src="/treatments/radiotherapy-conversation.jpg"
                    alt="A therapeutic radiographer speaking with a patient before radiotherapy"
                    fill
                    sizes="(max-width: 1024px) 92vw, 52vw"
                    className="object-cover object-center"
                  />
                </div>
              </motion.figure>

              <div>
                <h2 className="max-w-[11ch] font-display text-[clamp(2.8rem,4.3vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink">
                  Radiation can be delivered in different ways.
                </h2>
                <p className="mt-6 max-w-[35rem] text-[15px] leading-[1.7] text-ink-muted md:text-[16px]">
                  The method depends on where the cancer is, the aim of
                  treatment and how precisely the dose needs to be delivered.
                </p>
                <div className="mt-7">
                  <RadiotherapyRows treatments={radiotherapy.treatments} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
