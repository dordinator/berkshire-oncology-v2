// Keyless Google Maps embed centred on the practice. No API key/billing needed.
export default function MapEmbed({
  lat,
  lng,
  label,
  zoom = 15,
  className = "",
}: {
  lat: number;
  lng: number;
  label: string;
  zoom?: number;
  className?: string;
}) {
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  return (
    <iframe
      title={`Map showing ${label}`}
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`h-full w-full border-0 ${className}`}
    />
  );
}
