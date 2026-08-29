import { IconPhone, IconMail } from "@/components/ui/Icons";
import { site } from "@/content/site";

// The two things a visitor to the contact page actually wants to do, as full
// tap targets rather than lines of text in a definition list. Most of this
// site's traffic is on a phone, so these stack full-width and only sit
// side-by-side once there's room for it.
//
// These are plain <a> rather than the shared <Button>: tel: and mailto: aren't
// route transitions, and the label needs an icon in front of it instead of the
// trailing arrow.
//
// The navy telephone action uses the same site-wide wipe and focus treatment
// as every other solid navy CTA. The icon stays fixed because it identifies the
// action; there is no trailing directional arrow to move.
const base =
  "inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-medium transition-colors duration-200 sm:w-auto";

export default function ContactActions({
  className = "",
  align = "center",
}: {
  className?: string;
  align?: "center" | "start";
}) {
  const c = site.contact;
  const tel = `tel:${c.phone.replace(/\s+/g, "")}`;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center ${
        align === "center" ? "sm:justify-center" : "sm:justify-start"
      } ${className}`}
    >
      <a
        href={tel}
        className={`${base} ink-cta`}
      >
        <IconPhone className="h-[18px] w-[18px]" aria-hidden />
        <span>
          <span className="sr-only">Call the practice on </span>
          {c.phone}
        </span>
      </a>

      <a
        href={`mailto:${c.email}`}
        className={`${base} border border-ink/15 bg-white/70 text-ink backdrop-blur-sm focus-visible:border-ink/45 focus-visible:bg-white`}
      >
        <IconMail className="h-[18px] w-[18px]" aria-hidden />
        <span>Email the practice</span>
      </a>
    </div>
  );
}
