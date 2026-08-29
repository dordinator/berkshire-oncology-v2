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
      <h2
        id="next-step-heading"
        tabIndex={-1}
        className="scroll-mt-32 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl"
      >
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
        disabled
        className="mt-8 inline-flex min-h-12 cursor-not-allowed items-center rounded-full bg-ink px-6 text-sm font-medium text-white opacity-80"
      >
        {action}
        <span aria-hidden className="ml-3">→</span>
      </button>
      <p className="mt-4 text-xs leading-relaxed text-ink-muted">{note}</p>
    </div>
  );
}

function GuidanceFormPreview({ defaultSubject = "" }: { defaultSubject?: string }) {
  const field =
    "mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-[#fbfaf6] px-4 text-[15px] text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-muted";

  return (
    <div className="rounded-[2rem] border border-black/[0.07] bg-white p-7 shadow-[0_26px_70px_-38px_rgba(6,28,70,0.28)] md:p-10">
      <p
        id="guidance-prototype-note"
        className="mb-6 max-w-lg text-xs leading-relaxed text-ink-muted"
      >
        Prototype — the practice&apos;s approved contact service will be connected
        during implementation. Nothing can be submitted here.
      </p>
      <fieldset
        disabled
        aria-label="General guidance form preview"
        aria-describedby="guidance-prototype-note"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            First name
            <input className={field} autoComplete="off" />
          </label>
          <label className="text-sm font-medium text-ink">
            Last name
            <input className={field} autoComplete="off" />
          </label>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Email address
            <input className={field} type="email" autoComplete="off" />
          </label>
          <label className="text-sm font-medium text-ink">
            Telephone <span className="font-normal text-ink-muted">(optional)</span>
            <input className={field} type="tel" autoComplete="off" />
          </label>
        </div>

        <label className="mt-5 block text-sm font-medium text-ink">
          What can we help with?
          <select className={field} defaultValue={defaultSubject}>
            <option value="">Choose the closest option</option>
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
            className={`${field} min-h-32 resize-none py-3`}
            placeholder="Briefly tell the practice what you need help with."
          />
        </label>

        <button
          type="button"
          disabled
          className="mt-7 inline-flex min-h-12 cursor-not-allowed items-center rounded-full bg-ink px-6 text-sm font-medium text-white opacity-80"
        >
          Send securely to the practice
          <span className="ml-3" aria-hidden>→</span>
        </button>
      </fieldset>
    </div>
  );
}

export default function ContactNextStep({
  intent,
  professionalSubject,
}: {
  intent: ContactIntent;
  professionalSubject?: ProfessionalSubject | null;
}) {
  return (
    <section
      id="next-step"
      aria-labelledby="next-step-heading"
      className="scroll-mt-24 bg-[#f3f1ea]"
    >
      <div className="container-wide py-20 md:py-28 lg:py-32">
        {intent === "consultation" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Request a consultation online.">
              <p>
                Use the practice&apos;s online booking service to request or arrange
                a consultation. You&apos;ll be shown the options currently made
                available by the practice.
              </p>
              <ul className="mt-6 space-y-3 border-t border-ink/10 pt-6 text-sm text-ink">
                <li>Provide the basic details needed for your request</li>
                <li>Choose from the options the practice has made available</li>
                <li>Submit your request directly to the practice</li>
              </ul>
            </SectionHeading>
            <IntegrationCard
              title="Online booking"
              description="Continue to the practice's online booking service to see the available options and provide the details needed for your request."
              action="Continue to online booking"
              note="Prototype — the practice's booking service will be confirmed and connected during implementation."
            />
          </div>
        )}

        {intent === "guidance" && (
          <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <SectionHeading title="Ask the practice for guidance.">
              <p>
                Send the practice a few basic details. You do not need to choose a
                consultant or know which treatment may be appropriate.
              </p>
              <p className="mt-5">
                On the live website, your details will be handled through the
                contact service approved by the practice. This route should not be
                used for urgent medical advice.
              </p>
            </SectionHeading>
            <GuidanceFormPreview />
          </div>
        )}

        {intent === "patient-portal" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Continue to your patient portal.">
              <p>
                Use the patient portal for appointments, documents and information
                the practice has shared with you.
              </p>
              <p className="mt-5">
                If you need help with an existing appointment, call the practice on{" "}
                <a
                  className="font-medium text-ink hover:underline"
                  href={tel(site.contact.phone)}
                >
                  {site.contact.phone}
                </a>
                .
              </p>
            </SectionHeading>
            <IntegrationCard
              title="Open your patient portal"
              description="The practice's patient portal may ask you to sign in or verify your identity before showing information shared with you."
              action="Open patient portal"
              note="Prototype — the practice's existing portal and access route still need to be confirmed."
            />
          </div>
        )}

        {intent === "referral" && (
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading title="Make a professional referral.">
              <p>
                Refer a patient through the professional route approved by the
                practice. The live service will explain what information is needed
                to review and direct the referral.
              </p>
              <p className="mt-5">
                For current routing information, call{" "}
                <a
                  className="font-medium text-ink hover:underline"
                  href={tel(site.contact.phone)}
                >
                  {site.contact.phone}
                </a>
                .
              </p>
            </SectionHeading>
            <IntegrationCard
              title="Continue to the referral service"
              description="The live referral service will collect the patient, referrer and clinical information required by the practice."
              action="Start a referral"
              note="Prototype — the practice's professional referral route still needs to be confirmed."
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
            <GuidanceFormPreview
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
