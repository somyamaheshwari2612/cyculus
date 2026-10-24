import { describe, it, expect } from 'vitest';
import { computeInsights } from '../computeInsights';
import type { LogEntry, KnowledgeBase } from '@/shared/types';

const knowledge: KnowledgeBase = {
  rules: [
    {
      id: 'cycle_long',
      severity: 'discuss',
      params: { maxCycleLength: 38 },
      title: { en: 'Longer cycle intervals observed', hi: '' },
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
      title: { en: 'High variation', hi: '' },
      explanation: { en: '', hi: '' },
      discussWithDoctor: { en: '', hi: '' },
      questionsForDoctor: { en: [], hi: [] },
      sources: [],
      status: 'verified',
    },
  ],
  algorithm: {
    minBleedingGapDays: 2,
    minCycleLengthDays: 15,
    bleedingFlowLevels: ['light', 'medium', 'heavy'],
    predictionWindowBaselineCycles: 3,
    coverageFactorSD: 1.28,
  },
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

describe('computeInsights (integration)', () => {
  it('returns none sufficiency for empty entries', () => {
    const insights = computeInsights([], knowledge, '2026-10-01');
    expect(insights.dataSufficiency).toBe('none');
    expect(insights.cycles).toHaveLength(0);
    expect(insights.stats).toBeNull();
    expect(insights.prediction).toBeNull();
    expect(insights.patterns).toHaveLength(0);
    expect(insights.flags).toHaveLength(0);
  });

  it('returns minimal sufficiency with 1-2 completed cycles', () => {
    const entries = [
      // Cycle 1: Jun 1-5
      entry('2026-06-01', 'medium', 4, ['cramps']),
      entry('2026-06-02', 'heavy', 6, ['cramps', 'bloating']),
      entry('2026-06-03', 'medium', 3),
      entry('2026-06-04', 'light'),
      entry('2026-06-05', 'light'),
      // Cycle 2: Jul 1-4 (30 days later)
      entry('2026-07-01', 'medium', 5, ['cramps']),
      entry('2026-07-02', 'heavy', 7, ['cramps', 'fatigue']),
      entry('2026-07-03', 'light'),
      entry('2026-07-04', 'light'),
    ];
    const insights = computeInsights(entries, knowledge, '2026-07-15');

    expect(insights.dataSufficiency).toBe('minimal');
    expect(insights.cycles).toHaveLength(2);
    expect(insights.stats).not.toBeNull();
    expect(insights.stats!.cyclesUsed).toBe(1); // only one completed
    expect(insights.prediction).not.toBeNull();
    expect(insights.prediction!.confidence).toBe('low');
  });

  it('produces a full insights for Riya-like irregular persona', () => {
    const entries = [
      // Cycle 1: May 5-10 (27-day cycle)
      ...makePeriod('2026-05-05', 6, ['cramps', 'bloating']),
      // Cycle 2: Jun 1-6 (36-day cycle)
      ...makePeriod('2026-06-01', 6, ['cramps', 'fatigue']),
      // Cycle 3: Jul 7-11 (29-day cycle)
      ...makePeriod('2026-07-07', 5, ['cramps']),
      // Cycle 4: Aug 5-10 (41-day cycle)
      ...makePeriod('2026-08-05', 6, ['cramps', 'pelvic_pain', 'bloating']),
      // Cycle 5: Sep 15-19 (current, unfinished)
      ...makePeriod('2026-09-15', 5, ['cramps', 'lower_back_pain']),
    ];

    const insights = computeInsights(entries, knowledge, '2026-10-10');

    expect(insights.dataSufficiency).toBe('ok'); // 4 completed cycles
    expect(insights.cycles).toHaveLength(5);
    expect(insights.stats).not.toBeNull();
    expect(insights.stats!.cyclesUsed).toBe(4);
    expect(insights.stats!.longest).toBe(41);
    expect(insights.prediction).not.toBeNull();
    expect(insights.prediction!.confidence).toBe('high');

    // Flags: cycle_long should fire (41 > 38)
    const longFlag = insights.flags.find(f => f.ruleId === 'cycle_long');
    expect(longFlag).toBeDefined();

    // cycle_variability_high should fire (41 - 27 = 14 > 9)
    const varFlag = insights.flags.find(f => f.ruleId === 'cycle_variability_high');
    expect(varFlag).toBeDefined();

    // Symptom patterns should exist
    expect(insights.patterns.length).toBeGreaterThan(0);
    const cramps = insights.patterns.find(p => p.symptom === 'cramps');
    expect(cramps).toBeDefined();
    expect(cramps!.totalDays).toBeGreaterThan(0);
  });
});

/** Helper: generate a series of period entries */
function makePeriod(startDate: string, days: number, symptoms: string[] = []): LogEntry[] {
  const flows: ('medium' | 'heavy' | 'light')[] = [];
  for (let i = 0; i < days; i++) {
    if (i === 0) flows.push('medium');
    else if (i <= 2) flows.push('heavy');
    else flows.push('light');
  }

  return flows.map((flow, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    return entry(dateStr, flow, i <= 2 ? 6 : 3, symptoms);
  });
}
