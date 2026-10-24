import { describe, it, expect } from 'vitest';
import { evaluateFlags } from '../evaluateFlags';
import type { LogEntry, CycleSummary, KnowledgeRule, AlgorithmConfig } from '@/shared/types';

const defaultConfig: AlgorithmConfig = {
  minBleedingGapDays: 2,
  minCycleLengthDays: 15,
  bleedingFlowLevels: ['light', 'medium', 'heavy'],
  predictionWindowBaselineCycles: 3,
  coverageFactorSD: 1.28,
};

function entry(date: string, flow: 'none' | 'spotting' | 'light' | 'medium' | 'heavy' | null = null, painLevel: number | null = null, symptoms: string[] = []): LogEntry {
  return {
    date,
    flow,
    painLevel,
    symptoms: symptoms as LogEntry['symptoms'],
    moods: [],
    notes: '',
    sources: ['tap'],
    rawTexts: [],
    updatedAt: new Date().toISOString(),
  };
}

function cycle(startDate: string, lengthDays: number | null, bleedingDays: number = 5, heavyDays: number = 1, maxPain: number | null = 5): CycleSummary {
  return {
    startDate,
    endDate: lengthDays !== null ? 'computed' : null,
    lengthDays,
    bleedingDays,
    heavyDays,
    maxPain,
  };
}

// Minimal rules matching knowledge.json structure
const rules: KnowledgeRule[] = [
  {
    id: 'cycle_short',
    severity: 'discuss',
    params: { minCycleLength: 24 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'cycle_long',
    severity: 'discuss',
    params: { maxCycleLength: 38 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'cycle_variability_high',
    severity: 'discuss',
    params: { maxCycleLengthDiff: 9, minCycles: 3 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'period_long',
    severity: 'discuss',
    params: { maxBleedingDays: 8 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'heavy_flow_persistent',
    severity: 'soon',
    params: { consecutiveHeavyDays: 3, totalHeavyDaysInCycle: 4 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'pain_severe_recurring',
    severity: 'soon',
    params: { minPainLevel: 8, minCyclesWithSeverePain: 2 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'period_missed',
    severity: 'soon',
    params: { daysWithoutPeriod: 60 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  {
    id: 'spotting_between_periods',
    severity: 'discuss',
    params: { minSpottingDays: 2 },
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
  // Urgent rule — should NOT be evaluated by the engine
  {
    id: 'urgent_heavy_bleeding',
    severity: 'urgent',
    params: {},
    title: { en: '', hi: '' },
    explanation: { en: '', hi: '' },
    discussWithDoctor: { en: '', hi: '' },
    questionsForDoctor: { en: [], hi: [] },
    sources: [],
    status: 'verified',
  },
];

describe('evaluateFlags', () => {
  it('returns no flags for regular cycles', () => {
    const cycles = [
      cycle('2026-06-01', 28),
      cycle('2026-06-29', 30),
      cycle('2026-07-29', 29),
      cycle('2026-08-27', null),
    ];
    const entries: LogEntry[] = [];
    const flags = evaluateFlags(cycles, entries, rules, defaultConfig, '2026-09-10');

    // No flags should fire: all within normal ranges
    const shortFlag = flags.find(f => f.ruleId === 'cycle_short');
    const longFlag = flags.find(f => f.ruleId === 'cycle_long');
    const variabilityFlag = flags.find(f => f.ruleId === 'cycle_variability_high');
    expect(shortFlag).toBeUndefined();
    expect(longFlag).toBeUndefined();
    expect(variabilityFlag).toBeUndefined();
  });

  it('fires cycle_short when a cycle is below threshold', () => {
    const cycles = [
      cycle('2026-06-01', 22), // short!
      cycle('2026-06-23', 28),
      cycle('2026-07-21', null),
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-08-01');
    const flag = flags.find(f => f.ruleId === 'cycle_short');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('discuss');
    expect(flag!.evidence.cyclesBelow).toBe(1);
    expect(flag!.evidence.shortestCycle).toBe(22);
  });

  it('fires cycle_long when a cycle exceeds threshold', () => {
    const cycles = [
      cycle('2026-06-01', 28),
      cycle('2026-06-29', 41), // long!
      cycle('2026-08-09', null),
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-09-01');
    const flag = flags.find(f => f.ruleId === 'cycle_long');
    expect(flag).toBeDefined();
    expect(flag!.evidence.cyclesAbove).toBe(1);
    expect(flag!.evidence.longestCycle).toBe(41);
  });

  it('fires cycle_variability_high when range exceeds threshold', () => {
    const cycles = [
      cycle('2026-05-01', 24),
      cycle('2026-05-25', 38),
      cycle('2026-07-02', 27),
      cycle('2026-07-29', null),
    ];
    // Range: 38 - 24 = 14 > 9
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-08-20');
    const flag = flags.find(f => f.ruleId === 'cycle_variability_high');
    expect(flag).toBeDefined();
    expect(flag!.evidence.difference).toBe(14);
    expect(flag!.evidence.shortest).toBe(24);
    expect(flag!.evidence.longest).toBe(38);
  });

  it('does NOT fire variability with fewer than minCycles', () => {
    const cycles = [
      cycle('2026-06-01', 22),
      cycle('2026-06-23', 40),
      // only 2 completed — minCycles is 3
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-08-01');
    const flag = flags.find(f => f.ruleId === 'cycle_variability_high');
    expect(flag).toBeUndefined();
  });

  it('fires period_long when bleeding exceeds threshold', () => {
    const cycles = [
      cycle('2026-06-01', 28, 10), // 10 bleeding days > 8
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-07-01');
    const flag = flags.find(f => f.ruleId === 'period_long');
    expect(flag).toBeDefined();
    expect(flag!.evidence.maxBleedingDays).toBe(10);
  });

  it('fires pain_severe_recurring with enough cycles above pain threshold', () => {
    const cycles = [
      cycle('2026-06-01', 28, 5, 1, 9), // pain 9
      cycle('2026-06-29', 30, 5, 1, 8), // pain 8
      cycle('2026-07-29', null, 4, 1, 3), // pain 3
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-08-20');
    const flag = flags.find(f => f.ruleId === 'pain_severe_recurring');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('soon');
    expect(flag!.evidence.cyclesWithSeverePain).toBe(2);
  });

  it('does NOT fire pain_severe_recurring with only one painful cycle', () => {
    const cycles = [
      cycle('2026-06-01', 28, 5, 1, 9),
      cycle('2026-06-29', 30, 5, 1, 4),
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-08-01');
    const flag = flags.find(f => f.ruleId === 'pain_severe_recurring');
    expect(flag).toBeUndefined();
  });

  it('fires period_missed when too many days since last period', () => {
    const cycles = [
      cycle('2026-06-01', 28),
      cycle('2026-06-29', null),
    ];
    // 65 days since June 29
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-09-02');
    const flag = flags.find(f => f.ruleId === 'period_missed');
    expect(flag).toBeDefined();
    expect(flag!.evidence.daysSinceLastPeriod).toBeGreaterThanOrEqual(60);
  });

  it('does NOT fire period_missed when within threshold', () => {
    const cycles = [
      cycle('2026-09-01', null),
    ];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-09-20');
    const flag = flags.find(f => f.ruleId === 'period_missed');
    expect(flag).toBeUndefined();
  });

  it('never evaluates urgent rules', () => {
    const cycles = [cycle('2026-09-01', null)];
    const flags = evaluateFlags(cycles, [], rules, defaultConfig, '2026-10-01');
    const urgent = flags.filter(f => f.ruleId.startsWith('urgent_'));
    expect(urgent).toHaveLength(0);
  });

  it('fires heavy_flow_persistent with enough consecutive heavy days', () => {
    const cycles = [cycle('2026-09-01', 28, 5, 4, 5)];
    const entries = [
      entry('2026-09-01', 'heavy'),
      entry('2026-09-02', 'heavy'),
      entry('2026-09-03', 'heavy'),
      entry('2026-09-04', 'heavy'),
      entry('2026-09-05', 'medium'),
    ];
    const flags = evaluateFlags(cycles, entries, rules, defaultConfig, '2026-10-01');
    const flag = flags.find(f => f.ruleId === 'heavy_flow_persistent');
    expect(flag).toBeDefined();
    expect(flag!.severity).toBe('soon');
    expect(flag!.evidence.maxConsecutiveHeavyDays).toBe(4);
  });

  it('fires spotting_between_periods for intermenstrual spotting', () => {
    const cycles = [
      cycle('2026-09-01', 28, 5, 0, null),
    ];
    // Spotting on day 15 and 16 — well outside the bleeding window (days 0-4)
    const entries = [
      entry('2026-09-01', 'medium'),
      entry('2026-09-02', 'medium'),
      entry('2026-09-03', 'light'),
      entry('2026-09-04', 'light'),
      entry('2026-09-05', 'light'),
      entry('2026-09-15', 'spotting'),
      entry('2026-09-16', 'spotting'),
    ];
    const flags = evaluateFlags(cycles, entries, rules, defaultConfig, '2026-09-28');
    const flag = flags.find(f => f.ruleId === 'spotting_between_periods');
    expect(flag).toBeDefined();
    expect(flag!.evidence.spottingDaysOutsidePeriod).toBeGreaterThanOrEqual(2);
  });
});
