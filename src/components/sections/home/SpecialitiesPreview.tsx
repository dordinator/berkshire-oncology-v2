import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getAllSpecialities } from "@/content/queries";
import SpecialitiesHelix, {
  IconCircle,
  Label,
} from "@/components/sections/home/SpecialitiesHelix";

export default function SpecialitiesPreview() {
  const specialities = getAllSpecialities();
  const top = specialities.slice(0, 9);
  const bottom = specialities.slice(9);

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white md:py-32">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="container-wide relative">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_2.4fr] lg:gap-10">
          {/* left — copy + CTA */}
          <div>
            <Reveal>
              <span className="eyebrow text-accent-glow">
                <span className="h-px w-8 bg-accent-glow/50" /> Specialities
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="heading-lg mt-5 text-white">
                The cancers we <span className="text-accent-glow">treat.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/60">
                From breast, prostate and lung to bowel, gynaecological and
                upper-GI cancers — find the consultant who specialises in your
                diagnosis.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <Link
                href="/specialities"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/[0.06]"
              >
                Explore all cancer types
                <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>

          {/* right — double-helix timeline (desktop) */}
          <div className="hidden self-center lg:block">
            <SpecialitiesHelix top={top} bottom={bottom} />
          </div>

          {/* right — icon grid (mobile / tablet) */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 lg:hidden">
            {specialities.map((s) => (
              <Link
                key={s.slug}
                href={`/specialities/${s.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <IconCircle slug={s.slug} />
                <Label>{s.title}</Label>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
