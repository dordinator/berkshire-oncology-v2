import type { ReactNode } from "react";
import { TreatmentModeProvider } from "@/components/treatments/TreatmentMode";

// The visual-density mode is scoped to this section, so the provider lives here
// rather than in the root layout. Nothing outside /treatments/* reads it.
export default function TreatmentsLayout({ children }: { children: ReactNode }) {
  return <TreatmentModeProvider>{children}</TreatmentModeProvider>;
}
