import type { Consultant } from "./types";

// The ten partners of Berkshire Oncology Partnership. Biographies are reproduced
// from the practice's own consultant pages (light copy-editing only on obvious
// mechanical typos in the narrative; publication citations are kept verbatim).
// GMC numbers are from the practice's data-controller register; qualifications
// from the consultants listing. Photos are wired in via public/consultants/
// (see scripts/fetch-assets.mjs) and set on `photo` once present.
export const consultants: Consultant[] = [
  {
    slug: "joss-adams",
    photo: "/consultants/joss-adams.jpg",
    name: "Dr Joss Adams",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "4259509",
    qualifications: "MA, MB BChir, MRCP, FRCR",
    consultantInReadingSince: 2006,
    medicalSchool: { name: "University of Cambridge", year: 1995 },
    clinicalInvolvement: [
      `I graduated from Cambridge University in 1995 and completed both my junior medical training and my oncology specialist training in Oxford.`,
      `I am principal investigator for clinical trials in lung and breast cancer at the Royal Berkshire Hospital, Reading. I also refer patients for clinical trials where appropriate (including the Royal Marsden and University College Hospital, London).`,
      `Clinical Governance Lead in the Berkshire Cancer Centre, Royal Berkshire Hospital, Reading 2006–2011. Clinical Lead for Chemotherapy in the Berkshire Cancer Centre, Royal Berkshire Hospital, Reading 2011–2017. Clinical Supervisor for specialist oncology trainees.`,
    ],
    research: [
      `Addition of Apatorsen, an inhibitor of Hsp27, to first-line gemcitabine/carboplatin in advanced squamous cell lung cancer: Design of the Cedar study. ASCO 2016.`,
      `A Phase II, randomised, open-label study of Gemcitabine/Carboplatin first-line chemotherapy in combination with or without the antisense oligonucleotide Apatorsen (OGX-427) in advanced squamous cell lung cancers. ESMO 2017.`,
      `I have also written chapters for the Oxford Handbook of Emergencies in Oncology, and Problem Solving in Oncology.`,
    ],
    achievements: [
      `2014: Cycled from Reading to Barcelona on a tandem with Nurse Consultant Mark Foulkes on a charity cycle ride to raise funds to facilitate the local delivery of chemotherapy for patients in West Berkshire.`,
      `2017: Nominated for the National Oncology Registrars' Forum Trainer Award.`,
    ],
    disclosures: [
      `I am fully registered with the GMC (4259509) and hold a certificate of completion of specialist training in Clinical Oncology. I have accepted educational grants to fund attendance at both national and international cancer conferences. I have provided training and updates for pharmaceutical companies when requested. I have no financial interests in any pharmaceutical company. I am an investor in the Genesis Care, Windsor, Diagnostic and Oncology Centre.`,
    ],
  },
  {
    slug: "madhumita-bhattacharyya",
    photo: "/consultants/madhumita-bhattacharyya.jpg",
    name: "Dr Madhumita Bhattacharyya",
    role: "Consultant Medical Oncologist",
    shortRole: "Medical Oncologist",
    gmc: "4521657",
    qualifications: "BSc, MBBS, MRCP, PhD",
    consultantInReadingSince: 2012,
    medicalSchool: {
      name: "Barts and the London School of Medicine and Dentistry",
      year: 1998,
    },
    clinicalInvolvement: [
      `I graduated from Barts and the London School of Medicine and Dentistry in 1998, having also obtained an intercalated BSc in Tumour Biology at University College London (1995). After junior medical training in London, including oncology posts at Barts and the Royal Marsden Hospitals, I commenced my Medical Oncology training at Barts before undertaking a PhD in Molecular Oncology and completed my medical oncology training in Wessex. I was appointed as a Consultant in Reading at the Royal Berkshire Hospital in January 2012.`,
      `I specialise in the treatment of melanoma, breast and ovarian cancers with systemic treatments. I am also the Acute Oncology Lead for the Thames Valley and the Royal Berkshire Hospitals. I see private patients at Spire Dunedin Hospital. As well as my clinical interests, I have an interest in education and am educational supervisor for medical trainees at Royal Berkshire Hospital. In 2015, I edited Challenging Concepts in Oncology, a textbook of clinical scenarios in oncology, and recently updated the breast cancer, ovarian cancer and melanoma chapters in the Oxford Handbook of Oncology. I have a number of publications in peer-reviewed journals. I am keen for my patients to have access to clinical trials and am principal investigator on trials in ovarian and breast cancers.`,
    ],
    research: [
      `Using MRI to plan breast-conserving surgery following neoadjuvant chemotherapy for early breast cancer (2007).`,
      `Intermittent dosing with vemurafenib in BRAF V600E-mutant melanoma: review of a case series (2014).`,
      `Agreement between MRI and pathologic breast tumour size after neoadjuvant chemotherapy, and comparison with alternative tests: individual patient data meta-analysis (2015).`,
      `Editor of Challenging Concepts in Oncology, OUP, 2015. Author of the "Cancer of Unknown Primary" chapter in Challenging Concepts in Oncology.`,
    ],
    achievements: [
      `I was awarded a CRUK Clinical Research Fellowship investigating the role of adenoviral gene therapy in pancreatic cancer and was awarded a PhD in 2008.`,
    ],
    disclosures: [
      `I have previously accepted educational grants to fund attendance at national and international cancer conferences and have received payment at educational meetings sponsored by the pharmaceutical industry. I make full disclosures and have no financial interests in any pharmaceutical company. I am an investor in the Genesis Care, Windsor, Diagnostic and Oncology Centre.`,
    ],
  },
  {
    slug: "nicola-dallas",
    photo: "/consultants/nicola-dallas.jpg",
    name: "Dr Nicola Dallas",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "4502331",
    qualifications: "MBChB, MRCP, FRCR",
    consultantInReadingSince: 2011,
    medicalSchool: { name: "University of Birmingham Medical School", year: 1998 },
    clinicalInvolvement: [
      `I graduated from the University of Birmingham Medical School in 1998 and became a member of the Royal College of Physicians in 2001. I completed my oncology training in Oxford, becoming a Fellow of the Royal College of Radiologists in 2007. I was appointed as a Consultant Clinical Oncologist at the Berkshire Cancer Centre, Royal Berkshire Hospital in Reading in 2011.`,
      `I now practice at Dunedin and GenesisCare Oncology Centre Windsor. I specialise in the treatment of prostate, bladder, kidney and testicular cancers, head and neck and thyroid cancers. I have a particular interest in technical radiotherapy techniques including IMRT, dynamic arc IMRT and IGRT. I am a principal investigator and sub-investigator for a number of phase 3 clinical trials in urological and head and neck cancer including PATHOS, a head and neck radiotherapy trial looking at reducing the intensity of treatment in selected cases. At the Berkshire Cancer Centre I am the Clinical Governance and Audit Lead as well as an educational supervisor for specialist oncology trainees.`,
    ],
    research: [
      `I have published and presented work on prostate brachytherapy, testicular tumours and head and neck cancer (ORCID: 0000-0001-6835-7143).`,
      `No longer any role for routine follow-up chest x-rays in men with stage I germ cell cancer. H De La Pena, A Sharma, C Glicksman, et al. Eur J Cancer 2017; 84: 354-359.`,
      `Establishing a large prospective clinical cohort in people with head and neck cancer as a biomedical resource: Head and Neck 5000. A R Ness, A Waylen, K Hurley, et al. BMC Cancer 2014; 14: 973.`,
      `The results of real-time brachytherapy for the management of low and intermediate risk prostate cancer in patients with prostate volumes up to 100ml. N L Dallas, P R Malone, A Jones, et al. BJU Int 2012; 110: 383-390.`,
      `Author of the Thyroid Cancer chapter in Challenging Concepts in Oncology, 2015.`,
    ],
    disclosures: [
      `I am an investor in the Genesis Care, Windsor, Diagnostic and Oncology Centre. I have accepted sponsorship from drug companies to attend international oncology meetings. I have no financial relationship with any pharmaceutical company.`,
    ],
  },
  {
    slug: "ruth-davis",
    photo: "/consultants/ruth-davis.jpg",
    name: "Dr Ruth Davis",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "4529136",
    qualifications: "MBBS, MRCP, FRCR",
    consultantInReadingSince: 2012,
    medicalSchool: { name: "University College London Medical School", year: 1998 },
    clinicalInvolvement: [
      `I graduated from University College London Medical School in 1998 before working as a Junior Doctor in a number of Hospitals including Mount Vernon and Charing Cross. I completed my Clinical Oncology training at Southampton University Hospitals Trust prior to my appointment as Consultant at the Royal Berkshire Hospital, Reading in 2012.`,
      `I am the Radiotherapy Clinical Lead at the Berkshire Cancer Centre, Royal Berkshire Hospital, Reading. I am very keen to push forward new radiotherapy technologies, especially those that reduce toxicity to normal tissue and achieve better outcomes for patients. In particular I was involved in implementation of the Breath Hold Breast Radiotherapy technique in Reading and IMRT for Brain and Head and Neck patients. I am College Tutor, supervising training for Clinical Oncology trainees in Berkshire, and am involved with the regional training programme and National Recruitment.`,
    ],
    research: [
      `I am a keen participant in clinical research and am a Principal Investigator for a number of trials across Berkshire including the Fast Forward Breast Radiotherapy trial which compares standard radiotherapy with a shorter more intense course of treatment; Bridging the Age Gap which looks at treatment options for older breast cancer patients; and Horizons which documents the experiences of our younger breast cancer patients.`,
      `Erlotinib in the Treatment of Patients with Multiple Metastases from Non-small Cell Lung Cancer. Clinical Oncology Journal, 2013.`,
    ],
    achievements: [
      `I am a member of the UK Breast Cancer Group. I sing in a number of choirs including in the BBC4 documentary Vivaldi's Women.`,
    ],
    disclosures: [
      `I am on the Steering Committee for, and am an investor in, Windsor Oncology Centre with Genesis Care. I have previously received honoraria from Roche and previous sponsorship from Novartis.`,
    ],
  },
  {
    slug: "gelareh-eslamian",
    photo: "/consultants/gelareh-eslamian.jpg",
    name: "Dr Gelareh Eslamian",
    role: "Consultant Medical Oncologist",
    shortRole: "Medical Oncologist",
    gmc: "6043320",
    qualifications: "MD, MRCP, ESMO",
    consultantInReadingSince: 2020,
    medicalSchool: { name: "Babol University, Iran" },
    clinicalInvolvement: [
      `I acquired my Medical degree from Babol University in Iran; continued my Foundation years and Medical training in Peninsula deanery Devon and completed my Medical oncology training in Wessex, South Yorkshire (Weston Park Hospital), London (Guys and St Thomas, St Georges Hospitals) and Kent deaneries.`,
      `I specialise in treatment of breast, oesophagus, gastric and pancreato-biliary cancers with main focus and passion on treating breast cancer. I would encourage active participation in clinical trials and aim to provide the latest available cancer treatment to my patients. I have extensive experience in systemic anti-cancer therapies including chemotherapy, immunotherapy, monoclonal antibodies and endocrine treatments.`,
      `I am a core member of the Windsor breast Multi-Disciplinary Team and the Royal Berkshire UGI MDT. I have extensive experience in treating acutely unwell cancer patients and have a dedicated weekly ward round for Acute Oncology. I am the chemotherapy lead for Berkshire Cancer Centre and chair of the chemotherapy steering group. I am also interested in Medical Education and am a Clinical Supervisor for medical trainees.`,
    ],
    research: [
      `PEAR Study: UK experience of management of pregnancy-associated breast cancer — a national retrospective review of UK practice. Annals of Oncology, September 2020 (243P); presented ESMO 2020.`,
      `Immune checkpoint inhibitor induced large vessel vasculitis: a case report of immune-related toxicity post Ipilimumab and Nivolumab. BMJ, Volume 13, May 2020.`,
      `The assessment of Bone Mineral Density (BMD) and fracture risk after three years of adjuvant zoledronic acid in post-menopausal ER+ early breast cancer. Poster, UKBCG, November 2019.`,
      `Efficacy of Eribulin in breast cancer: a short report on new emerging data. OncoTargets and Therapy, February 2017. G. Eslamian, R. Young, C. Wilson.`,
      `Pertuzumab as part of triple therapy in metastatic HER-2 positive breast cancer. Poster, UKBCG, November 2017.`,
      `I have been a co-investigator in numerous oncology phase 3 clinical trials, including the breast cancer trials ARTemis, EMILIA, AZURE, D-CARE, MANTA, OlympiA, PERSEPHONE, ROSCO and PALOMA-2.`,
    ],
    disclosures: [
      `I have accepted educational sponsorship to attend international oncology meetings. I have no financial interest in any pharmaceutical company.`,
    ],
  },
  {
    slug: "alice-freebairn",
    photo: "/consultants/alice-freebairn.jpg",
    name: "Dr Alice Freebairn",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "3684771",
    qualifications: "BSc, MBBS, MRCP, FRCR, FRCP, CCST",
    consultantInReadingSince: 2001,
    medicalSchool: { name: "King's College London", year: 1992 },
    clinicalInvolvement: [
      `I graduated from King's College London and worked in Reading at the Royal Berkshire Hospital early in my career before moving to the Wessex rotation for oncology training.`,
      `In April 2018 I took on the role of Associate Medical Director for professional standards at the Royal Berkshire Hospital. Prior to that I was one of the training directors for the Foundation Programme doctors at the RBH as they start their careers, and an enhanced Appraiser for fellow Consultants. I was the Chair of the Royal Berkshire Hospital Consultants' Committee until October 2017. I am a member of the Thames Valley Head and Neck cancer group and am the oncology lead for the current MacMillan project in the Thames Valley, looking at support for patients undergoing treatment for oropharyngeal cancers.`,
    ],
    research: [
      `I have taken part in national bowel cancer clinical trials such as the SCOT trial, looking at the length of chemotherapy needed in bowel cancer; the COIN trial looking at the best duration of palliative chemotherapy for patients with bowel cancer; and the Add Aspirin trial, ongoing currently. Dr Dallas and I are in the process of setting up the Pathos trial which is looking at the best dose and techniques for the radiotherapy of oropharyngeal cancer. We are also in the process of setting up the PLATO trial, looking at radiotherapy and dose for the treatment of anal cancer.`,
    ],
    achievements: [
      `I helped set up the skin cancer Multi Disciplinary Team in the Royal Berkshire Hospital, Reading with plastic surgeons and dermatologists in 2003. I am an integral member of the Oxford/Reading Head and Neck cancer Multi Disciplinary Team and the Reading Colorectal Multi Disciplinary Team. Dr Dallas and I have introduced Head and Neck IMRT (Intensity Modulated Radiotherapy) to all Reading patients, and Dr Gildersleve and I have also introduced IMRT for patients with anal cancer. I have led a project at the Royal Berkshire Hospital to bring in an Acute Oncology service at the weekends.`,
    ],
    disclosures: [
      `I occasionally accept hospitality from pharmaceutical companies to attend international meetings. I have no financial interest in any pharmaceutical company. I am an investor in the Genesis Care, Windsor, Diagnostic and Oncology Centre.`,
    ],
  },
  {
    slug: "esme-hill",
    photo: "/consultants/esme-hill.jpg",
    name: "Dr Esme Hill",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "6025316",
    qualifications: "BSc, MBChB, MSc, MRCP, FRCR, DPhil",
    consultantInReadingSince: 2015,
    medicalSchool: { name: "University of Birmingham", year: 2001 },
    clinicalInvolvement: [
      `I graduated from Birmingham University, also completing an Intercalated BSc in the History of Medicine at University College London before training as a physician in the West Midlands. Once I decided to specialise in Oncology I completed my training at the Royal Free Hospital and then as a Specialist Registrar in Clinical Oncology on the Oxford Clinical Oncology training scheme.`,
      `I have extensive experience in the management of acutely unwell cancer patients, with a weekly session dedicated to 'Acute Oncology'. I am the malignant spinal cord compression clinical lead at the Royal Berkshire Hospital in Reading. I am also an Educational Supervisor to Core Medical trainees. I am a core member of the Upper Gastrointestinal Cancer Multi-Disciplinary Teams and Cancer of Unknown Primary Multi-Disciplinary Teams at both the Royal Berkshire Hospital, Reading and Wexham Park Hospital, Slough. I attend the Oxford Oesophago-gastric and Hepato-biliary Multi-Disciplinary Team meetings on a weekly basis via video-conference and have a strong working relationship with the Oxford teams.`,
    ],
    research: [
      `I completed an original research project for my MSc in Oncology on the role of PET-CT in the pre-operative staging of gastric cancer.`,
      `I spent 3 years as a Clinical Research Fellow at the Gray Institute of Radiation Oncology and Biology, University of Oxford, undertaking independent research towards a DPhil in Radiobiology, exploring the role of imaging to measure tumour vascular parameters in response to radiotherapy given before or alongside radio-sensitising drugs in the context of two radiotherapy clinical trials in colorectal cancer. I was also involved in recruitment and trial management for the ARCII trial, a Phase II trial evaluating the addition of a radiosensitiser (Nelfinavir) to chemo-radiotherapy for locally advanced pancreatic cancer.`,
      `I have been involved in recruitment to numerous national trials. I am currently a co-investigator for the ADD-ASPIRIN trial, recruiting patients with resected gastro-oesophageal cancer at the Royal Berkshire Hospital in Reading. I am setting up the SCOPE-2 trial (a Study of Chemo-radiotherapy in Oesophageal Cancer with PET-CT and dose escalation) as Principal Investigator at the Royal Berkshire Hospital, and am also Principal Investigator for a commercial study comparing second-line chemotherapy with immunotherapy for oesophageal cancer.`,
      `Selected publications include work in the Journal of Clinical Oncology, Clinical Cancer Research, the International Journal of Cancer, the British Journal of Cancer, Radiation Oncology and Critical Reviews in Oncology & Haematology, together with book chapters on combining radioembolisation with systemic chemotherapy for metastatic colorectal cancer.`,
    ],
    achievements: [
      `Royal College of Radiologists Ross Prize for best proffered paper at the National Cancer Research Institute Conference in Liverpool (2013). British Association of Cancer Research Travel Award for high quality abstract submission to the BACR conference (2013). Oxfordshire Health Services Research Committee Fellowship Grant (awarded 2010).`,
    ],
    disclosures: [`Nil.`],
  },
  {
    slug: "ayman-madi",
    photo: "/consultants/ayman-madi.jpg",
    name: "Dr Ayman Madi",
    role: "Consultant Medical Oncologist",
    shortRole: "Medical Oncologist",
    gmc: "6034857",
    qualifications: "MD, MRCP",
    consultantInReadingSince: 2022,
    medicalSchool: { name: "Damascus University, Faculty of Medicine", year: 2001 },
    clinicalInvolvement: [
      `I graduated from Damascus University – Faculty of Medicine in 2001. Subsequently I moved to the UK and attained the MRCP degree in 2006. I was a research fellow at Cardiff University 2007–2009 — the title of my MD thesis was "Pharmacogenetics of Advanced Colorectal Cancer". I did my training in medical oncology in Newcastle upon Tyne and completed this in 2013.`,
      `In 2014 I started my first consultant position at Clatterbridge Cancer Centre in Liverpool, where I was an honorary senior clinical lecturer at the University of Liverpool and the lead for acute oncology at the Royal Liverpool Hospital. I was the principal investigator for several clinical trials and presented the outcome of my research work and quality improvement projects at international conferences. I moved to the Royal Berkshire Hospital in 2022 and I am currently the research lead at Berkshire Cancer Centre. I treat patients with breast and colorectal cancers and see private patients at Spire Dunedin Hospital.`,
    ],
    research: [
      `I have 11 academic papers published in peer-reviewed journals in relation to cancer management, and many more published in abstract form.`,
    ],
    achievements: [
      `Clinical Audit / Service Improvement project of the year award, Clatterbridge Cancer Centre, for a project titled "DPYD genotyping for patients who develop severe toxicities on 5FU/Capecitabine based regimens", 2021.`,
      `Clinical Excellence Award Level 2, Clatterbridge Cancer Centre, 2019; Level 1, 2018.`,
      `Medical Director's Award for Clinical Teaching, Clatterbridge Cancer Centre, 2016.`,
      `Conquer Cancer Foundation of ASCO Merit Award, in recognition of the abstract "Comprehensive Pharmacogenetic Profiling of Advanced Colorectal Cancer", 2013.`,
    ],
    disclosures: [
      `I have accepted educational grants from pharmaceutical companies to fund attendance at international cancer conferences and have taken part in consultancy boards for which I have received honoraria. I have no financial interests in any pharmaceutical company.`,
    ],
  },
  {
    slug: "helen-odonnell",
    photo: "/consultants/helen-odonnell.jpg",
    name: "Dr Helen O'Donnell",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "4542566",
    qualifications: "BA, MBBS, MRCP, FRCR",
    consultantInReadingSince: 2009,
    medicalSchool: { name: "University of Oxford", year: 1998 },
    clinicalInvolvement: [
      `I graduated from Oxford University and went on to complete my initial general medical training at St George's Hospital Medical School, London, followed by post graduate training at the Bart's and The London in 2002, and was accredited in Clinical Oncology in 2007.`,
      `I was appointed as a Consultant Clinical Oncologist at the Royal Berkshire Hospital in 2009 and I am currently Clinical Director and Lead Cancer Physician at the Berkshire Cancer Centre. I have a particular interest in the treatment of gynaecological cancers, prostate, bladder and renal cancers. I specialise in Prostate Brachytherapy.`,
    ],
    research: [
      `I spent 2 years as a Clinical Research Fellow at the Royal Marsden Hospital and the Institute of Cancer Research.`,
      `Treatment of early prostate cancer. O'Donnell H, Parker C. Trends in Urology, Gynaecology and Sexual Health, May/June 2009.`,
      `What is low-risk prostate cancer and what is its natural history? O'Donnell H, Parker C. World Journal of Urology 2008; 26: 415-422.`,
      `Re-defining rectal volume and DVH for analysis of rectal morbidity after radiotherapy for early prostate cancer. O'Donnell HE, Finnegan K, Oliveros S, Plowman PN. Br J Radiol 2008; 81: 327-332.`,
      `A single centre experience of dosimetric outcomes in LDR prostate brachytherapy with I-125 seeds prescribed to 160Gy. O'Cathail SM, Day K, Doggart A, Rogers P, O'Donnell H. ESTRO Forum 2014, PO-1049.`,
    ],
    disclosures: [],
  },
  {
    slug: "paul-rogers",
    photo: "/consultants/paul-rogers.jpg",
    name: "Dr Paul Rogers",
    role: "Consultant Clinical Oncologist",
    shortRole: "Clinical Oncologist",
    gmc: "3310731",
    qualifications: "MBBS, MRCP, FRCP, FRCR",
    consultantInReadingSince: 1999,
    medicalSchool: { name: "St Mary's Hospital Medical School, London", year: 1989 },
    clinicalInvolvement: [
      `I graduated from St Mary's Hospital Medical School, London and went on to complete my general medical training in London, followed by 7 years of Oncology training at St Bartholomew's, Mount Vernon, The Middlesex, and The Royal Free Hospitals in London.`,
    ],
    research: [
      `Principal Investigator for national trials in prostate cancer, testicular cancer, renal cancer and genetics. Previous collaborative research with the MRC Cell Mutation Unit in Brighton (ORCID: 0000-0003-2593-2595).`,
      `10-year outcomes of real-time "4D" prostate brachytherapy in prostates up to 100ml. European Urology, March 2017.`,
      `Addition of docetaxel, zoledronic acid, or both to first-line long-term hormone therapy in prostate cancer (STAMPEDE): survival results from an adaptive multi-arm, multistage, platform randomised controlled trial. The Lancet, 2016.`,
      `A randomised phase 2 trial of intensive induction chemotherapy (CBOP/BEP) and standard BEP in poor prognosis germ cell tumours (MRC TE23). European Urology, 2015.`,
    ],
    achievements: [
      `ASCO merit award for research in radiosensitivity, 1999. Our Prostate Brachytherapy work has won prizes at the British Uro-Oncology Group (2010) and the UK and Ireland Prostate Brachytherapy Meeting (2017 and 2018).`,
      `I am currently the Regional Advisor for Clinical Oncology in the Oxford/Thames Valley Region for the Royal College of Radiologists. I am an Educational Supervisor for Clinical Oncology Registrars. Previously I was Training Programme Director for Clinical Oncology with the Oxford Deanery, and Trust Research & Development lead. I hosted the 2011 UK and Ireland Prostate Brachytherapy Conference in Windsor.`,
    ],
    disclosures: [
      `I accept sponsorship to attend Oncological Conferences from a variety of companies. I have been paid for advisory board work and to deliver educational talks. I am an investor in the Genesis Care, Windsor, Diagnostic and Oncology Centre.`,
    ],
  },
];
