import type { Slug } from "./types";

/**
 * Editorial copy for the shared consultant-profile design.
 *
 * The longer first-person biographies remain in consultants.ts as the source
 * archive. These shorter, third-person chapters are shaped for the profile
 * journey and were checked against the practice's consultant pages, with
 * current provider profiles used where a role or treatment needed confirming.
 */
export type ConsultantProfileCopy = {
  intro: string;
  about: string[];
  training: string[];
  clinicalFocus: string[];
  leadership: string[];
  sources: string[];
};

export const consultantProfileCopy: Record<Slug, ConsultantProfileCopy> = {
  "joss-adams": {
    intro:
      "Dr Adams is a consultant clinical oncologist specialising in breast cancer, lung cancer and lymphoma, with experience across chemotherapy, radiotherapy, immunotherapy and hormone treatment.",
    about: [
      "Dr Adams has been a consultant in Reading since 2006, combining patient care with clinical trials in breast and lung cancer, cancer-service leadership and the supervision of specialist oncology trainees.",
    ],
    training: [
      "Dr Adams graduated from the University of Cambridge in 1995 and completed both junior medical training and specialist oncology training in Oxford.",
    ],
    clinicalFocus: [
      "Dr Adams treats breast cancer, lung cancer and lymphoma using radiotherapy and drug treatments where appropriate.",
      "Dr Adams is a principal investigator for lung and breast cancer trials at the Royal Berkshire Hospital and also refers patients to other specialist trial centres when appropriate.",
    ],
    leadership: [
      "Dr Adams was Clinical Governance Lead at the Berkshire Cancer Centre from 2006 to 2011 and Clinical Lead for Chemotherapy from 2011 to 2017. Dr Adams is also listed as a Clinical Supervisor for specialist oncology trainees.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-joss-adams.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
    ],
  },
  "madhumita-bhattacharyya": {
    intro:
      "Dr Bhattacharyya is a consultant medical oncologist specialising in breast and ovarian cancers and melanoma, with a focus on systemic treatment and clinical trials.",
    about: [
      "Dr Bhattacharyya has been a consultant at the Royal Berkshire Hospital since January 2012. Her work combines patient care with acute oncology leadership, medical education, clinical research and improving access to clinical trials.",
    ],
    training: [
      "Dr Bhattacharyya graduated from Barts and the London School of Medicine and Dentistry in 1998, after completing an intercalated BSc in Tumour Biology at University College London in 1995. Following junior medical and oncology posts in London, including at Barts and the Royal Marsden, she undertook a PhD in Molecular Oncology and completed specialist medical oncology training in Wessex.",
    ],
    clinicalFocus: [
      "Dr Bhattacharyya specialises in systemic treatments for breast cancer, ovarian cancer and melanoma.",
      "She is a principal investigator for breast and ovarian cancer trials and is committed to helping suitable patients access clinical research.",
    ],
    leadership: [
      "Dr Bhattacharyya is listed as Acute Oncology Lead for the Thames Valley and Royal Berkshire Hospitals and as an educational supervisor for medical trainees at the Royal Berkshire Hospital.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-madhumita-bhattacharyya.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
    ],
  },
  "nicola-dallas": {
    intro:
      "Dr Dallas is a consultant clinical oncologist specialising in urological, head and neck, and thyroid cancers, with a particular interest in advanced radiotherapy techniques.",
    about: [
      "Dr Dallas has been a consultant at the Berkshire Cancer Centre since 2011. Her work combines highly targeted radiotherapy, clinical trials, clinical governance and the supervision of specialist oncology trainees.",
    ],
    training: [
      "Dr Dallas graduated from the University of Birmingham Medical School in 1998, became a member of the Royal College of Physicians in 2001 and completed oncology training in Oxford, becoming a Fellow of the Royal College of Radiologists in 2007.",
    ],
    clinicalFocus: [
      "Dr Dallas specialises in prostate, bladder, kidney and testicular cancers, germ-cell tumours, and head and neck and thyroid cancers. She has a particular interest in technical radiotherapy techniques including IMRT, dynamic arc IMRT and IGRT.",
      "She is a principal investigator and sub-investigator for phase-three trials in urological and head and neck cancers, including the PATHOS radiotherapy trial.",
    ],
    leadership: [
      "Dr Dallas is listed as Clinical Governance and Audit Lead at the Berkshire Cancer Centre and as an educational supervisor for specialist oncology trainees.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-nicola-dallas.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
    ],
  },
  "ruth-davis": {
    intro:
      "Dr Davis specialises in breast cancer and adult brain, skull-base and spinal cord tumours, with experience across radiotherapy and systemic anti-cancer treatments.",
    about: [
      "Dr Davis is a consultant clinical oncologist specialising in breast and central nervous system cancers. Her work combines specialist cancer care with radiotherapy leadership, clinical education and research.",
    ],
    training: [
      "Dr Davis graduated from University College London Medical School in 1998. After junior posts including Mount Vernon and Charing Cross, she completed clinical oncology training at Southampton University Hospitals Trust and was appointed a consultant at the Royal Berkshire Hospital in 2012.",
    ],
    clinicalFocus: [
      "Dr Davis specialises in the non-surgical treatment of breast cancer and adult brain, skull-base and spinal cord tumours.",
      "Her work includes radiotherapy and systemic treatments, including chemotherapy, biological therapies, hormone treatments, targeted therapies and immunotherapy. She also helped implement deep-inspiration breath-hold radiotherapy for breast cancer and intensity-modulated radiotherapy for brain and head-and-neck treatment in Reading.",
    ],
    leadership: [
      "Dr Davis is Radiotherapy Clinical Lead at the Berkshire Cancer Centre. She is also a College Tutor for Clinical Oncology trainees in Berkshire and contributes to the regional training programme and national recruitment.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-ruth-davis.htm",
      "https://www.fhft.nhs.uk/services/consultants/dr-ruth-davis",
      "https://www.genesiscare.com/uk/our-doctors/dr-ruth-davis",
      "https://www.spirehealthcare.com/spire-dunedin-hospital/consultants/dr-ruth-davis-c4529136/",
    ],
  },
  "gelareh-eslamian": {
    intro:
      "Dr Eslamian specialises in breast and upper gastrointestinal cancer care, with experience across chemotherapy, immunotherapy, targeted and endocrine treatments.",
    about: [
      "Dr Eslamian is a consultant medical oncologist specialising in breast and upper gastrointestinal cancers. Her work combines patient care with clinical leadership, research and medical education.",
    ],
    training: [
      "Dr Eslamian graduated in medicine from Babol University in Iran, then continued her foundation and medical training in Devon. She completed specialist oncology training across Wessex, South Yorkshire, London and Kent.",
    ],
    clinicalFocus: [
      "Dr Eslamian specialises in breast, oesophageal, gastric and pancreato-biliary cancers, with a particular focus on breast cancer.",
      "Her work includes chemotherapy, immunotherapy, monoclonal antibodies and endocrine treatment. She also encourages patients to consider clinical trials when a suitable study is available.",
    ],
    leadership: [
      "Dr Eslamian is a core member of the Windsor breast multidisciplinary team and the Royal Berkshire upper gastrointestinal multidisciplinary team. She is also the Chemotherapy Lead for the Berkshire Cancer Centre, chairs the chemotherapy steering group and supervises medical trainees.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-gelareh-eslamian.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
    ],
  },
  "alice-freebairn": {
    intro:
      "Dr Freebairn specialises in colorectal, head and neck and non-melanomatous skin cancers, with experience across chemotherapy, radiotherapy and multidisciplinary cancer care.",
    about: [
      "Dr Freebairn is a consultant clinical oncologist specialising in colorectal, head and neck and non-melanomatous skin cancers. Her work combines patient care with clinical leadership, multidisciplinary practice and cancer research.",
    ],
    training: [
      "Dr Freebairn graduated from King’s College London and worked at the Royal Berkshire Hospital early in her career. She then moved to the Wessex rotation to complete specialist oncology training.",
    ],
    clinicalFocus: [
      "Dr Freebairn specialises in colorectal, head and neck and non-melanomatous skin cancers.",
      "She works with the Oxford and Reading head-and-neck multidisciplinary team and the Reading colorectal multidisciplinary team. She also helped introduce intensity-modulated radiotherapy for head-and-neck and anal cancers in Reading.",
    ],
    leadership: [
      "Dr Freebairn has been Clinical Director of the Berkshire Cancer Centre since 2021. She also serves as the Royal Berkshire Hospital’s Responsible Officer through her role as Associate Medical Director for Professional Standards.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-alice-freebairn.htm",
      "https://www.spirehealthcare.com/consultant-profiles/dr-alice-freebairn-c3684771/",
      "https://www.genesiscare.com/uk/our-doctors/dr-alice-freebairn",
    ],
  },
  "esme-hill": {
    intro:
      "Dr Hill specialises in upper gastrointestinal, liver and pancreatic cancers, with experience across radiotherapy, chemotherapy and wider systemic treatment.",
    about: [
      "Dr Hill is a consultant clinical oncologist specialising in upper gastrointestinal, liver and pancreatic cancers. Her work combines patient care with acute oncology, multidisciplinary practice, medical education and research.",
    ],
    training: [
      "Dr Hill graduated from the University of Birmingham and completed an intercalated BSc in the History of Medicine at University College London. After physician training in the West Midlands, she completed oncology training at the Royal Free Hospital and on the Oxford Clinical Oncology training scheme.",
    ],
    clinicalFocus: [
      "Dr Hill has special clinical interests in upper gastrointestinal, liver and pancreatic cancers, including oesophageal, stomach and bile-duct cancers, as well as cancers of unknown primary.",
      "She also has extensive experience caring for acutely unwell cancer patients through dedicated Acute Oncology work.",
    ],
    leadership: [
      "Dr Hill is Clinical Lead for malignant spinal cord compression at the Royal Berkshire Hospital and an Educational Supervisor for Core Medical trainees. She is a core member of upper gastrointestinal multidisciplinary teams at the Royal Berkshire and Wexham Park hospitals and works closely with Oxford’s oesophago-gastric and hepato-biliary teams.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-esme-hill.htm",
      "https://www.spirehealthcare.com/consultant-profiles/dr-esme-hill-c6025316/",
      "https://www.genesiscare.com/uk/our-doctors/dr-esme-hill",
    ],
  },
  "ayman-madi": {
    intro:
      "Dr Madi specialises in breast and colorectal cancer care, with experience across chemotherapy, biological and immunotherapy, and hormone treatment.",
    about: [
      "Dr Madi is a consultant medical oncologist specialising in breast and colorectal cancers. His work combines patient care with clinical research, trial leadership, quality improvement and medical education.",
    ],
    training: [
      "Dr Madi graduated from Damascus University Faculty of Medicine in 2001 and attained MRCP in the UK in 2006. From 2007 to 2009 he was a research fellow at Cardiff University, where his MD examined the pharmacogenetics of advanced colorectal cancer, before completing medical oncology training in Newcastle upon Tyne in 2013.",
    ],
    clinicalFocus: [
      "Dr Madi treats breast and colorectal cancers. His treatment experience includes chemotherapy, biological and immunotherapy, and hormone treatment.",
    ],
    leadership: [
      "Dr Madi joined the Royal Berkshire Hospital in 2022 and is Research Lead at the Berkshire Cancer Centre. Previously, at Clatterbridge Cancer Centre, he was Lead for Acute Oncology at the Royal Liverpool Hospital and an honorary senior clinical lecturer at the University of Liverpool. He was also principal investigator for several clinical trials and presented research and quality-improvement work at international conferences.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-ayman-madi.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
      "https://www.spirehealthcare.com/consultant-profiles/dr-ayman-madi-c6034857/",
    ],
  },
  "helen-odonnell": {
    intro:
      "Dr O’Donnell specialises in gynaecological and urological cancer care, with particular expertise in prostate brachytherapy and experience across chemotherapy, radiotherapy, immunotherapy and hormone treatment.",
    about: [
      "Dr O’Donnell is a consultant clinical oncologist specialising in gynaecological cancers and prostate, bladder and kidney cancers. Her work combines specialist cancer treatment with clinical leadership and research.",
    ],
    training: [
      "Dr O’Donnell graduated from Merton College, Oxford, and completed her initial medical training at St George’s Hospital Medical School in London. She completed postgraduate training at Barts and The London in 2002, became accredited in clinical oncology in 2007, and spent two years as a clinical research fellow at the Royal Marsden Hospital and the Institute of Cancer Research.",
    ],
    clinicalFocus: [
      "Dr O’Donnell treats gynaecological cancers and urological cancers, including prostate, bladder and kidney cancers.",
      "She has particular expertise in prostate brachytherapy; her wider treatment experience includes chemotherapy, radiotherapy, biological and immunotherapy, and hormone treatment.",
    ],
    leadership: [
      "Dr O’Donnell was appointed as a Consultant Clinical Oncologist at the Royal Berkshire Hospital in 2009. She is Clinical Director and Lead Cancer Physician at the Berkshire Cancer Centre.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-helen-odonnell.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
      "https://www.spirehealthcare.com/consultant-profiles/dr-helen-odonnell-c4542566/",
      "https://www.genesiscare.com/uk/our-doctors/dr-helen-odonnell",
    ],
  },
  "paul-rogers": {
    intro:
      "Dr Rogers specialises in urological cancers, including prostate, testicular, kidney, bladder and urothelial tract cancers, with experience across radiotherapy, brachytherapy, chemotherapy, immunotherapy, hormone therapy and radioisotope treatment.",
    about: [
      "Dr Rogers is a consultant clinical oncologist with long-standing experience in urological cancers. His work includes prostate brachytherapy, national clinical trials and postgraduate oncology education.",
    ],
    training: [
      "Dr Rogers graduated from St Mary’s Hospital Medical School in London and completed his general medical training in London. This was followed by seven years of oncology training at St Bartholomew’s, Mount Vernon, The Middlesex and The Royal Free hospitals.",
    ],
    clinicalFocus: [
      "Dr Rogers treats prostate, testicular, kidney, bladder and urothelial tract cancers. His clinical interests also include metastatic castration-resistant prostate cancer and oligometastatic disease.",
      "His treatment experience includes prostate brachytherapy, radiotherapy, radioisotope therapy, chemotherapy, biological and immunotherapy, and hormone therapy.",
    ],
    leadership: [
      "Dr Rogers is Regional Advisor for Clinical Oncology in the Oxford and Thames Valley region for the Royal College of Radiologists and an educational supervisor for clinical oncology registrars. He previously served as Training Programme Director for Clinical Oncology with the Oxford Deanery and as Trust Research and Development Lead. He has also been principal investigator for national trials in prostate, testicular and kidney cancers and genetics.",
    ],
    sources: [
      "https://berkshire-oncology.org.uk/consultant-dr-paul-rogers.htm",
      "https://berkshire-oncology.org.uk/our-consultants.htm",
      "https://www.spirehealthcare.com/consultant-profiles/dr-paul-rogers-c3310731/",
      "https://www.genesiscare.com/uk/our-doctors/dr-paul-rogers",
    ],
  },
};
