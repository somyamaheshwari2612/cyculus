import type { CycleBand, LogEntry, FlowLevel } from '@/shared/types';

/**
 * Given a day's 0-indexed offset within a cycle and the average cycle length,
 * returns which approximate band the day falls in.
 *
 * Bands:
 * - 'period': bleeding days (determined by flow level, not position)
 * - 'early': first ~third after period ends
 * - 'mid': middle ~third
 * - 'late': final ~third before next cycle
 *
 * Never labels ovulation or fertility windows.
 */
export function assignBand(
  dayOffset: number,
  bleedingDays: number,
  avgCycleLength: number
): CycleBand {
  // If within the bleeding window, it's the period band
  if (dayOffset < bleedingDays) {
    return 'period';
  }

  // Remaining days after period
  const remainingDays = avgCycleLength - bleedingDays;
  if (remainingDays <= 0) return 'late';

  const offsetAfterPeriod = dayOffset - bleedingDays;
  const thirdLength = remainingDays / 3;

  if (offsetAfterPeriod < thirdLength) return 'early';
  if (offsetAfterPeriod < thirdLength * 2) return 'mid';
  return 'late';
}

/**
 * Check if a given flow level counts as a bleeding day.
 */
export function isBleedingFlow(
  flow: FlowLevel | null,
  bleedingFlowLevels: readonly FlowLevel[]
): boolean {
  if (flow === null) return false;
  return bleedingFlowLevels.includes(flow);
}

/**
 * For a list of entries within one cycle, compute how many days
 * are actual bleeding days.
 */
export function countBleedingDays(
  entries: LogEntry[],
  bleedingFlowLevels: readonly FlowLevel[]
): number {
  return entries.filter(e => isBleedingFlow(e.flow, bleedingFlowLevels)).length;
}

/**
 * Count heavy flow days in a list of entries.
 */
export function countHeavyDays(entries: LogEntry[]): number {
  return entries.filter(e => e.flow === 'heavy').length;
}

/**
 * Get maximum pain level from entries.
 */
export function getMaxPain(entries: LogEntry[]): number | null {
  const pains = entries
    .map(e => e.painLevel)
    .filter((p): p is number => p !== null);
  return pains.length > 0 ? Math.max(...pains) : null;
}

/**
 * Parse a YYYY-MM-DD string into a Date at midnight UTC.
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Get the difference in days between two YYYY-MM-DD date strings.
 */
export function daysBetween(a: string, b: string): number {
  const da = parseDate(a);
  const db = parseDate(b);
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date string and return a new YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Format a date string for display.
 */
export function formatDate(dateStr: string, locale: 'en' | 'hi' = 'en'): string {
  const d = parseDate(dateStr);
  return d.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
