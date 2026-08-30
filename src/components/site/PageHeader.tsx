import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import Breadcrumbs from "./Breadcrumbs";

// Shared interior-page header: pastel mesh band with top padding to clear the
// fixed navbar, an optional breadcrumb + eyebrow, the page H1, and an intro.
export default function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden mesh-bg noise pt-32 md:pt-40">
      <div className="container-wide pb-14 md:pb-20">
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-8 bg-ink-muted" /> {eyebrow}
            </span>
          </Reveal>
        )}
        <Reveal delay={1}>
          <h1 className="type-page-hero mt-5 max-w-4xl">{title}</h1>
        </Reveal>
        {intro && (
          <Reveal delay={2}>
            <p className="body-lg mt-6 max-w-2xl">{intro}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={3}>
            <div className="mt-8">{children}</div>
          </Reveal>
        )}
      </div>
    </header>
  );
}
