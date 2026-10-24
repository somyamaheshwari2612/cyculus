import { describe, it, expect } from 'vitest';
import { computePrediction } from '../computePrediction';
import type { CycleSummary, AlgorithmConfig } from '@/shared/types';

const defaultConfig: AlgorithmConfig = {
  minBleedingGapDays: 2,
  minCycleLengthDays: 15,
  bleedingFlowLevels: ['light', 'medium', 'heavy'],
  predictionWindowBaselineCycles: 3,
  coverageFactorSD: 1.28,
};

function cycle(startDate: string, lengthDays: number | null, bleedingDays: number = 5): CycleSummary {
  return {
    startDate,
    endDate: lengthDays !== null ? 'computed' : null,
    lengthDays,
    bleedingDays,
    heavyDays: 1,
    maxPain: 5,
  };
}

describe('computePrediction', () => {
  it('returns null with no cycles', () => {
    expect(computePrediction([], defaultConfig, '2026-10-01')).toBeNull();
  });

  it('returns null with only unfinished cycles', () => {
    const cycles = [cycle('2026-09-01', null)];
    expect(computePrediction(cycles, defaultConfig, '2026-10-01')).toBeNull();
  });

  it('returns low confidence with one completed cycle, uses ±3 fallback window', () => {
    const cycles = [
      cycle('2026-09-01', 28),
      cycle('2026-09-29', null), // current
    ];
    const pred = computePrediction(cycles, defaultConfig, '2026-10-15');
    expect(pred).not.toBeNull();
    expect(pred!.confidence).toBe('low');
    expect(pred!.basedOnCycles).toBe(1);

    // Expected: Sep 29 + 28 = Oct 27
    expect(pred!.expected).toBe('2026-10-27');
    // Window: ±3 days (fallback since SD=0 with 1 cycle)
    expect(pred!.earliest).toBe('2026-10-24');
    expect(pred!.latest).toBe('2026-10-30');
  });

  it('returns medium confidence with two completed cycles', () => {
    const cycles = [
      cycle('2026-08-01', 28),
      cycle('2026-08-29', 30),
      cycle('2026-09-28', null),
    ];
    const pred = computePrediction(cycles, defaultConfig, '2026-10-15');
    expect(pred).not.toBeNull();
    expect(pred!.confidence).toBe('medium');
    expect(pred!.basedOnCycles).toBe(2);
  });

  it('returns high confidence with 3+ completed cycles', () => {
    const cycles = [
      cycle('2026-06-01', 28),
      cycle('2026-06-29', 30),
      cycle('2026-07-29', 29),
      cycle('2026-08-27', null),
    ];
    const pred = computePrediction(cycles, defaultConfig, '2026-10-01');
    expect(pred).not.toBeNull();
    expect(pred!.confidence).toBe('high');
    expect(pred!.basedOnCycles).toBe(3);
  });

  it('uses last N=3 cycles for prediction, not all cycles', () => {
    const cycles = [
      cycle('2026-03-01', 35), // old — should be ignored
      cycle('2026-04-05', 32), // old — should be ignored
      cycle('2026-05-07', 28),
      cycle('2026-06-04', 30),
      cycle('2026-07-04', 29),
      cycle('2026-08-02', null),
    ];
    const pred = computePrediction(cycles, defaultConfig, '2026-09-01');
    expect(pred!.basedOnCycles).toBe(3);
    // Mean of last 3: (28 + 30 + 29) / 3 = 29
    // Expected: Aug 2 + 29 = Aug 31
    expect(pred!.expected).toBe('2026-08-31');
  });

  it('window width scales with cycle variability', () => {
    // Low variability
    const regularCycles = [
      cycle('2026-06-01', 28),
      cycle('2026-06-29', 29),
      cycle('2026-07-28', 28),
      cycle('2026-08-25', null),
    ];
    const regularPred = computePrediction(regularCycles, defaultConfig, '2026-09-20');

    // High variability
    const irregularCycles = [
      cycle('2026-06-01', 24),
      cycle('2026-06-25', 38),
      cycle('2026-08-02', 27),
      cycle('2026-08-29', null),
    ];
    const irregularPred = computePrediction(irregularCycles, defaultConfig, '2026-09-30');

    // The irregular persona should have a wider window
    const regularWidth = dayDiff(regularPred!.earliest, regularPred!.latest);
    const irregularWidth = dayDiff(irregularPred!.earliest, irregularPred!.latest);
    expect(irregularWidth).toBeGreaterThan(regularWidth);
  });

  it('predicts from the last cycle start (including unfinished)', () => {
    const cycles = [
      cycle('2026-08-01', 30),
      cycle('2026-08-31', 28),
      cycle('2026-09-28', null), // current, unfinished
    ];
    const pred = computePrediction(cycles, defaultConfig, '2026-10-10');
    // Should predict from Sept 28 (last cycle start), not from any earlier date
    expect(pred!.expected >= '2026-10-25').toBe(true);
  });
});

function dayDiff(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}
