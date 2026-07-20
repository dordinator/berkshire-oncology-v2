import type { ReactNode } from "react";

// Readable long-form container for tariffs / policy copy. Styling lives in the
// `.legal-prose` class (globals.css) so nested h2/h3/p/ul/a are handled.
export default function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`legal-prose ${className}`}>{children}</div>;
}
