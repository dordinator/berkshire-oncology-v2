import type { Speciality } from "./types";

// The 17 cancer types the partnership treats. (Sarcoma is excluded — its only
// listed consultant is not among the current ten partners.) Slugs match the old
// /specialities/*.htm filenames so 301 redirects map cleanly and keep SEO equity.
export const specialities: Speciality[] = [
  { slug: "bladder", name: "Bladder", title: "Bladder Cancer" },
  { slug: "brain", name: "Brain", title: "Brain Cancer" },
  { slug: "breast", name: "Breast", title: "Breast Cancer" },
  {
    slug: "cancer-unknown-primary",
    name: "Cancer of Unknown Primary",
    title: "Cancer of Unknown Primary (CUP)",
  },
  { slug: "colorectal", name: "Colorectal", title: "Bowel (Colorectal) Cancer" },
  { slug: "gynaecology", name: "Gynaecological", title: "Gynaecological Cancer" },
  { slug: "head-and-neck", name: "Head & Neck", title: "Head and Neck Cancer" },
  { slug: "kidney", name: "Kidney", title: "Kidney (Renal) Cancer" },
  { slug: "liver", name: "Liver", title: "Liver Cancer" },
  { slug: "lung", name: "Lung", title: "Lung Cancer" },
  { slug: "lymphoma", name: "Lymphoma", title: "Lymphoma" },
  { slug: "oesophagus", name: "Oesophageal", title: "Oesophageal Cancer" },
  { slug: "pancreas", name: "Pancreatic", title: "Pancreatic Cancer" },
  { slug: "prostate", name: "Prostate", title: "Prostate Cancer" },
  { slug: "skin", name: "Skin", title: "Skin Cancer" },
  { slug: "stomach", name: "Stomach", title: "Stomach (Gastric) Cancer" },
  { slug: "testicular", name: "Testicular", title: "Testicular Cancer" },
  { slug: "sarcoma", name: "Sarcoma", title: "Sarcoma" },
];
