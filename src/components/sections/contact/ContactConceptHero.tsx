"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import ContactNextStep, {
  ContactIntent,
  ProfessionalSubject,
} from "./ContactNextStep";

const HERO_IMAGE = "/tariffs/consultation.jpg";
const CONTACT_INTENTS: ContactIntent[] = [
  "consultation",
  "guidance",
  "patient-portal",
  "referral",
  "professional",
];

const PROFESSIONAL_HASHES: Record<string, ProfessionalSubject> = {
  "professional-joining-partnership": "joining-partnership",
  "professional-practice-role": "practice-role",
};

function isContactIntent(value: string | null): value is ContactIntent {
  return CONTACT_INTENTS.includes(value as ContactIntent);
}

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
    >
      <path
        d="M3.5 10h13M11.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function revealNextStep() {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

  // Allow the selected route to render before moving focus. Two animation
  // frames also make direct links from elsewhere on the site dependable.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const heading = document.getElementById("next-step-heading");
      heading?.scrollIntoView({ behavior, block: "start" });
      heading?.focus({ preventScroll: true });
    });
  });
}

function RouteLink({
  intent,
  title,
  description,
  selected,
  onSelect,
}: {
  intent: ContactIntent;
  title: string;
  description: string;
  selected: boolean;
  onSelect: (intent: ContactIntent) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-controls="next-step"
      onClick={() => onSelect(intent)}
      className={`group -mx-3 flex min-h-[6rem] w-[calc(100%+1.5rem)] items-center justify-between gap-5 border-t border-ink/10 px-3 py-4 text-left last:border-b focus-visible:text-accent lg:min-h-[6.4rem] ${selected ? "bg-ink/[0.045] text-ink" : "text-ink"}`}
    >
      <span className="min-w-0">
        <span className="block font-display text-[1.25rem] font-semibold leading-tight tracking-tight md:text-[1.35rem]">
          {title}
        </span>
        <span className="mt-2 block max-w-sm text-[13px] leading-relaxed text-ink-muted">
          {description}
        </span>
      </span>
      <span className="shrink-0 text-[#a66f1f]">
        <Arrow />
      </span>
    </button>
  );
}

export default function ContactConceptHero() {
  const tel = site.contact.phone.replace(/\s+/g, "");
  const [intent, setIntent] = useState<ContactIntent>("consultation");
  const [professionalSubject, setProfessionalSubject] =
    useState<ProfessionalSubject | null>(null);

  useEffect(() => {
    const readIntent = () => {
      const url = new URL(window.location.href);
      const hashValue = url.hash.slice(1);
      const hashSubject = PROFESSIONAL_HASHES[hashValue] ?? null;
      const hashIntent: ContactIntent | null = hashSubject
        ? "professional"
        : isContactIntent(hashValue)
          ? hashValue
          : null;
      const queryValue = url.searchParams.get("intent");
      const queryIntent = isContactIntent(queryValue) ? queryValue : null;
      const querySubjectValue = url.searchParams.get("subject");
      const querySubject: ProfessionalSubject | null =
        queryIntent === "professional" &&
        (querySubjectValue === "joining-partnership" ||
          querySubjectValue === "practice-role")
          ? querySubjectValue
          : null;
      const nextIntent = hashIntent ?? queryIntent ?? "consultation";
      const nextProfessionalSubject =
        nextIntent === "professional" ? hashSubject ?? querySubject : null;
      const hasExplicitIntent = Boolean(hashIntent || queryIntent);

      setIntent(nextIntent);
      setProfessionalSubject(nextProfessionalSubject);
      if (hasExplicitIntent) {
        revealNextStep();
      }

      // Older prototype links used query parameters, including cancer type.
      // Clear every query value from browser history and future referrers, then
      // preserve only a validated, non-clinical route in the URL fragment.
      const hasInvalidHash = Boolean(url.hash && !hashIntent);
      if (url.search || hasInvalidHash) {
        url.search = "";
        url.hash = hasExplicitIntent
          ? nextProfessionalSubject
            ? `professional-${nextProfessionalSubject}`
            : nextIntent
          : "";
        const currentState =
          window.history.state && typeof window.history.state === "object"
            ? window.history.state
            : {};
        window.history.replaceState(
          { ...currentState },
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      }
    };

    readIntent();
    window.addEventListener("popstate", readIntent);
    window.addEventListener("hashchange", readIntent);
    return () => {
      window.removeEventListener("popstate", readIntent);
      window.removeEventListener("hashchange", readIntent);
    };
  }, []);

  function selectIntent(nextIntent: ContactIntent) {
    setIntent(nextIntent);
    setProfessionalSubject(null);
    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};
    window.history.pushState({ ...currentState }, "", `/contact#${nextIntent}`);
    revealNextStep();
  }

  return (
    <>
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-[1.06] object-cover object-[60%_center] blur-[9px] saturate-[0.82] md:object-center"
      />

      {/* A second translucent wash turns the photograph into atmosphere rather
          than another piece of information to process. The slight image scale
          above keeps the softened edges outside the visible frame. */}
      <div aria-hidden className="absolute inset-0 bg-[#e8edf1]/10" />

      {/* The photograph remains warm and visible. The darker left and lower
          edges give the headline a dependable reading surface; the centre is
          deliberately lighter so this does not become another navy hero. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/25 via-ink/25 to-ink/80 lg:bg-[linear-gradient(100deg,rgba(6,28,70,0.88)_0%,rgba(6,28,70,0.58)_42%,rgba(6,28,70,0.15)_72%,rgba(6,28,70,0.28)_100%)]"
      />

      <div className="container-wide relative flex min-h-[100svh] items-center pb-14 pt-28 md:pb-20 md:pt-32">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,0.86fr)] lg:items-stretch lg:gap-14 xl:gap-20">
          <div className="max-w-2xl text-white lg:flex lg:max-w-none lg:flex-col lg:justify-center">
            <h1
              className="max-w-none font-display text-[clamp(3.35rem,6.2vw,6.7rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white [text-shadow:0_2px_24px_rgba(6,28,70,0.48)]"
            >
              <span className="block lg:whitespace-nowrap">Let&apos;s find the</span>
              <span className="block lg:whitespace-nowrap">right next step.</span>
            </h1>

            <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-white/85 [text-shadow:0_1px_16px_rgba(6,28,70,0.5)] md:text-lg">
              You don&apos;t need to know which consultant or treatment you need.
              Start with the option that feels closest.
            </p>

            <a
              href={`tel:${tel}`}
              className="mt-8 inline-flex min-h-12 w-fit items-center border-t border-white/35 pt-3 font-display text-2xl font-semibold text-white transition-colors hover:text-[#f3dca2] md:mt-10 md:text-[1.7rem]"
            >
              {site.contact.phone}
            </a>
          </div>

          <div
            className="rounded-[2rem] border border-white/55 bg-[#fbfaf5]/95 p-6 text-ink shadow-[0_32px_90px_-28px_rgba(6,28,70,0.45)] backdrop-blur-md sm:p-8 lg:h-full lg:p-11 xl:p-12"
          >
            <p className="text-[13px] leading-relaxed text-ink-muted">
              We&apos;ll show you the right form or online service next.
            </p>

            <div
              role="group"
              aria-label="Choose what you need help with"
              className="mt-4"
            >
              <RouteLink
                intent="consultation"
                title="Arrange a consultation"
                description="Request or arrange an appointment online."
                selected={intent === "consultation"}
                onSelect={selectIntent}
              />
              <RouteLink
                intent="guidance"
                title="Not sure where to start?"
                description="Ask the practice for guidance with a short message."
                selected={intent === "guidance"}
                onSelect={selectIntent}
              />
              <RouteLink
                intent="patient-portal"
                title="Open the patient portal"
                description="Access appointments and documents."
                selected={intent === "patient-portal"}
                onSelect={selectIntent}
              />
              <RouteLink
                intent="referral"
                title="Make a referral"
                description="Use the healthcare professional referral route."
                selected={intent === "referral"}
                onSelect={selectIntent}
              />
              <RouteLink
                intent="professional"
                title="Professional and career enquiries"
                description="For consultants interested in the partnership and people interested in practice roles."
                selected={intent === "professional"}
                onSelect={selectIntent}
              />
            </div>
          </div>
        </div>
      </div>

    </section>
    <ContactNextStep
      intent={intent}
      professionalSubject={professionalSubject}
    />
    </>
  );
}
