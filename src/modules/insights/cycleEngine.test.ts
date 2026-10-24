import { describe, it, expect } from 'vitest';
import {
  diffDays,
  addDays,
  detectBleedingEpisodes,
  deriveCycles,
  calculateRollingStats,
  predictNextPeriodWindow,
  getCurrentCycleStatus,
  checkClinicalFlags
} from './cycleEngine';
import { LogEntry } from '@/shared/types';

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

describe('Cycle Engine Pure Clinical Logic', () => {
  it('correctly calculates day differences and date additions', () => {
    expect(diffDays('2026-10-15', '2026-10-10')).toBe(5);
    expect(diffDays('2026-11-01', '2026-10-31')).toBe(1);
    expect(addDays('2026-10-10', 5)).toBe('2026-10-15');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
  });

  it('detects bleeding episodes and bridges <=2 day gaps', () => {
    const logs: LogEntry[] = [
      createLog('2026-09-01', 'medium'),
      createLog('2026-09-02', 'heavy', 6),
      createLog('2026-09-03', 'light'),
      createLog('2026-09-04', 'none'), // 1 day gap
      createLog('2026-09-05', 'light'),
      createLog('2026-09-06', 'spotting'), // Spotting alone should not count as menstrual bleeding
      // Next month episode
      createLog('2026-09-29', 'medium'),
      createLog('2026-09-30', 'medium')
    ];

    const episodes = detectBleedingEpisodes(logs);
    expect(episodes.length).toBe(2);

    expect(episodes[0].startDate).toBe('2026-09-01');
    expect(episodes[0].endDate).toBe('2026-09-05');
    expect(episodes[0].bleedingDays).toBe(4);
    expect(episodes[0].heavyDays).toBe(1);
    expect(episodes[0].maxPain).toBe(6);

    expect(episodes[1].startDate).toBe('2026-09-29');
    expect(episodes[1].endDate).toBe('2026-09-30');
    expect(episodes[1].bleedingDays).toBe(2);
  });

  it('derives cycle summaries and lengths correctly', () => {
    const logs: LogEntry[] = [
      // Cycle 1: starts Sep 1
      createLog('2026-09-01', 'medium'),
      createLog('2026-09-02', 'medium'),
      // Cycle 2: starts Sep 29 (length = 28 days)
      createLog('2026-09-29', 'medium'),
      createLog('2026-09-30', 'medium'),
      // Cycle 3: starts Oct 28 (length = 29 days, current/unfinished)
      createLog('2026-10-28', 'medium')
    ];

    const cycles = deriveCycles(logs);
    expect(cycles.length).toBe(3);

    // Cycle 1
    expect(cycles[0].startDate).toBe('2026-09-01');
    expect(cycles[0].endDate).toBe('2026-09-28');
    expect(cycles[0].lengthDays).toBe(28);

    // Cycle 2
    expect(cycles[1].startDate).toBe('2026-09-29');
    expect(cycles[1].endDate).toBe('2026-10-27');
    expect(cycles[1].lengthDays).toBe(29);

    // Cycle 3 (unfinished)
    expect(cycles[2].startDate).toBe('2026-10-28');
    expect(cycles[2].endDate).toBeNull();
    expect(cycles[2].lengthDays).toBeNull();
  });

  it('calculates rolling statistics for completed cycles', () => {
    const cycles = [
      { startDate: '2026-06-01', endDate: '2026-06-29', lengthDays: 29, bleedingDays: 5, heavyDays: 1, maxPain: 4 },
      { startDate: '2026-06-30', endDate: '2026-07-27', lengthDays: 28, bleedingDays: 5, heavyDays: 2, maxPain: 5 },
      { startDate: '2026-07-28', endDate: '2026-08-26', lengthDays: 30, bleedingDays: 5, heavyDays: 1, maxPain: 4 },
      { startDate: '2026-08-27', endDate: null, lengthDays: null, bleedingDays: 5, heavyDays: 1, maxPain: 3 }
    ];

    const stats = calculateRollingStats(cycles);
    expect(stats.cyclesUsed).toBe(3);
    expect(stats.avgCycleLength).toBe(29); // (29 + 28 + 30) / 3 = 29.0
    expect(stats.shortest).toBe(28);
    expect(stats.longest).toBe(30);
    expect(stats.cycleLengthSD).toBe(1.5); // Floored at 1.5
  });

  it('predicts next period window with calibrated confidence and range', () => {
    const lastStartDate = '2026-10-10';
    const stats = {
      cyclesUsed: 3,
      avgCycleLength: 28,
      cycleLengthSD: 2.0,
      shortest: 27,
      longest: 29,
      avgBleedingDays: 5
    };

    const pred = predictNextPeriodWindow(lastStartDate, stats);
    expect(pred.expected).toBe('2026-11-07'); // Oct 10 + 28 days = Nov 7
    expect(pred.confidence).toBe('high');
    // Margin = round(1.28 * 2.0) = 3 days
    expect(pred.earliest).toBe('2026-11-04');
    expect(pred.latest).toBe('2026-11-10');
  });

  it('dynamically recalibrates when an early period is logged', () => {
    // Initial logs with a 28-day baseline
    const logs: LogEntry[] = [
      createLog('2026-09-01', 'heavy'),
      createLog('2026-09-02', 'medium')
    ];

    const cyclesBefore = deriveCycles(logs);
    expect(cyclesBefore.length).toBe(1);
    expect(cyclesBefore[0].lengthDays).toBeNull();

    // Now user logs an early period starting on Sep 24 (23 days later, >= 15d min threshold)
    logs.push(createLog('2026-09-24', 'heavy'));
    const cyclesAfter = deriveCycles(logs);

    expect(cyclesAfter.length).toBe(2);
    expect(cyclesAfter[0].lengthDays).toBe(23); // Completed cycle recalibrated to 23 days!
    expect(cyclesAfter[1].startDate).toBe('2026-09-24');
    expect(cyclesAfter[1].lengthDays).toBeNull(); // New active cycle

    const stats = calculateRollingStats(cyclesAfter);
    const pred = predictNextPeriodWindow(cyclesAfter[1].startDate, stats);

    // Next period now dynamically projects from the new Sep 24 start!
    expect(diffDays(pred.expected, '2026-09-24')).toBe(Math.round(stats.avgCycleLength));
  });

  it('computes cycle day and safe non-diagnostic phase bands', () => {
    const stats = {
      cyclesUsed: 3,
      avgCycleLength: 28,
      cycleLengthSD: 2.0,
      shortest: 27,
      longest: 29,
      avgBleedingDays: 5
    };

    // Day 2 of cycle -> Menstrual
    const day2 = getCurrentCycleStatus('2026-10-01', '2026-10-02', stats, 5);
    expect(day2.cycleDay).toBe(2);
    expect(day2.band).toBe('period');

    // Day 8 of cycle -> Early Follicular
    const day8 = getCurrentCycleStatus('2026-10-01', '2026-10-08', stats, 5);
    expect(day8.cycleDay).toBe(8);
    expect(day8.band).toBe('early');

    // Day 14 of cycle -> Mid-Cycle window
    const day14 = getCurrentCycleStatus('2026-10-01', '2026-10-14', stats, 5);
    expect(day14.cycleDay).toBe(14);
    expect(day14.band).toBe('mid');

    // Day 22 of cycle -> Luteal
    const day22 = getCurrentCycleStatus('2026-10-01', '2026-10-22', stats, 5);
    expect(day22.cycleDay).toBe(22);
    expect(day22.band).toBe('late');
  });

  it('accurately identifies FIGO clinical flags', () => {
    const abnormalCycles = [
      // 41-day cycle -> cycle_long
      { startDate: '2026-05-01', endDate: '2026-06-10', lengthDays: 41, bleedingDays: 5, heavyDays: 1, maxPain: 4 },
      // 25-day cycle -> difference 41 - 25 = 16 > 9 -> cycle_variability_high
      { startDate: '2026-06-11', endDate: '2026-07-05', lengthDays: 25, bleedingDays: 5, heavyDays: 1, maxPain: 4 },
      { startDate: '2026-07-06', endDate: '2026-08-04', lengthDays: 30, bleedingDays: 5, heavyDays: 1, maxPain: 4 }
    ];

    const flags = checkClinicalFlags(abnormalCycles, []);
    const flagIds = flags.map(f => f.ruleId);

    expect(flagIds).toContain('cycle_long');
    expect(flagIds).toContain('cycle_variability_high');
  });
});
