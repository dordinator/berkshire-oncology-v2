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
  "This page gives general information, not medical advice. Whether a treatment is suitable for you, and its form, dose and schedule, depends on your diagnosis and a clinical review by your consultant. Do not use this page to make decisions about your care or delay contacting your treating team.";

export const trialsNote =
  "Clinical trial availability changes according to the diagnosis, previous treatment and treating centre. Ask your consultant about trial options. They will know which trials are open and relevant at the time.";

export const sactNote =
  "Systemic anti-cancer treatment, or SACT, is a term used on letters and appointment records. It is an umbrella term, not a treatment in itself. It covers drug treatments that travel through the body, including chemotherapy, immunotherapy, targeted therapies and hormone therapy.";

export const therapies: Therapy[] = [
  // ── Drug treatments ────────────────────────────────────────────────────────
  {
    slug: "chemotherapy",
    title: "Chemotherapy",
    group: "drug",
    summary:
      "Chemotherapy uses anti-cancer medicines to destroy cancer cells. The medicines, how they are given and the treatment schedule depend on the cancer and your treatment plan.",
    matches: ["Chemotherapy"],
    related: ["immunotherapy", "targeted-therapies", "hormone-therapy"],
    what: [
      "Many chemotherapy medicines act on cells while they are growing and dividing. Cancer cells often divide more quickly than healthy cells. Some healthy cells also divide quickly and can be affected, which is why treatment can cause side effects.",
      "Chemotherapy can be given into a vein, by injection, through a pump, or as tablets or capsules. Treatment can take place in a hospital, clinic or at home. Many plans use cycles, with treatment followed by a break to allow the body to recover.",
      "Chemotherapy can be used on its own or with surgery, radiotherapy or other cancer medicines. Its aim can be to cure a cancer, lower the chance of it returning, shrink or control it, or relieve symptoms. Your consultant will explain the aim of your treatment.",
    ],
    whenConsidered: [
      "When chemotherapy is an established treatment for the type and stage of cancer",
      "Before surgery or radiotherapy, to shrink a cancer before the next treatment",
      "After surgery, to lower the chance of the cancer returning",
      "To shrink or control cancer that has spread, or to relieve symptoms",
      "With immunotherapy or targeted treatment as part of some treatment plans",
    ],
    expect: [
      {
        title: "Before you start",
        body: "Before you agree to treatment, your consultant will explain its aim, possible benefits, risks and alternatives. Blood tests check whether treatment can go ahead. Other tests depend on the medicines in your plan. The treating unit will give you a 24-hour advice number.",
      },
      {
        title: "On a treatment day",
        body: "Blood tests can be done on the day or earlier. The length of the appointment depends on the medicines and checks required. Anti-sickness medicine can be given before chemotherapy or supplied for you to take at home.",
      },
      {
        title: "Between cycles",
        body: "Infection during chemotherapy can become serious quickly. If you develop a temperature, start shivering or suddenly feel unwell, call the treating unit's 24-hour advice line immediately. Call the same number for any other symptom that your team has said is urgent. Do not wait for the next appointment. Call 999 in a life-threatening emergency.",
      },
      {
        title: "Reviews and follow-up",
        body: "Before each cycle, the team will ask about side effects and check the blood results required for your plan. Scans or other tests can be used to assess how the cancer is responding. The team can delay treatment, change the dose or discuss a different approach in response to side effects, test results or the cancer's response.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: How chemotherapy works",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/how-chemotherapy-works",
      },
      {
        label: "NHS: Chemotherapy",
        url: "https://www.nhs.uk/tests-and-treatments/chemotherapy/",
      },
      {
        label: "Cancer Research UK: Your chemotherapy plan",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/planning/your-chemotherapy-plan",
      },
      {
        label: "Cancer Research UK: Chemotherapy side effects",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/chemotherapy/side-effects",
      },
    ],
  },
  {
    slug: "immunotherapy",
    title: "Immunotherapy",
    group: "drug",
    summary:
      "Immunotherapy uses the immune system to recognise and attack cancer cells. This page focuses on checkpoint inhibitors.",
    matches: ["Immunotherapy", "Biological and immunotherapy"],
    related: ["targeted-therapies", "chemotherapy"],
    what: [
      "There are several types of immunotherapy. Checkpoint inhibitors block proteins that can stop immune cells from attacking cancer cells. This helps the immune system find and attack the cancer.",
      "Checkpoint inhibitors are usually given through a drip into a vein. Some can be given as an injection under the skin. The medicine and treatment plan determine how often treatment is given and how long it continues.",
      "Checkpoint inhibitors can also make the immune system attack healthy parts of the body. These immune-related side effects can affect any part of the body. They can start during treatment or after it ends and can become serious quickly.",
    ],
    whenConsidered: [
      "When checkpoint inhibitor treatment is established for the type and stage of cancer",
      "When a tumour or blood test supports use of a particular checkpoint inhibitor",
      "Alongside chemotherapy as part of some treatment plans",
      "Before or after surgery as part of treatment for some cancers",
      "To slow or control some cancers that have spread",
    ],
    expect: [
      {
        title: "Before you start",
        body: "Your consultant will consider the cancer type and stage, previous treatment and your general health. You will have blood tests before treatment. Some people also need a test on a tumour or blood sample to see whether a particular checkpoint inhibitor is an option.",
      },
      {
        title: "On a treatment day",
        body: "The team will ask about new symptoms and review the blood results required for your plan. The length of the appointment depends on the medicine. Keep the treatment alert card and 24-hour advice number supplied by the treating unit with you.",
      },
      {
        title: "During treatment",
        body: "Call the treating unit's 24-hour advice line straight away about any new or worsening symptom, even if it seems mild. Examples include diarrhoea, a rash, breathlessness, a persistent cough, unusual thirst, weakness or feeling much more tired than usual. Do not wait for the next appointment or try to treat the symptom yourself unless your team has told you how. Call 999 for chest pain, severe breathing difficulty or another life-threatening emergency.",
      },
      {
        title: "Reviews and follow-up",
        body: "Your treatment plan sets out when scans, blood tests and other checks are needed. The team will use these results, the cancer's response and any side effects to decide whether treatment should continue. Monitoring continues after treatment because immune-related side effects can appear later.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: What is immunotherapy?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/what-is-immunotherapy",
      },
      {
        label: "Cancer Research UK: Checkpoint inhibitors",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/checkpoint-inhibitors",
      },
      {
        label: "UCLH: Cancer immunotherapy treatment",
        url: "https://www.uclh.nhs.uk/patients-and-visitors/patient-information-pages/cancer-immunotherapy-treatment",
      },
      {
        label: "Cancer Research UK: Immunotherapy side effects",
        url: "https://www.cancerresearchuk.org/health-professional/treatment-and-other-post-diagnosis-issues/immunotherapy-and-its-side-effects",
      },
    ],
  },
  {
    slug: "targeted-therapies",
    title: "Targeted therapies",
    group: "drug",
    summary:
      "Medicines that act on particular differences in cancer cells or processes that help a cancer grow and survive.",
    // "Biological and immunotherapy" is deliberately NOT matched here. Seven
    // consultants list that phrase, and it already maps to Immunotherapy above;
    // reading it as targeted therapy as well would be our inference, not their
    // wording. Only "Targeted and endocrine treatments" says it outright.
    matches: ["Targeted therapies", "Targeted and endocrine treatments"],
    related: ["immunotherapy", "hormone-therapy", "chemotherapy"],
    what: [
      "Targeted therapies are cancer medicines that act on particular differences in cancer cells or processes that help a cancer grow and survive. Different targeted medicines work in different ways, so their uses and side effects are not all the same.",
      "Some targeted therapies require tests on a tumour sample or blood sample. These tests look for a particular protein or gene change that the medicine targets. Not every targeted therapy requires this type of test. The result shows whether the target is present. Your consultant considers it with your diagnosis and other clinical information when planning treatment.",
      "Targeted therapies can be taken as tablets or capsules, given by injection or given through a drip into a vein. If you take treatment at home, follow the instructions carefully. Check with the treating team before taking new medicines or supplements because they can affect how some cancer medicines work.",
    ],
    whenConsidered: [
      "For cancers where a targeted medicine is an established treatment option",
      "When any test required for the medicine finds the relevant protein or gene change",
      "On its own or alongside chemotherapy, hormone therapy or another treatment",
      "After considering previous treatment, other health conditions and the aim of treatment",
    ],
    expect: [
      {
        title: "Tests and treatment decision",
        body: "Your consultant will confirm whether testing is needed. Depending on the test, it can use tissue from an earlier biopsy or operation, a new tumour sample or a blood sample. Your consultant will explain what the result means for your treatment options.",
      },
      {
        title: "Starting treatment",
        body: "The team will explain whether the medicine is taken at home or given in hospital, the schedule, and any instructions about food, missed doses and storage. Tell them about all prescribed medicines, medicines bought without a prescription and supplements. Check with the team before starting anything new.",
      },
      {
        title: "During treatment",
        body: "The possible side effects and checks are specific to the medicine. The team will tell you what to look out for and who to contact. Report side effects using the contact instructions they give you. Do not wait until the next appointment if they have told you to seek advice sooner.",
      },
      {
        title: "Reviews",
        body: "Reviews check for side effects and whether treatment is meeting its aim. They can include blood tests, scans or other checks. Your consultant will explain how long treatment is planned for and when the plan will be reviewed.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: What are targeted cancer drugs?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/targeted-cancer-drugs-immunotherapy/what-are-targeted-cancer-drugs",
      },
      {
        label: "Macmillan Cancer Support: Targeted therapies",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/treatments-and-drugs/targeted-therapies",
      },
      {
        label: "Cancer Research UK: Taking cancer medicines",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/cancer-drugs/how-you-have/taking-medicines",
      },
    ],
  },
  {
    slug: "hormone-therapy",
    title: "Hormone therapy",
    group: "drug",
    summary:
      "Treatment that lowers hormone levels or blocks their effects to slow or stop the growth of hormone-sensitive cancers.",
    matches: ["Hormone treatment", "Hormone therapy", "Targeted and endocrine treatments"],
    related: ["targeted-therapies", "chemotherapy", "radiotherapy"],
    what: [
      "Some cancers depend on hormones to grow. Hormone therapy lowers the amount of a hormone in the body or blocks its effect on cancer cells. It is also called endocrine therapy.",
      "Hormone therapy is commonly used for breast and prostate cancers and for some other cancers that are hormone sensitive. It can be given as tablets, injections or implants. The treatment, schedule and duration depend on the cancer and the aim of treatment.",
      "Side effects depend on the treatment and the hormones it affects. They can include hot flushes, tiredness, changes in mood, joint or muscle pain, sexual problems and reduced bone strength. Your team will explain the side effects linked to your treatment and the support or monitoring available.",
    ],
    whenConsidered: [
      "When testing shows that breast cancer has hormone receptors",
      "Before or after surgery for some hormone-sensitive breast cancers",
      "Before, during or after radiotherapy for some prostate cancers",
      "To control hormone-sensitive cancer that has spread or returned",
    ],
    expect: [
      {
        title: "Before you start",
        body: "For breast cancer, the cancer cells are tested for hormone receptors. For prostate cancer, your consultant considers the stage or risk group and whether hormone therapy would be used with radiotherapy or for cancer that has spread. They will explain the aim of treatment, the alternatives, the likely duration and the possible side effects.",
      },
      {
        title: "Starting treatment",
        body: "Tablets, injections and implants have different schedules. Follow the instructions supplied for your treatment. Ask the team what to do if you miss a dose or appointment, and check with them before starting another medicine or supplement.",
      },
      {
        title: "During treatment",
        body: "Tell the treating team about side effects that are new, troublesome or affecting daily life. Some hormone therapies can reduce bone strength. The team will assess your risk and arrange bone health checks or treatment when needed. Do not stop or change hormone therapy without advice from the team.",
      },
      {
        title: "Reviews and follow-up",
        body: "Follow-up is planned around the cancer and the aim of treatment. It can include a review of side effects, PSA blood tests for prostate cancer, breast cancer follow-up, bone health checks or scans. The team will tell you which checks apply and who will arrange them.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: Hormone therapy for cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/hormone-therapy/for-cancer",
      },
      {
        label: "Cancer Research UK: Hormone therapy for breast cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/breast-cancer/treatment/hormone-therapy",
      },
      {
        label: "Cancer Research UK: Hormone therapy for prostate cancer",
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
      "External beam radiotherapy uses a machine to direct radiation at the treatment area. Treatment can involve one session or a course of sessions.",
    matches: ["Radiotherapy"],
    related: ["brachytherapy", "radioisotope-therapy", "chemotherapy"],
    what: [
      "External beam radiotherapy uses carefully measured radiation from a machine outside the body to damage cancer cells. A linear accelerator is the most common type of machine. Treatment does not make you radioactive, so you can be around other people afterwards.",
      "The radiotherapy team plans the treatment before it starts. They use scans to calculate the dose and direct the radiation at the treatment area while limiting the dose to nearby healthy tissue. The plan is specific to your cancer and the part of the body being treated.",
      "The prescribed dose is often divided into smaller treatments called fractions. A course can range from a single session to treatment over several weeks. The schedule is set by the type and purpose of treatment.",
    ],
    whenConsidered: [
      "As the main treatment for some cancers",
      "After surgery, to reduce the risk of cancer returning in the treated area",
      "Before surgery, to shrink a tumour",
      "Alongside chemotherapy for some cancers",
      "To control symptoms such as pain, bleeding, pressure or a blockage",
    ],
    expect: [
      {
        title: "Planning appointment",
        body: "Most people have a planning scan, usually a CT scan. Depending on the area being treated, the team uses a mask, mould or small skin marks to help position you accurately. They will explain what the planning appointment involves for you.",
      },
      {
        title: "Creating the plan",
        body: "After the planning appointment, the radiotherapy team creates and checks your treatment plan. The plan sets out the treatment area, dose and beam positions. The radiotherapy service will tell you when treatment starts.",
      },
      {
        title: "During treatment",
        body: "Radiographers position you carefully and leave the room while the machine delivers the radiation. They can see and speak to you throughout. The machine does not touch you, and you do not feel the radiation.",
      },
      {
        title: "Side effects and follow-up",
        body: "Side effects depend on the area treated and the type of radiotherapy. The team will explain which effects apply to your plan and what to report. Some effects continue after the last session, and others can appear later. Follow-up is arranged by your cancer team.",
      },
    ],
    sections: [
      {
        id: "palliative-radiotherapy",
        title: "Palliative radiotherapy",
        body: [
          "Palliative radiotherapy aims to shrink a cancer, slow its growth or control symptoms. It does not aim to cure the cancer. It can be used for bone pain, bleeding, pressure or a blockage.",
          "External beam palliative radiotherapy usually involves fewer sessions than treatment intended to cure cancer. A course can consist of a single treatment. Side effects depend on the area treated, and symptom relief is not always immediate.",
          "The word palliative describes the aim of this treatment. Your consultant will explain what the treatment is intended to achieve, the possible side effects and the other options available.",
        ],
        note: "Your consultant will discuss whether palliative radiotherapy is suitable for you and how it fits with your other care.",
      },
    ],
    // Caption wording matters here: this is a linac at another hospital
    // entirely, so it is described as "of the type used" and never as our
    // equipment or our room. See public/treatments/CREDITS.md.
    image: {
      src: "/treatments/linear-accelerator.jpg",
      alt: "A linear accelerator above a treatment couch in an empty radiotherapy room.",
      caption:
        "An example of a linear accelerator used for external beam radiotherapy. This is not a room or equipment at a Berkshire Oncology treatment location. Staff monitor the patient from outside the room during treatment.",
      credit: "Photograph: Narenfox, CC BY-SA 4.0, via Wikimedia Commons.",
    },
    sources: [
      {
        label: "Cancer Research UK: External radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/external/what",
      },
      {
        label: "Cancer Research UK: Planning external radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/external/planning/your-planning",
      },
      {
        label: "NHS: What happens during radiotherapy",
        url: "https://www.nhs.uk/tests-and-treatments/radiotherapy/what-happens/",
      },
      {
        label: "NHS: Radiotherapy side effects",
        url: "https://www.nhs.uk/tests-and-treatments/radiotherapy/side-effects/",
      },
      {
        label: "Cancer Research UK: Radiotherapy to relieve symptoms",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/symptoms/what-is-radiotherapy-to-relieve-symptoms",
      },
    ],
  },
  {
    slug: "brachytherapy",
    title: "Brachytherapy",
    group: "radiotherapy",
    summary:
      "Brachytherapy is radiotherapy delivered from a radioactive source placed inside or close to the treatment area. The source is temporary or permanent.",
    matches: ["Brachytherapy", "Prostate brachytherapy"],
    related: ["radiotherapy", "radioisotope-therapy"],
    what: [
      "Brachytherapy delivers radiation over a short distance from inside the body. This concentrates the treatment in the intended area and limits the dose to nearby healthy tissue.",
      "High dose rate brachytherapy uses a temporary source that stays in place for a short time. Low dose rate brachytherapy delivers radiation over a longer period. Some low dose rate sources are removed after treatment. Permanent seeds remain in the body and lose their radioactivity over time.",
      "Brachytherapy is used most often for cancers of the prostate, cervix, womb and vagina. It can be the only radiotherapy treatment or be given with external beam radiotherapy.",
    ],
    whenConsidered: [
      "For certain prostate cancers, using permanent seeds or temporary high dose rate brachytherapy",
      "For cancers of the cervix, womb or vagina",
      "As the main radiotherapy treatment for certain cancers",
      "Alongside external beam radiotherapy as part of a combined treatment plan",
    ],
    expect: [
      {
        title: "Assessment and planning",
        body: "Your consultant considers the diagnosis, the treatment area and any other planned care before recommending brachytherapy. A CT scan, ultrasound scan or other imaging is used to plan the dose and position of the radioactive source. The team will explain which type of brachytherapy is being considered and why.",
      },
      {
        title: "Temporary brachytherapy",
        body: "A temporary radioactive source is placed inside or close to the treatment area for a set time and then removed. The source is removed after each session or at the end of the treatment course, depending on the type of brachytherapy. Once it has been removed, you are not radioactive.",
      },
      {
        title: "Permanent seed brachytherapy",
        body: "Permanent seed brachytherapy is used mainly for prostate cancer. The seeds remain in the prostate and release radiation over a number of months. The team will give you written safety instructions, including any temporary limits on close contact with children or anyone who is pregnant.",
      },
      {
        title: "After treatment",
        body: "Treatment can be given as an outpatient or involve a hospital stay. Side effects depend on the treatment area and the type of brachytherapy. The team will explain what to expect, which symptoms to report and how follow-up will be arranged.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: What is internal radiotherapy?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radiotherapy/internal/what-is",
      },
      {
        label: "Cancer Research UK: Temporary brachytherapy for prostate cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/treatment/radiotherapy/brachytherapy/temporary-brachytherapy",
      },
      {
        label: "Cancer Research UK: Permanent seed brachytherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/treatment/radiotherapy/brachytherapy/permanent-seed-brachytherapy",
      },
      {
        label: "Cancer Research UK: Brachytherapy for cervical cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/cervical-cancer/treatment/radiotherapy/internal-radiotherapy-brachytherapy",
      },
    ],
  },
  {
    slug: "radioisotope-therapy",
    title: "Radioisotope therapy",
    group: "radiotherapy",
    summary:
      "Radioisotope therapy uses a radioactive medicine that travels through the body and is taken up by particular cells or tissues.",
    matches: ["Therapeutic radioisotopes", "Radio-isotope therapy"],
    related: ["radiotherapy", "brachytherapy"],
    what: [
      "Radioisotope therapy, also called radionuclide therapy, uses a radioactive medicine given as a drink, capsule or injection. The medicine travels through the bloodstream and delivers radiation to the cells or tissues that take it up.",
      "Different medicines treat different cancers. Radioiodine is taken up by thyroid cells. Radium-223 collects in areas of bone affected by prostate cancer. Peptide receptor radionuclide therapy, or PRRT, targets receptors found on certain neuroendocrine tumours.",
      "A nuclear medicine team gives the treatment. Some radioisotope treatments require a hospital stay or temporary precautions to protect other people from radiation. The team will give you written instructions explaining what applies and when the precautions end.",
    ],
    whenConsidered: [
      "For papillary and follicular thyroid cancers that take up radioactive iodine, often after surgery",
      "For prostate cancer that has spread to the bones and meets the clinical criteria for radium-223",
      "For certain pancreatic or digestive-system neuroendocrine tumours with the receptors needed for PRRT",
      "For certain neuroendocrine tumours that can be treated with radioactive MIBG",
    ],
    expect: [
      {
        title: "Before treatment",
        body: "Your consultant and nuclear medicine team confirm which treatment is being considered. Preparation can include blood tests and scans. Follow the instructions you are given about food, drink and medicines, and do not stop or change medicines without checking with the team.",
      },
      {
        title: "Radioiodine",
        body: "Radioiodine is taken as a capsule or drink. The team will tell you whether to follow a low-iodine diet or change thyroid medicines before treatment. Treatment is given in hospital. The nuclear medicine team checks your radiation level and tells you when it is safe to leave. They will also explain the safety precautions to follow afterwards.",
      },
      {
        title: "Radium-223, PRRT and MIBG",
        body: "Radium-223 is given as an injection into a vein. PRRT and MIBG are given through a drip. Each treatment has its own schedule and monitoring, which the nuclear medicine team will explain before treatment starts.",
      },
      {
        title: "After treatment",
        body: "Some radioisotope treatments make body fluids temporarily radioactive and require safety precautions after treatment. You will receive written advice explaining what to do and when the precautions end. Follow-up can include blood tests and scans, depending on the treatment.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: Radioisotope therapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes",
      },
      {
        label: "Cancer Research UK: What is radioisotope therapy?",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes/what-is",
      },
      {
        label: "Cancer Research UK: Radioactive iodine therapy",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes/radioactive-iodine-therapy",
      },
      {
        label: "Cancer Research UK: Radium-223 for metastatic prostate cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer/metastatic-cancer/treatment/radium-223",
      },
      {
        label: "Cancer Research UK: PRRT for neuroendocrine tumours",
        url: "https://www.cancerresearchuk.org/about-cancer/neuroendocrine-tumours-nets/treatment/peptide-receptor-radionuclide-therapy-prrt",
      },
      {
        label: "Cancer Research UK: Radioactive iodine MIBG",
        url: "https://www.cancerresearchuk.org/about-cancer/treatment/radioisotopes/131-i-mibg",
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
      "Cancer medicines can be given through a drip, by injection or as tablets or capsules. The schedule depends on the treatment.",
  },
  {
    id: "radiotherapy",
    title: "Radiotherapy",
    blurb:
      "Radiotherapy can be delivered from outside the body, from a source placed inside it or as a radioactive medicine.",
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
