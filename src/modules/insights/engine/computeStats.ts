import type { CycleSummary } from '@/shared/types';

export interface CycleStats {
  cyclesUsed: number;
  avgCycleLength: number;
  cycleLengthSD: number;
  shortest: number;
  longest: number;
  avgBleedingDays: number;
}

/**
 * Compute summary statistics from completed cycles.
 * Only cycles with a non-null lengthDays are included.
 * Returns null if there are no completed cycles.
 */
export function computeStats(cycles: CycleSummary[]): CycleStats | null {
  const completed = cycles.filter(
    (c): c is CycleSummary & { lengthDays: number } => c.lengthDays !== null
  );

  if (completed.length === 0) return null;

  const lengths = completed.map(c => c.lengthDays);
  const cyclesUsed = lengths.length;
  const avgCycleLength = mean(lengths);
  const cycleLengthSD = stdDev(lengths);
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);

  const bleedingDaysList = completed.map(c => c.bleedingDays);
  const avgBleedingDays = mean(bleedingDaysList);

  return {
    cyclesUsed,
    avgCycleLength: round2(avgCycleLength),
    cycleLengthSD: round2(cycleLengthSD),
    shortest,
    longest,
    avgBleedingDays: round2(avgBleedingDays),
  };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => (v - avg) ** 2);
  // Use population SD (N, not N-1), since these are the user's actual cycles, not a sample
  return Math.sqrt(mean(squaredDiffs));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
