import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────
// "Referrals, careers and professional enquiries" — the two sections that used
// to sit here, merged.
//
// They were "Referring professionals" and "Careers or professional enquiries",
// back to back, in the same shape, saying much the same thing. They are one
// audience: people contacting the practice who are not patients. Merged, the
// three things they might actually want become the structure — one card each —
// rather than being buried in prose.
//
// The middle card is inverted. Recruiting consultants is the enquiry that
// matters most to a partnership of independent practitioners, and an even row
// of three identical tiles says nothing about which door to knock on.
//
// The heading is centred, which is the only centred heading on the page. That
// is deliberate: this is the last section before the contact band, and the
// three cards read as a set beneath a centred heading in a way they do not
// beneath a left-aligned one.
//
// On imagery: the referrers and practice-roles cards carry people, the
// consultants card carries a room. A stock photograph of clinicians under
// "thinking about joining?" is read as this partnership's consultants, which
// would be a picture of people who do not work here on the one card where that
// claim actually matters.
// ─────────────────────────────────────────────────────────────────────────────

interface Route {
  title: string;
  label: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  /** Non-empty only where a face could be mistaken for one of ours. */
  alt: string;
  icon: "referral" | "consultants" | "office";
  feature?: boolean;
}

const iconBase = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

function Icon({
  name,
  className,
}: {
  name: Route["icon"];
  className?: string;
}) {
  return (
    <svg {...iconBase} className={className} aria-hidden>
      {name === "referral" && (
        <>
          <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
          <path d="M14 3v6h4" />
          <path d="M9.5 15.5h5M12 13v5" />
        </>
      )}
      {name === "consultants" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 6.2a3 3 0 0 1 0 5.6M18.5 19a5.6 5.6 0 0 0-2.2-4.4" />
        </>
      )}
      {name === "office" && (
        <>
          <path d="M3 21h18" />
          <path d="M5 21V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15" />
          <path d="M15 21V11h3a1 1 0 0 1 1 1v9" />
          <path d="M8 9h3M8 13h3M8 17h3" />
        </>
      )}
    </svg>
  );
}

const routes: Route[] = [
  {
    title: "Refer a patient",
    label: "For GPs and clinicians",
    body: "If you know which consultant you need, name them in your referral. If you are unsure, tell us about the diagnosis or presentation and the practice team will direct it. Please telephone us about urgent referrals.",
    cta: "Start a referral",
    href: "/contact#referral",
    image: "/professionals/referrers.jpg",
    alt: "A clinician talking with a patient across a desk",
    icon: "referral",
  },
  {
    title: "Join the partnership",
    label: "For consultant oncologists",
    body: "Our consultants practise independently within the partnership. If you are interested in joining, you are welcome to contact us even when no opportunity is being advertised.",
    cta: "Contact the practice",
    href: "/contact#professional-joining-partnership",
    image: "/professionals/consultants.jpg",
    alt: "",
    icon: "consultants",
    feature: true,
  },
  {
    title: "Work with us",
    label: "Practice and administration roles",
    body: "The practice office manages recruitment for administrative and practice roles. Contact the team to ask about current opportunities or make a general enquiry.",
    cta: "Contact the practice",
    href: "/contact#professional-practice-role",
    image: "/professionals/practice-roles.jpg",
    alt: "Two colleagues working at desks in a small office",
    icon: "office",
  },
];

export default function ProfessionalRoutes() {
  return (
    <Section>
      <div className="site-gutter w-full">
        <div className="text-center">
          <Reveal>
            <div
              aria-hidden
              className="mx-auto h-0.5 w-14 rounded-full bg-accent/45"
            />
          </Reveal>
          <Reveal delay={1}>
            <h2
              id="referrals"
              data-copy-key="professionals.heading"
              tabIndex={-1}
              className="home-section-title mt-7 text-ink"
            >
              For healthcare professionals
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p
              data-copy-key="professionals.intro"
              className="section-subtitle mx-auto mt-5 max-w-2xl text-ink/75"
            >
              Whether you are referring a patient or would like to work with
              us, start with {site.contact.practiceManager} in the practice
              office.
            </p>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-7">
            {routes.map((r) => (
              <div
                key={r.title}
                // The old #careers anchor lands on the consultants card, so links
                // to the section this replaced still reach what they meant.
                id={r.feature ? "careers" : undefined}
                // flex column, so the three cards equalise: the bodies differ in
                // length and without this the grey backing showed beneath the
                // shorter two while the taller one ran on.
                className="relative flex scroll-mt-28 flex-col overflow-hidden rounded-3xl bg-ink/5"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={r.image}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>

                {/* Pulled up over the foot of the photograph, as in the
                  reference — the card belongs to the image rather than sitting
                  under it. */}
                <div className="relative -mt-16 flex flex-1 px-4 pb-4 md:-mt-20 md:px-5 md:pb-5">
                  <div
                    className={`flex w-full flex-col rounded-2xl p-6 shadow-[0_18px_50px_-24px_rgba(6,28,70,0.45)] md:p-7 ${
                      r.feature ? "bg-ink text-white" : "bg-white text-ink"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          r.feature
                            ? "bg-white/10 text-white"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        <Icon name={r.icon} className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <h3
                          data-copy-key={`professionals.${r.icon}.title`}
                          className="type-compact-title"
                        >
                          {r.title}
                        </h3>
                        <p
                          data-copy-key={`professionals.${r.icon}.label`}
                          className={`type-label mt-1 ${
                            r.feature ? "text-white/60" : "text-ink-muted"
                          }`}
                        >
                          {r.label}
                        </p>
                      </div>
                    </div>

                    <p
                      data-copy-key={`professionals.${r.icon}.body`}
                      className={`type-body mt-4 ${
                        r.feature ? "text-white/75" : "text-ink/75"
                      }`}
                    >
                      {r.body}
                    </p>

                    {/* Telephone is the current routing fallback. Do not invite
                      referral documents or clinical details through email. */}
                    {r.icon === "referral" && (
                      <p className="type-body mt-4">
                        <a
                          href={`tel:${site.contact.phone.replace(/\s+/g, "")}`}
                          className="font-display text-lg text-ink transition-colors hover:text-accent"
                        >
                          {site.contact.phone}
                        </a>
                      </p>
                    )}

                    {/* mt-auto on the wrapper pins the rule and the call to action
                      to the foot of every card, so the three buttons sit on one
                      line however much text is above them. The rule is a child
                      rather than the padded box itself — a background fills its
                      padding, so h-px with pt-6 would paint a 25px bar. */}
                    <div className="mt-auto pt-6">
                      <div
                        aria-hidden
                        className={`h-px w-full ${
                          r.feature ? "bg-white/20" : "bg-ink/10"
                        }`}
                      />
                      <Link
                        href={r.href}
                        className={`group mt-6 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors ${
                          r.feature
                            ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                            : "border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]"
                        }`}
                      >
                        <span data-copy-key={`professionals.${r.icon}.action`}>
                          {r.cta}
                        </span>
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                        >
                          <path
                            d="M3 8h10M9 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Tighter than the mt-24/md:mt-36 the page's other sections use, on purpose:
 * the section above this one is the full-bleed testimonials chapter, which
 * already carries 128px of its own bottom padding. At the standard margin the
 * two paddings stacked into roughly 270px of blank page.
 */
function Section({ children }: { children: React.ReactNode }) {
  return <section className="mt-14 md:mt-20">{children}</section>;
}
