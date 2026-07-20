import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllSpecialities,
  getSpecialityBySlug,
  getConsultantsForSpeciality,
} from "@/content/queries";
import { pageMeta, conditionLd, breadcrumbLd } from "@/content/seo";
import JsonLd from "@/components/site/JsonLd";
import ConsultantCoverflow from "@/components/sections/specialities/ConsultantCoverflow";
import MarbleVines from "@/components/sections/specialities/MarbleVines";

// ─────────────────────────────────────────────────────────────────────
// LHS navy convex hero shape (desktop / xl only) — tweak these by hand to
// reshape or reposition it. All values are in px except `radius`.
//   shiftLeft : how far the shape is pulled off the LEFT edge of the screen.
//               ↑ bigger = sits further left / extends LESS far right.
//   topGap    : gap at the top before the shape starts (clears the header).
//   width     : width of the navy fill. ↑ bigger = extends further RIGHT.
//   rimWidth  : width of the gold rim behind the navy (keep ~14px > width).
//   radius    : CSS border-radius, "TL TR BR BL / TLv TRv BRv BLv".
//               TR (2nd number) drives the top curve — ↑ = more curved,
//               ↓ = flatter top. BR (3rd) drives how much the bottom-right
//               lifts off the footer — keep small to stay flush.
// ─────────────────────────────────────────────────────────────────────
const HERO_SHAPE = {
  shiftLeft: 176,
  topGap: 92,
  width: 600,
  rimWidth: 614,
  radius: "0 74% 42% 0 / 0 52% 48% 0",
};

export function generateStaticParams() {
  return getAllSpecialities().map((s) => ({ slug: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const s = getSpecialityBySlug(params.slug);
  if (!s) return {};
  const names = getConsultantsForSpeciality(s.slug).map((c) => c.name);
  const title = s.seoTitle ?? `${s.title} — Private Treatment in Reading`;
  const description =
    s.seoDescription ??
    `Consultant oncologists at Berkshire Oncology Partnership treating ${s.title.toLowerCase()} privately in Reading, Berkshire${
      names.length ? `: ${names.join(", ")}.` : "."
    }`;
  return pageMeta({ title, description, path: `/specialities/${s.slug}` });
}

export default function SpecialityPage({
  params,
}: {
  params: { slug: string };
}) {
  const s = getSpecialityBySlug(params.slug);
  if (!s) notFound();
  const doctors = getConsultantsForSpeciality(s.slug);

  return (
    <>
      <JsonLd
        data={[
          conditionLd(s),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Specialities", path: "/specialities" },
            { name: s.title, path: `/specialities/${s.slug}` },
          ]),
        ]}
      />

      {/* ── split hero: navy panel + gold rim (left), marble + orbit (right) ── */}
      <section className="relative overflow-hidden">
        {/* white base with a warm gold glow pooling in the bottom-right */}
        <div aria-hidden className="absolute inset-0 bg-white" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1240px 980px at 98% 108%, rgba(201,161,79,0.24), rgba(201,161,79,0.08) 48%, transparent 82%), radial-gradient(880px 720px at 82% 94%, rgba(226,196,132,0.13), transparent 74%)",
          }}
        />
        {/* gold marble vines (bottom-left → top-right bundle) that breathe,
            shimmer, and drift toward the cursor — kept clear of the orbit */}
        <MarbleVines />

        {/* navy gold-rimmed convex feature — full height, flush to the (navy)
            footer at the bottom, starting just below the header; strongly convex
            right edge, only slightly flat across the top (desktop) */}
        <div
          aria-hidden
          className="absolute bottom-0 hidden xl:block"
          style={{ left: -HERO_SHAPE.shiftLeft, top: HERO_SHAPE.topGap }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-b from-[#e3c98f] via-[#c9a35a] to-[#a9791a]"
            style={{ width: HERO_SHAPE.rimWidth, borderRadius: HERO_SHAPE.radius }}
          />
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: HERO_SHAPE.width,
              borderRadius: HERO_SHAPE.radius,
              // bottom stop is the footer colour (#061c46 = bg-ink) so the
              // shape merges seamlessly into the footer at the base
              background:
                "linear-gradient(155deg, #0d2c5c 0%, #0a2450 52%, #061c46 100%)",
            }}
          />
          {/* faint sheen following the curve */}
          <div
            className="absolute inset-y-0 left-0 opacity-40"
            style={{
              width: HERO_SHAPE.width,
              borderRadius: HERO_SHAPE.radius,
              background:
                "radial-gradient(460px 320px at 20% 26%, rgba(63,111,176,0.5), transparent 70%)",
            }}
          />
        </div>

        <div className="container-wide relative z-10 pb-14 pt-32 md:pt-36 xl:pb-16 xl:pt-40">
          <div className="grid items-center gap-10 xl:grid-cols-[300px_1fr] xl:gap-12">
            {/* left — copy (its own navy card below xl; over the panel at xl) */}
            <div className="rounded-3xl bg-gradient-to-br from-[#0d2c5c] to-[#040f28] p-7 sm:p-9 xl:rounded-none xl:bg-none xl:p-0">
              <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d9b878]">
                <span className="h-px w-8 bg-[#d9b878]/70" /> Speciality
              </span>
              <h1 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl">
                {s.title}
              </h1>
              <p className="mt-4 max-w-[260px] text-sm leading-relaxed text-white/60">
                The Berkshire Oncology Partnership consultants who specialise in
                this area, and the treatments they offer.
              </p>
              <Link
                href="/consultants"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0c084] via-[#cfa75f] to-[#b98a2e] px-5 py-2.5 text-[13px] font-semibold text-[#08183a] shadow-[0_10px_24px_-10px_rgba(185,138,46,0.6)] transition hover:brightness-105"
              >
                View all consultants
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* right — cover-flow of the consultants who treat this cancer
                (or a contact note when no partner covers it) */}
            {doctors.length > 0 ? (
              // reserve the height the orbit used (636px) so the hero keeps its
              // former size; centre the cover-flow within it
              <div className="flex flex-col justify-center xl:min-h-[636px]">
                <ConsultantCoverflow items={doctors} />
              </div>
            ) : (
              <div className="max-w-md rounded-3xl border border-[#e9dab4] bg-white/85 p-8 text-[15px] leading-relaxed text-ink/80 shadow-[0_20px_44px_-24px_rgba(61,45,10,0.3)]">
                Please contact the practice to discuss diagnosis and treatment
                options for this condition.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
