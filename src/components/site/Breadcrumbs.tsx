import Link from "next/link";

export default function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="transition-colors hover:text-ink">
                {it.name}
              </Link>
            ) : (
              <span className="text-ink" aria-current="page">
                {it.name}
              </span>
            )}
            {i < items.length - 1 && (
              <span aria-hidden className="text-ink-muted/50">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
