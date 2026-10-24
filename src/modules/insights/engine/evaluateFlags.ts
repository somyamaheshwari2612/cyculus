import type { CycleSummary, Flag, KnowledgeRule, LogEntry, AlgorithmConfig } from '@/shared/types';
import { daysBetween } from './bandUtils';

/**
 * Evaluate all knowledge rules against the user's data and return Flag[].
 *
 * **No threshold is hardcoded here.** Every threshold comes from rule.params
 * in knowledge.json. Evidence numbers come straight from computed data.
 *
 * Urgent rules (urgent_*) are NOT evaluated here — they're handled
 * at capture time by Module A. This engine only evaluates insight-level
 * flags (severity up to 'soon').
 */
export function evaluateFlags(
  cycles: CycleSummary[],
  entries: LogEntry[],
  rules: KnowledgeRule[],
  config: AlgorithmConfig,
  today: string
): Flag[] {
  const flags: Flag[] = [];

  // Only evaluate non-urgent rules
  const insightRules = rules.filter(r => !r.id.startsWith('urgent_'));

  for (const rule of insightRules) {
    const flag = evaluateRule(rule, cycles, entries, config, today);
    if (flag) {
      flags.push(flag);
    }
  }

  return flags;
}

function evaluateRule(
  rule: KnowledgeRule,
  cycles: CycleSummary[],
  entries: LogEntry[],
  config: AlgorithmConfig,
  today: string
): Flag | null {
  switch (rule.id) {
    case 'cycle_short':
      return evaluateCycleShort(rule, cycles);
    case 'cycle_long':
      return evaluateCycleLong(rule, cycles);
    case 'cycle_variability_high':
      return evaluateCycleVariability(rule, cycles);
    case 'period_long':
      return evaluatePeriodLong(rule, cycles);
    case 'heavy_flow_persistent':
      return evaluateHeavyFlow(rule, cycles, entries);
    case 'pain_severe_recurring':
      return evaluateSeverePain(rule, cycles);
    case 'period_missed':
      return evaluatePeriodMissed(rule, cycles, today);
    case 'spotting_between_periods':
      return evaluateSpotting(rule, cycles, entries, config);
    default:
      return null;
  }
}

/**
 * cycle_short: any completed cycle shorter than params.minCycleLength
 */
function evaluateCycleShort(rule: KnowledgeRule, cycles: CycleSummary[]): Flag | null {
  const threshold = rule.params.minCycleLength;
  const completed = cycles.filter(c => c.lengthDays !== null);
  const shortCycles = completed.filter(c => c.lengthDays! < threshold);

  if (shortCycles.length === 0) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      cyclesBelow: shortCycles.length,
      threshold,
      of: completed.length,
      shortestCycle: Math.min(...shortCycles.map(c => c.lengthDays!)),
    },
  };
}

/**
 * cycle_long: any completed cycle longer than params.maxCycleLength
 */
function evaluateCycleLong(rule: KnowledgeRule, cycles: CycleSummary[]): Flag | null {
  const threshold = rule.params.maxCycleLength;
  const completed = cycles.filter(c => c.lengthDays !== null);
  const longCycles = completed.filter(c => c.lengthDays! > threshold);

  if (longCycles.length === 0) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      cyclesAbove: longCycles.length,
      threshold,
      of: completed.length,
      longestCycle: Math.max(...longCycles.map(c => c.lengthDays!)),
    },
  };
}

/**
 * cycle_variability_high: difference between longest and shortest cycle > maxCycleLengthDiff
 * Requires at least minCycles completed cycles.
 */
function evaluateCycleVariability(rule: KnowledgeRule, cycles: CycleSummary[]): Flag | null {
  const maxDiff = rule.params.maxCycleLengthDiff;
  const minCycles = rule.params.minCycles;

  const completed = cycles.filter(c => c.lengthDays !== null);
  if (completed.length < minCycles) return null;

  const lengths = completed.map(c => c.lengthDays!);
  const shortest = Math.min(...lengths);
  const longest = Math.max(...lengths);
  const diff = longest - shortest;

  if (diff <= maxDiff) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      shortest,
      longest,
      difference: diff,
      threshold: maxDiff,
      cyclesUsed: completed.length,
    },
  };
}

/**
 * period_long: any cycle with bleedingDays > params.maxBleedingDays
 */
function evaluatePeriodLong(rule: KnowledgeRule, cycles: CycleSummary[]): Flag | null {
  const threshold = rule.params.maxBleedingDays;
  const longPeriods = cycles.filter(c => c.bleedingDays > threshold);

  if (longPeriods.length === 0) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      cyclesWithLongPeriod: longPeriods.length,
      threshold,
      of: cycles.length,
      maxBleedingDays: Math.max(...longPeriods.map(c => c.bleedingDays)),
    },
  };
}

/**
 * heavy_flow_persistent: checks for consecutive heavy days and total heavy days in a cycle
 */
function evaluateHeavyFlow(
  rule: KnowledgeRule,
  cycles: CycleSummary[],
  entries: LogEntry[]
): Flag | null {
  const consecutiveThreshold = rule.params.consecutiveHeavyDays;
  const totalThreshold = rule.params.totalHeavyDaysInCycle;

  // Check each cycle for heavy flow patterns
  let cyclesWithPersistentHeavy = 0;
  let maxConsecutiveHeavy = 0;
  let maxTotalHeavy = 0;

  for (let i = 0; i < cycles.length; i++) {
    const cycle = cycles[i];
    const nextStart = i < cycles.length - 1 ? cycles[i + 1].startDate : null;

    // Get entries for this cycle
    const cycleEntries = entries.filter(e => {
      if (e.date < cycle.startDate) return false;
      if (nextStart && e.date >= nextStart) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Count consecutive heavy days
    let consecutive = 0;
    let maxConsec = 0;
    let totalHeavy = 0;

    for (const entry of cycleEntries) {
      if (entry.flow === 'heavy') {
        consecutive++;
        totalHeavy++;
        maxConsec = Math.max(maxConsec, consecutive);
      } else {
        consecutive = 0;
      }
    }

    maxConsecutiveHeavy = Math.max(maxConsecutiveHeavy, maxConsec);
    maxTotalHeavy = Math.max(maxTotalHeavy, totalHeavy);

    if (maxConsec >= consecutiveThreshold || totalHeavy >= totalThreshold) {
      cyclesWithPersistentHeavy++;
    }
  }

  if (cyclesWithPersistentHeavy === 0) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      cyclesAffected: cyclesWithPersistentHeavy,
      of: cycles.length,
      maxConsecutiveHeavyDays: maxConsecutiveHeavy,
      maxTotalHeavyDays: maxTotalHeavy,
      consecutiveThreshold,
      totalThreshold,
    },
  };
}

/**
 * pain_severe_recurring: pain >= minPainLevel across >= minCyclesWithSeverePain cycles
 */
function evaluateSeverePain(rule: KnowledgeRule, cycles: CycleSummary[]): Flag | null {
  const minPain = rule.params.minPainLevel;
  const minCycles = rule.params.minCyclesWithSeverePain;

  const severePainCycles = cycles.filter(
    c => c.maxPain !== null && c.maxPain >= minPain
  );

  if (severePainCycles.length < minCycles) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      cyclesWithSeverePain: severePainCycles.length,
      of: cycles.length,
      minPainThreshold: minPain,
      maxPainRecorded: Math.max(...severePainCycles.map(c => c.maxPain!)),
    },
  };
}

/**
 * period_missed: no bleeding for more than params.daysWithoutPeriod since the last cycle start
 */
function evaluatePeriodMissed(
  rule: KnowledgeRule,
  cycles: CycleSummary[],
  today: string
): Flag | null {
  const threshold = rule.params.daysWithoutPeriod;

  if (cycles.length === 0) return null;

  const lastCycle = cycles[cycles.length - 1];
  const daysSinceLastStart = daysBetween(lastCycle.startDate, today);

  if (daysSinceLastStart <= threshold) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      daysSinceLastPeriod: daysSinceLastStart,
      threshold,
      lastPeriodStart: lastCycle.startDate,
    },
  };
}

/**
 * spotting_between_periods: spotting days outside the bleeding episode window
 */
function evaluateSpotting(
  rule: KnowledgeRule,
  cycles: CycleSummary[],
  entries: LogEntry[],
  _config: AlgorithmConfig
): Flag | null {
  const minSpottingDays = rule.params.minSpottingDays;

  if (cycles.length === 0) return null;

  // Find spotting days that are outside any bleeding episode
  let intermenstrualSpottingDays = 0;

  for (let i = 0; i < cycles.length; i++) {
    const cycle = cycles[i];
    const nextStart = i < cycles.length - 1 ? cycles[i + 1].startDate : null;

    const cycleEntries = entries.filter(e => {
      if (e.date < cycle.startDate) return false;
      if (nextStart && e.date >= nextStart) return false;
      return true;
    });

    // Determine the bleeding window: the first bleedingDays of the cycle
    // Spotting outside this window counts as intermenstrual
    const bleedEndOffset = cycle.bleedingDays;

    for (const entry of cycleEntries) {
      if (entry.flow !== 'spotting') continue;
      const dayOffset = daysBetween(cycle.startDate, entry.date);
      // If spotting occurs after the bleeding window + a small buffer
      if (dayOffset > bleedEndOffset + 2) {
        intermenstrualSpottingDays++;
      }
    }
  }

  if (intermenstrualSpottingDays < minSpottingDays) return null;

  return {
    ruleId: rule.id,
    severity: rule.severity,
    evidence: {
      spottingDaysOutsidePeriod: intermenstrualSpottingDays,
      threshold: minSpottingDays,
    },
  };
}
