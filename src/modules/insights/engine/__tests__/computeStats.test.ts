import { describe, it, expect } from 'vitest';
import { computeStats } from '../computeStats';
import type { CycleSummary } from '@/shared/types';

function cycle(startDate: string, lengthDays: number | null, bleedingDays: number = 5, heavyDays: number = 1, maxPain: number | null = 5): CycleSummary {
  return {
    startDate,
    endDate: lengthDays !== null ? '2026-12-31' : null,
    lengthDays,
    bleedingDays,
    heavyDays,
    maxPain,
  };
}

describe('computeStats', () => {
  it('returns null for empty array', () => {
    expect(computeStats([])).toBeNull();
  });

  it('returns null when all cycles are unfinished', () => {
    const cycles = [cycle('2026-09-01', null)];
    expect(computeStats(cycles)).toBeNull();
  });

  it('computes stats for a single completed cycle', () => {
    const cycles = [cycle('2026-09-01', 28, 5)];
    const stats = computeStats(cycles);
    expect(stats).not.toBeNull();
    expect(stats!.cyclesUsed).toBe(1);
    expect(stats!.avgCycleLength).toBe(28);
    expect(stats!.cycleLengthSD).toBe(0);
    expect(stats!.shortest).toBe(28);
    expect(stats!.longest).toBe(28);
    expect(stats!.avgBleedingDays).toBe(5);
  });

  it('computes correct average and SD for multiple cycles', () => {
    const cycles = [
      cycle('2026-06-01', 28, 5),
      cycle('2026-07-01', 30, 4),
      cycle('2026-08-01', 26, 6),
    ];
    const stats = computeStats(cycles);
    expect(stats).not.toBeNull();
    expect(stats!.cyclesUsed).toBe(3);
    expect(stats!.avgCycleLength).toBe(28); // (28+30+26)/3 = 28
    // SD: sqrt(((0)^2 + (2)^2 + (-2)^2) / 3) = sqrt(8/3) ≈ 1.63
    expect(stats!.cycleLengthSD).toBeCloseTo(1.63, 1);
    expect(stats!.shortest).toBe(26);
    expect(stats!.longest).toBe(30);
    expect(stats!.avgBleedingDays).toBe(5); // (5+4+6)/3 = 5
  });

  it('excludes unfinished cycles from stats', () => {
    const cycles = [
      cycle('2026-06-01', 28, 5),
      cycle('2026-07-01', 30, 4),
      cycle('2026-08-01', null, 3), // unfinished
    ];
    const stats = computeStats(cycles);
    expect(stats!.cyclesUsed).toBe(2);
    expect(stats!.avgCycleLength).toBe(29); // (28+30)/2
  });

  it('handles irregular cycle lengths like Riya demo persona', () => {
    const cycles = [
      cycle('2026-05-05', 27, 5),
      cycle('2026-06-01', 36, 5),
      cycle('2026-07-07', 29, 4),
      cycle('2026-08-05', 41, 6),
    ];
    const stats = computeStats(cycles);
    expect(stats!.cyclesUsed).toBe(4);
    expect(stats!.avgCycleLength).toBeCloseTo(33.25, 1);
    expect(stats!.shortest).toBe(27);
    expect(stats!.longest).toBe(41);
    expect(stats!.cycleLengthSD).toBeGreaterThan(5); // high variability
  });
});
