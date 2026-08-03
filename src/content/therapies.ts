import { modalitiesByConsultant } from "./modalities";
import { consultants } from "./consultants";
import { treatments } from "./treatments";
import { specialities } from "./specialities";
import type { Slug, Speciality } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Treatment modalities as their own pages (/treatments/*).
//
// Note the distinction from ./treatments.ts, which is the consultant↔cancer-type
// edge list. This module is about the therapies themselves.
//
// ── What these pages are, and are not ───────────────────────────────────────
// Berkshire Oncology Partnership is a group of consultants, not a facility
// operator. The linear accelerators, chemotherapy suites and nuclear medicine
// departments belong to the partner hospitals. So these pages deliberately do
// NOT follow the shape of a hospital-group treatment page ("we have this
// machine, come here"). They are routing-and-orientation pages: what the
// treatment is, in plain English; which of our consultants provide it; where it
// would be delivered; and what happens next. Anything deeper is linked out to
// Cancer Research UK and Macmillan rather than restated here.
//
// ── Provenance of the clinical copy ─────────────────────────────────────────
// `what`, `whenConsidered` and `expect` are drafted from UK public patient
// information (per-therapy sources listed in `sources` on each entry, all
// checked 2026-07-31). They are written to stay general on purpose: no doses,
// no drug names, no eligibility criteria, no outcome claims. Every specific is
// routed back to the patient's own consultant. Nothing here is derived from the
// partnership's own material, because the old site carries no treatment copy at
// all.
//
// ── Provenance of the consultant lists ──────────────────────────────────────
// `matches` holds the exact modality wording each consultant lists on their own
// profile. We only ever claim a consultant provides a treatment when their own
// listed wording says so, and we show that wording alongside their name rather
// than paraphrasing it — an oncology site is the wrong place to infer clinical
// scope. Where a mapping cannot be made honestly, `matches` is empty and the
// page says the detail is being confirmed with the consultants.
//
// ── What was deliberately left out ──────────────────────────────────────────
// • Clinical trials / research — the live site mentions research nowhere, on no
//   consultant profile and on no page. A trials page would be the site's only
//   unevidenced claim, so it is not built. /treatments/clinical-trials redirects
//   to the hub, which carries an honest "ask your consultant" note instead.
// • Palliative radiotherapy — no consultant lists it as separate wording, so it
//   is a section within the radiotherapy page rather than a page with an empty
//   consultant list. The old URL redirects to that anchor.
// • Systemic anti-cancer treatment (SACT) — an umbrella term for the four drug
//   treatments, not a treatment in itself. It is explained on the hub.
// ─────────────────────────────────────────────────────────────────────────────

export type TherapyGroupId = "drug" | "radiotherapy";

export interface TherapySource {
  label: string;
  url: string;
}

export interface TherapySection {
  id: string;
  title: string;
  body: string[];
  /** Shown as a bordered caveat under the section. */
  note?: string;
}

export interface TherapyStage {
  title: string;
  body: string;
}

export interface TherapyImage {
  /** Path under /public. */
  src: string;
  /** Substantive alt text — these figures carry meaning, not decoration. */
  alt: string;
  caption: string;
  /** Attribution line; see public/treatments/CREDITS.md for the swap manifest. */
  credit: string;
}

export interface Therapy {
  slug: string;
  title: string;
  /** Short plain-English description used on cards and in search. */
  summary: string;
  /** Which hub group this belongs to. */
  group: TherapyGroupId;
  /** Modality strings, verbatim from modalities.ts, that count as this therapy. */
  matches: string[];
  /** Rendered when there is no honest automatic mapping. */
  note?: string;
  /** Related therapy slugs, for cross-linking. */
  related?: string[];
  /** 2–3 short paragraphs: what the treatment is. */
  what: string[];
  /** When it may be considered. Deliberately general. */
  whenConsidered: string[];
  /** What a patient may expect, in order. */
  expect: TherapyStage[];
  /** Extra sections folded into this page (e.g. palliative radiotherapy). */
  sections?: TherapySection[];
  /** Where the drafted copy came from. Rendered as "Read more" links. */
  sources: TherapySource[];
  /** Optional supporting figure. */
  image?: TherapyImage;
}

// ── Standing disclaimer, shown on every treatment page ───────────────────────
export const treatmentDisclaimer =
  "This page is general information, not medical advice. Whether any treatment is suitable for you — and if so which drugs, which doses and over what period — depends entirely on your individual diagnosis and on clinical review by your consultant. Nothing on this page should be used to make a decision about your own care, or to delay contacting your treating team.";

export const trialsNote =
  "We are sometimes asked about clinical trials. Trial availability changes constantly and depends on your diagnosis, your previous treatment and where you are being treated. Ask your consultant directly whether a trial may be suitable for you — they will know what is open and relevant at the time.";

export const sactNote =
  "You may see the term systemic anti-cancer treatment, or SACT, on letters and appointment records. It is an umbrella term rather than a treatment in itself: it covers the drug treatments that travel through the whole body — chemotherapy, immunotherapy, targeted therapies and hormone therapy. If a letter refers to SACT, the treatment being described is one of the four above.";

export const therapies: Therapy[] = [
  // ── Drug treatments ────────────────────────────────────────────────────────
  {
    slug: "chemotherapy",
    title: "Chemotherapy",
    group: "drug",
    summary:
      "Drug treatment that acts on cells as they divide, given as a course of cycles with rest periods in between.",
    matches: ["Chemotherapy"],
    related: ["immunotherapy", "targeted-therapies", "hormone-therapy"],
    what: [
      "Chemotherapy uses anti-cancer drugs that act on cells while they are dividing. Cancer cells divide more often than most healthy cells, so the drugs affect them more — but some healthy tissues that also renew quickly, such as the lining of the mouth and gut, the bone marrow and hair follicles, are affected as well. That is where most of the familiar side effects come from.",
      "It is usually given as a course made up of several cycles: a treatment day, or a few days, followed by a rest period that gives healthy tissue time to recover. Most chemotherapy is given into a vein through a drip or a line, though some drugs are taken as tablets or capsules at home.",
      "Chemotherapy may be used on its own or alongside surgery and radiotherapy — before another treatment to shrink a tumour, after it to reduce the chance of the cancer returning, or on its own over a longer period to keep a cancer under control.",
    ],
    whenConsidered: [
      "Where the cancer type is one that responds well to drug treatment",
      "Before surgery or radiotherapy, to reduce the size of a tumour first",
      "After surgery, to lower the risk of the cancer coming back",
      "Where a cancer has spread, to control it and relieve symptoms",
      "In combination with immunotherapy or targeted treatment, for some cancers",
    ],
    expect: [
      {
        title: "Before you start",
        body: "A consultation to go through the plan, why this treatment is being recommended, and what the alternatives are. Blood tests, and sometimes heart or kidney checks, confirm you are well enough to begin. You will be asked to give written consent, and you should be given a 24-hour helpline number to keep with you throughout treatment.",
      },
      {
        title: "On a treatment day",
        body: "Bloods are usually checked first and the treatment is prepared once results are back, so there is often waiting time. Treatment itself may take from under an hour to most of a day depending on the drugs. Anti-sickness medication is generally given alongside. Most people can be driven home afterwards rather than driving themselves.",
      },
      {
        title: "Between cycles",
        body: "Side effects tend to follow a pattern that repeats with each cycle, so you learn to anticipate them. The main thing to watch for is infection: a temperature, shivering or feeling suddenly unwell needs to be reported the same day, not at the next appointment. This is what the 24-hour helpline is for.",
      },
      {
        title: "Reviews and follow-up",
        body: "You will be seen before each cycle, and scans are used at intervals to see how the cancer is responding. The plan can be adjusted along the way — doses changed, cycles delayed, or the approach reconsidered — based on how you are tolerating it and how the cancer is behaving.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Chemotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy",
      },
      {
        label: "NHS — Chemotherapy",
        url: "https://www.nhs.uk/conditions/chemotherapy/",
      },
    ],
  },
  {
    slug: "immunotherapy",
    title: "Immunotherapy",
    group: "drug",
    summary:
      "Treatment that works on the immune system, helping the body's own defences recognise and act against cancer cells.",
    matches: ["Immunotherapy", "Biological and immunotherapy"],
    related: ["targeted-therapies", "chemotherapy"],
    what: [
      "Immunotherapy works on the immune system rather than on the cancer directly. The most widely used group, checkpoint inhibitors, blocks the signals some cancers use to switch off an immune response — which allows the body's own immune cells to recognise the tumour and act on it.",
      "It is usually given as a drip into a vein, in cycles a few weeks apart, and where it is working it may be continued for many months. Appointments are often shorter than chemotherapy appointments.",
      "Because it works by increasing immune activity, its side effects are different in character from chemotherapy's. They tend to look like inflammation and can affect almost any part of the body — skin, bowel, thyroid and other hormone glands, joints, liver or lungs. They can also appear weeks or months after treatment begins, including after it finishes. They are usually very manageable when picked up early, which is why any new or unusual symptom is worth reporting promptly rather than waiting.",
    ],
    whenConsidered: [
      "Where the cancer type is one known to respond to immune checkpoint treatment",
      "Where tests on the tumour suggest immunotherapy is more likely to help",
      "Alongside chemotherapy, for some cancers",
      "After surgery, for some cancers, to reduce the risk of recurrence",
      "Where a cancer has spread and long-term control is the aim",
    ],
    expect: [
      {
        title: "Before you start",
        body: "As well as the usual blood tests, baseline checks of thyroid, liver and kidney function are normally taken, because these are the things monitored for immune-related effects later. Tests on your tumour sample may be used to help judge whether immunotherapy is likely to help.",
      },
      {
        title: "On a treatment day",
        body: "The infusion itself is often relatively short — commonly around half an hour to an hour — with observation afterwards, particularly for the first cycle. Many people feel much as they did when they arrived and are able to go about their day.",
      },
      {
        title: "Between cycles",
        body: "Bloods are repeated before each cycle to monitor for immune-related effects, some of which show up in test results before you notice anything. Tiredness is common. New symptoms — persistent diarrhoea, a rash, breathlessness, unusual thirst or fatigue — should be reported rather than waited out, because early treatment usually settles them quickly.",
      },
      {
        title: "Reviews and follow-up",
        body: "Scans are used at intervals to judge response. Monitoring for immune-related effects continues after treatment ends, since some can emerge later, and you will be told what to watch for and who to contact once you are no longer attending regularly.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Immunotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/immunotherapy",
      },
      {
        label: "Macmillan — Treatments and drugs",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatments-and-drugs",
      },
    ],
  },
  {
    slug: "targeted-therapies",
    title: "Targeted therapies",
    group: "drug",
    summary:
      "Drugs designed to act on a specific feature of a cancer cell, rather than on dividing cells generally.",
    // "Biological and immunotherapy" is deliberately NOT matched here. Seven
    // consultants list that phrase, and it already maps to Immunotherapy above;
    // reading it as targeted therapy as well would be our inference, not their
    // wording. Only "Targeted and endocrine treatments" says it outright.
    matches: ["Targeted and endocrine treatments"],
    note: "Several of our consultants describe this treatment under other wording, such as 'biological and immunotherapy'. Which of them provide targeted therapies is being confirmed with the partnership before it is listed here.",
    related: ["immunotherapy", "hormone-therapy", "chemotherapy"],
    what: [
      "Targeted therapies act on a specific feature of a cancer cell — a particular protein, receptor or gene change that is driving its growth — rather than on dividing cells in general. Because the target is more specific to the cancer, the pattern of side effects is usually different from chemotherapy's, though it is not necessarily milder.",
      "They only work when the cancer actually carries the feature the drug is designed for. So they normally follow a test on a sample of the tumour, or sometimes a blood test, to establish whether that target is present.",
      "Many targeted drugs are tablets taken at home, which changes the shape of treatment: fewer hospital visits, but more responsibility on you to take the drug exactly as prescribed, to keep track of other medicines and supplements that might interact, and to report side effects between appointments rather than at them.",
    ],
    whenConsidered: [
      "Where testing shows the cancer carries a specific target the drug acts on",
      "Where a cancer has particular molecular or genetic features identified on a sample",
      "Alongside chemotherapy or hormone therapy, for some cancers",
      "Where a previous treatment is no longer holding the cancer",
    ],
    expect: [
      {
        title: "Testing first",
        body: "Treatment normally depends on a test result. A sample of the tumour taken at biopsy or surgery — or occasionally a blood sample — is examined for the specific change the drug targets. This takes time to come back, and the result determines whether this route is open at all.",
      },
      {
        title: "Starting treatment",
        body: "If a tablet, you will be shown how and when to take it, what to take it with, and what to avoid. Some targeted drugs interact with common medicines, supplements and even grapefruit, so your team will want a full list of everything you take. Others are given as an infusion in the same way as chemotherapy.",
      },
      {
        title: "During treatment",
        body: "Side effects vary a great deal by drug, but skin changes, diarrhoea, tiredness and blood pressure changes are among the more common. Regular blood tests and reviews continue while you are on treatment. Dose adjustments are routine rather than a setback.",
      },
      {
        title: "Reviews and follow-up",
        body: "Scans at intervals show whether the treatment is holding the cancer. Targeted treatment is often continued for as long as it keeps working and is tolerated, so reviews focus on both response and how you are managing day to day.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Targeted cancer drugs",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs",
      },
      {
        label: "Macmillan — Treatments and drugs",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatments-and-drugs",
      },
    ],
  },
  {
    slug: "hormone-therapy",
    title: "Hormone therapy",
    group: "drug",
    summary:
      "Treatment that lowers or blocks the hormones some cancers depend on to grow, usually taken over a long period.",
    matches: ["Hormone treatment", "Hormone therapy", "Targeted and endocrine treatments"],
    related: ["targeted-therapies", "chemotherapy", "radiotherapy"],
    what: [
      "Some cancers use the body's own hormones as a growth signal — most familiarly oestrogen in many breast cancers, and testosterone in prostate cancer. Hormone therapy either lowers the amount of that hormone in the body or blocks it from reaching the cancer cells.",
      "Because it acts on a signal rather than on dividing cells, day-to-day it is generally gentler than chemotherapy. But it is usually taken for far longer — often several years — as daily tablets, or as injections or implants given at set intervals.",
      "Side effects tend to reflect the hormone being reduced, and commonly include hot flushes, tiredness, changes in mood, weight, sexual function or bone strength. Where treatment is long-term, bone health is usually monitored and sometimes actively protected.",
    ],
    whenConsidered: [
      "Where tests show the cancer is driven by hormones — for example an oestrogen-receptor-positive breast cancer",
      "After surgery or radiotherapy, to reduce the risk of the cancer returning",
      "Before or alongside radiotherapy, for some prostate cancers",
      "Where a hormone-sensitive cancer has spread, to control it over a long period",
    ],
    expect: [
      {
        title: "Before you start",
        body: "Hormone therapy generally follows a test showing the cancer is hormone-sensitive. Your consultant will explain how long the course is expected to run — often measured in years rather than months — because that length is central to deciding whether it is right for you.",
      },
      {
        title: "Starting treatment",
        body: "If tablets, you take them at home, usually once a day. If injections or implants, you attend at set intervals, which may be monthly or several-monthly. A baseline bone density scan is sometimes arranged for treatments known to affect bone.",
      },
      {
        title: "During treatment",
        body: "Effects often build gradually over the first weeks rather than arriving at once. Hot flushes, joint aches, tiredness and mood changes are common and there are practical ways to reduce most of them — worth raising early rather than enduring, since long courses are far easier to complete when side effects are actively managed.",
      },
      {
        title: "Reviews and follow-up",
        body: "Reviews continue throughout, covering both how the cancer is behaving and how you are tolerating treatment. Because the course is long, it is normal to discuss switching to an alternative if one is not suiting you.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Hormone therapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/hormone-therapy",
      },
      {
        label: "Macmillan — Treatments and drugs",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatments-and-drugs",
      },
    ],
  },

  // ── Radiotherapy ───────────────────────────────────────────────────────────
  {
    slug: "radiotherapy",
    title: "Radiotherapy",
    group: "radiotherapy",
    summary:
      "Precisely aimed radiation, planned in advance and given as a series of short daily appointments.",
    matches: ["Radiotherapy"],
    related: ["brachytherapy", "radioisotope-therapy", "chemotherapy"],
    what: [
      "Radiotherapy uses carefully measured, precisely aimed radiation to damage cancer cells so that they cannot continue to divide. In external beam radiotherapy — much the most common form — it is delivered from a machine outside the body called a linear accelerator. Nothing is put inside you, and you are not radioactive at any point.",
      "A course is planned in detail before it starts. A planning CT scan maps the treatment area; small skin marks are sometimes used so you can be positioned identically each day; and a physics team calculates how the beams are shaped and angled so that the tumour receives the intended dose while surrounding healthy tissue receives as little as possible.",
      "Treatment is then given as a series of short appointments, typically Monday to Friday over a number of weeks. The treatment itself takes only minutes — you lie still, the machine moves around you, and you feel nothing while it is running.",
    ],
    whenConsidered: [
      "As the main treatment for some cancers, sometimes instead of surgery",
      "After surgery, to treat any cells that may remain in the area",
      "Before surgery, to reduce the size of a tumour first",
      "Alongside chemotherapy, which can make radiotherapy more effective for some cancers",
      "To relieve symptoms such as pain, pressure or bleeding — see palliative radiotherapy below",
    ],
    expect: [
      {
        title: "Planning appointment",
        body: "A planning CT scan is done in the position you will be treated in, which is why it can take longer than the treatment sessions themselves. Immobilisation aids — a headrest, or a moulded mask for head and neck treatment — may be made so your position is reproducible. Tiny permanent skin marks are sometimes used as alignment points.",
      },
      {
        title: "Waiting for the plan",
        body: "There is usually a gap of several days to a couple of weeks between planning and the first treatment. This is not a delay in the ordinary sense — it is the time the physics team needs to calculate and check the dose distribution before anything is delivered.",
      },
      {
        title: "During the course",
        body: "Daily appointments are short, and most of each visit is spent being positioned rather than treated. Side effects build gradually and are usually confined to the area being treated — skin changes and tiredness are the most common general ones. They typically peak shortly after the course finishes rather than during it.",
      },
      {
        title: "After treatment",
        body: "Because effects can continue to build for a week or two after the last session, support does not stop when the course does. You will be told what to expect, how to care for the treated skin, and who to contact. Follow-up appointments are arranged to check how the area has settled and how the cancer has responded.",
      },
    ],
    sections: [
      {
        id: "palliative-radiotherapy",
        title: "Palliative radiotherapy",
        body: [
          "Radiotherapy is also used to relieve symptoms rather than to attempt a cure. This is called palliative radiotherapy, and it is one of the most effective ways of easing pain caused by cancer in the bone. It is also used to relieve pressure, bleeding or breathlessness.",
          "Courses are much shorter than curative ones — sometimes a single appointment — and the doses are lower, so side effects are usually milder and the practical burden on you is far smaller. The benefit often takes a week or two to build, so it is worth knowing that relief is not always immediate.",
          "The word palliative sometimes causes alarm. Here it describes the purpose of the treatment — controlling a symptom — and not a stage of illness or a prognosis.",
        ],
        note: "No consultant lists palliative radiotherapy as separate wording on their profile, so we do not publish a list for it. In practice it is delivered by consultants providing radiotherapy — ask your consultant, or call the practice and we will tell you who to speak to.",
      },
    ],
    // Caption wording matters here: this is a linac at another hospital
    // entirely, so it is described as "of the type used" and never as our
    // equipment or our room. See public/treatments/CREDITS.md.
    image: {
      src: "/treatments/linear-accelerator.jpg",
      alt: "A linear accelerator in a radiotherapy treatment room: a large gantry arm with a treatment head above a motorised couch, in an otherwise empty, plainly furnished room.",
      caption:
        "A linear accelerator of the type used to deliver external beam radiotherapy. The machine moves around the couch to direct the beam from several angles; the room is empty during treatment and staff watch from outside.",
      credit: "Photograph: Narenfox, CC BY-SA 4.0, via Wikimedia Commons.",
    },
    sources: [
      {
        label: "Cancer Research UK — Radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy",
      },
      {
        label: "NHS — Radiotherapy",
        url: "https://www.nhs.uk/conditions/radiotherapy/",
      },
    ],
  },
  {
    slug: "brachytherapy",
    title: "Brachytherapy",
    group: "radiotherapy",
    summary:
      "Radiotherapy delivered from a source placed inside the body, immediately at the tumour.",
    matches: ["Brachytherapy", "Prostate brachytherapy"],
    related: ["radiotherapy", "radioisotope-therapy"],
    what: [
      "Brachytherapy delivers radiotherapy from a source placed inside the body, next to or within the tumour itself. Because the dose falls away very sharply over a short distance, a high dose can be concentrated where it is needed while nearby healthy tissue receives comparatively little.",
      "It is a procedure rather than a course of daily appointments. The source is positioned under imaging guidance, usually with an anaesthetic. In some forms, small permanent seeds are left in place and lose their radioactivity gradually over months. In others, a source is placed for a set period and then removed, and nothing radioactive stays in the body.",
      "Within this partnership, brachytherapy is listed by consultants working in prostate and gynaecological cancer.",
    ],
    whenConsidered: [
      "For prostate cancer, where the cancer is contained within the prostate",
      "For gynaecological cancers, often alongside external beam radiotherapy",
      "Where concentrating a high dose in a small area is an advantage",
      "As an alternative to surgery for some cancers, depending on the individual case",
    ],
    expect: [
      {
        title: "Assessment and planning",
        body: "Brachytherapy suits some cancers and not others, so assessment is more selective than for external radiotherapy. Imaging is used to judge whether the tumour is in a position where a source can be placed accurately and safely, and to plan exactly where it will go.",
      },
      {
        title: "The procedure",
        body: "It is carried out in a theatre or procedure room, generally under a general or spinal anaesthetic. Imaging guides the placement. Depending on the technique this is a day case or involves a short stay — your team will tell you which applies well in advance, since it affects what you need to arrange.",
      },
      {
        title: "Afterwards",
        body: "Recovery is from the procedure itself rather than from radiation. Where permanent seeds are used, you will be given clear written guidance about the first weeks, including simple precautions about prolonged close contact with young children or anyone pregnant. Where the source is removed, no such precautions are needed.",
      },
      {
        title: "Follow-up",
        body: "Follow-up appointments check how the area has healed and how the cancer has responded, using examination and, where relevant, blood tests or imaging over the following months.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Internal radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/internal",
      },
      {
        label: "Macmillan — Radiotherapy",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/types-of-treatment/radiotherapy",
      },
    ],
  },
  {
    slug: "radioisotope-therapy",
    title: "Radioisotope therapy",
    group: "radiotherapy",
    summary:
      "A radioactive medicine, given by injection or by mouth, that collects where it is needed and treats the cancer from within.",
    matches: ["Therapeutic radioisotopes", "Radio-isotope therapy"],
    related: ["radiotherapy", "brachytherapy"],
    what: [
      "Radioisotope therapy uses a radioactive substance given as an injection, a drink or a capsule. It travels through the body and collects where it is needed — in bone, or in cells that take up a particular molecule — and treats the cancer from within, over a very short range.",
      "Because the treatment is targeted biologically rather than aimed by a machine, it can reach several sites at once. Radioiodine for thyroid cancer, and bone-seeking treatments for prostate cancer that has spread to bone, are among the more familiar examples.",
      "It is given in a nuclear medicine department under specific safety arrangements. For a period afterwards you may be asked to follow simple, temporary precautions about close contact with others — particularly young children and anyone pregnant — and about using the toilet and handling laundry. Your team will give you these in writing, with dates, so there is nothing to remember or guess at.",
    ],
    whenConsidered: [
      "For thyroid cancer, following surgery",
      "For prostate cancer that has spread to bone",
      "For some neuroendocrine tumours",
      "Where a cancer has spread to several sites that a single radiation beam could not cover",
    ],
    expect: [
      {
        title: "Before treatment",
        body: "Scans and blood tests confirm the treatment will reach the right places. You may be asked to follow a specific diet or to stop certain medicines beforehand — for radioiodine, for example, dietary preparation matters and you will be given clear instructions.",
      },
      {
        title: "Receiving the treatment",
        body: "The dose is given as an injection, a drink or a capsule, and takes very little time in itself. Depending on the treatment you may go home the same day, or stay in a dedicated room for a short period until radiation levels fall to the point where normal contact is safe.",
      },
      {
        title: "The days afterwards",
        body: "You will be given written precautions covering distance and duration of close contact, sleeping arrangements, toilet use and laundry, each with an end date. They are straightforward and time-limited. Drinking plenty of fluids is usually advised, to help clear what the body does not use.",
      },
      {
        title: "Follow-up",
        body: "Scans afterwards can often show where the radioactive medicine has collected, which itself gives useful information. Blood tests and imaging then follow at intervals to check response, and treatment can sometimes be repeated.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Internal radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/internal",
      },
      {
        label: "Macmillan — Radiotherapy",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/types-of-treatment/radiotherapy",
      },
    ],
  },
];

const therapyBySlug = new Map(therapies.map((t) => [t.slug, t]));

export function getTherapy(slug: string): Therapy | undefined {
  return therapyBySlug.get(slug);
}

export const therapyGroups: { id: TherapyGroupId; title: string; blurb: string }[] = [
  {
    id: "drug",
    title: "Drug treatments",
    blurb:
      "Treatments that travel through the body. Given as infusions or as tablets, over cycles or continuously.",
  },
  {
    id: "radiotherapy",
    title: "Radiotherapy",
    blurb:
      "Treatments that use radiation, delivered from outside the body, from a source placed within it, or as a radioactive medicine.",
  },
];

export function getTherapiesInGroup(group: TherapyGroupId): Therapy[] {
  return therapies.filter((t) => t.group === group);
}

export interface TherapyConsultant {
  slug: Slug;
  name: string;
  role?: string;
  shortRole?: string;
  photo?: string;
  /** The consultant's own wording for this treatment, shown verbatim. */
  listedAs: string[];
}

/** Consultants whose own listed modalities include this therapy. */
export function getConsultantsForTherapy(slug: string): TherapyConsultant[] {
  const therapy = therapyBySlug.get(slug);
  if (!therapy || therapy.matches.length === 0) return [];

  const out: TherapyConsultant[] = [];
  for (const c of consultants) {
    const listed = modalitiesByConsultant[c.slug];
    if (!listed) continue;
    const listedAs = listed.filter((m) => therapy.matches.includes(m));
    if (listedAs.length === 0) continue;
    out.push({
      slug: c.slug,
      name: c.name,
      role: c.role,
      shortRole: c.shortRole,
      photo: c.photo,
      listedAs,
    });
  }
  return out;
}

/** Therapies a given consultant lists, for the reverse view. */
export function getTherapiesForConsultant(slug: Slug): Therapy[] {
  const listed = modalitiesByConsultant[slug];
  if (!listed) return [];
  return therapies.filter((t) => t.matches.some((m) => listed.includes(m)));
}

const specialityBySlug = new Map(specialities.map((s) => [s.slug, s]));

/**
 * Cancer types treated by the consultants who provide this treatment.
 *
 * Note precisely what this is and is not. It is NOT a claim that the treatment
 * is used for each of these cancers — that would be our inference, and it would
 * be wrong in individual cases. It is a routing aid: these are the cancer types
 * looked after by the same consultants, which is what someone arriving on a
 * treatment page actually needs in order to get to the right next page. The UI
 * labels it in exactly those terms.
 */
export function getCancerTypesForTherapy(slug: string): Speciality[] {
  const providers = new Set(getConsultantsForTherapy(slug).map((c) => c.slug));
  if (providers.size === 0) return [];

  const seen = new Set<Slug>();
  const out: Speciality[] = [];
  for (const edge of treatments) {
    if (!providers.has(edge.consultant)) continue;
    if (seen.has(edge.speciality)) continue;
    seen.add(edge.speciality);
    const speciality = specialityBySlug.get(edge.speciality);
    if (speciality) out.push(speciality);
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
