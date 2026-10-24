import type { LogEntry, CycleSummary, AlgorithmConfig } from '@/shared/types';
import { isBleedingFlow, daysBetween, countBleedingDays, countHeavyDays, getMaxPain } from './bandUtils';

/**
 * Derive cycle summaries from daily log entries.
 *
 * Algorithm (parameters from knowledge.json → algorithm):
 * 1. A *bleeding day* has flow in bleedingFlowLevels (default: light, medium, heavy).
 *    'spotting' is tracked separately but doesn't start/continue an episode.
 * 2. A *bleeding episode* is a run of bleeding days with gaps of at most
 *    `minBleedingGapDays` (default: 2) non-bleeding days.
 * 3. A new cycle starts on the first day of an episode that begins at least
 *    `minCycleLengthDays` (default: 15) days after the previous cycle's start.
 *
 * Entries MUST be sorted by date ascending.
 */
export function deriveCycles(
  entries: LogEntry[],
  config: AlgorithmConfig,
  _today: string
): CycleSummary[] {
  if (entries.length === 0) return [];

  // Sort entries by date ascending (defensive)
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Step 1: Find all bleeding episodes
  const episodes = findBleedingEpisodes(sorted, config);

  if (episodes.length === 0) return [];

  // Step 2: Filter episodes to cycle starts
  // A new cycle starts when the episode begins ≥ minCycleLengthDays after the previous cycle start
  const cycleStarts: BleedingEpisode[] = [episodes[0]];
  for (let i = 1; i < episodes.length; i++) {
    const lastStart = cycleStarts[cycleStarts.length - 1];
    const gap = daysBetween(lastStart.startDate, episodes[i].startDate);
    if (gap >= config.minCycleLengthDays) {
      cycleStarts.push(episodes[i]);
    } else {
      // Merge this episode into the current cycle (don't start a new one)
      // Extend the last cycle's episode end date if needed
      const last = cycleStarts[cycleStarts.length - 1];
      if (episodes[i].endDate > last.endDate) {
        last.endDate = episodes[i].endDate;
        last.bleedingDays += episodes[i].bleedingDays;
        last.heavyDays += episodes[i].heavyDays;
      }
    }
  }

  // Step 3: Build CycleSummary[]
  const cycles: CycleSummary[] = [];
  for (let i = 0; i < cycleStarts.length; i++) {
    const start = cycleStarts[i].startDate;
    const isLast = i === cycleStarts.length - 1;

    // End date: day before next cycle starts, or null if current/unfinished
    let endDate: string | null = null;
    let lengthDays: number | null = null;

    if (!isLast) {
      const nextStart = cycleStarts[i + 1].startDate;
      lengthDays = daysBetween(start, nextStart);
      // endDate is the day before nextStart (last day of this cycle)
      endDate = nextStart; // We store the next cycle's start as the boundary
    }

    // Gather all entries that belong to this cycle
    const cycleEntries = getCycleEntries(sorted, start, isLast ? null : cycleStarts[i + 1].startDate);

    const bleedingDays = countBleedingDays(cycleEntries, config.bleedingFlowLevels);
    const heavyDays = countHeavyDays(cycleEntries);
    const maxPain = getMaxPain(cycleEntries);

    cycles.push({
      startDate: start,
      endDate,
      lengthDays,
      bleedingDays,
      heavyDays,
      maxPain,
    });
  }

  return cycles;
}

interface BleedingEpisode {
  startDate: string;
  endDate: string;
  bleedingDays: number;
  heavyDays: number;
}

/**
 * Find contiguous bleeding episodes allowing gaps of up to maxGap non-bleeding days.
 */
function findBleedingEpisodes(
  sortedEntries: LogEntry[],
  config: AlgorithmConfig
): BleedingEpisode[] {
  const episodes: BleedingEpisode[] = [];
  let currentEpisode: BleedingEpisode | null = null;
  let lastBleedingDate: string | null = null;

  for (const entry of sortedEntries) {
    const isBleeding = isBleedingFlow(entry.flow, config.bleedingFlowLevels);

    if (isBleeding) {
      if (currentEpisode === null) {
        // Start new episode
        currentEpisode = {
          startDate: entry.date,
          endDate: entry.date,
          bleedingDays: 1,
          heavyDays: entry.flow === 'heavy' ? 1 : 0,
        };
      } else {
        // Check if this bleeding day is within the allowed gap
        const gapDays = lastBleedingDate
          ? daysBetween(lastBleedingDate, entry.date) - 1
          : 0;

        if (gapDays <= config.minBleedingGapDays) {
          // Continue current episode
          currentEpisode.endDate = entry.date;
          currentEpisode.bleedingDays += 1;
          if (entry.flow === 'heavy') currentEpisode.heavyDays += 1;
        } else {
          // Gap too large, save current and start new
          episodes.push(currentEpisode);
          currentEpisode = {
            startDate: entry.date,
            endDate: entry.date,
            bleedingDays: 1,
            heavyDays: entry.flow === 'heavy' ? 1 : 0,
          };
        }
      }
      lastBleedingDate = entry.date;
    } else {
      // Non-bleeding day: check if we need to close the current episode
      if (currentEpisode !== null && lastBleedingDate !== null) {
        const gapDays = daysBetween(lastBleedingDate, entry.date);
        if (gapDays > config.minBleedingGapDays + 1) {
          // Gap exceeded, close the episode
          episodes.push(currentEpisode);
          currentEpisode = null;
          lastBleedingDate = null;
        }
      }
    }
  }

  // Don't forget to push the last episode
  if (currentEpisode !== null) {
    episodes.push(currentEpisode);
  }

  return episodes;
}

/**
 * Get all entries that fall within a cycle's date range.
 * @param start - Cycle start date (inclusive)
 * @param nextStart - Next cycle start date (exclusive), null for current cycle
 */
function getCycleEntries(
  sortedEntries: LogEntry[],
  start: string,
  nextStart: string | null
): LogEntry[] {
  return sortedEntries.filter(e => {
    if (e.date < start) return false;
    if (nextStart !== null && e.date >= nextStart) return false;
    return true;
  });
}
