import Link from "next/link";
import Image from "next/image";
import type { Consultant } from "@/content/types";
import { getSpecialitiesForConsultant } from "@/content/queries";

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ConsultantCard({
  consultant,
}: {
  consultant: Consultant;
}) {
  const pills = getSpecialitiesForConsultant(consultant.slug)
    .slice(0, 3)
    .map((x) => x.speciality.name);

  return (
    <Link
      href={`/consultants/${consultant.slug}`}
      className="group card-soft flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-accent/10 to-accent-glow/20">
        {consultant.photo ? (
          <Image
            src={consultant.photo}
            alt={`${consultant.name}, ${consultant.shortRole ?? consultant.role}, Reading`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl text-accent/60">
              {initials(consultant.name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="type-compact-title text-ink">{consultant.name}</h3>
        <p className="type-supporting mt-1 text-ink-muted">{consultant.role}</p>
        {pills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {pills.map((p) => (
              <span
                key={p}
                className="type-supporting rounded-full border border-ink/[0.06] bg-canvas-soft px-2.5 py-1 leading-none text-ink-muted"
              >
                {p}
              </span>
            ))}
          </div>
        )}
        <span className="type-button mt-5 inline-flex items-center gap-1.5 text-accent">
          View profile
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
