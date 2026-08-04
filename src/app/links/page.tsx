import type { Metadata } from "next";
import type { ReactNode } from "react";
import { usefulLinks } from "@/content/usefulLinks";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import LinkLogo from "@/components/sections/links/LinkLogo";
import ResourceWave from "@/components/sections/links/ResourceWave";

export const metadata: Metadata = pageMeta({
  title: "Resources and support",
  description:
    "Clear information, practical guidance and trusted organisations for patients, families and carers affected by cancer.",
  path: "/resources",
});

const cancerLinks = [
  "Understanding a diagnosis",
  "Cancer types",
  "Treatment options",
  "Questions to ask your consultant",
];

const sideEffectLinks = [
  "Fatigue",
  "Nausea and appetite",
  "Hair loss and skin changes",
  "Managing symptoms at home",
];

function Arrow() {
  return <span aria-hidden className="text-lg leading-none">→</span>;
}

function LinkList({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item) => (
        <li key={item}>
          <a
            href="#contact-practice"
            className="group flex items-center justify-between gap-6 py-4 text-[15px] text-ink transition-colors hover:text-accent"
          >
            <span>{item}</span>
            <Arrow />
          </a>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="max-w-xl">
      <span className="eyebrow text-[#a9791a]">{eyebrow}</span>
      <h2 className="heading-md mt-5">{title}</h2>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{children}</p>
    </div>
  );
}

export default function LinksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/links" },
        ])}
      />
      <div className="overflow-x-clip bg-canvas">
        <section className="relative min-h-[640px] overflow-hidden pt-32 md:min-h-[720px] md:pt-40">
          <div className="container-wide relative z-10 text-center">
            <Reveal>
              <span className="eyebrow justify-center text-[#a9791a]">Support and information</span>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="mx-auto mt-6 max-w-5xl font-display text-5xl leading-[1.02] tracking-tight text-ink md:text-7xl">
                Find the right support for you.
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
                Clear information, practical guidance and trusted organisations for patients, families and carers.
              </p>
            </Reveal>
            <Reveal delay={3}>
              <a href="#resource-index" className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
                Explore resources <Arrow />
              </a>
            </Reveal>
          </div>
          <ResourceWave className="absolute inset-x-0 bottom-0 h-[300px] md:h-[360px]" />
        </section>

        {/* ── Recommended organisations ── a chapter-break band in the site's
            darkest colour, after the logo walls the big product sites run
            (granola.ai's "Trusted by teams we admire"): a quiet body-size
            label, then the marks themselves rendered monochrome white and left
            to float on the ink with no tiles around them.

            The whitening is one CSS recipe rather than nine edited files:
            grayscale + invert turns any dark mark light, and mix-blend-screen
            drops everything darker than the band — which is exactly the baked-in
            white rectangles of the JPEG/flattened logos (white → inverted to
            black → screened to invisible). Internal white detail (the NHS
            letters) inverts to black and screens to knocked-out navy, which is
            the correct mono treatment for that mark. */}
        <section id="resource-index" className="relative z-10 -mt-16 rounded-t-[2rem] bg-ink py-16 md:-mt-24 md:rounded-t-[3rem] md:py-24">
          <div className="container-wide">
            <Reveal>
              <h2 className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-white/80 md:text-xl">
                Organisations and services we often recommend.
              </h2>
            </Reveal>

            <div
              aria-label="Recommended organisations and services"
              // One arbitrary filter rather than Tailwind's filter utilities:
              // Tailwind composes those in a fixed order with brightness BEFORE
              // invert, which brightens the original artwork and so darkens it
              // after inversion — the opposite of what this wall needs. Written
              // out longhand the order is explicit: grayscale, invert (dark
              // marks go light, baked white boxes go black), then brightness
              // 2.5 clips every mark to solid white while the boxes stay black
              // for mix-blend-screen to swallow. Marks sit at full strength and
              // dim under the pointer — the affordance is never the resting
              // state. The GenesisCare file is a small mark inside a large
              // baked-in margin, so it alone is scaled up to match optical
              // size.
              className="mt-12 md:mt-14 [&_img]:[filter:grayscale(1)_invert(1)_brightness(2.5)_contrast(1.05)] [&_img]:transition-opacity [&_img]:duration-300 [&_img]:mix-blend-screen [&_a:hover_img]:opacity-70 [&_a:focus-visible_img]:opacity-70 [&_img[src*='genesiscare']]:scale-[1.4]"
            >
              {/* md+: the first five across the full width, the remaining four
                  offset to sit under the gaps — the stagger is what keeps it
                  from reading as a table. The crosses live on the midline at
                  the top row's column boundaries, so each one marks where a
                  bottom-row mark sits below. */}
              <div className="hidden md:block">
                <Reveal>
                  <div className="flex items-center justify-center gap-8">
                    {usefulLinks.slice(0, 5).map((link, i) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.name}
                        className="flex h-28 min-w-0 flex-1 items-center justify-center md:h-36"
                      >
                        <LinkLogo name={link.name} logo={link.logo} i={i} large />
                      </a>
                    ))}
                  </div>
                </Reveal>

                {/* the midline crosses, at the boundaries between the five
                    columns above */}
                <div aria-hidden className="relative my-6 h-3">
                  {["20%", "40%", "60%", "80%"].map((left) => (
                    <span
                      key={left}
                      style={{ left }}
                      className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
                    >
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/25" />
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
                    </span>
                  ))}
                </div>

                <Reveal>
                  {/* inset by one half-column each side, so these four centre
                      under the crosses */}
                  <div className="flex items-center justify-center gap-8 px-[10%]">
                    {usefulLinks.slice(5).map((link, i) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.name}
                        className="flex h-28 min-w-0 flex-1 items-center justify-center md:h-36"
                      >
                        <LinkLogo name={link.name} logo={link.logo} i={i + 5} large />
                      </a>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* phones: a three-column grid, no crosses — nine marks in three
                  clean rows beats two cramped ones. */}
              <Reveal>
                <div className="grid grid-cols-3 gap-x-3 gap-y-8 md:hidden">
                  {usefulLinks.map((link, i) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.name}
                      className="flex h-20 items-center justify-center"
                    >
                      <LinkLogo name={link.name} logo={link.logo} i={i} compact />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="cancer-information" className="scroll-mt-28 bg-canvas py-24 md:py-32">
          <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
            <SectionHeading eyebrow="Cancer information" title="Clear information when you need it.">
              Getting clear, reliable information can help you feel more in control. Learn about diagnosis, different cancer types, treatment options and questions you may want to ask your care team.
            </SectionHeading>
            <div className="lg:pt-10"><LinkList items={cancerLinks} /></div>
          </div>
        </section>

        <section id="treatment-preparation" className="scroll-mt-28 bg-canvas-soft py-24 md:py-32">
          <div className="container-wide">
            <SectionHeading eyebrow="Treatment preparation" title="Feel informed and ready.">
              Knowing what to expect can reduce worry and help you prepare for the road ahead.
            </SectionHeading>
            <div className="relative mt-16 border-y border-ink/10 py-10 md:mt-20">
              <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent md:block" />
              <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
                {[
                  ["01", "Before your appointment", "Tips to help you prepare, including what to bring and how to make the most of your time."],
                  ["02", "Understanding your treatment plan", "Learn about possible treatments, how they work and what to expect."],
                  ["03", "Planning for treatment days", "Practical advice to help you feel organised and supported."],
                ].map(([number, title, text]) => (
                  <div key={number} className="relative bg-canvas-soft md:px-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-medium text-white">{number}</span>
                    <h3 className="mt-5 font-display text-2xl leading-tight text-ink">{title}</h3>
                    <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-muted">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="side-effects" className="scroll-mt-28 bg-canvas py-24 md:py-32">
          <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
            <SectionHeading eyebrow="Managing side effects" title="Support for everyday life.">
              Side effects can affect everyone differently. Find guidance and practical information to help you manage symptoms and look after your wellbeing.
            </SectionHeading>
            <div className="lg:pt-10"><LinkList items={sideEffectLinks} /></div>
          </div>
        </section>

        <section id="emotional-support" className="scroll-mt-28 bg-canvas-soft py-24 md:py-32">
          <div className="container-wide grid gap-12 lg:grid-cols-2 lg:items-end lg:gap-24">
            <SectionHeading eyebrow="Emotional and practical support" title="You don’t have to face this alone.">
              Access support for your emotional wellbeing, daily life and the practical challenges that can come with cancer.
            </SectionHeading>
            <div className="grid gap-5 sm:grid-cols-2">
              {["Emotional wellbeing", "Work and everyday life", "Nutrition and movement", "Local support groups"].map((item) => (
                <a key={item} href="#external-organisations" className="group border-b border-ink/15 pb-4 text-ink transition-colors hover:text-accent">
                  <span className="flex items-center justify-between gap-4 text-[15px]">{item}<Arrow /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="carers-and-families" className="scroll-mt-28 bg-canvas py-24 md:py-32">
          <div className="container-narrow text-center">
            <SectionHeading eyebrow="Support for carers and families" title="Support for the people around you.">
              Partners, relatives and friends can need information and support too. Find guidance for caring, communicating and looking after yourself.
            </SectionHeading>
            <a href="#external-organisations" className="mt-8 inline-flex items-center gap-3 text-sm font-medium text-accent hover:text-ink">Explore support for carers <Arrow /></a>
          </div>
        </section>

        <section id="financial-support" className="scroll-mt-28 bg-canvas-soft py-24 md:py-32">
          <div className="container-wide grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
            <SectionHeading eyebrow="Financial and benefits advice" title="Practical help with the things around treatment.">
              Find guidance about benefits, work, travel, insurance and the financial questions that can arise during cancer care.
            </SectionHeading>
            <LinkList items={["Benefits and financial support", "Work and cancer", "Travel and transport", "Insurance and legal information"]} />
          </div>
        </section>

        <section id="external-organisations" className="scroll-mt-28 bg-canvas py-24 md:py-32">
          <div className="container-wide">
            <SectionHeading eyebrow="External organisations" title="Trusted organisations and services.">
              We have gathered these links to help patients and families find further support and reliable information. These organisations are independent of Berkshire Oncology Partnership.
            </SectionHeading>
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {usefulLinks.map((link, i) => (
                <Reveal key={link.url} delay={i % 2}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 border-t border-ink/10 py-5 transition-colors hover:text-accent">
                    <LinkLogo name={link.name} logo={link.logo} i={i} />
                    <span className="flex-1 text-[15px] font-medium leading-snug text-ink group-hover:text-accent">{link.name}</span>
                    <span className="text-lg text-ink-muted transition-transform group-hover:translate-x-1">↗</span>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="patient-guides" className="scroll-mt-28 bg-canvas-soft py-24 md:py-32">
          <div className="container-wide grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
            <SectionHeading eyebrow="Downloadable patient guides" title="Take useful information with you.">
              Downloadable guides can help you prepare for appointments, make notes and return to information in your own time.
            </SectionHeading>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {["Questions to ask at your appointment", "Preparing for treatment", "Managing side effects"].map((guide) => (
                <a key={guide} href="#contact-practice" className="group flex items-center justify-between gap-6 py-5 text-ink hover:text-accent">
                  <span><span className="block font-display text-xl">{guide}</span><span className="mt-1 block text-xs uppercase tracking-[.14em] text-ink-muted">Patient guide · PDF</span></span>
                  <span className="text-lg">↓</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="news-and-updates" className="scroll-mt-28 bg-canvas py-24 md:py-32">
          <div className="container-wide">
            <SectionHeading eyebrow="News and updates" title="The latest from the partnership.">
              Updates about our services, patient information events and new resources.
            </SectionHeading>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {["New patient information", "Events and support", "Partnership updates"].map((item, i) => (
                <a key={item} href="#contact-practice" className="group border-t border-ink/15 pt-5 hover:text-accent">
                  <span className="text-xs uppercase tracking-[.14em] text-ink-muted">0{i + 1} · Update</span>
                  <h3 className="mt-5 font-display text-2xl leading-tight text-ink group-hover:text-accent">{item}</h3>
                  <span className="mt-8 inline-flex items-center gap-3 text-sm">Read more <Arrow /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="contact-practice" className="bg-ink py-20 text-white md:py-28">
          <div className="container-narrow text-center">
            <span className="eyebrow text-white/60">Need help finding the right information?</span>
            <h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">Contact the practice.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/70">Our practice team can help point you towards the right information or service for your circumstances.</p>
            <a href="/contact" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5">Contact us <Arrow /></a>
          </div>
        </section>
      </div>
    </>
  );
}
