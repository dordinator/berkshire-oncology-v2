import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { IconCheck } from "@/components/ui/Icons";
import { site } from "@/content/site";

const points = [
  "Consultant-led private diagnosis and treatment",
  "Appointments at leading hospitals across Berkshire",
  "Self-funding and insured patients welcome",
];

export default function ContactCta() {
  const c = site.contact;
  const tel = (n: string) => `tel:${n.replace(/\s+/g, "")}`;

  return (
    <section className="bg-canvas py-24 md:py-32">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-4xl bg-ink px-8 py-14 text-white md:px-16 md:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <span className="eyebrow text-white/60">
                  <span className="h-px w-8 bg-white/40" /> Get in touch
                </span>
              </Reveal>
              <Reveal delay={1}>
                <h2 className="heading-lg mt-5 text-white">
                  Arrange a{" "}
                  <span className="text-accent-glow">consultation.</span>
                </h2>
              </Reveal>
              <Reveal delay={2}>
                <ul className="mt-8 space-y-4">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent-glow">
                        <IconCheck className="h-4 w-4" />
                      </span>
                      <span className="text-white/80">{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <div className="lg:pl-10">
              <Reveal delay={2}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
                  <dl className="space-y-5 text-sm">
                    <div>
                      <dt className="text-white/40">Address</dt>
                      <dd className="mt-1 text-white/85">
                        {c.addressLines.join(", ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Telephone</dt>
                      <dd className="mt-1 text-white/85">
                        <a href={tel(c.phone)} className="hover:text-white">
                          {c.phone}
                        </a>
                        <span className="text-white/30"> · </span>
                        <a href={tel(c.phoneMobile)} className="hover:text-white">
                          {c.phoneMobile}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-white/40">Email</dt>
                      <dd className="mt-1">
                        <a
                          href={`mailto:${c.email}`}
                          className="break-all text-accent-glow hover:text-white"
                        >
                          {c.email}
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href="/contact#guidance"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:scale-[1.02]"
                  >
                    Contact the practice
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
