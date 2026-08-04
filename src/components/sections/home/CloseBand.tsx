import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────
// The page's closing call to action.
//
// A navy band rather than a rule and two buttons: this is the last thing on the
// page and the only place asking for an action, so it gets to be the one block
// that inverts. The number sits opposite the heading where a reader scanning
// for it will look, and the routes below are pills rather than a list because
// they are alternatives, not steps.
//
// It runs full width, square-cornered, straight into the site footer — which is
// the same bg-ink. As a contained card it was navy, then a white stripe, then
// navy again, which reads as an accident rather than a decision. Merged, the
// page ends in one continuous dark foot.
//
// That merge is why `close-merged` is on the wrapper: globals.css uses it to
// pull in the footer's top padding on this page only. The band's bottom padding
// and the footer's own top padding were otherwise stacking into 168px of empty
// navy between the last pill and the first footer link.
// ─────────────────────────────────────────────────────────────────────────────

const ROUTES = [
  { label: "Contact the practice", href: "/contact", icon: "phone" },
  { label: "Find a consultant", href: "/consultants", icon: "person" },
  { label: "For referrers", href: "/about/referring-professionals", icon: "arrow" },
  { label: "Fees", href: "/tariffs", icon: "card" },
] as const;

function RouteIcon({ name }: { name: (typeof ROUTES)[number]["icon"] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0 text-white/70 transition-colors group-hover:text-white"
    >
      {name === "phone" && (
        <path d="M6.2 3.5 8 6.3l-1.5 1.6a9.5 9.5 0 0 0 5.6 5.6L13.7 12l2.8 1.8-.6 2.1a1.4 1.4 0 0 1-1.5 1A12.4 12.4 0 0 1 3.1 5.6a1.4 1.4 0 0 1 1-1.5Z" />
      )}
      {name === "person" && (
        <>
          <circle cx="10" cy="7" r="3" />
          <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
        </>
      )}
      {name === "arrow" && <path d="M3.5 10h13M11.5 5l5 5-5 5" />}
      {name === "card" && (
        <>
          <rect x="2.5" y="5" width="15" height="10" rx="2" />
          <path d="M2.5 8.5h15" />
        </>
      )}
    </svg>
  );
}

export default function CloseBand() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    // Tighter top margin than the page's usual section rhythm: the routes
    // section above already ends in a row of cards with their own breathing
    // room. Asymmetric vertical padding, because the foot of this box is no
    // longer an edge — it is the middle of a continuous dark block.
    <div className="close-merged mt-14 bg-ink px-6 pb-8 pt-12 text-white md:mt-20 md:pb-10 md:pt-14">
      <Reveal>
        <div className="mx-auto w-full max-w-[1560px] md:px-6 lg:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
            <h2 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
              Speak to the practice.
            </h2>
            <p className="text-[15px] text-white/70 md:text-base">
              Enquiries &amp; appointments:{" "}
              <a
                href={`tel:${tel}`}
                className="font-semibold text-white underline-offset-4 hover:underline"
              >
                {site.contact.phone}
              </a>
            </p>
          </div>

          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">
            Enquiries about the partnership, appointments and referrals all come
            through {site.contact.practiceManager}, who can point you to the
            right consultant.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROUTES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center justify-center gap-2.5 rounded-full border border-white/35 px-6 py-4 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <RouteIcon name={r.icon} />
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
