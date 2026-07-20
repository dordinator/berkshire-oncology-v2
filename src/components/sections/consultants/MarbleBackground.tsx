/*
  MarbleBackground — a soft warm-ivory "marble" wash with faint gold veins.
  Purely decorative (aria-hidden), full-bleed. Used behind the consultants
  thread to fill the negative space. Static SVG, no client JS; covers its
  container via preserveAspectRatio slice.
*/

const GOLD = "#b98a2e";

export default function MarbleBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* gold marble strands on a plain white background */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke={GOLD} strokeLinecap="round" fill="none">
          <path
            d="M -40 180 C 220 130, 420 260, 700 200 C 940 150, 1080 210, 1260 170"
            strokeOpacity="0.24"
            strokeWidth="2.1"
          />
          <path
            d="M -40 60 C 260 200, 480 120, 760 300 C 1000 450, 1140 380, 1260 480"
            strokeOpacity="0.18"
            strokeWidth="1.7"
          />
          <path
            d="M -40 760 C 220 690, 380 830, 640 780 C 900 730, 1080 850, 1260 790"
            strokeOpacity="0.2"
            strokeWidth="1.9"
          />
          <path
            d="M 180 -40 C 120 240, 240 470, 130 760 C 70 900, 190 1000, 120 1240"
            strokeOpacity="0.15"
            strokeWidth="1.5"
          />
          <path
            d="M 1080 -40 C 1150 260, 1010 470, 1120 720 C 1180 860, 1060 960, 1140 1240"
            strokeOpacity="0.15"
            strokeWidth="1.4"
          />
          <path
            d="M 760 300 C 720 340, 716 384, 738 420"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
          <path
            d="M 700 200 C 726 234, 724 274, 746 306"
            strokeOpacity="0.13"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}
