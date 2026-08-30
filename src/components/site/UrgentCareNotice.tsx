import { IconAlert } from "@/components/ui/Icons";

// Routes anyone who is actually unwell away from a contact form that nobody
// reads at 3am. Deliberately not styled as a red error state — this is standing
// guidance on a cancer practice's site, and a page someone reads after a
// diagnosis should not shout at them. Gold picks up the accent already in the
// hero wave and the logo.
//
// No practice-specific numbers here on purpose: the acute oncology line belongs
// to whichever unit is treating the patient, and inventing one would be worse
// than pointing at the card they were given.
export default function UrgentCareNotice({
  className = "",
}: {
  className?: string;
}) {
  return (
    <aside
      className={`rounded-3xl border border-gold/25 bg-gold/[0.05] p-5 md:p-6 ${className}`}
    >
      <div className="flex gap-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-ink">
          <IconAlert className="h-[18px] w-[18px]" aria-hidden />
        </span>
        <div className="type-body min-w-0 text-ink/80">
          <p className="font-medium text-ink">
            If you feel unwell, don&rsquo;t wait for a reply.
          </p>
          <p className="mt-2">
            If you are having treatment and become unwell, contact your acute
            oncology service on the number given on your treatment card. Outside
            those hours call{" "}
            <a
              href="tel:111"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              NHS&nbsp;111
            </a>
            . In an emergency call{" "}
            <a
              href="tel:999"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              999
            </a>
            .
          </p>
          <p className="mt-2 text-ink-muted">
            This page isn&rsquo;t monitored around the clock, so please don&rsquo;t
            use the form for anything urgent.
          </p>
        </div>
      </div>
    </aside>
  );
}
