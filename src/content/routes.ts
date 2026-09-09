import cancerRoutes from "./cancerRoutes.json";

/** The consultant choice stays in a fragment, outside request URLs/referrers. */
export function consultantAppointmentHref(slug: string): string {
  return `/contact#consultation/${encodeURIComponent(slug)}`;
}

/** The same cancer selection reached from the homepage finder. */
export function cancerTypeHref(slug: string, section = "specialists"): string {
  const group = cancerRoutes[slug as keyof typeof cancerRoutes]
    ?? (Object.values(cancerRoutes).includes(slug) ? slug : undefined);
  return group
    ? `/specialities?type=${encodeURIComponent(group)}#${section}`
    : "/specialities#browse-all";
}
