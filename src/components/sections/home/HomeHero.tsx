import Image from "next/image";
import Button from "@/components/ui/Button";
import { site } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────
// The home hero: a full-height photograph, the practice's line, and two ways
// in — one to the enquiry form, one to the telephone.
//
// No state, so no "use client" — this renders on the server with the rest of
// the page.
// ─────────────────────────────────────────────────────────────────────────────

/** The hero photograph. Swap the file to change it; nothing here changes. */
const HERO_IMAGE = "/home/hero.jpg";

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="relative h-4 w-4" fill="none">
      <path
        d="M5.2 2.5 6.6 5.2 5.3 6.6a8 8 0 0 0 4.1 4.1l1.4-1.3 2.7 1.4v2.4c0 .5-.4.9-.9.8A11.8 11.8 0 0 1 2 3.4c0-.5.4-.9.9-.9h2.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeHero() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* ── Photograph ──────────────────────────────────────────────────────
          object-position keeps the consultant in frame as the crop tightens on
          narrow screens; the scrim below is what makes the type legible. */}
      <Image
        src={HERO_IMAGE}
        alt="A consultant oncologist in conversation with a patient across a consulting room desk"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] md:object-[60%_center]"
      />

      {/* Scrim. Vertical on phones, where the type sits over the whole frame;
          left-weighted from md up, where it sits in the left third.
          Kept as light as legibility allows: this is a bright, warm, softly lit
          room, and a heavy navy wash turned it into a night scene — which is
          the opposite of what the photograph is for. The right-hand third runs
          to fully transparent so the consultant is seen in her own light. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/40 via-45% to-ink/85 md:bg-gradient-to-r md:from-ink/85 md:from-0% md:via-ink/20 md:via-42% md:to-transparent md:to-68%"
      />

      <div
        // svh, not vh: on a phone `100vh` is the height with the browser chrome
        // *retracted*, so a full-height hero is taller than what you can
        // actually see and the buttons sit below the fold on first paint. svh
        // is the smallest viewport height, which is the one that is always
        // visible — the CTAs are reachable without scrolling.
        //
        // On phones the copy sits low, set with top padding: a 1.6:1 photograph
        // in a 0.46:1 viewport crops to a narrow vertical slice, so the subject
        // fills it and copy at the top landed across her face. Low, it sits
        // over the desk instead.
        className="container-wide relative flex min-h-[100svh] flex-col justify-start pb-14 pt-[38svh] md:justify-center md:pb-24 md:pt-44"
      >
        <div className="max-w-2xl">
          {/* A soft shadow on the type rather than more scrim on the
              photograph. The crop shifts with the viewport, so a word can land
              on the pale chair or the bright window; the shadow guarantees
              contrast there without darkening the whole room to insure against
              it. */}
          <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white [text-shadow:0_1px_20px_rgba(6,28,70,0.6)] sm:text-5xl md:text-6xl lg:text-7xl">
            Exceptional care,
            <br />
            personal to you.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 [text-shadow:0_1px_16px_rgba(6,28,70,0.6)] md:mt-7 md:text-xl md:leading-relaxed">
            A partnership of ten consultant oncologists providing private cancer
            diagnosis, treatment and care in Reading and across Berkshire.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-11">
            <Button href="/contact" variant="onPhoto">
              Request an appointment
            </Button>
            <Button href={`tel:${tel}`} variant="onPhotoGhost" arrow={false}>
              {/* Button puts children in a single span, so the icon and label
                  need their own flex row to sit on the same baseline. */}
              <span className="inline-flex items-center gap-2.5">
                <PhoneIcon />
                Call {site.contact.phone}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
