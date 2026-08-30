import type { Approach } from "./cancerInfo";
export interface CancerTreatmentGuide {
  groupId: string;
  intro: string;
  approaches: Approach[];
  sources: { label: string; url: string }[];
  reviewedBy?: string;
  reviewerCredentials?: string;
  reviewedOn?: string;
  nextReviewOn?: string;
}

/**
 * Treatment-only drafts for cancer groupings whose full clinical guide has not
 * yet been written in cancerInfo.ts. These are kept separate so adding a safe
 * treatment overview cannot make an unfinished detail page appear complete.
 */
export const cancerTreatmentGuides: Record<string, CancerTreatmentGuide> = {
  colorectal: {
    groupId: "colorectal",
    intro: "Treatment for bowel cancer depends on whether it started in the colon or rectum, its stage, whether it has spread, relevant molecular test results, treatment you have already had, your general health and what matters to you. The approaches below may be discussed, but this page cannot show which, if any, are suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery is the main treatment for many bowel cancers that have not spread. It may involve removing the affected part of the colon or rectum and nearby lymph nodes. Surgery is carried out by a colorectal surgeon, and some operations involve a temporary or permanent stoma.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be given after surgery for some bowel cancers. It may also be used before surgery in particular situations, or when the cancer has spread. The decision depends on the stage and characteristics of the cancer, previous treatment and your general health.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy and chemoradiotherapy",
        body: "Radiotherapy is used mainly for rectal cancer rather than colon cancer. It may be given before surgery, sometimes together with chemotherapy, or used to help control symptoms when cancer has spread.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "For some advanced or metastatic bowel cancers, molecular tests may identify features that make a targeted medicine an option. Whether it is relevant depends on the test results, previous treatment and the wider treatment plan.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Some advanced or metastatic bowel cancers have changes in the way their cells repair DNA. Tests may describe this as mismatch repair deficient (dMMR) or microsatellite instability high (MSI-H). In those specific circumstances, immunotherapy may be an option.",
      },
    ],
    sources: [
      {
        label: "NICE NG151: Colorectal cancer",
        url: "https://www.nice.org.uk/guidance/ng151",
      },
      {
        label: "NHS: Treatment for bowel cancer",
        url: "https://www.nhs.uk/conditions/bowel-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Treatment for bowel cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/bowel-cancer/treatment",
      },
    ],
  },
  "bladder-and-kidney": {
    groupId: "bladder-and-kidney",
    intro: "Bladder and kidney cancers are different diseases and are treated differently. What may be discussed depends on where the cancer started, its exact type and stage, whether a bladder cancer has reached the muscle, kidney function, relevant test results, previous treatment, your general health and what matters to you. This page cannot show which, if any, approaches are suitable for you.",
    approaches: [
      {
        title: "Surgery and other local treatments",
        byOthers: true,
        body: "A urologist may remove a bladder tumour through the urethra, and some muscle-invasive cancers may lead to discussion of removing the bladder. Kidney surgery may remove part or all of a kidney; selected small kidney cancers may instead be monitored or treated with heat or freezing.",
      },
      {
        title: "Treatment placed inside the bladder",
        byOthers: true,
        body: "For some non-muscle-invasive bladder cancers, chemotherapy or an immune treatment is put directly into the bladder after the tumour has been removed. This is different from medicine that circulates throughout the body, and it is not a treatment for kidney cancer.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be used before surgery or radical radiotherapy for muscle-invasive bladder cancer, or when bladder cancer has spread. It is not commonly used for renal cell carcinoma, although it may be relevant to some less common kidney cancer types.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "For some muscle-invasive bladder cancers, radiotherapy with a radiosensitising medicine may be discussed as an alternative to removing the bladder. Radiotherapy has a more selective role in kidney cancer and may also be used to control symptoms.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be considered after surgery or for advanced disease in particular bladder- or kidney-cancer situations. The exact pathology, extent of the cancer, earlier treatment, general health and current NICE criteria all matter.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Targeted medicines may be used for advanced renal cell carcinoma, sometimes with immunotherapy. They may also be relevant in selected advanced bladder cancers, depending on tumour tests, previous treatment and current NICE criteria.",
      },
    ],
    sources: [
      {
        label: "NICE NG2: Bladder cancer",
        url: "https://www.nice.org.uk/guidance/ng2/chapter/Recommendations",
      },
      {
        label: "NICE NG256: Kidney cancer",
        url: "https://www.nice.org.uk/guidance/ng256",
      },
      {
        label: "NHS: Bladder cancer treatment",
        url: "https://www.nhs.uk/conditions/bladder-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Kidney cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/kidney-cancer/treatment/decisions",
      },
    ],
  },
  lung: {
    groupId: "lung",
    intro: "Lung cancer treatment differs substantially between non-small-cell and small-cell lung cancer. It depends on the exact type, stage and position, lung function and overall fitness, relevant molecular or immune-marker results, previous treatment and what matters to you. This page cannot identify which treatment, if any, is suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery may be considered for some early non-small-cell lung cancers when the cancer can be removed and lung function and general fitness support an operation. It is unusual for small-cell lung cancer but may be discussed for a small number of cancers found very early.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy may be used with curative intent for early non-small-cell lung cancer when surgery is not suitable, often using stereotactic ablative radiotherapy (SABR), or with chemotherapy for some locally advanced disease. It may also control symptoms or selected sites of spread.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be used before or after surgery, with radiotherapy, or for advanced non-small-cell lung cancer. It is a main part of treatment for most small-cell lung cancers, sometimes with radiotherapy or immunotherapy.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be used around surgery, after chemoradiotherapy, or with chemotherapy in selected lung cancers. Eligibility depends on the exact diagnosis, stage, biomarkers, health, previous treatment and current NICE criteria.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Targeted medicines are considered only when non-small-cell lung cancer has a relevant molecular change and the treatment setting meets current NICE criteria. Testing of the cancer guides this; targeted treatment is not a general option for every lung cancer.",
      },
    ],
    sources: [
      {
        label: "NICE NG122: Lung cancer",
        url: "https://www.nice.org.uk/guidance/ng122/chapter/Management",
      },
      {
        label: "NHS: Lung cancer treatment",
        url: "https://www.nhs.uk/conditions/lung-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Non-small-cell lung cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/lung-cancer/treatment/non-small-cell-lung-cancer",
      },
      {
        label: "Cancer Research UK: Small-cell lung cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/lung-cancer/treatment/small-cell-lung-cancer",
      },
    ],
  },
  "head-and-neck": {
    groupId: "head-and-neck",
    intro: "Head and neck is not one cancer: this group includes cancers of the mouth, throat, voice box, salivary glands, nose and sinuses. Treatment depends on the exact site and cell type, stage, test results, previous treatment, general health, likely effects on speech or swallowing and what matters to you. This page cannot show which, if any, approaches are suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery may be considered at several head-and-neck sites and can include removing lymph nodes or reconstructing the treated area. The balance between surgery and an organ-preserving approach depends on the exact site, stage, expected effect on function, general health and personal preferences.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy may be the main treatment for some cancers, used after surgery, or combined with chemotherapy for selected locally advanced disease. The cancer site and nearby structures strongly shape how it is planned.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy is often used with radiotherapy for selected locally advanced squamous cancers and may be used for recurrent or metastatic disease. It is not routine for every head-and-neck site or cell type.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy is an option in defined head-and-neck squamous-cell situations, including some locally advanced, recurrent or metastatic cancers. Biomarkers, stage, previous treatment and current NICE criteria determine whether it may be considered.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Targeted medicines have a limited, tumour-specific role in some locally advanced, recurrent or metastatic head-and-neck cancers. Whether one may be considered depends on the exact tumour type, previous treatment and wider treatment plan.",
      },
      {
        title: "Rehabilitation and supportive care",
        byOthers: true,
        body: "Speech and language therapy, dietetic, dental and sometimes reconstructive support can form part of care because treatment may affect speech, swallowing, eating, appearance or breathing. The specialists involved depend on the cancer site and treatment plan.",
      },
    ],
    sources: [
      {
        label: "NICE NG36: Head and neck cancer",
        url: "https://www.nice.org.uk/guidance/ng36/chapter/recommendations",
      },
      {
        label: "NHS: Mouth cancer treatment",
        url: "https://www.nhs.uk/conditions/mouth-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Head and neck cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/head-neck-cancer",
      },
      {
        label: "Cancer Research UK: Salivary gland cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/salivary-gland-cancer/treatment/decisions",
      },
    ],
  },
  gynaecological: {
    groupId: "gynaecological",
    intro: "Gynaecological cancer covers cancers that start in the ovary, womb, cervix, vulva or vagina, and they are not treated in the same way. Discussions depend on the exact site and cell type, stage and grade, test results, previous treatment, general health, possible effects on fertility or menopause, and what matters to you. This page cannot show which, if any, approaches may form part of your care.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery is a main treatment for many early gynaecological cancers, but the operation differs greatly according to where the cancer started and how far it has grown. It is carried out by a specialist gynaecological cancer surgeon.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be used before or after surgery, with radiotherapy, or to treat cancer that is advanced or has returned. Its role differs substantially between ovarian, womb, cervical, vulval and vaginal cancers.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy, chemoradiotherapy and brachytherapy",
        body: "External radiotherapy may be the main treatment, follow surgery, or help control symptoms, depending on the cancer site and stage. Some cervical or womb cancers also involve internal radiotherapy (brachytherapy), and chemotherapy is sometimes given at the same time.",
      },
      {
        therapy: "hormone-therapy",
        title: "Hormone therapy",
        body: "Hormone treatment is used only for some hormone-sensitive ovarian or womb cancers, often in particular advanced, recurrent or lower-grade situations. The cancer type, test results and wider clinical picture determine whether it may be discussed.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Some ovarian or womb cancers have features that can be treated with targeted medicines, most often in advanced disease or as maintenance or later treatment. The option depends on the exact cancer type, molecular test results and treatment already given.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be considered for selected advanced or recurrent womb or cervical cancers. It is not a general treatment for all gynaecological cancers and depends on the diagnosis, test results and previous treatment.",
      },
    ],
    sources: [
      {
        label: "Cancer Research UK: Gynaecological cancers",
        url: "https://www.cancerresearchuk.org/about-cancer/womens-cancer",
      },
      {
        label: "NHS: Ovarian cancer treatment",
        url: "https://www.nhs.uk/conditions/ovarian-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Womb cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/womb-cancer/treatment/decisions-about-treatment",
      },
      {
        label: "NHS: Cervical cancer treatment",
        url: "https://www.nhs.uk/conditions/cervical-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Vulval cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/vulval-cancer/treatment",
      },
      {
        label: "Cancer Research UK: Vaginal cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/vaginal-cancer/treatment/treatment-decisions",
      },
    ],
  },
  "brain-and-spinal": {
    groupId: "brain-and-spinal",
    intro: "Primary brain or spinal cord tumours and cancers that have spread to the brain from elsewhere are different diseases. Discussions depend on tumour type, grade and molecular results; its site, size and number; symptoms and neurological function; previous treatment, general health and preferences; and, for brain metastases, the original cancer and disease elsewhere. This page cannot identify what may be appropriate for you.",
    approaches: [
      {
        title: "Neurosurgery and biopsy",
        byOthers: true,
        body: "Neurosurgery may obtain a biopsy, remove all or part of a primary tumour, or treat a small number of brain metastases. Whether it can be considered depends particularly on location, size, symptoms, overall health and the cancer elsewhere.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy, including stereotactic treatment",
        body: "Radiotherapy may be given after surgery, instead of surgery, or to control growth or symptoms. It can range from targeted stereotactic treatment to radiotherapy over a wider area; despite its name, stereotactic radiosurgery is a form of radiotherapy.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy is used for some primary brain tumours, sometimes with radiotherapy or after surgery, and may be considered if a tumour returns. Tumour type and molecular results are important, and chemotherapy is not used for every brain or spinal cord tumour.",
      },
      {
        title: "Medicines for cancer that has spread to the brain",
        body: "When cancer has spread to the brain, medicine treatment is selected according to the cancer it came from and its molecular features rather than the brain location alone. It may involve chemotherapy, hormone therapy, targeted medicines or immunotherapy, depending on that original cancer.",
      },
      {
        title: "Monitoring and symptom support",
        byOthers: true,
        body: "Some small, slow-growing primary tumours may be monitored with regular scans rather than treated straight away. Medicines can help manage swelling, seizures, pain or other symptoms, alongside rehabilitation and supportive care where needed.",
      },
    ],
    sources: [
      {
        label: "NICE NG99: Brain tumours and brain metastases",
        url: "https://www.nice.org.uk/guidance/ng99/chapter/recommendations",
      },
      {
        label: "NHS: Malignant brain tumour treatment",
        url: "https://www.nhs.uk/conditions/malignant-brain-tumour/treatment/",
      },
      {
        label: "Cancer Research UK: Brain tumour treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/brain-tumours/treatment/treatment-decisions",
      },
      {
        label: "Cancer Research UK: Secondary brain cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/secondary-cancer/secondary-brain-cancer/treatment",
      },
      {
        label: "Cancer Research UK: Primary spinal cord tumours",
        url: "https://www.cancerresearchuk.org/about-cancer/brain-tumours/types/treatment-spinal-cord-tumours",
      },
    ],
  },
  "upper-gi": {
    groupId: "upper-gi",
    intro: "Cancers of the oesophagus, the junction with the stomach and the stomach are grouped together, but treatment differs by exact site and cell type. Discussions depend on stage and whether the cancer can be removed, molecular test results, previous treatment, nutrition, general health and fitness, and personal preferences. This page cannot show what may form part of your care.",
    approaches: [
      {
        title: "Endoscopic treatment and surgery",
        byOthers: true,
        body: "Some very early cancers can be removed through an endoscope. Other cancers that have not spread may be treated with an operation to remove part or all of the oesophagus or stomach and nearby lymph nodes, carried out by a specialist upper gastrointestinal surgeon.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be given before or after surgery, with radiotherapy, or as the main medicine treatment when surgery is not planned or cancer has spread. Its timing and combination differ between oesophageal, junctional and stomach cancers.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy and chemoradiotherapy",
        body: "For some oesophageal and junctional cancers, chemoradiotherapy may be given before surgery or as the main treatment. Radiotherapy is used less often as a primary treatment for stomach cancer, but it may be combined with chemotherapy or used to control symptoms.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Tests on the cancer can identify features that make a targeted medicine relevant for some advanced oesophageal, junctional or stomach cancers. These medicines are often combined with chemotherapy, and the choice depends on test results and previous treatment.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be part of treatment for selected oesophageal, junctional or stomach cancers, particularly in advanced disease or after earlier treatment. The exact diagnosis, molecular test results and treatment history determine whether it may be discussed.",
      },
      {
        title: "Swallowing, nutrition and symptom support",
        byOthers: true,
        body: "These cancers can affect swallowing, eating and weight. Specialist teams may use dietary support and, when needed, a stent or another procedure to relieve a blockage and support nutrition or ease symptoms.",
      },
    ],
    sources: [
      {
        label: "NICE NG83: Oesophago-gastric cancer",
        url: "https://www.nice.org.uk/guidance/ng83/",
      },
      {
        label: "Cancer Research UK: Oesophageal cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/oesophageal-cancer/treatment/decisions-about-your-treatment",
      },
      {
        label: "Cancer Research UK: Stomach cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/stomach-cancer/treatment",
      },
    ],
  },
  "liver-and-pancreatic": {
    groupId: "liver-and-pancreatic",
    intro: "This group brings together primary liver cancer, exocrine pancreatic cancer and bile-duct cancer, which do not share one treatment pathway. A cancer found in the liver may instead have spread from another organ and would follow the pathway for the cancer where it started; pancreatic neuroendocrine tumours also need a different pathway. Treatment depends on the exact starting point and type, whether it can be removed, spread, liver function where relevant, molecular tests, previous treatment, general health and what matters to you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery may be considered when a primary liver, pancreatic or bile-duct cancer can be completely removed and the person is fit enough for a major operation. The operation depends on where the cancer started and is carried out by a specialist liver or pancreatic surgeon; liver transplant is considered only in particular circumstances.",
      },
      {
        title: "Liver-directed treatments",
        byOthers: true,
        body: "For some primary liver cancers, a specialist team may discuss treatment that destroys a tumour with heat, blocks its blood supply or delivers radiation through its blood vessels. These approaches depend on tumour number, size and position, liver function and the wider plan; they are not general treatments for pancreatic cancer.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be used before or after surgery, or when surgery is not possible, for some pancreatic and bile-duct cancers. Its role differs between these cancers and depends on stage, previous treatment, general health and how the cancer responds.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy and chemoradiotherapy",
        body: "External radiotherapy may be considered for some primary liver cancers or locally advanced pancreatic cancers. For bile-duct cancer it is less common and may sometimes be used to control symptoms; its purpose and timing depend on the exact cancer and wider plan.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Targeted medicines may be an option for some primary liver cancers, advanced bile-duct cancers and a small number of pancreatic cancers. Relevance depends on cancer type, molecular test results where applicable, previous treatment and the wider clinical picture.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may form part of treatment for some advanced primary liver or bile-duct cancers, and for a small number of pancreatic cancers with particular molecular features. It is not suitable for every cancer represented by this group.",
      },
    ],
    sources: [
      {
        label: "NICE NG85: Pancreatic cancer",
        url: "https://www.nice.org.uk/guidance/ng85",
      },
      {
        label: "Cancer Research UK: Primary liver cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/liver-cancer/treatment/treatment-options",
      },
      {
        label: "Cancer Research UK: Pancreatic cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/pancreatic-cancer/treatment/treatment-decisions",
      },
      {
        label: "Cancer Research UK: Bile-duct cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/bile-duct-cancer/treatment/treatment-options",
      },
    ],
  },
  "skin-and-melanoma": {
    groupId: "skin-and-melanoma",
    intro: "This group includes melanoma and non-melanoma skin cancers, most commonly basal cell carcinoma (BCC) and squamous cell carcinoma (SCC). They behave differently, and treatment depends on the exact type, depth or thickness, position, stage and spread, previous treatment, relevant tumour tests, general health and your preferences. This page cannot show which, if any, approaches are suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery is the main treatment for most early melanomas, BCCs and SCCs. The operation may range from a straightforward excision to a more specialist technique, depending on the type, position, depth and risk of the cancer.",
      },
      {
        title: "Other local skin treatments",
        byOthers: true,
        body: "Selected superficial or lower-risk skin cancers may be treated with a prescribed cream, curettage and cautery, freezing or photodynamic therapy instead of an operation. These options are not suitable for every BCC or SCC, and their use for melanoma is much more limited.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy may be considered for some BCCs or SCCs when surgery is unsuitable, or after surgery in selected higher-risk situations. It is not a common melanoma treatment, although it may sometimes be used when melanoma cannot be removed or to control symptoms after it has spread.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted therapy",
        body: "Targeted medicines may be considered for melanoma with particular gene changes and for a small number of advanced non-melanoma skin cancers. Tumour testing, previous treatment and stage help determine whether this may be relevant.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Systemic immunotherapy may be an option for selected melanomas that have spread or cannot be removed, and for some advanced SCCs. A topical immune treatment used for certain superficial skin lesions is different, so the specialist team should explain which meaning applies.",
      },
    ],
    sources: [
      {
        label: "NICE NG14: Melanoma",
        url: "https://www.nice.org.uk/guidance/ng14",
      },
      {
        label: "Cancer Research UK: Melanoma treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/melanoma/treatment/treatment-decisions",
      },
      {
        label: "Cancer Research UK: Non-melanoma skin cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/skin-cancer/treatment",
      },
      {
        label: "NHS: Melanoma treatment",
        url: "https://www.nhs.uk/conditions/melanoma-skin-cancer/treatment-for-melanoma-skin-cancer/",
      },
    ],
  },
  testicular: {
    groupId: "testicular",
    intro: "Treatment for testicular cancer depends particularly on whether it is a seminoma or non-seminoma, its stage, tumour-marker results, whether it has spread, previous treatment, general health and what matters to you. Fertility and sperm storage should be discussed before treatment where relevant. This page cannot show which, if any, approaches are suitable for you.",
    approaches: [
      {
        title: "Surgery",
        byOthers: true,
        body: "Surgery to remove the affected testicle is usually the first treatment and also allows the cancer type to be confirmed. In selected circumstances, further surgery may be considered for lymph nodes or cancer remaining after chemotherapy.",
      },
      {
        title: "Surveillance after surgery",
        byOthers: true,
        body: "Some stage 1 testicular cancers do not need immediate additional treatment after surgery. Planned surveillance uses regular appointments, blood tests and scans; whether it is appropriate depends on the cancer type and estimated risk of it returning.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy may be offered after surgery to reduce the risk of the cancer returning, or to treat cancer that has spread or returned. The plan depends on whether it is a seminoma or non-seminoma, stage, tumour markers, response and general health.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy is used only in particular seminoma situations, most often when cancer involves lymph nodes at the back of the abdomen or when chemotherapy is unsuitable. It is not a standard treatment for non-seminoma testicular cancer.",
      },
    ],
    sources: [
      {
        label: "NHS: Testicular cancer treatment",
        url: "https://www.nhs.uk/conditions/testicular-cancer/treatment/",
      },
      {
        label: "Cancer Research UK: Testicular cancer treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/testicular-cancer/treatment",
      },
      {
        label: "Cancer Research UK: Testicular radiotherapy",
        url: "https://www.cancerresearchuk.org/about-cancer/testicular-cancer/treatment/radiotherapy-treatment",
      },
    ],
  },
  lymphoma: {
    groupId: "lymphoma",
    intro: "Lymphoma includes many different diseases. Hodgkin and non-Hodgkin lymphoma follow different pathways, and treatment also varies between individual subtypes and between slow- and fast-growing lymphomas. Decisions depend on the exact diagnosis, stage, symptoms, test results, previous treatment, age, general health and what matters to you.",
    approaches: [
      {
        title: "Active monitoring",
        byOthers: true,
        body: "Some slow-growing lymphomas may be monitored before treatment if they are not causing problems. This is a planned approach led by a specialist lymphoma team, with appointments and tests; treatment is reconsidered if the lymphoma or symptoms change.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy",
        body: "Chemotherapy is central to treatment for many Hodgkin and non-Hodgkin lymphomas. It may be given alone or with steroids, targeted medicines or radiotherapy, and its intensity varies substantially according to subtype, stage, test results and general health.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted medicines",
        body: "Targeted medicines may be given with chemotherapy, on their own, or as later or maintenance treatment, depending on lymphoma subtype. Some antibody treatments may also be described as immunotherapy, so the specialist team should explain how the terms apply.",
      },
      {
        therapy: "immunotherapy",
        title: "Immunotherapy",
        body: "Immunotherapy may be considered for selected Hodgkin or non-Hodgkin lymphomas, often when lymphoma has returned or has not responded to earlier treatment. Whether it is relevant depends on the exact subtype and previous treatment.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy",
        body: "Radiotherapy treats a defined area. It may be used alone for some localised, slow-growing lymphomas, after or alongside chemotherapy, or to control symptoms, depending on subtype, the areas involved and response to other treatment.",
      },
      {
        title: "Stem-cell transplant or CAR-T therapy",
        byOthers: true,
        body: "High-dose treatment followed by a stem-cell transplant, or CAR-T cell therapy, may be considered for selected lymphomas that have returned or have not responded. These are specialist treatments available only for particular subtypes and circumstances.",
      },
    ],
    sources: [
      {
        label: "NICE NG52: Non-Hodgkin lymphoma",
        url: "https://www.nice.org.uk/guidance/ng52/chapter/Recommendations",
      },
      {
        label: "NHS: Hodgkin lymphoma treatment",
        url: "https://www.nhs.uk/conditions/hodgkin-lymphoma/treatment/",
      },
      {
        label: "NHS: Non-Hodgkin lymphoma treatment",
        url: "https://www.nhs.uk/conditions/non-hodgkin-lymphoma/treatment/",
      },
      {
        label: "Cancer Research UK: Hodgkin lymphoma treatment",
        url: "https://www.cancerresearchuk.org/about-cancer/hodgkin-lymphoma/treatment/treatment-decisions",
      },
    ],
  },
  sarcoma: {
    groupId: "sarcoma",
    intro: "Sarcoma includes many cancers arising in bone or soft tissues such as muscle and fat. Primary bone cancers and soft-tissue sarcomas do not share one treatment pathway. No Berkshire Oncology partner currently lists sarcoma, so an appropriate specialist sarcoma multidisciplinary team must confirm any plan; please contact the practice for help finding the right service.",
    approaches: [
      {
        title: "Surgery through a specialist sarcoma service",
        byOthers: true,
        body: "Surgery is the main treatment for many localised bone and soft-tissue sarcomas. The operation depends on site and subtype and should be planned through a specialist sarcoma team, with the aim of removing the cancer while preserving function where possible.",
      },
      {
        therapy: "chemotherapy",
        title: "Chemotherapy through a specialist sarcoma service",
        byOthers: true,
        body: "Chemotherapy is important for some primary bone cancers but is not routinely used for every soft-tissue sarcoma. It may be considered before or after surgery, or for cancer that has spread, according to the exact subtype and individual circumstances.",
      },
      {
        therapy: "radiotherapy",
        title: "Radiotherapy through a specialist sarcoma service",
        byOthers: true,
        body: "Radiotherapy may be used before or after surgery for some soft-tissue sarcomas and is important in particular bone-sarcoma pathways. It may also be considered when surgery is not possible or to control symptoms, but its role varies considerably by subtype.",
      },
      {
        therapy: "targeted-therapies",
        title: "Targeted medicines through a specialist sarcoma service",
        byOthers: true,
        body: "A targeted medicine may be an option for selected sarcoma subtypes or advanced disease. Relevance depends on the exact pathological diagnosis, molecular test results where applicable, previous treatment and specialist sarcoma assessment.",
      },
    ],
    sources: [
      {
        label: "NICE QS78: Sarcoma",
        url: "https://www.nice.org.uk/guidance/qs78",
      },
      {
        label: "NHS: Soft-tissue sarcoma treatment",
        url: "https://www.nhs.uk/conditions/soft-tissue-sarcoma/treatment/",
      },
      {
        label: "Cancer Research UK: Soft-tissue sarcoma",
        url: "https://www.cancerresearchuk.org/about-cancer/soft-tissue-sarcoma/treatment",
      },
      {
        label: "Cancer Research UK: Primary bone cancer",
        url: "https://www.cancerresearchuk.org/about-cancer/bone-cancer/treatment/treatment-options-for-bone-cancer",
      },
    ],
  },
};
