"use client";

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
        <>
          <Link
            href="#medicine-treatments-static"
            className={`treatment-static-medicine-link ${linkClass}`}
          >
            Browse cancer medicines
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#medicine-treatments"
            className={`treatment-desktop-medicine-link ${linkClass}`}
          >
            Browse cancer medicines
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </>
      ) : (
        <Link
          href="#radiotherapy-treatments"
          className={`inline-flex ${linkClass}`}
        >
          Browse radiotherapy
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function MedicineRows({
  treatments,
  activeIndex,
  onSelect,
  idPrefix,
}: {
  treatments: TreatmentItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  idPrefix: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div data-medicine-rows className="border-t border-ink/15">
      {treatments.map((treatment, index) => {
        const isActive = activeIndex === index;
        const panelId = `${idPrefix}-medicine-panel-${index}`;

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
              className="group grid w-full grid-cols-[1.75rem_minmax(0,1fr)_1rem] items-center gap-3 py-5 text-left sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-4 md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:gap-6 md:py-6"
            >
              <span
                className={`text-[12px] font-medium tracking-[0.08em] transition-colors duration-500 ${
                  isActive ? "text-[#6e9388]" : "text-ink-muted"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-ink transition-transform duration-500 group-hover:translate-x-1 sm:text-[1.55rem] md:text-[2rem]">
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
                  <div className="pb-7 pl-10 pr-0 sm:pl-[4.5rem] sm:pr-8 md:pb-8 md:pl-[5.5rem]">
                    <p className="max-w-[38rem] text-[15px] leading-[1.7] text-ink-muted md:text-[16px]">
                      {treatment.summary}
                    </p>
                    <Link
                      href={`/treatments/${treatment.slug}`}
                      className="group mt-5 inline-flex items-center gap-4 text-sm font-medium text-ink underline decoration-ink/25 underline-offset-[7px] hover:decoration-ink"
                    >
                      Read about {treatment.title.toLowerCase()}
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

function OverviewCopy() {
  return (
    <div>
      <h2 className="max-w-[10ch] font-display text-[clamp(2.75rem,11vw,3.5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink xl:text-[clamp(3.5rem,5vw,5.7rem)]">
        Types of cancer treatment.
      </h2>
      <p className="mt-8 max-w-[34rem] text-[17px] leading-[1.75] text-ink-muted md:text-[19px]">
        Cancer medicines and radiotherapy work in different ways. Your
        consultant will discuss which treatment options apply to you.
      </p>
    </div>
  );
}

function MedicineCopy() {
  return (
    <div>
      <h2 className="max-w-[10ch] font-display text-[clamp(2.75rem,10.5vw,3.35rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-ink xl:text-[clamp(3.35rem,4.7vw,5.35rem)]">
        Medicines used to treat cancer.
      </h2>
      <p className="mt-8 max-w-[34rem] text-[17px] leading-[1.75] text-ink-muted md:text-[18px]">
        These include chemotherapy, immunotherapy, targeted therapies and
        hormone therapy.
      </p>
      <p className="mt-7 max-w-[30rem] text-[15px] leading-[1.7] text-ink-muted">
        The medicine used depends on the cancer and the aim of treatment.
      </p>
    </div>
  );
}

function MobileTreatmentOverview({
  medicine,
  radiotherapy,
}: {
  medicine: TreatmentGroup;
  radiotherapy: TreatmentGroup;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="treatment-static-overview container-wide pb-20 pt-40 md:pb-24 md:pt-32">
      <OverviewCopy />

      <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
        <article className="min-h-[285px] rounded-[2.5rem] bg-[#dfe9e4]">
          <FamilyCardContent group={medicine} isMedicine />
        </article>
        <article className="min-h-[285px] rounded-[2.5rem] bg-[#dfe9f5]">
          <FamilyCardContent group={radiotherapy} isMedicine={false} />
        </article>
      </div>

      <div
        id="medicine-treatments-static"
        className="grid scroll-mt-24 gap-10 pt-24 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-12"
      >
        <MedicineCopy />
        <div className="rounded-[2rem] bg-[#dfe9e4] px-5 py-6 sm:rounded-[2.5rem] md:px-9 md:py-9">
          <MedicineRows
            treatments={medicine.treatments}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            idPrefix="static"
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
  const [medicineRowsActive, setMedicineRowsActive] = useState(false);
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

  const overviewOpacity = useTransform(smoothProgress, [0.05, 0.1], [1, 0]);
  const overviewY = useTransform(smoothProgress, [0.05, 0.11], [0, -24]);
  const medicineOpacity = useTransform(smoothProgress, [0.08, 0.16], [0, 1]);
  const medicineY = useTransform(smoothProgress, [0.08, 0.16], [28, 0]);
  const panelBottom = useTransform(
    smoothProgress,
    [0.08, 0.2],
    ["52%", "0%"],
  );
  const panelLeft = useTransform(
    smoothProgress,
    [0.08, 0.2],
    ["0%", "-15%"],
  );
  const panelRight = useTransform(
    smoothProgress,
    [0.08, 0.2],
    ["0%", "-4%"],
  );
  const blueOpacity = useTransform(smoothProgress, [0.04, 0.1], [1, 0]);
  const blueY = useTransform(smoothProgress, [0.04, 0.12], [0, 120]);
  const overviewPanelOpacity = useTransform(
    smoothProgress,
    [0.04, 0.1],
    [1, 0],
  );
  const medicinePanelOpacity = useTransform(
    smoothProgress,
    [0.08, 0.15],
    [0, 1],
  );
  const selectMedicine = (index: number) => {
    manualProgressRef.current = smoothProgress.get();
    setActiveIndex(index);
  };

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setMedicineRowsActive(latest >= 0.1);

    if (manualProgressRef.current !== null) {
      if (Math.abs(latest - manualProgressRef.current) < 0.012) return;
      manualProgressRef.current = null;
    }

    if (!medicine || latest < 0.22 || latest >= 0.92) return;

    const step = (0.92 - 0.22) / medicine.treatments.length;
    const nextIndex = Math.min(
      medicine.treatments.length - 1,
      Math.floor((latest - 0.22) / step),
    );
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  if (!medicine || !radiotherapy) return null;

  return (
    <section
      ref={sceneRef}
      id="treatment-index"
      className="treatment-scroll-scene relative scroll-mt-24"
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
        tabIndex={-1}
        className="treatment-desktop-anchor pointer-events-none absolute left-0 top-[20%] scroll-mt-24"
      >
        <span className="sr-only">Medicine treatments</span>
      </span>
      <MobileTreatmentOverview
        medicine={medicine}
        radiotherapy={radiotherapy}
      />

      <div className="treatment-desktop-stage sticky top-0 h-screen overflow-hidden">
        <motion.div
          data-treatment-medicine-scene
          className="absolute inset-0 z-10"
        >
          <div className="container-wide flex h-full items-center pb-8 pt-28">
            <div className="grid h-full max-h-[620px] w-full grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-20 xl:gap-24">
              <div className="relative h-full">
                <motion.div
                  style={{
                    opacity: reduce ? 1 : overviewOpacity,
                    y: reduce ? 0 : overviewY,
                  }}
                  aria-hidden={medicineRowsActive}
                  className="absolute inset-0 flex items-center"
                >
                  <OverviewCopy />
                </motion.div>
                <motion.div
                  style={{
                    opacity: reduce ? 0 : medicineOpacity,
                    y: reduce ? 0 : medicineY,
                  }}
                  aria-hidden={!medicineRowsActive}
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
                    aria-hidden={medicineRowsActive}
                    inert={
                      medicineRowsActive
                        ? ("" as unknown as boolean)
                        : undefined
                    }
                    className={`absolute inset-0 ${
                      medicineRowsActive
                        ? "pointer-events-none"
                        : "pointer-events-auto"
                    }`}
                  >
                    <FamilyCardContent group={medicine} isMedicine />
                  </motion.div>

                  <motion.div
                    style={{ opacity: reduce ? 0 : medicinePanelOpacity }}
                    aria-hidden={!medicineRowsActive}
                    inert={
                      !medicineRowsActive
                        ? ("" as unknown as boolean)
                        : undefined
                    }
                    className={`absolute inset-0 flex flex-col justify-center px-10 py-7 xl:px-12 xl:py-8 ${
                      !medicineRowsActive
                        ? "pointer-events-none"
                        : "pointer-events-auto"
                    }`}
                  >
                    <MedicineRows
                      treatments={medicine.treatments}
                      activeIndex={activeIndex}
                      onSelect={selectMedicine}
                      idPrefix="desktop"
                    />
                  </motion.div>
                </motion.article>

                <motion.article
                  style={{
                    opacity: reduce ? 1 : blueOpacity,
                    y: reduce ? 0 : blueY,
                  }}
                  aria-hidden={medicineRowsActive}
                  inert={
                    medicineRowsActive
                      ? ("" as unknown as boolean)
                      : undefined
                  }
                  className={`absolute inset-x-0 bottom-0 top-[52%] overflow-hidden rounded-[2.5rem] bg-[#dfe9f5] ${
                    medicineRowsActive
                      ? "pointer-events-none"
                      : "pointer-events-auto"
                  }`}
                >
                  <FamilyCardContent group={radiotherapy} isMedicine={false} />
                </motion.article>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
