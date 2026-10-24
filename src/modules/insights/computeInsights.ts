import {
  LogEntry,
  KnowledgeRule,
  UserSetup,
  Insights,
  CycleSummary,
  Prediction,
  Flag,
  SymptomPattern,
  CycleBand,
  SYMPTOMS
} from '@/shared/types';
import knowledgeData from '@/shared/knowledge.json';

const ALGORITHM = knowledgeData.algorithm;

/** Calculate difference in calendar days between two 'YYYY-MM-DD' strings (d2 - d1) */
export function diffDays(d2Str: string, d1Str: string): number {
  const d1 = new Date(d1Str + 'T00:00:00Z');
  const d2 = new Date(d2Str + 'T00:00:00Z');
  const msDiff = d2.getTime() - d1.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/** Add calendar days to a 'YYYY-MM-DD' string */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

interface BleedingEpisode {
  startDate: string;
  endDate: string;
  bleedingDays: number;
  heavyDays: number;
  maxPain: number | null;
}

/**
 * Detect bleeding episodes from entries actually logged by user.
 * Bleeding is defined as flow in ['light', 'medium', 'heavy'].
 * Gaps of <= minBleedingGapDays (default: 2) are joined into the same episode.
 */
function detectBleedingEpisodes(entries: LogEntry[]): BleedingEpisode[] {
  const bleedingFlows = new Set(ALGORITHM.bleedingFlowLevels);
  const bleedingLogs = entries
    .filter(l => l.flow && bleedingFlows.has(l.flow))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (bleedingLogs.length === 0) return [];

  const episodes: BleedingEpisode[] = [];
  let currentGroup: LogEntry[] = [bleedingLogs[0]];

  for (let i = 1; i < bleedingLogs.length; i++) {
    const prev = bleedingLogs[i - 1];
    const curr = bleedingLogs[i];
    const gap = diffDays(curr.date, prev.date) - 1;

    if (gap <= ALGORITHM.minBleedingGapDays) {
      currentGroup.push(curr);
    } else {
      episodes.push(summarizeEpisode(currentGroup));
      currentGroup = [curr];
    }
  }

  if (currentGroup.length > 0) {
    episodes.push(summarizeEpisode(currentGroup));
  }

  return episodes;
}

function summarizeEpisode(group: LogEntry[]): BleedingEpisode {
  const startDate = group[0].date;
  const endDate = group[group.length - 1].date;
  const bleedingDays = group.length;
  const heavyDays = group.filter(e => e.flow === 'heavy').length;
  const pains = group
    .map(e => e.painLevel)
    .filter((p): p is number => p !== null && p !== undefined);
  const maxPain = pains.length > 0 ? Math.max(...pains) : null;

  return {
    startDate,
    endDate,
    bleedingDays,
    heavyDays,
    maxPain
  };
}

/**
 * Derive observed cycles from entries only.
 * Episodes starting >= minCycleLengthDays (default: 15) apart mark cycles.
 */
export function deriveObservedCycles(entries: LogEntry[]): CycleSummary[] {
  const episodes = detectBleedingEpisodes(entries);
  if (episodes.length === 0) return [];

  const cycleStarts: BleedingEpisode[] = [];
  for (const ep of episodes) {
    if (cycleStarts.length === 0) {
      cycleStarts.push(ep);
    } else {
      const lastStart = cycleStarts[cycleStarts.length - 1].startDate;
      if (diffDays(ep.startDate, lastStart) >= ALGORITHM.minCycleLengthDays) {
        cycleStarts.push(ep);
      }
    }
  }

  const cycles: CycleSummary[] = [];
  for (let i = 0; i < cycleStarts.length; i++) {
    const currentEp = cycleStarts[i];
    const nextEp = cycleStarts[i + 1];

    if (nextEp) {
      const lengthDays = diffDays(nextEp.startDate, currentEp.startDate);
      cycles.push({
        startDate: currentEp.startDate,
        endDate: addDays(nextEp.startDate, -1),
        lengthDays,
        bleedingDays: currentEp.bleedingDays,
        heavyDays: currentEp.heavyDays,
        maxPain: currentEp.maxPain
      });
    } else {
      // Latest active cycle
      cycles.push({
        startDate: currentEp.startDate,
        endDate: null,
        lengthDays: null,
        bleedingDays: currentEp.bleedingDays,
        heavyDays: currentEp.heavyDays,
        maxPain: currentEp.maxPain
      });
    }
  }

  return cycles;
}

/**
 * Determine the cycle length prior from setup answers.
 * If user provided earlier period start dates, calculates intervals.
 * If user provided a typical cycle estimate, uses that.
 * If user was 'Not sure' or skipped, falls back to 29.3 days (Bull et al. 2019 population average).
 */
export function determinePrior(setup?: UserSetup | null): { prior: number; source: 'starts' | 'estimate' | 'population' } {
  if (setup?.previousStarts && setup.previousStarts.length >= 2) {
    const sorted = [...setup.previousStarts].sort();
    const intervals: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = diffDays(sorted[i + 1], sorted[i]);
      if (diff >= 15 && diff <= 90) {
        intervals.push(diff);
      }
    }
    if (intervals.length > 0) {
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      return { prior: Math.round(avg * 10) / 10, source: 'starts' };
    }
  }

  if (setup?.typicalCycleLength && setup.typicalCycleLength >= 15 && setup.typicalCycleLength <= 90) {
    return { prior: setup.typicalCycleLength, source: 'estimate' };
  }

  // Bull et al. 2019 population average (npj Digital Medicine)
  return { prior: 29.3, source: 'population' };
}

/**
 * Module B Pure Engine: computeInsights(entries, knowledge, today, setup?)
 * Grounded in cited rules, strictly deterministic.
 * Setup acts as a shrinkage prior: (2 * prior + sum(observed)) / (2 + n) until n >= 3,
 * then switches to mean-of-last-3 validated on Utah Hive data.
 * Self-reported setup data NEVER triggers clinical flags.
 */
export function computeInsights(
  entries: LogEntry[],
  knowledge: KnowledgeRule[],
  _today: string,
  setup?: UserSetup | null
): Insights {
  const cycles = deriveObservedCycles(entries);
  const completed = cycles.filter(c => c.lengthDays !== null);
  const observedLengths = completed.map(c => c.lengthDays as number);
  const n = observedLengths.length;

  // 1. Data sufficiency
  let dataSufficiency: 'none' | 'minimal' | 'ok' = 'none';
  if (n >= 3) {
    dataSufficiency = 'ok';
  } else if (n >= 1) {
    dataSufficiency = 'minimal';
  }

  // 2. Prior from setup
  const { prior, source: priorSource } = determinePrior(setup);

  // 3. Predicted cycle length and standard deviation (shrinkage formula)
  let predictedLength: number;
  let cycleSD: number;
  let confidence: 'low' | 'medium' | 'high' = 'low';

  if (n >= 3) {
    // Validated baseline on Utah Hive data: mean-of-last-3 completed cycles
    const last3 = observedLengths.slice(-3);
    predictedLength = last3.reduce((a, b) => a + b, 0) / 3;
    const variance =
      last3.reduce((acc, len) => acc + Math.pow(len - predictedLength, 2), 0) /
      (last3.length - 1);
    cycleSD = Math.max(1.5, Math.sqrt(variance));
    confidence = cycleSD <= 3.5 ? 'high' : 'medium';
  } else {
    // Shrinkage prior: (2 * prior + sum(observed)) / (2 + n)
    const sumObserved = observedLengths.reduce((a, b) => a + b, 0);
    predictedLength = (2 * prior + sumObserved) / (2 + n);
    // Low confidence prior window
    cycleSD = priorSource === 'population' && n === 0 ? 4.5 : 3.0;
    confidence = 'low';
  }

  // 4. Determine anchor date for prediction
  // Origin priority: latest observed bleeding start date > setup.lastPeriodStart
  let projectStartDate: string | null = null;
  if (cycles.length > 0) {
    projectStartDate = cycles[cycles.length - 1].startDate;
  } else if (setup?.lastPeriodStart) {
    projectStartDate = setup.lastPeriodStart;
  }

  // 5. Prediction window
  let prediction: Prediction | null = null;
  if (projectStartDate) {
    const expected = addDays(projectStartDate, Math.round(predictedLength));
    const coverageMargin = Math.max(3, Math.round(ALGORITHM.coverageFactorSD * cycleSD));
    const earliest = addDays(expected, -coverageMargin);
    const latest = addDays(expected, coverageMargin);

    prediction = {
      expected,
      earliest,
      latest,
      confidence,
      basedOnCycles: n
    };
  }

  // 6. Stats (only based on real observed cycles, null if no completed cycle)
  let stats: Insights['stats'] = null;
  if (n > 0) {
    const avgLen = observedLengths.reduce((a, b) => a + b, 0) / n;
    let sd = 2.4;
    if (n > 1) {
      const variance =
        observedLengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) /
        (n - 1);
      sd = Math.sqrt(variance);
    }
    const bleedingCounts = cycles.map(c => c.bleedingDays).filter(d => d > 0);
    const avgBleed =
      bleedingCounts.length > 0
        ? bleedingCounts.reduce((a, b) => a + b, 0) / bleedingCounts.length
        : 5;

    stats = {
      cyclesUsed: n,
      avgCycleLength: Math.round(avgLen * 10) / 10,
      cycleLengthSD: Math.round(sd * 10) / 10,
      shortest: Math.min(...observedLengths),
      longest: Math.max(...observedLengths),
      avgBleedingDays: Math.round(avgBleed * 10) / 10
    };
  }

  // 7. Symptom patterns by CycleBand
  const patterns: SymptomPattern[] = [];
  const approxAvg = stats ? stats.avgCycleLength : Math.round(predictedLength);

  for (const symptom of SYMPTOMS) {
    const matchingEntries = entries.filter(e => e.symptoms && e.symptoms.includes(symptom));
    if (matchingEntries.length > 0) {
      const byBand: Record<CycleBand, number> = {
        period: 0,
        early: 0,
        mid: 0,
        late: 0
      };

      for (const entry of matchingEntries) {
        // Approximate band assignment relative to latest known cycle start
        if (projectStartDate) {
          const dayOfCycle = Math.max(1, diffDays(entry.date, projectStartDate) + 1);
          if (dayOfCycle <= 5) {
            byBand.period++;
          } else if (dayOfCycle < approxAvg - 16) {
            byBand.early++;
          } else if (dayOfCycle <= approxAvg - 12) {
            byBand.mid++;
          } else {
            byBand.late++;
          }
        } else {
          byBand.early++;
        }
      }

      patterns.push({
        symptom,
        totalDays: matchingEntries.length,
        byBand
      });
    }
  }

  // 8. Flags evaluation (STRICT: Evaluated on observed data only, self-reported setup NEVER triggers flags)
  const flags: Flag[] = [];

  // Evaluate knowledge rules
  for (const rule of knowledge) {
    if (rule.id === 'cycle_short' && n > 0) {
      const shortCycles = observedLengths.filter(len => len < (rule.params.minCycleLength || 24));
      if (shortCycles.length > 0) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          evidence: {
            shortestCycle: Math.min(...shortCycles),
            affectedCycles: shortCycles.length,
            totalCompleted: n
          }
        });
      }
    } else if (rule.id === 'cycle_long' && n > 0) {
      const longCycles = observedLengths.filter(len => len > (rule.params.maxCycleLength || 38));
      if (longCycles.length > 0) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          evidence: {
            longestCycle: Math.max(...longCycles),
            affectedCycles: longCycles.length,
            totalCompleted: n
          }
        });
      }
    } else if (rule.id === 'cycle_variability_high' && n >= 3) {
      const spread = Math.max(...observedLengths) - Math.min(...observedLengths);
      if (spread > (rule.params.maxCycleLengthDiff || 9)) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          evidence: {
            spreadDays: spread,
            shortest: Math.min(...observedLengths),
            longest: Math.max(...observedLengths)
          }
        });
      }
    } else if (rule.id === 'period_long') {
      const prolonged = cycles.filter(c => c.bleedingDays > (rule.params.maxBleedingDays || 8));
      if (prolonged.length > 0) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          evidence: {
            maxBleedingDays: Math.max(...prolonged.map(c => c.bleedingDays))
          }
        });
      }
    } else if (rule.id === 'heavy_flow_persistent') {
      const heavyCycles = cycles.filter(c => c.heavyDays >= (rule.params.totalHeavyDaysInCycle || 4));
      if (heavyCycles.length > 0) {
        flags.push({
          ruleId: rule.id,
          severity: rule.severity,
          evidence: {
            maxHeavyDays: Math.max(...heavyCycles.map(c => c.heavyDays))
          }
        });
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    dataSufficiency,
    cycles,
    stats,
    prediction,
    patterns,
    flags
  };
}

/** Helper: Calculate current cycle day relative to an origin start date */
export function calculateCurrentCycleDay(startDate: string, today: string): number {
  const diff = diffDays(today, startDate);
  return Math.max(1, diff + 1);
}
