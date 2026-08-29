"use client";

import { FormEvent, useState } from "react";
import { site } from "@/content/site";

export type ContactIntent =
  | "consultation"
  | "guidance"
  | "patient-portal"
  | "referral"
  | "professional";

export type ProfessionalSubject = "joining-partnership" | "practice-role";

const tel = (number: string) => `tel:${number.replace(/\s+/g, "")}`;

function SectionHeading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl">
      <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      <div className="mt-6 text-[16px] leading-relaxed text-ink-muted md:text-[17px]">
        {children}
      </div>
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  action,
  note,
}: {
  title: string;
  description: string;
  action: string;
  note: string;
}) {
  return (
    <div className="rounded-[2rem] border border-black/[0.07] bg-white p-7 shadow-[0_26px_70px_-38px_rgba(6,28,70,0.28)] md:p-10">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
        {title}
      </h3>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
        {description}
      </p>
      <button
        type="button"
        aria-disabled="true"
        className="mt-8 inline-flex min-h-12 cursor-default items-center rounded-full bg-ink px-6 text-sm font-medium text-white"
      >
        {action}
        <span aria-hidden className="ml-3">→</span>
      </button>
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">{note}</p>
    </div>
  );
}

function GuidanceForm({
  cancerLabel,
  defaultSubject = "",
}: {
  cancerLabel?: string | null;
  defaultSubject?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(result?.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("sent");
    formElement.reset();
  }

  if (status === "sent") {
    return (
      <div className="rounded-[2rem] border border-black/[0.07] bg-white p-8 md:p-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
          Message received
        </p>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
          Thank you. The practice will be in touch.
        </h3>
        <p className="mt-4 leading-relaxed text-ink-muted">
          If you need to speak to someone instead, call{" "}
          <a className="font-medium text-ink hover:underline" href={tel(site.contact.phone)}>
            {site.contact.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const field =
    "mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-[#fbfaf6] px-4 text-[15px] text-ink outline-none transition focus:border-ink/35 focus:bg-white";

  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] border border-black/[0.07] bg-white p-7 shadow-[0_26px_70px_-38px_rgba(6,28,70,0.28)] md:p-10"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          First name
          <input className={field} name="firstName" autoComplete="given-name" required />
        </label>
        <label className="text-sm font-medium text-ink">
          Last name
          <input className={field} name="lastName" autoComplete="family-name" required />
        </label>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Email address
          <input className={field} name="email" type="email" autoComplete="email" required />
        </label>
        <label className="text-sm font-medium text-ink">
          Telephone <span className="font-normal text-ink-muted">(optional)</span>
          <input className={field} name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>

      <label className="mt-5 block text-sm font-medium text-ink">
        What can we help with?
        <select
          className={field}
          name="subject"
          defaultValue={defaultSubject}
          required
        >
          <option value="" disabled>
            Choose the closest option
          </option>
          <option>Considering a consultation</option>
          <option>Choosing the right consultant</option>
          <option>Fees or insurance</option>
          <option>Joining the consultant partnership</option>
          <option>Practice or administration role</option>
          <option>General practice enquiry</option>
          <option>Something else</option>
        </select>
      </label>

      <label className="mt-5 block text-sm font-medium text-ink">
        How can we help?
        <textarea
          className={`${field} min-h-32 resize-y py-3`}
          name="message"
          required
          placeholder="Please do not include detailed or confidential medical information."
        />
      </label>

      <input className="hidden" name="company" tabIndex={-1} autoComplete="off" />
      {cancerLabel && <input type="hidden" name="cancerType" value={cancerLabel} />}

      {status === "error" && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-medium text-white transition hover:bg-ink/90 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send to the practice"}
          {status !== "sending" && <span className="ml-3" aria-hidden>→</span>}
        </button>
        <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
          This form is for general guidance, not urgent medical advice.
        </p>
      </div>
    </form>
  );
}

export default function ContactNextStep({
  intent,
  onChooseAgain,
  cancerLabel,
  professionalSubject,
}: {
  intent: ContactIntent;
  onChooseAgain: () => void;
  cancerLabel?: string | null;
  professionalSubject?: ProfessionalSubject | null;
}) {
  return (
    <section id="next-step" className="scroll-mt-24 bg-[#f3f1ea]">
      <div className="container-wide py-20 md:py-28 lg:py-32">
        <div className="mb-10 flex items-center justify-between gap-4 border-b border-ink/10 pb-5">
          {cancerLabel ? (
            <p className="text-sm text-ink-muted">Enquiry context: <span className="font-medium text-ink">{cancerLabel}</span></p>
          ) : (
            <span aria-hidden />
          )}
          <button
            type="button"
            onClick={onChooseAgain}
            className="text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Choose another route
          </button>
        </div>

        {intent === "consultation" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Request a consultation online.">
              <p>
                Use our online booking form to request or arrange a consultation.
                You&apos;ll be shown the options currently available through the
                practice.
              </p>
              <ul className="mt-6 space-y-3 border-t border-ink/10 pt-6 text-sm text-ink">
                <li>Provide the basic details needed for your request</li>
                <li>Choose from the options the practice has made available</li>
                <li>Submit your request to the practice</li>
              </ul>
            </SectionHeading>
            <IntegrationCard
              title="Online booking"
              description="Complete the practice's online booking form to see the available options and provide the details needed for your request."
              action="Continue to online booking"
              note="Prototype integration point — the practice's live booking form or embed code is still required."
            />
          </div>
        )}

        {intent === "guidance" && (
          <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <SectionHeading title="Not sure where to start?">
              <p>
                Send the practice a few basic details. You do not need to choose a
                consultant or know which treatment may be appropriate.
              </p>
              <p className="mt-5">
                Please avoid detailed clinical information. The practice can explain
                the safest way to share anything confidential if it is needed.
              </p>
            </SectionHeading>
            <GuidanceForm cancerLabel={cancerLabel} />
          </div>
        )}

        {intent === "patient-portal" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Continue to your patient portal.">
              <p>
                Use the secure portal for appointments, documents and information the
                practice has shared with you.
              </p>
              <p className="mt-5">
                If you cannot access the portal, call the practice on{" "}
                <a className="font-medium text-ink hover:underline" href={tel(site.contact.phone)}>
                  {site.contact.phone}
                </a>
                .
              </p>
            </SectionHeading>
            <IntegrationCard
              title="Open your secure portal"
              description="The practice's patient portal will open in a new window. You may be asked to sign in or verify your identity."
              action="Open patient portal"
              note="Prototype integration point — the practice's live portal URL is still required."
            />
          </div>
        )}

        {intent === "referral" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Make a secure referral.">
              <p>
                Refer a patient through the practice&apos;s secure professional route.
                Please do not send patient-identifiable clinical information through
                the general guidance form.
              </p>
              <p className="mt-5">
                For routing help, call{" "}
                <a className="font-medium text-ink hover:underline" href={tel(site.contact.phone)}>
                  {site.contact.phone}
                </a>
                .
              </p>
            </SectionHeading>
            <IntegrationCard
              title="Continue to the referral service"
              description="The secure referral service will collect the patient, referrer and clinical information required by the practice."
              action="Start a referral"
              note="Prototype integration point — the final secure referral route is still to be confirmed."
            />
          </div>
        )}

        {intent === "professional" && (
          <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <SectionHeading
              title={
                professionalSubject === "joining-partnership"
                  ? "Talk to us about joining the partnership."
                  : professionalSubject === "practice-role"
                    ? "Ask about working with the practice."
                    : "Make a professional enquiry."
              }
            >
              <p>
                Contact the practice office about joining the consultant
                partnership, practice and administration roles, or another
                professional enquiry.
              </p>
              <p className="mt-5">
                Please do not include patient-identifiable or confidential
                clinical information in this form.
              </p>
            </SectionHeading>
            <GuidanceForm
              key={professionalSubject ?? "professional"}
              defaultSubject={
                professionalSubject === "joining-partnership"
                  ? "Joining the consultant partnership"
                  : professionalSubject === "practice-role"
                    ? "Practice or administration role"
                    : ""
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
