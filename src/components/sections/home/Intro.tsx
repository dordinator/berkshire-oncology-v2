import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

export default function Intro() {
  return (
    <section className="bg-canvas py-24 md:py-32">
      <div className="container-wide grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink-muted" /> The partnership
            </span>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="heading-lg mt-5">
              Ten consultants,{" "}
              <span className="text-gradient">one standard of care.</span>
            </h2>
          </Reveal>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-ink-muted">
          <Reveal delay={1}>
            <p>
              Berkshire Oncology Partnership is a partnership of ten Consultant
              Oncologists based in Reading, Berkshire. All members of the Partnership
              hold Consultant posts in the NHS at the Royal Berkshire Hospital.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <p>
              Our Consultants are committed to providing high quality, excellent care
              for all our patients. All our Partners are appraised annually and take
              pride in maintaining and developing their professional knowledge, skills
              and revalidation.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="pt-2">
              <Button href="/consultants" variant="ghost">
                Meet the team
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
