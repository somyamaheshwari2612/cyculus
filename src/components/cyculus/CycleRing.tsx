
/** Open-cycle ring: shows progress through the current cycle when a cycle day is known. */
export function CycleRing({ day, length }: { day: number | null; length: number | null }) {
  const L = length ?? 28;
  const r = 70;
  const c = 2 * Math.PI * r;
  const gap = 0.06;
  const prog = day ? Math.min(day / L, 1) * (1 - gap) : 0;
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-lavender"
          strokeDasharray={`${c * (1 - gap)} ${c}`}
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-700"
          strokeDasharray={`${c * prog} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {day ? (
          <>
            <span className="eyebrow">Cycle day</span>
            <span className="font-display text-5xl leading-none text-foreground">{day}</span>
            {length && <span className="mt-1 text-xs text-muted-foreground">of ~{length} (avg)</span>}
          </>
        ) : (
          <span className="max-w-[7.5rem] text-xs text-muted-foreground">Log a period day to begin your cycle view</span>
        )}
      </div>
    </div>
  );
}
