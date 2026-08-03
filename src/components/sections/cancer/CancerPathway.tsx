"use client";

import CancerGraphic from "@/components/graphic/CancerGraphic";
import {
  GraphicModeProvider,
  GraphicModeToggle,
} from "@/components/graphic/GraphicMode";
import type { CareMapData } from "@/components/graphic/CareMap";

// The pathway band on a cancer page: the same map the hub uses, but built from
// this cancer's own consultants, treatments and sites. Self-contained (it owns
// the provider) so a server page can drop it in without becoming a client
// component itself.

export default function CancerPathway({
  data,
  note,
}: {
  data: CareMapData;
  note?: string;
}) {
  return (
    <GraphicModeProvider>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <span className="eyebrow">
            <span className="h-px w-8 bg-ink-muted" /> How care is joined up
          </span>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/80 md:text-base">
            {note ??
              "Who you would see, what they may use to treat it, and where that treatment actually takes place."}
          </p>
        </div>
        <GraphicModeToggle />
      </div>

      <CancerGraphic data={data} className="mt-8 md:mt-10" />
    </GraphicModeProvider>
  );
}
