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
// checked 2026-08-29). They stay general on purpose: no patient-specific
// eligibility decisions, doses or outcome claims. Treatment examples are used
// only where they help distinguish materially different pathways, and each
// individual decision is routed back to the treating team. Nothing here is
// derived from the partnership's old site, which carries no treatment copy.
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
  "This page is general information, not medical advice. Whether any treatment is suitable for you — and if so which form, dose and schedule — depends on your individual diagnosis and clinical review by your consultant. Nothing on this page should be used to make a decision about your own care, or to delay contacting your treating team.";

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
      "Drug treatment that damages cancer cells as they grow and divide. How it is given and how often depends on the medicines and treatment plan.",
    matches: ["Chemotherapy"],
    related: ["immunotherapy", "targeted-therapies", "hormone-therapy"],
    what: [
      "Chemotherapy uses anti-cancer drugs to damage cancer cells as they grow and divide. It can also affect healthy cells that renew quickly, including cells in the mouth and gut, bone marrow and hair follicles. This is why side effects can occur, although the effects and their severity vary from person to person and between medicines.",
      "Chemotherapy may be given into a vein, as tablets or capsules, or less commonly in another way. Many treatments are arranged in cycles, with treatment followed by a rest period, but the route, timing and number of cycles depend on the medicines and the individual plan.",
      "It may be used on its own or alongside surgery, radiotherapy, immunotherapy or targeted treatment. The aim may be to reduce the chance of cancer returning, shrink or control a cancer, or relieve symptoms. Your consultant will explain the intended aim in your situation.",
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
        body: "Your consultant will explain the treatment aim, possible benefits and risks, alternatives and what matters to you before you consent. Blood tests help the team decide whether treatment can go ahead; other checks, such as heart, kidney or liver tests, depend on the medicines being considered. The treating unit should give you a 24-hour advice number to keep with you.",
      },
      {
        title: "On a treatment day",
        body: "Blood tests are carried out before treatment and may be arranged on the day or earlier. The appointment length varies from a short visit to much of the day, depending on the medicines and checks required. If sickness is expected, anti-sickness treatment may be given before chemotherapy or supplied to take at home. Ask the treating team about driving and travel arrangements.",
      },
      {
        title: "Between cycles",
        body: "The timing and severity of side effects vary and can change between cycles. Infection during chemotherapy can become serious quickly. If you develop a temperature, shivering, feel suddenly unwell or have another symptom your team has told you is urgent, contact the treating unit's 24-hour advice line immediately rather than waiting for the next appointment. Call 999 for a life-threatening emergency.",
      },
      {
        title: "Reviews and follow-up",
        body: "Before further treatment, the team reviews how you are feeling and checks relevant blood results. Depending on the treatment aim, scans or other tests may be used to assess what is happening. The plan may be delayed, adjusted or reconsidered according to side effects, test results and how the cancer is responding.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — How chemotherapy works",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/how-chemotherapy-works",
      },
      {
        label: "NHS — Chemotherapy",
        url: "https://www.nhs.uk/tests-and-treatments/chemotherapy/",
      },
      {
        label: "Cancer Research UK — Your chemotherapy plan",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/planning/your-chemotherapy-plan",
      },
      {
        label: "Cancer Research UK — Chemotherapy side effects",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/side-effects",
      },
    ],
  },
  {
    slug: "immunotherapy",
    title: "Immunotherapy",
    group: "drug",
    summary:
      "Treatment that uses the immune system to recognise and attack cancer cells. This page focuses mainly on checkpoint inhibitors.",
    matches: ["Immunotherapy", "Biological and immunotherapy"],
    related: ["targeted-therapies", "chemotherapy"],
    what: [
      "Immunotherapy is a broad group of treatments that work with the immune system. This page focuses mainly on immune checkpoint inhibitors, which block signals that some cancers use to dampen an immune response and can help immune cells recognise and act against cancer cells.",
      "Checkpoint inhibitors may be given into a vein or, for some medicines, as an injection under the skin. The interval between treatments and the length of the course depend on the medicine, cancer, treatment aim, response and side effects. Other forms of immunotherapy can follow different pathways.",
      "Checkpoint inhibitors can cause immune-related side effects in almost any organ, including the skin, bowel, lungs, liver, joints, thyroid and other hormone glands. These effects can begin during treatment or after it has finished. A symptom that starts mildly can become serious, so new or worsening symptoms should be reported to the treating team straight away.",
    ],
    whenConsidered: [
      "Where evidence supports an immune checkpoint treatment for the cancer type and stage",
      "Where the overall clinical picture, and sometimes tests on the tumour, suggest it may be relevant",
      "Alongside chemotherapy, for some cancers",
      "After surgery, for some cancers, to reduce the risk of recurrence",
      "Where a cancer has spread and slowing or controlling it is the treatment aim",
    ],
    expect: [
      {
        title: "Before you start",
        body: "The team considers the cancer, previous treatment, your general health and other factors such as autoimmune conditions, an organ transplant and the medicines you take. Blood tests provide a baseline for later monitoring, and tumour tests may sometimes help with treatment decisions. No single test can guarantee that immunotherapy will help.",
      },
      {
        title: "How it may be given",
        body: "Depending on the medicine, treatment may be given through an intravenous infusion or as an injection. Appointment length, observation and the interval between treatments vary. The treating unit will explain what applies, including any advice about travel or driving afterwards.",
      },
      {
        title: "During treatment",
        body: "Blood tests and symptom checks help look for immune-related effects. Contact the treating unit's 24-hour advice line straight away about any new or worsening symptom, even if it seems mild — examples include diarrhoea, rash, breathlessness, chest pain, unusual thirst, weakness or marked fatigue. Do not wait for the next appointment or try to treat a suspected immune effect yourself unless your team has advised it. Call 999 for a life-threatening emergency.",
      },
      {
        title: "Reviews and follow-up",
        body: "Scans, blood tests or other assessments may be used to review the cancer and decide whether treatment should continue. Monitoring for immune-related effects continues after treatment ends because some can appear later or require longer-term care. Keep the treatment alert information and contact details supplied by your treating unit.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — What is immunotherapy?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/what-is-immunotherapy",
      },
      {
        label: "Cancer Research UK — Checkpoint inhibitors",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/checkpoint-inhibitors",
      },
      {
        label: "Macmillan Cancer Support — Immunotherapy",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/types-of-treatment/immunotherapy",
      },
      {
        label: "Cancer Research UK — Immunotherapy side effects",
        url: "https://www.cancerresearchuk.org/health-professional/treatment-and-other-post-diagnosis-issues/immunotherapy-and-its-side-effects",
      },
    ],
  },
  {
    slug: "targeted-therapies",
    title: "Targeted therapies",
    group: "drug",
    summary:
      "A varied group of cancer medicines that act on particular features or processes involved in cancer growth and survival.",
    // "Biological and immunotherapy" is deliberately NOT matched here. Seven
    // consultants list that phrase, and it already maps to Immunotherapy above;
    // reading it as targeted therapy as well would be our inference, not their
    // wording. Only "Targeted and endocrine treatments" says it outright.
    matches: ["Targeted therapies", "Targeted and endocrine treatments"],
    note: "Some published consultant information uses overlapping terms such as 'biological and immunotherapy'. That wording does not by itself confirm targeted-therapy provision, so this page only shows consultants whose published treatment wording explicitly includes targeted treatment.",
    related: ["immunotherapy", "hormone-therapy", "chemotherapy"],
    what: [
      "Targeted therapies are a varied group of cancer medicines. They act on particular differences in cancer cells, or on processes that help a cancer grow and survive. The way they work and the side effects they can cause differ from one medicine to another; targeted does not mean side-effect free or necessarily milder than another treatment.",
      "Some targeted medicines are considered only when testing finds a relevant biomarker — a feature such as a protein, receptor or gene change — in a tumour or blood sample. A matching result may show that a medicine could be relevant, but it does not guarantee benefit or decide suitability on its own.",
      "Some targeted medicines are tablets or capsules taken at home; others are given by injection or intravenous infusion. Monitoring can still involve regular appointments and tests. It is important to follow the medicine instructions and tell the team about other prescribed medicines, over-the-counter products and supplements because interactions can occur.",
    ],
    whenConsidered: [
      "Where a relevant biomarker is present, when the medicine requires one",
      "Where evidence supports the medicine for the cancer type, stage and treatment setting",
      "Alongside chemotherapy or hormone therapy, for some cancers",
      "As one possible option after considering previous treatment, general health and the aim of care",
    ],
    expect: [
      {
        title: "Testing and assessment",
        body: "For some medicines, a tumour sample or blood sample is tested for a biomarker. Other targeted medicines do not require this type of test. Your consultant considers any result alongside the cancer type and stage, previous treatment, other health conditions, the treatment aim and your preferences.",
      },
      {
        title: "Starting treatment",
        body: "The team will explain how the medicine is given and any instructions about food, missed doses or storage. Some targeted medicines interact with common medicines, supplements or particular foods, so provide a complete list of everything you take and check before starting anything new.",
      },
      {
        title: "During treatment",
        body: "Side effects and monitoring depend on the medicine and any combination treatment. They may include skin changes, diarrhoea, tiredness or blood-pressure changes, but your team will explain the relevant effects and urgent symptoms. Treatment may be paused, reduced or changed if clinically needed.",
      },
      {
        title: "Reviews and follow-up",
        body: "Reviews consider side effects and whether treatment is meeting its intended aim. Depending on the cancer and medicine, assessment may use scans, blood tests or other measures. Some courses have a fixed duration; others may continue while they are helping and remain tolerable.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — What are targeted cancer drugs?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/what-are-targeted-cancer-drugs",
      },
      {
        label: "Macmillan Cancer Support — Targeted therapies",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatments-and-drugs/targeted-therapies",
      },
      {
        label: "Cancer Research UK — Taking cancer medicines",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/cancer-drugs/how-you-have/taking-medicines",
      },
    ],
  },
  {
    slug: "hormone-therapy",
    title: "Hormone therapy",
    group: "drug",
    summary:
      "Treatment that lowers hormone levels or blocks their effects for cancers that use hormones to grow. The treatment and duration vary.",
    matches: ["Hormone treatment", "Hormone therapy", "Targeted and endocrine treatments"],
    related: ["targeted-therapies", "chemotherapy", "radiotherapy"],
    what: [
      "Some cancers use the body's hormones as growth signals — most commonly oestrogen in many breast cancers and testosterone in prostate cancer. Hormone therapy, also called endocrine therapy, can lower the amount of a hormone in the body or block its effect on cancer cells. It is different from hormone replacement therapy used for menopausal symptoms.",
      "Treatment may involve tablets, injections or implants; less commonly, an operation is used to reduce hormone production. A course may last for months or years, or continue while it is helping and remains tolerable. The route and duration depend on the cancer, treatment aim and medicine.",
      "Side effects vary by treatment and can significantly affect daily life. They may include hot flushes, tiredness, mood or weight changes, joint or muscle symptoms, sexual difficulties and effects on bone strength. Your team will explain the effects relevant to the proposed treatment and how they can be monitored or managed.",
    ],
    whenConsidered: [
      "For breast cancer where tumour testing shows relevant hormone receptors",
      "After surgery or radiotherapy, to reduce the risk of the cancer returning",
      "Before or alongside radiotherapy, for some prostate cancers",
      "For some breast, prostate or other hormone-sensitive cancers that have spread, to slow or help control them",
    ],
    expect: [
      {
        title: "Before you start",
        body: "For breast cancer, tumour cells are tested for hormone receptors. For prostate cancer and other cancers, decisions depend on factors such as the cancer type, stage or risk group, treatment aim, previous treatment, other health conditions and your preferences. Your consultant will discuss possible benefits, risks, alternatives and likely duration with you.",
      },
      {
        title: "Starting treatment",
        body: "If the treatment is a tablet, injection or implant, the schedule depends on the medicine. Follow the instructions supplied with your own treatment rather than a general timetable. Some treatments can weaken bones, so the team may assess fracture risk and explain whether a DEXA scan, monitoring or bone-strengthening treatment is appropriate.",
      },
      {
        title: "During treatment",
        body: "The type, timing and persistence of side effects vary. Tell the treating team about effects that are new, troublesome or affecting daily life; they can discuss supportive measures and, where clinically appropriate, other treatment options. Do not stop, miss or change treatment without advice from the team.",
      },
      {
        title: "Reviews and follow-up",
        body: "Follow-up depends on the cancer and the aim of treatment. It may include review of side effects and how medicines are being taken, blood tests such as PSA, routine breast follow-up, bone-health assessment or scans when clinically indicated. The team responsible for each part of follow-up will be explained to you.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Hormone therapy for cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/hormone-therapy/for-cancer",
      },
      {
        label: "Cancer Research UK — Hormone therapy for breast cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/breast-cancer/treatment/hormone-therapy",
      },
      {
        label: "Cancer Research UK — Hormone therapy for prostate cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/treatment/hormone-therapy/about-hormone-therapy",
      },
    ],
  },

  // ── Radiotherapy ───────────────────────────────────────────────────────────
  {
    slug: "radiotherapy",
    title: "Radiotherapy",
    group: "radiotherapy",
    summary:
      "This page focuses on external beam radiotherapy: radiation directed from a machine outside the body, sometimes in one treatment and sometimes over a course.",
    matches: ["Radiotherapy"],
    related: ["brachytherapy", "radioisotope-therapy", "chemotherapy"],
    what: [
      "Radiotherapy uses carefully measured radiation to damage cancer cells. This page focuses on external beam radiotherapy, which is delivered from a machine outside the body, often a linear accelerator. External beam treatment does not make you radioactive, so it is safe to be around other people afterwards. Brachytherapy and radioisotope therapy are covered separately on this site.",
      "External beam treatment is planned before it starts. A CT scan is commonly used and other imaging may also contribute. The radiotherapy planning team works out the dose, beam shape and treatment position, aiming to treat the intended area while limiting the dose to surrounding healthy tissue. Supports, masks or small skin marks may be used to reproduce the position accurately.",
      "The number and frequency of appointments depend on the cancer, treatment aim, dose and technique. Treatment may be given once, on selected days, or as a course over several weeks. You cannot feel the radiation itself, although holding the treatment position or using a mask can sometimes be uncomfortable.",
    ],
    whenConsidered: [
      "As the main treatment for some cancers, depending on the diagnosis and treatment aim",
      "After surgery, where treating the surrounding area may reduce the risk of recurrence",
      "Before surgery, where reducing the size of a tumour may help the wider treatment plan",
      "Alongside chemotherapy or another treatment, for selected cancers",
      "To relieve symptoms such as pain, pressure or bleeding — see palliative radiotherapy below",
    ],
    expect: [
      {
        title: "Planning appointment",
        body: "A planning CT scan is commonly carried out in the position used for treatment, and other imaging may also be reviewed. Supports or a moulded mask may be prepared when needed, and small temporary or permanent skin marks are sometimes used as alignment points. The exact process depends on the body area and technique.",
      },
      {
        title: "Creating the plan",
        body: "After planning, the specialist team creates and independently checks the treatment plan before radiation is delivered. The time this takes varies with the complexity and urgency of treatment. The treating service will confirm the start date rather than the website estimating a waiting period.",
      },
      {
        title: "During the course",
        body: "Appointment length and frequency vary. Positioning and imaging often take longer than the radiation delivery itself. Side effects depend on the area treated, dose, schedule, technique and other treatments. Tiredness or a skin reaction can occur, while other effects are specific to the part of the body being treated.",
      },
      {
        title: "After treatment",
        body: "Some short-term effects can continue or temporarily worsen after treatment, and some effects can begin or persist months or years later. The team will explain the risks relevant to your treatment, what to report and who to contact. Follow-up may be with the radiotherapy centre, your consultant or another part of the cancer team.",
      },
    ],
    sections: [
      {
        id: "palliative-radiotherapy",
        title: "Palliative radiotherapy",
        body: [
          "Radiotherapy may be used to relieve symptoms rather than to try to cure the cancer. This is called palliative radiotherapy. It may be considered for symptoms such as pain from cancer in the bone, bleeding, pressure or blockage, depending on the cancer and the part of the body affected.",
          "External beam palliative radiotherapy often uses fewer sessions and may sometimes be given in one appointment. Side effects can still occur and depend on the treatment area and schedule. Symptom improvement is not always immediate, and not every cancer or symptom responds in the same way.",
          "In this context, palliative describes the aim of this particular treatment. It is not the same as saying that someone is receiving end-of-life care. Your consultant will explain the intended benefit, possible side effects and alternatives in your individual situation.",
        ],
        note: "Whether palliative radiotherapy may help depends on the symptom, cancer, wider treatment plan and what matters to you. This page cannot determine whether it is appropriate for an individual.",
      },
    ],
    // Caption wording matters here: this is a linac at another hospital
    // entirely, so it is described as "of the type used" and never as our
    // equipment or our room. See public/treatments/CREDITS.md.
    image: {
      src: "/treatments/linear-accelerator.jpg",
      alt: "A linear accelerator in a radiotherapy treatment room: a large gantry arm with a treatment head above a motorised couch, in an otherwise empty, plainly furnished room.",
      caption:
        "An example of a linear accelerator used to deliver external beam radiotherapy. This is not equipment or a room at a Berkshire Oncology treatment location. During treatment, staff monitor the patient from outside the room.",
      credit: "Photograph: Narenfox, CC BY-SA 4.0, via Wikimedia Commons.",
    },
    sources: [
      {
        label: "Cancer Research UK — External radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/external/what",
      },
      {
        label: "NHS — What happens during radiotherapy",
        url: "https://www.nhs.uk/tests-and-treatments/radiotherapy/what-happens/",
      },
      {
        label: "NHS — Radiotherapy side effects",
        url: "https://www.nhs.uk/tests-and-treatments/radiotherapy/side-effects/",
      },
      {
        label: "Cancer Research UK — Radiotherapy to relieve symptoms",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/symptoms/what-is-radiotherapy-to-relieve-symptoms",
      },
    ],
  },
  {
    slug: "brachytherapy",
    title: "Brachytherapy",
    group: "radiotherapy",
    summary:
      "Internal radiotherapy delivered by placing a radioactive source inside or close to the treatment area. The source may be temporary or permanent.",
    matches: ["Brachytherapy", "Prostate brachytherapy"],
    related: ["radiotherapy", "radioisotope-therapy"],
    what: [
      "Brachytherapy is a type of internal radiotherapy. A sealed radioactive source is placed inside or close to the area being treated, allowing radiation to be delivered over a short distance and helping to limit the dose to surrounding tissue. The technique depends on the cancer and treatment area.",
      "With temporary brachytherapy, applicators, tubes or needles are positioned first and the radioactive source is placed for a set time before being removed. With permanent brachytherapy, small seeds remain in the body while their radiation gradually fades. Treatment may involve one procedure or several sessions.",
      "Published consultant information lists brachytherapy in relation to prostate and gynaecological cancer care within the partnership. The exact technique, treatment site and whether it could form part of an individual's plan need specialist assessment.",
    ],
    whenConsidered: [
      "For some prostate cancers, using permanent seeds or temporary brachytherapy depending on the individual case",
      "For some cervical, womb or vaginal cancers, sometimes alongside external beam radiotherapy",
      "Where a radioactive source can be positioned safely inside or close to the treatment area",
      "As one possible treatment for selected cancers, on its own or with another treatment",
    ],
    expect: [
      {
        title: "Assessment and planning",
        body: "The team considers the diagnosis, position of the treatment area, general health and any other treatment being given. Planning may involve CT, ultrasound or another type of imaging. The team should explain which form of brachytherapy is being considered and why.",
      },
      {
        title: "Temporary brachytherapy",
        body: "Applicators, tubes or needles are positioned in or close to the treatment area, sometimes with a general, spinal or local anaesthetic or sedation. Imaging helps check their position. The radioactive source is placed for a set time and removed. There may be one or several treatments, as an outpatient, day case or inpatient. Once a temporary source has been removed, you are not radioactive.",
      },
      {
        title: "Permanent seed brachytherapy",
        body: "Permanent seeds are most commonly used for some prostate cancers. They are positioned using imaging, usually during a procedure with an anaesthetic, and remain in place while their radiation gradually fades. If this treatment applies, the team will supply written safety advice with clear time limits, including any precautions around prolonged close contact with children or anyone pregnant.",
      },
      {
        title: "Recovery and follow-up",
        body: "Possible effects depend on the treatment area and type of brachytherapy. There may be effects from placing the applicators, needles or seeds as well as short- or longer-term effects from radiotherapy. The team should explain what to expect, which symptoms to report and how follow-up will be arranged. Follow-up may include examination, blood tests or imaging where relevant.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — What is internal radiotherapy?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/internal/what-is",
      },
      {
        label: "Cancer Research UK — Permanent seed brachytherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/treatment/radiotherapy/brachytherapy/permanent-seed-brachytherapy",
      },
      {
        label: "Cancer Research UK — Brachytherapy for cervical cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/cervical-cancer/treatment/radiotherapy/internal-radiotherapy-brachytherapy",
      },
    ],
  },
  {
    slug: "radioisotope-therapy",
    title: "Radioisotope therapy",
    group: "radiotherapy",
    summary:
      "Treatment with a radioactive medicine selected to collect in particular tissues or attach to features on certain cancer cells.",
    matches: ["Therapeutic radioisotopes", "Radio-isotope therapy"],
    related: ["radiotherapy", "brachytherapy"],
    what: [
      "Radioisotope therapy, also called radionuclide therapy, uses a radioactive medicine given as a capsule, drink or injection. The medicine travels through the bloodstream and is selected because it is taken up by a particular tissue or attaches to a feature on certain cancer cells. This delivers radiation from inside the body.",
      "Different medicines work in different ways. Radioiodine is taken up by thyroid cells; radium-223 travels to areas of bone affected by prostate cancer; and peptide receptor radionuclide therapy, or PRRT, targets particular receptors on some neuroendocrine tumours. Other radioisotope treatments are also available for selected cancers.",
      "Treatment takes place through a nuclear medicine service. Whether you need to stay in hospital and which temporary radiation-safety precautions apply depend on the medicine and dose. The team will give you written instructions for your treatment, with clear time limits.",
    ],
    whenConsidered: [
      "For selected differentiated thyroid cancers, often after surgery",
      "For selected people with prostate cancer that has spread to the bones",
      "For some neuroendocrine tumours whose cells have features that the medicine can target",
      "For certain cancers where a suitable radioactive medicine can reach cancer cells at more than one site",
    ],
    expect: [
      {
        title: "Before treatment",
        body: "The assessment depends on the medicine being considered. It may include blood tests and scans to check whether the treatment is suitable and how safely it can be given. You may receive instructions about medicines, food or drink, but these are treatment-specific. Follow the instructions from your nuclear medicine team rather than making changes yourself.",
      },
      {
        title: "Radioiodine",
        body: "Radioiodine is usually taken as a capsule or drink for some thyroid cancers. Some people are asked to follow a low-iodine diet or change thyroid medicines beforehand. Depending on the treatment and service, you may go home the same day or stay in a single hospital room until radiation levels have fallen. Your team will explain the arrangements that apply to you.",
      },
      {
        title: "Radium-223 and PRRT",
        body: "Radium-223 is given by injection for selected prostate cancers that have spread to bone. PRRT is given through a drip for some neuroendocrine tumours and is usually given alongside an amino-acid infusion to help protect the kidneys. The length and number of visits, and whether a hospital stay is needed, differ between treatments.",
      },
      {
        title: "After treatment and follow-up",
        body: "If radiation-safety precautions are needed at home, you will receive written advice covering exactly what to do and for how long. Do not assume that precautions for another radioisotope treatment apply to yours. Blood tests, scans and the possibility of further doses also vary by treatment. Your team should explain the follow-up plan and who to contact with concerns.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK — Radioisotope therapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes",
      },
      {
        label: "Cancer Research UK — Radioactive iodine therapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes/radioactive-iodine-therapy",
      },
      {
        label: "Cancer Research UK — Radium-223 for metastatic prostate cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/metastatic-cancer/treatment/radium-223",
      },
      {
        label: "Cancer Research UK — PRRT for neuroendocrine tumours",
        url: "https://www.cancerresearchuk.org/about-cancer/neuroendocrine-tumours-nets/treatment/peptide-receptor-radionuclide-therapy-prrt",
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
