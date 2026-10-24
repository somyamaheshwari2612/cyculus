import { describe, it, expect } from 'vitest';
import { deriveCycles } from '../deriveCycles';
import type { LogEntry, AlgorithmConfig } from '@/shared/types';

const defaultConfig: AlgorithmConfig = {
  minBleedingGapDays: 2,
  minCycleLengthDays: 15,
  bleedingFlowLevels: ['light', 'medium', 'heavy'],
  predictionWindowBaselineCycles: 3,
  coverageFactorSD: 1.28,
};

/** Helper: create a minimal LogEntry for a given date and flow */
function entry(date: string, flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | null = null, painLevel: number | null = null): LogEntry {
  return {
    date,
    flow,
    painLevel,
    symptoms: [],
    moods: [],
    notes: '',
    sources: ['tap'],
    rawTexts: [],
    updatedAt: new Date().toISOString(),
  };
}

describe('deriveCycles', () => {
  it('returns empty array for no entries', () => {
    const result = deriveCycles([], defaultConfig, '2026-10-01');
    expect(result).toEqual([]);
  });

  it('returns empty array for entries with no bleeding', () => {
    const entries = [
      entry('2026-09-01', 'none'),
      entry('2026-09-02', 'spotting'),
      entry('2026-09-03', 'none'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toEqual([]);
  });

  it('detects a single bleeding episode as one cycle', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'heavy'),
      entry('2026-09-03', 'light'),
      entry('2026-09-04', 'none'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe('2026-09-01');
    expect(result[0].endDate).toBeNull(); // unfinished — no next cycle
    expect(result[0].lengthDays).toBeNull();
    expect(result[0].bleedingDays).toBe(3);
  });

  it('handles a 1-day gap within a bleeding episode', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'none'), // 1-day gap
      entry('2026-09-03', 'light'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toHaveLength(1);
    expect(result[0].bleedingDays).toBe(2); // only actual bleeding days counted
    expect(result[0].startDate).toBe('2026-09-01');
  });

  it('handles a 2-day gap within a bleeding episode (maxGap=2)', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'none'),
      entry('2026-09-03', 'none'), // 2-day gap
      entry('2026-09-04', 'light'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toHaveLength(1);
    expect(result[0].bleedingDays).toBe(2);
  });

  it('splits episodes when gap exceeds minBleedingGapDays', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'medium'),
      // gap of 10 days
      entry('2026-09-12', 'none'),
      entry('2026-09-20', 'medium'), // new episode, 19 days from first
      entry('2026-09-21', 'medium'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    // Two episodes, and 20 - 1 = 19 >= 15, so two cycles
    expect(result).toHaveLength(2);
    expect(result[0].startDate).toBe('2026-09-01');
    expect(result[0].lengthDays).toBe(19); // daysBetween Sept 1 and Sept 20
    expect(result[1].startDate).toBe('2026-09-20');
  });

  it('merges episodes that start < 15 days apart (avoids splitting one period)', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'medium'),
      // 8-day gap
      entry('2026-09-10', 'none'),
      entry('2026-09-11', 'medium'), // only 10 days from start — too close for new cycle
      entry('2026-09-12', 'medium'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    // Episodes at day 1-2 and day 11-12: gap > 2 so separate episodes
    // But cycle start difference = 10 < 15, so merged into one cycle
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe('2026-09-01');
  });

  it('correctly computes two completed cycles', () => {
    const entries = [
      // Cycle 1: Sep 1-5
      entry('2026-09-01', 'light'),
      entry('2026-09-02', 'medium'),
      entry('2026-09-03', 'heavy'),
      entry('2026-09-04', 'medium'),
      entry('2026-09-05', 'light'),
      // Non-bleeding days
      entry('2026-09-15', 'none'),
      // Cycle 2: Oct 1-4 (30 days later)
      entry('2026-10-01', 'medium'),
      entry('2026-10-02', 'heavy'),
      entry('2026-10-03', 'medium'),
      entry('2026-10-04', 'light'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-15');

    expect(result).toHaveLength(2);

    // First cycle: completed
    expect(result[0].startDate).toBe('2026-09-01');
    expect(result[0].lengthDays).toBe(30);
    expect(result[0].bleedingDays).toBe(5);
    expect(result[0].heavyDays).toBe(1);

    // Second cycle: unfinished
    expect(result[1].startDate).toBe('2026-10-01');
    expect(result[1].endDate).toBeNull();
    expect(result[1].lengthDays).toBeNull();
    expect(result[1].bleedingDays).toBe(4);
    expect(result[1].heavyDays).toBe(1);
  });

  it('counts heavy days correctly', () => {
    const entries = [
      entry('2026-09-01', 'heavy'),
      entry('2026-09-02', 'heavy'),
      entry('2026-09-03', 'heavy'),
      entry('2026-09-04', 'medium'),
      entry('2026-09-05', 'light'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result[0].heavyDays).toBe(3);
    expect(result[0].bleedingDays).toBe(5);
  });

  it('tracks max pain level', () => {
    const entries = [
      entry('2026-09-01', 'medium', 3),
      entry('2026-09-02', 'heavy', 8),
      entry('2026-09-03', 'medium', 5),
      entry('2026-09-04', 'none', 2),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result[0].maxPain).toBe(8);
  });

  it('returns null for maxPain when no pain is recorded', () => {
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'medium'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result[0].maxPain).toBeNull();
  });

  it('spotting alone does not start a cycle', () => {
    const entries = [
      entry('2026-09-01', 'spotting'),
      entry('2026-09-02', 'spotting'),
      entry('2026-09-03', 'none'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toHaveLength(0);
  });

  it('handles entries out of order (sorts them)', () => {
    const entries = [
      entry('2026-09-03', 'light'),
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'heavy'),
    ];
    const result = deriveCycles(entries, defaultConfig, '2026-10-01');
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe('2026-09-01');
    expect(result[0].bleedingDays).toBe(3);
  });
});
