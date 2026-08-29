import type { Slug } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Plain-English clinical information for each cancer type.
//
// DRAFT STATUS. Everything in this file was written from published UK guidance
// (NICE, Cancer Research UK, Macmillan) and is deliberately general: what
// usually happens, in what order, and what the words mean. It does not tell an
// individual what their treatment will be, and it must be read and signed off
// by a consultant before publication. See REVIEW.md for the claim-by-claim
// source list and the sign-off record.
//
// Rules this content follows, and any addition should keep to:
//   • No survival figures, no prognosis, no "success rates".
//   • No drug names, doses, or "you will be given" — only "may", "usually",
//     "your consultant will discuss".
//   • Say plainly when something is done by someone else (surgery is done by
//     surgeons; our consultants are oncologists).
//   • Where the partnership's cover is thin, say so rather than implying more.
// ─────────────────────────────────────────────────────────────────────────────

export interface InfoStep {
  title: string;
  body: string;
}

export interface Approach {
  /** Slug of a published /treatments page, when one exists to link to.
   *  Only the seven slugs in therapies.ts are live — anything else is
   *  redirected, and linking at a redirect from a patient page is sloppy. */
  therapy?: string;
  /** Explicit href, for the cases that need an anchor rather than a page. */
  href?: string;
  title: string;
  body: string;
  /** True when this is done by another specialist, not by our consultants. */
  byOthers?: boolean;
}

export interface SupportLink {
  name: string;
  url: string;
  note: string;
}

export interface CancerInfo {
  slug: Slug;
  /** Opening orientation — two or three short paragraphs, no jargon. */
  overview: string[];
  /** "What the partnership treats" — concrete, checkable bullets. */
  scope: string[];
  /** Optional caveat about the partnership's cover for this cancer. */
  scopeNote?: string;
  /** Typical diagnostic and staging context. */
  diagnosis: {
    intro: string;
    steps: InfoStep[];
    /** What staging language means for this cancer specifically. */
    stagingNote?: string;
  };
  /** Possible treatment approaches. Order is roughly how they are discussed. */
  approaches: Approach[];
  /** Anything specific about where this cancer's care tends to happen. */
  deliveryNote?: string;
  /** Reputable, condition-specific support organisations. */
  support: SupportLink[];
  /** Sources behind this page's clinical content. */
  sources: { label: string; url: string }[];
  /** Set once a consultant has signed the page off. */
  reviewedBy?: string;
  /** Relevant professional credentials for the named reviewer. */
  reviewerCredentials?: string;
  reviewedOn?: string;
  nextReviewOn?: string;
}

export const cancerInfo: Record<Slug, CancerInfo> = {
  // ── Breast ────────────────────────────────────────────────────────────────
  breast: {
    slug: "breast",
    overview: [
      "Breast cancer is cancer that starts in the breast tissue. It is the most common cancer in the UK, it affects men as well as women, and a great deal is known about how to treat it.",
      "Most people are diagnosed after finding a change themselves or after routine screening. By the time you reach an oncologist, the diagnosis is usually already made — our role is to work out which treatments will help in your particular case, and in what order.",
      "Five of the partnership's consultants treat breast cancer, which makes it the area with the widest choice of consultant.",
    ],
    scope: [
      "Early breast cancer that has been found in the breast, with or without spread to the lymph nodes under the arm",
      "Locally advanced breast cancer, where treatment is often given before surgery to shrink the tumour",
      "Secondary (metastatic) breast cancer, where the aim is control of the disease and of symptoms",
      "Treatment given after surgery to reduce the chance of the cancer coming back",
      "Hormone-sensitive, HER2-positive and triple-negative breast cancer",
      "Breast cancer in men",
      "Second opinions on a diagnosis or a treatment plan made elsewhere",
    ],
    diagnosis: {
      intro:
        "Breast cancer is usually diagnosed through a combination of imaging and a biopsy — often on the same day, at a one-stop clinic. Staging is the process of working out how much cancer there is and where it is, because that is what determines which treatments are worth giving.",
      steps: [
        {
          title: "Examination and imaging",
          body: "A mammogram, an ultrasound of the breast and the lymph nodes under the arm, or both. An MRI scan is sometimes added when the picture is unclear or when the breast tissue is dense.",
        },
        {
          title: "Biopsy",
          body: "A small sample of tissue is taken with a needle, usually under local anaesthetic, and examined under a microscope. This is what confirms the diagnosis — imaging alone cannot.",
        },
        {
          title: "Receptor testing",
          body: "The biopsy sample is tested for oestrogen and progesterone receptors and for HER2. This is not an extra formality: it is the single biggest factor in which drug treatments will work, and it is why two people with tumours of the same size can be offered very different treatment.",
        },
        {
          title: "Staging scans, when they are needed",
          body: "CT, bone or other scans are not automatic. They are used when the size of the tumour, involvement of the lymph nodes or particular symptoms make it sensible to check whether the cancer has spread further.",
        },
      ],
      stagingNote:
        "You may hear a stage from 1 to 4, or the TNM description — the size of the Tumour, whether the lymph Nodes are involved, and whether there is spread (Metastasis) elsewhere. You may also hear a grade, which describes how different the cancer cells look from normal cells. Stage and grade are separate things, and both are used when deciding treatment.",
    },
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Most people with early breast cancer have surgery. This may mean removing the lump with a margin of normal tissue or removing the whole breast, usually with an assessment of the lymph nodes. Surgery is carried out by a breast surgeon rather than an oncologist. An oncologist may be involved in planning treatment before or after the operation.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Drug treatment given through a drip or by tablet, used when the features of the cancer suggest a meaningful benefit. It may be given after surgery to reduce the risk of recurrence, or before surgery to shrink a tumour first, which can make a smaller operation possible.",
      },
      {
        therapy: "hormone-therapy",
        title: "Hormone (endocrine) therapy",
        body: "For cancers that are driven by oestrogen or progesterone. Usually tablets taken for several years after other treatment has finished. It is often the most important single treatment for hormone-sensitive breast cancer, and side effects are managed rather than simply endured.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "These treatments target a specific feature of the cancer cell, most commonly HER2. They are given when receptor testing shows that the cancer has that feature.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Carefully targeted radiation, usually given after breast-conserving surgery and sometimes after mastectomy, to treat the area where the cancer was. It is given as a course of short daily appointments over one to several weeks, at a centre with a radiotherapy machine.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Used in particular situations, most often in triple-negative breast cancer, where evidence supports it. Your consultant will tell you whether it applies to your case.",
      },
      {
        title: "Clinical trials",
        body: "Trial availability and eligibility change. A consultant can explain whether any currently open study may be relevant to your diagnosis, including at specialist centres elsewhere.",
      },
    ],
    deliveryNote:
      "Breast cancer care is usually split across sites: drug treatment close to home in Reading or Windsor, radiotherapy at a centre with a linear accelerator. Deep inspiration breath hold — a technique that moves the heart away from the treatment area during left-sided breast radiotherapy — is available at GenesisCare.",
    support: [
      {
        name: "Breast Cancer Now",
        url: "https://breastcancernow.org",
        note: "UK breast cancer charity — information, a free helpline and Someone Like Me, which matches you with a person who has been through it.",
      },
      {
        name: "Macmillan Cancer Support",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/breast-cancer",
        note: "Practical, financial and emotional support, plus a free support line.",
      },
      {
        name: "Cancer Research UK",
        url: "https://www.cancerresearchuk.org/about-cancer/breast-cancer",
        note: "Clear, evidence-based explanations of tests, stages and treatments.",
      },
    ],
    sources: [
      {
        label:
          "NICE NG101 — Early and locally advanced breast cancer: diagnosis and management",
        url: "https://www.nice.org.uk/guidance/ng101",
      },
      {
        label: "NICE CG81 — Advanced breast cancer: diagnosis and treatment",
        url: "https://www.nice.org.uk/guidance/cg81",
      },
      {
        label: "Cancer Research UK — breast cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/breast-cancer",
      },
    ],
  },

  // ── Prostate ──────────────────────────────────────────────────────────────
  prostate: {
    slug: "prostate",
    overview: [
      "Prostate cancer is the most common cancer in men in the UK. It often grows slowly, and a significant number of men diagnosed with it will never need treatment for it — which is why the first question is not always \"what treatment?\" but \"does this need treating now?\"",
      "That makes the assessment stage unusually important. The tests below are about working out which kind of prostate cancer you have, because low-risk and high-risk disease are managed very differently.",
      "Three of the partnership's consultants treat prostate cancer, all of them clinical oncologists, meaning they provide radiotherapy as well as drug treatment.",
    ],
    scope: [
      "Localised prostate cancer that has not spread beyond the prostate",
      "Locally advanced prostate cancer that has grown through the capsule of the prostate or into nearby tissue",
      "Prostate cancer that has spread to lymph nodes or bone",
      "Prostate cancer that has come back after surgery or after previous radiotherapy",
      "Discussion of active surveillance, where treatment is safely deferred and the cancer monitored",
      "Second opinions on whether treatment is needed at all, and on which treatment to choose",
    ],
    diagnosis: {
      intro:
        "The pathway for prostate cancer changed for the better when MRI scanning was brought in before biopsy: it means some men avoid a biopsy altogether, and for those who need one it shows where to take the samples from.",
      steps: [
        {
          title: "PSA blood test and examination",
          body: "PSA is a protein made by the prostate. A raised level can indicate cancer but also has innocent causes, including infection and an enlarged prostate — which is why a PSA result on its own never makes the diagnosis.",
        },
        {
          title: "MRI scan before biopsy",
          body: "A detailed multiparametric MRI of the prostate is now done before biopsy. It is scored to show how suspicious the prostate looks, guides where any biopsy samples should be taken from, and sometimes shows that a biopsy is not needed.",
        },
        {
          title: "Biopsy",
          body: "Small samples are taken from the prostate, most often through the skin behind the scrotum (a transperineal biopsy). The samples are examined to confirm whether cancer is present and how it behaves.",
        },
        {
          title: "Grading and risk assessment",
          body: "The biopsy gives a Gleason score, also expressed as a grade group from 1 to 5. That is combined with your PSA level and the stage to place the cancer in a risk group, and the risk group is what drives the treatment conversation.",
        },
        {
          title: "Further staging, when it is needed",
          body: "For higher-risk disease, additional scans — such as a bone scan, CT, or a PET scan — are used to check whether the cancer has spread. These are not needed for everyone.",
        },
      ],
      stagingNote:
        "You will hear a stage (how far the cancer has grown), a grade group or Gleason score (how the cells behave) and a PSA level. Together these place the cancer in a risk category — commonly described as low, intermediate or high risk, or by Cambridge Prognostic Group 1 to 5. Ask which category you are in: it explains almost every recommendation that follows.",
    },
    approaches: [
      {
        title: "Active surveillance",
        body: "For low-risk cancer that is unlikely to cause harm, treatment can be safely deferred while the cancer is monitored with PSA tests, examinations and repeat scans. This is not the same as doing nothing or being refused treatment. It is a plan, with agreed points at which treatment would begin.",
      },
      {
        title: "Surgery (radical prostatectomy)",
        byOthers: true,
        body: "Removal of the prostate, carried out by a urological surgeon rather than an oncologist. An oncologist can explain how surgery compares with radiotherapy and whether oncology treatment may be needed after surgery.",
      },
      {
        therapy: "radiotherapy",
        title: "External beam radiotherapy",
        body: "Targeted radiation given as a course of outpatient appointments. Modern techniques shape the dose closely to the prostate. A gel spacer is sometimes placed between the prostate and the rectum beforehand to reduce side effects.",
      },
      {
        therapy: "brachytherapy",
        title: "Brachytherapy",
        body: "Radiotherapy delivered from a radioactive source placed inside the prostate itself, either permanently as seeds or temporarily at a higher dose. It is used for selected cancers, sometimes alongside external radiotherapy.",
      },
      {
        therapy: "hormone-therapy",
        title: "Hormone therapy",
        body: "Prostate cancer depends on testosterone. Hormone therapy lowers it or blocks its effect, and may be given for a period before, during and after radiotherapy, or on its own for more advanced disease.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy and newer drug treatments",
        body: "Used mainly for prostate cancer that has spread or is no longer responding to hormone treatment, sometimes in combination with hormone therapy.",
      },
      {
        therapy: "radioisotope-therapy",
        title: "Radioisotope treatment",
        body: "A radioactive medicine is given into a vein and travels to where the cancer is active. It is used in particular situations in advanced prostate cancer.",
      },
    ],
    deliveryNote:
      "Prostate radiotherapy is a course of daily weekday appointments over several weeks, so travel time matters. Both GenesisCare centres offer prostate spacers, and Oxford has stereotactic (SABR) and MR-guided treatment for suitable cases.",
    support: [
      {
        name: "Prostate Cancer UK",
        url: "https://prostatecanceruk.org",
        note: "Specialist nurse helpline, clear guides on choosing between treatments, and one-to-one support.",
      },
      {
        name: "Macmillan Cancer Support",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/prostate-cancer",
        note: "Support with the practical and emotional side, including side effects that men often do not raise.",
      },
      {
        name: "Cancer Research UK",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer",
        note: "Plain explanations of PSA, grade groups, staging and each treatment option.",
      },
    ],
    sources: [
      {
        label: "NICE NG131 — Prostate cancer: diagnosis and management",
        url: "https://www.nice.org.uk/guidance/ng131",
      },
      {
        label: "Cancer Research UK — prostate cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/prostate-cancer",
      },
    ],
  },

  // ── Cancer of Unknown Primary ─────────────────────────────────────────────
  "cancer-unknown-primary": {
    slug: "cancer-unknown-primary",
    overview: [
      "Sometimes cancer is found somewhere in the body — in a lymph node, the liver, the lung or a bone — without it being clear where it started. That is what cancer of unknown primary means.",
      "It is an unsettling position to be in, and the uncertainty is the hardest part. It does not mean anything has been missed or done badly: in a proportion of cases the original site is small, hidden, or has stopped growing, and modern tests still cannot pin it down.",
      "It also does not mean nothing can be done. Treatment is chosen from what the tests do show — the type of cell, its pattern of behaviour and where the cancer is — and it often starts before the question is fully settled.",
    ],
    scope: [
      "Cancer found on a scan or in a biopsy with no clear primary site",
      "Coordinating the further tests that look for the primary, and knowing when to stop looking",
      "Treatment planned on the basis of the tissue type when the primary is never found",
      "Treatment that switches to a specific cancer pathway once the primary is identified",
      "Control of symptoms alongside investigation, so you are not left waiting in discomfort",
      "Second opinions where a diagnosis is uncertain or a plan is unclear",
    ],
    scopeNote:
      "One consultant in the partnership, Dr Esme Hill, lists cancer of unknown primary. If she is not available at the time you need to be seen, the practice will tell you plainly rather than book you with someone who does not cover it.",
    diagnosis: {
      intro:
        "Investigation runs in two directions at once: finding out what kind of cancer cell it is, and looking for where it came from. Both matter, but the first is what usually determines treatment.",
      steps: [
        {
          title: "Biopsy and laboratory testing",
          body: "A sample of the cancer is examined under a microscope and then stained with a panel of markers (immunohistochemistry). These markers often point strongly towards a likely origin — for example breast, lung, bowel or prostate — even when scans show nothing.",
        },
        {
          title: "Imaging",
          body: "A CT scan of the chest, abdomen and pelvis is usually the starting point. A PET-CT scan may be added, and further targeted tests — mammogram, endoscopy or a specific MRI — are chosen on the basis of what the markers suggest.",
        },
        {
          title: "Blood tests and tumour markers",
          body: "Blood tests assess your general health and organ function. Certain tumour markers can support a suspected origin, though on their own they are rarely conclusive.",
        },
        {
          title: "Specialist team review",
          body: "Findings are discussed by a multidisciplinary team, which is how the balance gets struck between doing more tests and starting treatment. NHS services have a dedicated team for exactly this situation, and where you are also under NHS care your consultant will work with them.",
        },
      ],
      stagingNote:
        "You may hear three terms in sequence. Malignancy of undefined primary origin (MUO) means cancer has been confirmed but investigation has only just begun. Provisional cancer of unknown primary means the first round of tests has not found the source. Confirmed cancer of unknown primary means the search has been completed without finding it. Moving between these is normal, and the plan is reviewed at each stage.",
    },
    approaches: [
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "If tests suggest where the cancer started, doctors may use the drug combination usually given for that cancer. If the primary site is still unclear, a broader combination may be considered. Your consultant will explain what they recommend and why.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Laboratory tests on the tissue sometimes identify a feature that a specific drug can act on, in which case treatment can be directed at that feature rather than at a presumed site of origin.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be considered if tests suggest that the tumour is likely to respond.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy can treat a specific area, such as an affected group of lymph nodes. It can also relieve symptoms such as pain from a bone deposit, often quickly and effectively.",
      },
      {
        href: "/treatments/radiotherapy#palliative-radiotherapy",
        title: "Symptom control alongside investigation",
        body: "Pain, breathlessness and other symptoms can be treated while tests continue. You do not need to wait for a complete diagnosis before getting help with symptoms.",
      },
      {
        title: "Treatment that changes course",
        body: "If the primary site is identified later, treatment can follow the pathway for that cancer. This is a helpful development, not a sign that anything was wrong before. It is one reason testing may continue after treatment has started.",
      },
    ],
    support: [
      {
        name: "Cancer of Unknown Primary Foundation (Jo's Friends)",
        url: "https://www.cupfoundjo.org",
        note: "The UK charity specifically for CUP — information written for this diagnosis, and contact with others facing it.",
      },
      {
        name: "Macmillan Cancer Support",
        url: "https://www.macmillan.org.uk/cancer-information-and-support/cancer-of-unknown-primary",
        note: "Guidance on CUP, and a support line for the questions that come at three in the morning.",
      },
      {
        name: "Cancer Research UK",
        url: "https://www.cancerresearchuk.org/about-cancer/cancer-unknown-primary-cup",
        note: "Explains the tests, the terminology and how treatment decisions are made.",
      },
    ],
    sources: [
      {
        label:
          "NICE CG104 — Metastatic malignant disease of unknown primary origin in adults",
        url: "https://www.nice.org.uk/guidance/cg104",
      },
      {
        label: "Cancer Research UK — cancer of unknown primary",
        url: "https://www.cancerresearchuk.org/about-cancer/cancer-unknown-primary-cup",
      },
    ],
  },
};

export function getCancerInfo(slug: Slug): CancerInfo | undefined {
  return cancerInfo[slug];
}
