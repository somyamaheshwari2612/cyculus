import type { LogEntry, CycleSummary, SymptomPattern, CycleBand, Symptom, AlgorithmConfig } from '@/shared/types';
import { SYMPTOMS } from '@/shared/types';
import { assignBand, daysBetween } from './bandUtils';

/**
 * Compute symptom patterns across all cycles, grouped by CycleBand.
 *
 * For each symptom in the vocabulary, counts how many days it appeared
 * and breaks that count down by which cycle band (period/early/mid/late)
 * the day fell in.
 *
 * Only includes symptoms that were actually logged at least once.
 */
export function computePatterns(
  entries: LogEntry[],
  cycles: CycleSummary[],
  _config: AlgorithmConfig
): SymptomPattern[] {
  if (entries.length === 0 || cycles.length === 0) return [];

  // Compute average cycle length from completed cycles for band assignment
  const completedLengths = cycles
    .filter((c): c is CycleSummary & { lengthDays: number } => c.lengthDays !== null)
    .map(c => c.lengthDays);

  const avgCycleLength = completedLengths.length > 0
    ? completedLengths.reduce((s, l) => s + l, 0) / completedLengths.length
    : 28; // fallback if no completed cycles

  // Compute average bleeding days
  const bleedingDayCounts = cycles.map(c => c.bleedingDays);
  const avgBleedingDays = bleedingDayCounts.length > 0
    ? Math.round(bleedingDayCounts.reduce((s, d) => s + d, 0) / bleedingDayCounts.length)
    : 5; // fallback

  // Build a map of date → cycle band
  const dateToBand = new Map<string, CycleBand>();

  for (let i = 0; i < cycles.length; i++) {
    const cycle = cycles[i];
    const cycleStart = cycle.startDate;
    const cycleEnd = i < cycles.length - 1
      ? cycles[i + 1].startDate
      : null;

    // Assign bands to each entry in this cycle
    for (const entry of entries) {
      if (entry.date < cycleStart) continue;
      if (cycleEnd !== null && entry.date >= cycleEnd) continue;

      const dayOffset = daysBetween(cycleStart, entry.date);
      const band = assignBand(dayOffset, avgBleedingDays, avgCycleLength);
      dateToBand.set(entry.date, band);
    }
  }

  // Count symptoms by band
  const symptomCounts = new Map<Symptom, { total: number; byBand: Record<CycleBand, number> }>();

  for (const entry of entries) {
    const band = dateToBand.get(entry.date);
    if (!band) continue; // entry not in any cycle

    for (const symptom of entry.symptoms) {
      if (!SYMPTOMS.includes(symptom as Symptom)) continue;

      if (!symptomCounts.has(symptom)) {
        symptomCounts.set(symptom, {
          total: 0,
          byBand: { period: 0, early: 0, mid: 0, late: 0 },
        });
      }

      const counts = symptomCounts.get(symptom)!;
      counts.total += 1;
      counts.byBand[band] += 1;
    }
  }

  // Convert to SymptomPattern[], sorted by total descending
  const patterns: SymptomPattern[] = [];
  for (const [symptom, counts] of symptomCounts) {
    patterns.push({
      symptom,
      totalDays: counts.total,
      byBand: counts.byBand,
    });
  }

  patterns.sort((a, b) => b.totalDays - a.totalDays);
  return patterns;
}
