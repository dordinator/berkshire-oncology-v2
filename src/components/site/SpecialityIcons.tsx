import type { SVGProps } from "react";

// Simple, consistent line icons for each cancer type. Always shown above a text
// label, so they read as medical/organ glyphs without needing to be literal.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

const IconBladder = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 10C7 7.8 17 7.8 17 10C17 14 15.8 18 12 18C8.2 18 7 14 7 10Z" />
    <path d="M9.6 8.6 8.6 5M14.4 8.6 15.4 5M12 18V21" />
  </svg>
);
const IconBrain = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5.5C10.3 5.5 9 6.8 9 8.3 7.6 8.3 6.6 9.6 7 11 6.1 11.9 6.2 13.7 7.6 14.3 7.7 15.7 9 16.6 10.4 16.2 10.9 17.1 13.1 17.1 13.6 16.2 15 16.6 16.3 15.7 16.4 14.3 17.8 13.7 17.9 11.9 17 11 17.4 9.6 16.4 8.3 15 8.3 15 6.8 13.7 5.5 12 5.5Z" />
    <path d="M12 5.5V16.6" />
  </svg>
);
const IconBreast = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    <path d="M12 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    <path d="M8 12h.01M16 12h.01" />
  </svg>
);
const IconCup = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.3a2.6 2.6 0 1 1 3 2.7v1.5" />
    <path d="M12.4 17h.01" />
  </svg>
);
const IconColorectal = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8.5 4C11 4 11 8 8.5 8 6 8 6 12 8.5 12 11 12 11 16 8.5 16" />
    <path d="M8.5 4H14a5 5 0 0 1 0 10 3 3 0 0 0 0 6H8.5" />
  </svg>
);
const IconGynae = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="5" />
    <path d="M12 13v8M8.5 17.5h7" />
  </svg>
);
const IconHeadNeck = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8.6 10.2 8 14.5A4.2 4.2 0 0 0 12 20a4.2 4.2 0 0 0 4-5.5l-.6-4.3" />
  </svg>
);
const IconKidney = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.5 6C6.9 6 6 9.1 6 12s.9 6 4.5 6c1.6 0 1.4-2.4.9-4-.5-1.5-.5-2.5 0-4C11.9 8.4 12.1 6 10.5 6Z" />
    <path d="M13.5 6C17.1 6 18 9.1 18 12s-.9 6-4.5 6c-1.6 0-1.4-2.4-.9-4 .5-1.5.5-2.5 0-4C12.1 8.4 11.9 6 13.5 6Z" />
  </svg>
);
const IconLiver = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8.5C9 6.5 16 6.5 20 8.5c0 0-1 7-8 7.5C6.5 16 4 12.5 4 8.5Z" />
    <path d="M9 8.8V12" />
  </svg>
);
const IconLung = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v7M10 4h4" />
    <path d="M12 8.5C10.5 6.5 7 6.5 6 9.5c-1 3-1 8 1 9 1.8.9 3-.9 3-3l2-4.5" />
    <path d="M12 8.5c1.5-2 5-2 6 1 1 3 1 8-1 9-1.8.9-3-.9-3-3L12 11" />
  </svg>
);
const IconLymphoma = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9.5 13 7 21M14.5 13 17 21" />
    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
  </svg>
);
const IconOesophagus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9.5 3v8c0 3-.5 6-.5 10M14.5 3v8c0 3 .5 6 .5 10" />
    <path d="M9 3h6M8.6 12h6.8" />
  </svg>
);
const IconPancreas = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.5 11.5C7 9 12 9 16 10c3 .8 3.5 3.5 1.5 4-2 .5-3.5-1-6.5-1s-5 1.5-6 .5C4 12.4 3.5 12 4.5 11.5Z" />
    <path d="M7.5 11h.01" />
  </svg>
);
const IconProstate = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="14" r="5" />
    <path d="M12 9V5M10 5h4M12 19v3" />
  </svg>
);
const IconSkin = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 8.5C7 6.5 17 6.5 21 8.5" />
    <path d="M3 11C7 9 17 9 21 11" />
    <path d="M6 14h.01M10 15h.01M14 14h.01M18 15h.01M5 18h.01M9 19h.01M13 18h.01M17 19h.01" />
  </svg>
);
const IconStomach = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 4c-4 0-7 2.5-7 6.5S10.5 18 14.5 18c3 0 4-3 1.8-4.6" />
    <path d="M15 4c1.8 0 3 1.2 3 3M8.2 11 5 12.2" />
  </svg>
);
const IconTesticular = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v6" />
    <path d="M10.2 9C8.2 9 7 11 7 13.5S8.4 18 10.5 18 13 16 12.8 13.5 12.2 9 10.2 9Z" />
    <path d="M13.8 9C15.8 9 17 11 17 13.5S15.6 18 13.5 18 11 16 11.2 13.5 11.8 9 13.8 9Z" />
  </svg>
);
const IconSarcoma = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 12h8" />
    <circle cx="7" cy="10.6" r="1.7" />
    <circle cx="7" cy="13.4" r="1.7" />
    <circle cx="17" cy="10.6" r="1.7" />
    <circle cx="17" cy="13.4" r="1.7" />
  </svg>
);

export const specialityIcon: Record<
  string,
  (props: IconProps) => JSX.Element
> = {
  bladder: IconBladder,
  brain: IconBrain,
  breast: IconBreast,
  "cancer-unknown-primary": IconCup,
  colorectal: IconColorectal,
  gynaecology: IconGynae,
  "head-and-neck": IconHeadNeck,
  kidney: IconKidney,
  liver: IconLiver,
  lung: IconLung,
  lymphoma: IconLymphoma,
  oesophagus: IconOesophagus,
  pancreas: IconPancreas,
  prostate: IconProstate,
  skin: IconSkin,
  stomach: IconStomach,
  testicular: IconTesticular,
  sarcoma: IconSarcoma,
};
