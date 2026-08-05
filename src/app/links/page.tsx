import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { usefulLinks } from "@/content/usefulLinks";
import { getSection } from "@/content/navigation";
import { organisationGroups, domain } from "@/content/organisations";
import { pathways, isOutline } from "@/content/pathways";
import { pageMeta, breadcrumbLd } from "@/content/seo";
import { site } from "@/content/site";
import JsonLd from "@/components/site/JsonLd";
import Reveal from "@/components/ui/Reveal";
import LinkLogo from "@/components/sections/links/LinkLogo";
import ResourceWave from "@/components/sections/links/ResourceWave";
import IntensityStage from "@/components/sections/resources/Intensity";
import PageMotion from "@/components/sections/resources/PageMotion";
import Pathways from "@/components/sections/resources/Pathways";
import ResourceSearch from "@/components/sections/resources/ResourceSearch";
import Statement from "@/components/sections/resources/Statement";
import WaveMark from "@/components/sections/resources/WaveMark";

// ─────────────────────────────────────────────────────────────────────────────
// Resources and support.
//
// This page had eleven sections and almost no destinations. Nine of the eleven
// were a heading, a paragraph and a list of four link-shaped things, and nearly
// every one of those links pointed at #contact-practice — an anchor further
// down this same page. A reader clicking "Fatigue" expecting to learn about
// fatigue was moved to a telephone number.
//
// Meanwhile eight real pages already existed under /resources/*, described in
// src/content/navigation.ts with a summary and a contents list each, and this
// page linked to none of them.
//
// So the rebuild is mostly deletion. The eight areas below are read straight
// out of the navigation module — same labels, same descriptions, same contents
// — which means this page cannot drift from the section it introduces, and a
// ninth area added to the IA appears here without anyone remembering to come
// back. The invented link lists are gone rather than rewritten: there was
// nothing behind them to rewrite towards.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = pageMeta({
  title: "Resources and support",
  description:
    "Clear information, practical guidance and trusted organisations for patients, families and carers affected by cancer.",
  path: "/resources",
});

/**
 * The reference library: the /resources pages that the five situation pathways
 * do NOT already point at.
 *
 * Derived by subtraction rather than listed, which is what keeps the two
 * sections from overlapping. Between them, the pathways and this section cover
 * all eight /resources destinations exactly once — add a ninth to the IA and it
 * appears in one place or the other automatically, depending on whether a
 * pathway claims it.
 */
const pathwayTargets = new Set(
  pathways.flatMap((p) => [p.action.href, ...p.links.map((l) => l.href)]),
);

const libraryAreas = (getSection("resources")?.groups ?? [])
  .flatMap((group) => group.links)
  .filter(
    (link) =>
      link.href.startsWith("/resources/") && !pathwayTargets.has(link.href),
  )
  .map((link) => ({
    label: link.label,
    href: link.href,
    description: link.description ?? "",
    covers: link.covers ?? [],
  }));

function Arrow() {
  return (
    <span aria-hidden className="text-lg leading-none">
      →
    </span>
  );
}

export default function ResourcesPage() {
  const tel = site.contact.phone.replace(/\s+/g, "");

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ])}
      />
      {/* Snapping is switched off here — see SmoothScroll. This page is a long
          index rather than a sequence of full-height chapters, and settling the
          reader onto section boundaries fights the scroll rather than helping
          it. */}
      <IntensityStage>
      <PageMotion />
      <div data-no-snap className="overflow-x-clip bg-canvas">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[640px] overflow-hidden pt-32 md:min-h-[720px] md:pt-40">
          <div className="container-wide relative z-10 text-center">
            <Reveal>
              <span className="eyebrow justify-center text-[#a9791a]">
                Support and information
              </span>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="display-hero mx-auto mt-7 max-w-5xl text-ink">
                Find the right support for you.
              </h1>
            </Reveal>
            <Reveal delay={2}>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
                Clear information, practical guidance and trusted organisations
                for patients, families and carers.
              </p>
            </Reveal>
          </div>
          {/* The CTA that used to sit here is gone, and the height it occupied
              has gone to the wave rather than being closed up — the wave is the
              hero's only piece of artwork, and it was being cropped to a strip
              to make room for a button that duplicated the section directly
              below it. */}
          {/* Variant 2 ("Tide") is locked in and the review switcher is gone.
              The other three are still in ResourceWave if the choice is ever
              revisited — it is a one-number change here, not a rebuild. */}
          <ResourceWave
            variant={2}
            className="absolute inset-x-0 bottom-0 h-[380px] md:h-[470px]"
          />
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
        {/* Clear of the wave, not overlapping it. The panel used to be pulled
            up by 4–6rem so its rounded top cut across the strands; with the
            wave now the main event in the hero, it starts below the artwork
            instead of cropping it. */}
        <section className="relative z-10 mt-10 rounded-t-[2rem] bg-ink py-16 md:mt-16 md:rounded-t-[3rem] md:py-24">
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
              {/* Nine marks, three by three, at every width.

                  This was two layouts: five across the top with four staggered
                  beneath and cross-hairs marking the offsets, swapped for a
                  three-column grid on phones. The stagger was there to stop it
                  reading as a table, and the crosses to explain the stagger —
                  decoration explaining decoration. Nine divides by three, so
                  the symmetrical arrangement was available the whole time, and
                  it is the one the phone layout had already found. One grid now
                  serves both, which also means the nine logos are rendered once
                  rather than twice with one set hidden. */}
              <Reveal>
                <div className="grid grid-cols-3 items-center gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-14">
                  {usefulLinks.map((link, i) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.name}
                      className="flex h-20 items-center justify-center md:h-32"
                    >
                      <LinkLogo
                        name={link.name}
                        logo={link.logo}
                        i={i}
                        responsive
                      />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            From here down, every section wears a different skin and every
            boundary is a transition. The rhythm of surfaces:

              white → paper sheet → navy → white → photograph → tint → navy

            No two neighbours match. The scroll choreography lives in
            PageMotion.tsx and reads the data-fx hooks below; the intensity
            panel (bottom left) switches how far it all goes.
            ───────────────────────────────────────────────────────────────── */}

        {/* ── Start wherever you are ── the held breath.
            Giant fill-on-scroll type on plain white, with the wave's waist
            fragment tapering in from the page edge. At full intensity this
            section pins and the paper sheet slides up over it — the page
            turning its first page. */}
        <section
          data-pin-curtain
          className="relative z-0 overflow-hidden bg-canvas py-28 md:py-40"
        >
          <div data-fx="draw" className="absolute left-0 top-1/2 hidden h-[130px] w-[58%] -translate-y-1/2 md:block">
            <WaveMark
              idPrefix="waist-taper"
              viewBox="-30 150 640 135"
              opacityBase={0.12}
              opacitySpan={0.2}
              className="h-full w-full"
            />
          </div>
          <div className="container-wide relative">
            <Statement className="max-w-3xl">Start wherever you are.</Statement>
            <Reveal>
              <p className="mt-10 max-w-md text-[17px] leading-relaxed text-ink/70">
                Nothing here has to be read in order, or in one sitting. Each of
                the eight areas below stands on its own.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── The five situations ── the paper sheet.
            Warm paper, rounded top, riding up over the statement: at level 2 it
            rises and settles as it arrives, at level 3 it is the curtain that
            covers the pinned statement — and on desktop the five situations
            become the pinned shelf that scrolls sideways. */}
        <section
          id="pathways"
          data-fx="rise"
          className="relative z-10 scroll-mt-28 rounded-t-[2.5rem] bg-[#f6f4ee] pb-6 pt-14 will-change-transform md:-mt-6 md:rounded-t-[3.5rem] md:pt-20"
        >
          <Pathways />
        </section>

        {/* ── Search ── the navy interlude.
            The page's darkest moment between two light sheets. Rises and
            settles into place; the search itself works the whole site. */}
        <section
          id="resource-search"
          data-fx="rise"
          className="relative z-20 -mt-6 scroll-mt-28 rounded-t-[2.5rem] bg-ink py-20 will-change-transform md:rounded-t-[3.5rem] md:py-28"
        >
          <ResourceSearch />
        </section>

        {/* ── Guides and information ── the card gallery.
            White sheet over the navy; the three reference areas arrive as
            cards flying in from alternating sides, each carrying its own
            signature of the wave at a different density. */}
        <section
          id="guides"
          className="relative z-[21] -mt-6 scroll-mt-28 rounded-t-[2.5rem] bg-canvas py-20 md:rounded-t-[3.5rem] md:py-28"
        >
          <div className="container-wide">
            <div className="max-w-2xl">
              <span className="eyebrow text-[#a9791a]">Guides and information</span>
              <h2 className="display-section mt-6 text-ink">
                Written to be read on a bad day.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {libraryAreas.map((area, i) => (
                <article
                  key={area.href}
                  data-fx="fly"
                  data-side={i % 2 === 0 ? "left" : "right"}
                  className="card-soft overflow-hidden rounded-[1.75rem] will-change-transform"
                >
                  {/* each card's header is the wave at its own density —
                      imagery without stock photography */}
                  <div className="border-b border-black/[0.05] bg-canvas-soft/60">
                    <WaveMark
                      idPrefix={`guide-${i}`}
                      viewBox="0 134 1400 84"
                      amplitude={[0.25, 0.45, 0.35][i % 3]}
                      count={[9, 15, 11][i % 3]}
                      opacityBase={0.18}
                      opacitySpan={0.26}
                      strokeScale={1.2}
                      mirrored={i % 2 === 1}
                      className="h-24 w-full"
                    />
                  </div>
                  <div className="p-7">
                    <span className="label-tight tabular-nums text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-2xl leading-tight text-ink">
                      <Link
                        href={area.href}
                        className="transition-colors hover:text-accent"
                      >
                        {area.label}
                      </Link>
                      {isOutline(area.href) && (
                        <span className="ml-2 whitespace-nowrap rounded-full bg-ink/[0.06] px-2 py-0.5 align-middle text-[11px] font-medium text-ink/60">
                          Being written
                        </span>
                      )}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
                      {area.description}
                    </p>
                    {/* Desktop only: a preview of the destination's contents —
                        on a phone these were sixteen rows a reader scrolls past
                        on a page that is already long. */}
                    <ul className="mt-5 hidden md:block">
                      {area.covers.map((item) => (
                        <li
                          key={item}
                          className="border-b border-ink/[0.08] py-2 text-[14px] leading-snug text-ink/60"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={area.href}
                      className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-ink"
                    >
                      Read this
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Emotional and family support ── the photograph.
            The page's one full-bleed image: it moves slower than the page, and
            at full intensity it un-crops from a rounded window to edge-to-edge
            as you reach it. The copy rides a white card overlapping its foot.
            Faceless by policy — public/support/CREDITS.md has the reasoning. */}
        <section
          id="emotional-support"
          data-parallax-frame
          className="relative z-[22] scroll-mt-28 bg-canvas"
        >
          <div data-fx-clip className="relative h-[340px] overflow-hidden md:h-[560px]">
            <Image
              data-fx="parallax"
              src="/support/hands-table.jpg"
              alt="Two people's hands resting together on a kitchen table"
              fill
              sizes="100vw"
              className="scale-[1.28] object-cover will-change-transform"
            />
            <div aria-hidden className="absolute inset-0 bg-ink/20" />
          </div>
          <div className="container-wide">
            <Reveal>
              <div className="relative z-10 -mt-24 max-w-2xl rounded-[1.75rem] border border-black/[0.05] bg-white p-7 shadow-[0_2px_4px_rgba(6,28,70,0.04),0_28px_70px_-24px_rgba(6,28,70,0.28)] md:-mt-32 md:p-10">
                <span className="eyebrow text-[#a9791a]">
                  Emotional and family support
                </span>
                <h2 className="display-section mt-5 text-ink">
                  A diagnosis arrives for everyone around it.
                </h2>
                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/75">
                  Partners, relatives and friends often carry a good deal of it,
                  and frequently without being asked how they are. Support
                  exists for them too, and using it is not taking something away
                  from the person who is ill.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  <Link
                    href="/resources/carers-and-families"
                    className="group inline-flex items-center gap-2.5 text-sm font-medium text-accent transition-colors hover:text-ink"
                  >
                    Support for carers and families
                    {isOutline("/resources/carers-and-families") && (
                      <span className="whitespace-nowrap rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium text-ink/60">
                        Being written
                      </span>
                    )}
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                  <a
                    href="https://www.macmillan.org.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm font-medium text-ink/70 transition-colors hover:text-accent"
                  >
                    Macmillan support line
                    <span aria-hidden>↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── The organisations, with reasons ── drifting panels on tint.
            Three white panels on the cool tint, each travelling at its own
            speed — the counterpart to the navy band of marks near the top:
            that one is recognition, this one says what each is for. */}
        <section
          id="external-organisations"
          data-drift-band
          className="relative z-[23] scroll-mt-28 bg-canvas-soft pb-24 pt-20 md:pb-32 md:pt-24"
        >
          <div className="container-wide">
            <div className="max-w-2xl">
              <span className="eyebrow text-[#a9791a]">
                Organisations and services
              </span>
              <h2 className="display-section mt-6 text-ink">
                Where to go next, outside us.
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-ink/70">
                All independent of Berkshire Oncology Partnership. Every link
                opens in a new tab.
              </p>
            </div>

            <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
              {organisationGroups.map((group, gi) => (
                <div
                  key={group.id}
                  data-fx="drift"
                  data-drift={[0.55, 0.25, 0.8][gi % 3]}
                  data-rot={[-1, 0, 1][gi % 3]}
                  className="rounded-[1.75rem] border border-black/[0.05] bg-white p-7 shadow-[0_1px_2px_rgba(6,28,70,0.04),0_18px_44px_-18px_rgba(6,28,70,0.16)] will-change-transform md:p-8"
                >
                  <h3 className="font-display text-xl leading-snug text-ink">
                    {group.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-ink/60">
                    {group.note}
                  </p>
                  <ul className="mt-5">
                    {group.entries.map(({ link, reason }) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-[52px] items-start gap-4 border-t border-ink/10 py-3.5"
                        >
                          <span className="flex-1">
                            <span className="block text-[15.5px] font-medium leading-snug text-ink transition-colors group-hover:text-accent">
                              {link.name}
                            </span>
                            {reason && (
                              <span className="mt-1 block text-[14px] leading-relaxed text-ink/65">
                                {reason}
                              </span>
                            )}
                            <span className="mt-1 block text-[12.5px] text-ink-muted">
                              {domain(link.url)}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className="mt-1 shrink-0 text-ink-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          >
                            ↗
                          </span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Close ── the reprise.
            Ink again, bookending the navy band up top — and the hero's wave
            returns mirrored in white, drawing itself in behind the sign-off so
            the page ends where it began, seen from the other side. */}
        <section className="relative z-[24] -mt-6 overflow-hidden rounded-t-[2.5rem] bg-ink py-28 text-white md:rounded-t-[3.5rem] md:py-36">
          <div
            data-fx="draw"
            className="absolute inset-x-0 bottom-0 h-[240px] md:h-[320px]"
          >
            <WaveMark
              idPrefix="close-reprise"
              viewBox="0 20 1400 270"
              stroke="#ffffff"
              opacityBase={0.06}
              opacitySpan={0.16}
              strokeScale={1.2}
              mirrored
              className="h-full w-full"
            />
          </div>
          <div className="container-wide relative z-10">
            <Statement className="max-w-3xl [&_span]:text-white">
              You don&rsquo;t have to face this alone.
            </Statement>
            <Reveal>
              <p className="mt-10 max-w-xl text-[17px] leading-relaxed text-white/70">
                If you are not sure where to start, {site.contact.practiceManager}{" "}
                and the practice team can point you to the right information, or
                to the right person, for your circumstances.
              </p>
            </Reveal>
            <Reveal>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5"
                >
                  Contact the practice <Arrow />
                </Link>
                <a
                  href={`tel:${tel}`}
                  className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/[0.06]"
                >
                  {site.contact.phone}
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
      </IntensityStage>
    </>
  );
}
