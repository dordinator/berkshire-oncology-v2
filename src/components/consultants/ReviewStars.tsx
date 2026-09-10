const STAR = "m12 2 3 6.3 7 .9-5.1 4.9 1.3 6.9-6.2-3.3L5.8 21l1.3-6.9L2 9.2l7-.9L12 2Z";

export default function ReviewStars({ rating = 0 }: { rating?: number }) {
  return <>{Array.from({ length: 5 }, (_, index) => {
    const filled = Math.max(0, Math.min(1, rating - index)) * 100;
    return (
      <svg key={index} aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d={STAR} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        {filled > 0 && <path d={STAR} fill="currentColor" style={{ clipPath: `inset(0 ${100 - filled}% 0 0)` }} />}
      </svg>
    );
  })}</>;
}
