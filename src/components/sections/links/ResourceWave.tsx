export default function ResourceWave({ className = "" }: { className?: string }) {
  const strands = Array.from({ length: 19 }, (_, index) => {
    const offset = index - 9;
    const start = 116 + offset * 8.4;
    const firstControl = 82 + offset * 8.1;
    const firstEnd = 188 + offset * 3.2;
    const middle = 292 + offset * 2.1;
    const secondControl = 252 - offset * 4.1;
    const end = 118 - offset * 7.2;

    return {
      d: `M -30 ${start.toFixed(1)} C 150 ${firstControl.toFixed(1)}, 270 ${(firstControl + 24).toFixed(1)}, 430 ${firstEnd.toFixed(1)} S 700 ${middle.toFixed(1)}, 900 ${(middle - 48).toFixed(1)} S 1180 ${secondControl.toFixed(1)}, 1430 ${end.toFixed(1)}`,
      opacity: 0.08 + (1 - Math.abs(offset) / 10) * 0.18,
      width: index === 9 ? 1.45 : index % 3 === 0 ? 1.1 : 0.85,
    };
  });

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1400 360"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <g stroke="#a7bddb" strokeLinecap="round">
          {strands.map((strand, index) => (
            <path key={index} d={strand.d} strokeOpacity={strand.opacity} strokeWidth={strand.width} />
          ))}
        </g>
        <path
          d={strands[9].d}
          stroke="#1a4d8f"
          strokeOpacity=".78"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
