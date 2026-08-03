import { IconPhone, IconMail } from "@/components/ui/Icons";
import { site } from "@/content/site";

// The two things a visitor to the contact page actually wants to do, as full
// tap targets rather than lines of text in a definition list. Most of this
// site's traffic is on a phone, so these stack full-width and only sit
// side-by-side once there's room for it.
//
// These are plain <a> rather than the shared <Button>: tel: and mailto: aren't
// route transitions, and the label needs an icon in front of it instead of the
// trailing arrow. The wipe-on-hover fill is copied deliberately so they read as
// the same family of control.
const base =
  "group relative isolate inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-4 text-[15px] font-medium transition-colors duration-300 sm:w-auto";

const wipe =
  "absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-smooth group-hover:scale-x-100 motion-reduce:transition-none";

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
      <a href={tel} className={`${base} bg-ink text-white`}>
        <span aria-hidden className={`${wipe} bg-accent`} />
        <IconPhone className="relative h-[18px] w-[18px]" aria-hidden />
        <span className="relative">
          <span className="sr-only">Call the practice on </span>
          {c.phone}
        </span>
      </a>

      <a
        href={`mailto:${c.email}`}
        className={`${base} border border-ink/15 bg-white/70 text-ink backdrop-blur-sm hover:border-ink/40`}
      >
        <span aria-hidden className={`${wipe} bg-ink/[0.05]`} />
        <IconMail className="relative h-[18px] w-[18px]" aria-hidden />
        <span className="relative">Email the practice</span>
      </a>
    </div>
  );
}
