import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

// No network request for the hidden layout, even before CSS or hydration.
const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

export default function MediaHeroImage({
  src, srcSet, sizes, media, alt, className, style,
}: {
  src: string;
  srcSet?: string;
  sizes: string;
  media: string;
  alt: string;
  className: string;
  style?: CSSProperties;
}) {
  const { props } = getImageProps({ src, alt, fill: true, sizes, unoptimized: Boolean(srcSet), className, style });
  return (
    <picture>
      <source media={media} srcSet={srcSet ?? props.srcSet} sizes={sizes} />
      {/* getImageProps preserves Next's existing fill geometry and optimisation.
          Fees can instead supply pre-generated candidates with the original at
          the top end. The fallback MUST NOT inherit a network srcSet. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...props} alt={alt} srcSet={undefined} sizes={undefined} src={EMPTY_IMAGE} loading="eager" {...{ fetchpriority: "high" }} />
    </picture>
  );
}
