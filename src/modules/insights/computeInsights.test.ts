import { describe, it, expect } from 'vitest';
import { computeInsights, determinePrior } from './computeInsights';
import { LogEntry, UserSetup } from '@/shared/types';
import knowledgeData from '@/shared/knowledge.json';

const rules = knowledgeData.rules as any;

function createLog(date: string, flow: LogEntry['flow'], pain: number | null = null): LogEntry {
  return {
    date,
    flow,
    painLevel: pain,
    symptoms: [],
    moods: [],
    notes: '',
    sources: ['tap'],
    rawTexts: [],
    updatedAt: new Date().toISOString()
  };
}

describe('Module B computeInsights Engine with Setup Prior Contract', () => {
  it('falls back to 29.3 population average when user is Not Sure or skipped', () => {
    const { prior, source } = determinePrior(null);
    expect(prior).toBe(29.3);
    expect(source).toBe('population');

    const emptySetup: UserSetup = { updatedAt: new Date().toISOString() };
    const res = determinePrior(emptySetup);
    expect(res.prior).toBe(29.3);
    expect(res.source).toBe('population');
  });

  it('calculates prior from previous starts when dates are provided', () => {
    const setup: UserSetup = {
      previousStarts: ['2026-08-01', '2026-08-31', '2026-09-30'], // Intervals: 30 days, 30 days
      updatedAt: new Date().toISOString()
    };
    const { prior, source } = determinePrior(setup);
    expect(source).toBe('starts');
    expect(prior).toBe(30);
  });

  it('uses self-reported estimate when previous starts are not provided', () => {
    const setup: UserSetup = {
      typicalCycleLength: 32,
      updatedAt: new Date().toISOString()
    };
    const { prior, source } = determinePrior(setup);
    expect(source).toBe('estimate');
    expect(prior).toBe(32);
  });

  it('returns dataSufficiency none and NO flags when 0 completed cycles are logged', () => {
    // User self-reported a 45-day cycle. FIGO flag must NOT fire because it is unverified self-report!
    const setup: UserSetup = {
      lastPeriodStart: '2026-10-01',
      typicalCycleLength: 45,
      updatedAt: new Date().toISOString()
    };

    const insights = computeInsights([], rules, '2026-10-24', setup);

    expect(insights.dataSufficiency).toBe('none');
    expect(insights.stats).toBeNull(); // No observed completed cycles
    expect(insights.flags).toEqual([]); // Zero flags from self-reported data!
    expect(insights.prediction).not.toBeNull();
    expect(insights.prediction?.expected).toBe('2026-11-15'); // Oct 01 + 45d
    expect(insights.prediction?.confidence).toBe('low');
    expect(insights.prediction?.basedOnCycles).toBe(0);
  });

  it('applies shrinkage formula: (2 * prior + observed) / 3 when n = 1 completed cycle', () => {
    const setup: UserSetup = {
      typicalCycleLength: 30, // Prior = 30
      updatedAt: new Date().toISOString()
    };

    // Cycle 1: Sep 1 to Sep 25 (length = 24 days)
    // Cycle 2: Sep 25 (active)
    const entries: LogEntry[] = [
      createLog('2026-09-01', 'medium'),
      createLog('2026-09-25', 'medium')
    ];

    const insights = computeInsights(entries, rules, '2026-10-24', setup);

    expect(insights.dataSufficiency).toBe('minimal');
    expect(insights.cycles.length).toBe(2);
    // n = 1 completed cycle of length 24
    // Blended length = (2 * 30 + 24) / (2 + 1) = 84 / 3 = 28 days
    expect(insights.prediction?.expected).toBe('2026-10-23'); // Sep 25 + 28 days = Oct 23
    expect(insights.prediction?.basedOnCycles).toBe(1);
  });

  it('switches to validated mean-of-last-3 when n >= 3 completed cycles exist', () => {
    const setup: UserSetup = {
      typicalCycleLength: 45, // Prior that should be ignored once 3 real cycles exist
      updatedAt: new Date().toISOString()
    };

    const entries: LogEntry[] = [
      createLog('2026-06-01', 'medium'), // Cycle 1 start
      createLog('2026-06-30', 'medium'), // Cycle 2 start (len = 29)
      createLog('2026-07-28', 'medium'), // Cycle 3 start (len = 28)
      createLog('2026-08-27', 'medium'), // Cycle 4 start (len = 30)
      createLog('2026-09-26', 'medium')  // Cycle 5 start (active, len of Cycle 4 = 30)
    ];

    const insights = computeInsights(entries, rules, '2026-10-24', setup);

    expect(insights.dataSufficiency).toBe('ok');
    expect(insights.stats?.cyclesUsed).toBe(4);
    // Last 3 completed cycles: 28, 30, 30. Mean = 29.333 -> round = 29 days
    expect(insights.prediction?.expected).toBe('2026-10-25'); // Sep 26 + 29 days
    expect(insights.prediction?.basedOnCycles).toBe(4);
  });

  it('fires clinical flags strictly on observed completed cycles', () => {
    // 41-day observed cycle -> must trigger cycle_long
    const entries: LogEntry[] = [
      createLog('2026-05-01', 'medium'),
      createLog('2026-06-11', 'medium') // length = 41 days
    ];

    const insights = computeInsights(entries, rules, '2026-10-24', null);
    const flagIds = insights.flags.map(f => f.ruleId);

    expect(flagIds).toContain('cycle_long');
    expect(insights.flags[0].evidence.longestCycle).toBe(41);
  });
});
