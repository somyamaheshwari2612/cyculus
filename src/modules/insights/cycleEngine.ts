import { LogEntry, CycleSummary, Prediction, Flag, UserProfile, CycleBand } from '@/shared/types';
import knowledgeData from '@/shared/knowledge.json';

const ALGORITHM = knowledgeData.algorithm;

/** Helper: calculate difference in calendar days between two 'YYYY-MM-DD' strings (d2 - d1) */
export function diffDays(d2Str: string, d1Str: string): number {
  const d1 = new Date(d1Str + 'T00:00:00Z');
  const d2 = new Date(d2Str + 'T00:00:00Z');
  const msDiff = d2.getTime() - d1.getTime();
  return Math.round(msDiff / (1000 * 60 * 60 * 24));
}

/** Helper: add N calendar days to a 'YYYY-MM-DD' string */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/** Bleeding episode identified from daily logs */
export interface BleedingEpisode {
  startDate: string;
  endDate: string;
  bleedingDays: number;
  heavyDays: number;
  maxPain: number | null;
}

/**
 * Detect bleeding episodes from a list of logs.
 * Bleeding is defined as flow in ['light', 'medium', 'heavy'].
 * Gaps of <= minBleedingGapDays (default: 2) are joined into the same episode.
 */
export function detectBleedingEpisodes(logs: LogEntry[]): BleedingEpisode[] {
  const bleedingFlows = new Set(ALGORITHM.bleedingFlowLevels);
  const bleedingLogs = logs
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

function summarizeEpisode(entries: LogEntry[]): BleedingEpisode {
  const startDate = entries[0].date;
  const endDate = entries[entries.length - 1].date;
  const bleedingDays = entries.length;
  const heavyDays = entries.filter(e => e.flow === 'heavy').length;
  const pains = entries
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
 * Derive cycle summaries from bleeding episodes and optional baseline profile.
 * An episode starting >= minCycleLengthDays (default: 15) after the previous cycle start marks a new cycle.
 */
export function deriveCycles(logs: LogEntry[], profile?: UserProfile | null): CycleSummary[] {
  const episodes = detectBleedingEpisodes(logs);

  // If no bleeding episodes logged yet, but we have a user profile with lastPeriodStartDate:
  if (episodes.length === 0) {
    if (profile && profile.lastPeriodStartDate) {
      return [{
        startDate: profile.lastPeriodStartDate,
        endDate: null,
        lengthDays: null,
        bleedingDays: profile.typicalPeriodDuration || 5,
        heavyDays: 0,
        maxPain: null
      }];
    }
    return [];
  }

  // Filter episodes that are >= minCycleLengthDays apart
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

  // Build CycleSummary objects
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
      // Latest unfinished cycle
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
 * Calculate rolling cycle statistics (rolling average of completed cycles).
 * If fewer than 3 completed cycles exist from logs, supplements with user's remembered past cycles
 * or typical cycle length.
 */
export interface CycleStats {
  cyclesUsed: number;
  avgCycleLength: number;
  cycleLengthSD: number;
  shortest: number;
  longest: number;
  avgBleedingDays: number;
}

export function calculateRollingStats(
  cycles: CycleSummary[],
  profile?: UserProfile | null
): CycleStats {
  const completed = cycles.filter(c => c.lengthDays !== null);
  const completedLengths = completed.map(c => c.lengthDays as number);

  // Combine completed cycle lengths with remembered past cycles from profile
  let lengthsToUse: number[] = [...completedLengths];
  if (lengthsToUse.length < ALGORITHM.predictionWindowBaselineCycles && profile?.previousCycleLengths?.length) {
    const needed = ALGORITHM.predictionWindowBaselineCycles - lengthsToUse.length;
    lengthsToUse = [...profile.previousCycleLengths.slice(0, needed), ...lengthsToUse];
  }

  // Fallback to profile typicalCycleLength or clinical baseline (28)
  if (lengthsToUse.length === 0) {
    const fallback = profile?.typicalCycleLength || 28;
    lengthsToUse = [fallback];
  }

  // Focus on rolling window of last N cycles (default: 3)
  const windowLengths = lengthsToUse.slice(-ALGORITHM.predictionWindowBaselineCycles);

  const avgCycleLength =
    windowLengths.reduce((acc, val) => acc + val, 0) / windowLengths.length;

  // Calculate sample standard deviation
  let cycleLengthSD = 2.4; // Default Utah Hive baseline SD for 1 cycle
  if (windowLengths.length > 1) {
    const variance =
      windowLengths.reduce((acc, val) => acc + Math.pow(val - avgCycleLength, 2), 0) /
      (windowLengths.length - 1);
    cycleLengthSD = Math.sqrt(variance);
    // Floor SD at 1.5 to prevent unrealistic 0-day prediction windows
    if (cycleLengthSD < 1.5) cycleLengthSD = 1.5;
  }

  const bleedingCounts = cycles.map(c => c.bleedingDays).filter(d => d > 0);
  const avgBleedingDays =
    bleedingCounts.length > 0
      ? bleedingCounts.reduce((a, b) => a + b, 0) / bleedingCounts.length
      : profile?.typicalPeriodDuration || 5;

  return {
    cyclesUsed: windowLengths.length,
    avgCycleLength: Math.round(avgCycleLength * 10) / 10,
    cycleLengthSD: Math.round(cycleLengthSD * 10) / 10,
    shortest: Math.min(...lengthsToUse),
    longest: Math.max(...lengthsToUse),
    avgBleedingDays: Math.round(avgBleedingDays * 10) / 10
  };
}

/**
 * Predict the next period window calibrated on the rolling average and standard deviation.
 */
export function predictNextPeriodWindow(
  lastCycleStartDate: string,
  stats: CycleStats
): Prediction {
  const centerDays = Math.round(stats.avgCycleLength);
  const expected = addDays(lastCycleStartDate, centerDays);

  // Interval margin = coverageFactorSD * SD (coverage factor 1.28 for ~80% coverage)
  const margin = Math.max(2, Math.round(ALGORITHM.coverageFactorSD * stats.cycleLengthSD));
  const earliest = addDays(expected, -margin);
  const latest = addDays(expected, margin);

  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (stats.cyclesUsed >= 3 && stats.cycleLengthSD <= 3.5) {
    confidence = 'high';
  } else if (stats.cyclesUsed >= 2 || stats.cycleLengthSD <= 5) {
    confidence = 'medium';
  }

  return {
    expected,
    earliest,
    latest,
    confidence,
    basedOnCycles: stats.cyclesUsed
  };
}

/**
 * Calculate current cycle day and non-diagnostic cycle phase band.
 */
export interface CurrentCycleStatus {
  cycleDay: number;
  band: CycleBand;
  bandLabel: { en: string; hi: string };
  bandDescription: { en: string; hi: string };
  lastStartDate: string;
}

export function getCurrentCycleStatus(
  lastCycleStartDate: string,
  todayDate: string,
  stats: CycleStats,
  bleedingDuration: number = 5
): CurrentCycleStatus {
  const dayDiff = diffDays(todayDate, lastCycleStartDate);
  const cycleDay = Math.max(1, dayDiff + 1);
  const avgLength = Math.round(stats.avgCycleLength);

  // Approximate, non-diagnostic phase bands:
  // 1. period: Days 1 to bleedingDuration
  // 2. early: Days bleedingDuration + 1 to (avgLength - 16)
  // 3. mid: (avgLength - 16) to (avgLength - 12)
  // 4. late: (avgLength - 11) onwards
  const midStart = Math.max(bleedingDuration + 1, avgLength - 16);
  const midEnd = Math.max(midStart, avgLength - 12);

  let band: CycleBand;
  let bandLabel: { en: string; hi: string };
  let bandDescription: { en: string; hi: string };

  if (cycleDay <= bleedingDuration) {
    band = 'period';
    bandLabel = { en: 'Menstrual Phase', hi: 'माहवारी के दिन' };
    bandDescription = {
      en: 'Active bleeding episode. Rest, hydration, and gentle movement recommended.',
      hi: 'सक्रिय माहवारी चरण। विश्राम और पर्याप्त पानी पीने की सलाह दी जाती है।'
    };
  } else if (cycleDay < midStart) {
    band = 'early';
    bandLabel = { en: 'Early Follicular Phase', hi: 'आरंभिक चक्र चरण' };
    bandDescription = {
      en: 'Post-period interval. Energy levels typically begin rising.',
      hi: 'माहवारी के बाद का समय। शरीर में ऊर्जा स्तर आमतौर पर बढ़ता है।'
    };
  } else if (cycleDay <= midEnd) {
    band = 'mid';
    bandLabel = { en: 'Mid-Cycle Window', hi: 'मध्य-चक्र समय' };
    bandDescription = {
      en: 'Approximate mid-cycle window (population average). Non-diagnostic and not contraceptive advice.',
      hi: 'मध्य-चक्र की अनुमानित अवधि। यह गर्भनिरोधक या पक्के ओव्यूलेशन की गारंटी नहीं है।'
    };
  } else {
    band = 'late';
    bandLabel = { en: 'Luteal Phase', hi: 'उत्तर-चक्र (ल्यूटियल) चरण' };
    bandDescription = {
      en: 'Pre-menstrual window. Focus on balanced nutrition and stress management.',
      hi: 'आगामी माहवारी से पूर्व का समय। संतुलित आहार और तनाव प्रबंधन पर ध्यान दें।'
    };
  }

  return {
    cycleDay,
    band,
    bandLabel,
    bandDescription,
    lastStartDate: lastCycleStartDate
  };
}

/**
 * Check FIGO & Clinical standards rules against cycles and logs.
 */
export function checkClinicalFlags(cycles: CycleSummary[], _logs: LogEntry[]): Flag[] {
  const flags: Flag[] = [];
  const completed = cycles.filter(c => c.lengthDays !== null);

  // 1. cycle_short (<24 days)
  const shortCycles = completed.filter(c => (c.lengthDays as number) < 24);
  if (shortCycles.length > 0) {
    flags.push({
      ruleId: 'cycle_short',
      severity: 'discuss',
      evidence: {
        shortestCycle: Math.min(...shortCycles.map(c => c.lengthDays as number)),
        affectedCycles: shortCycles.length,
        totalCompleted: completed.length
      }
    });
  }

  // 2. cycle_long (>38 days)
  const longCycles = completed.filter(c => (c.lengthDays as number) > 38);
  if (longCycles.length > 0) {
    flags.push({
      ruleId: 'cycle_long',
      severity: 'discuss',
      evidence: {
        longestCycle: Math.max(...longCycles.map(c => c.lengthDays as number)),
        affectedCycles: longCycles.length,
        totalCompleted: completed.length
      }
    });
  }

  // 3. cycle_variability_high (>9 days spread across >=3 cycles)
  if (completed.length >= 3) {
    const lengths = completed.map(c => c.lengthDays as number);
    const spread = Math.max(...lengths) - Math.min(...lengths);
    if (spread > 9) {
      flags.push({
        ruleId: 'cycle_variability_high',
        severity: 'discuss',
        evidence: {
          spreadDays: spread,
          shortest: Math.min(...lengths),
          longest: Math.max(...lengths)
        }
      });
    }
  }

  // 4. period_long (>8 bleeding days in any cycle)
  const prolongedBleeding = cycles.filter(c => c.bleedingDays > 8);
  if (prolongedBleeding.length > 0) {
    flags.push({
      ruleId: 'period_long',
      severity: 'discuss',
      evidence: {
        maxBleedingDays: Math.max(...prolongedBleeding.map(c => c.bleedingDays))
      }
    });
  }

  // 5. heavy_flow_persistent (4+ heavy days in any cycle)
  const heavyCycles = cycles.filter(c => c.heavyDays >= 4);
  if (heavyCycles.length > 0) {
    flags.push({
      ruleId: 'heavy_flow_persistent',
      severity: 'soon',
      evidence: {
        maxHeavyDays: Math.max(...heavyCycles.map(c => c.heavyDays))
      }
    });
  }

  // 6. dysmenorrhea_severe (pain >= 7 on bleeding days)
  const severePainCycles = cycles.filter(c => c.maxPain !== null && c.maxPain >= 7);
  if (severePainCycles.length > 0) {
    flags.push({
      ruleId: 'dysmenorrhea_severe',
      severity: 'discuss',
      evidence: {
        maxPainLogged: Math.max(...severePainCycles.map(c => c.maxPain as number))
      }
    });
  }

  return flags;
}
