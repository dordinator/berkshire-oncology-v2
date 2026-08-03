"use client";

import CareMap, { type CareMapData } from "./CareMap";
import ExpressiveNetwork from "./ExpressiveNetwork";
import QuietWave from "./QuietWave";
import { useGraphicMode } from "./GraphicMode";

// Dispatcher for the three graphic modes. Every mode has to leave the page
// usable on its own: quiet must not remove information, expressive must not
// bury it. So integrated and expressive show the same map — expressive simply
// sets it against the fuller illustration.

export default function CancerGraphic({
  data,
  className = "",
}: {
  data: CareMapData;
  className?: string;
}) {
  const { mode } = useGraphicMode();

  if (mode === "quiet") {
    return (
      <div className={className}>
        <QuietWave className="h-16 w-full md:h-20" />
      </div>
    );
  }

  if (mode === "expressive") {
    return (
      <div className={`relative isolate ${className}`}>
        <ExpressiveNetwork className="absolute inset-x-0 -top-10 -z-10 h-[calc(100%+5rem)] w-full opacity-90" />
        {/* keeps the map legible over the network without hiding it */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_50%,rgba(250,251,252,0.92),rgba(250,251,252,0.55)_60%,transparent)]"
        />
        <CareMap data={data} />
      </div>
    );
  }

  return (
    <div className={className}>
      <CareMap data={data} />
    </div>
  );
}
