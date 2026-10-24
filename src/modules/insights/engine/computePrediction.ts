import type { CycleSummary, Prediction, AlgorithmConfig } from '@/shared/types';
import { addDays } from './bandUtils';

/**
 * Compute a prediction window for the next period.
 *
 * Method: mean of the last N completed cycle lengths (N from config.predictionWindowBaselineCycles,
 * default 3), with window width = coverageFactorSD * SD of those cycles.
 *
 * The coverageFactorSD is calibrated so that real coverage lands near ~80%.
 * Under a normal approximation, z=1.28 gives ~80% coverage.
 * Cycle length distributions are right-skewed, so actual coverage may differ;
 * the Utah eval script will verify.
 *
 * Confidence levels:
 * - 'low': 1 completed cycle (SD=0, window is fixed ±3 days fallback)
 * - 'medium': 2 completed cycles
 * - 'high': ≥3 completed cycles
 *
 * Returns null if there are no completed cycles.
 */
export function computePrediction(
  cycles: CycleSummary[],
  config: AlgorithmConfig,
  _today: string
): Prediction | null {
  const completed = cycles.filter(
    (c): c is CycleSummary & { lengthDays: number } => c.lengthDays !== null
  );

  if (completed.length === 0) return null;

  // Use the last N cycles for prediction
  const n = Math.min(config.predictionWindowBaselineCycles, completed.length);
  const recentCycles = completed.slice(-n);
  const lengths = recentCycles.map(c => c.lengthDays);

  const avg = mean(lengths);
  const sd = stdDev(lengths);

  // The last cycle in the list (completed or not) — we predict from the last cycle's start
  const lastCycle = cycles[cycles.length - 1];
  const predictFromDate = lastCycle.startDate;

  // Expected next period: lastCycleStart + avgLength
  const expectedDays = Math.round(avg);
  const expected = addDays(predictFromDate, expectedDays);

  // Window width
  let halfWidth: number;
  if (sd === 0 || completed.length === 1) {
    // Not enough variance data; use a fallback window of ±3 days
    halfWidth = 3;
  } else {
    halfWidth = Math.max(2, Math.round(config.coverageFactorSD * sd));
  }

  const earliest = addDays(predictFromDate, expectedDays - halfWidth);
  const latest = addDays(predictFromDate, expectedDays + halfWidth);

  // Confidence
  let confidence: 'low' | 'medium' | 'high';
  if (completed.length === 1) {
    confidence = 'low';
  } else if (completed.length === 2) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  return {
    expected,
    earliest,
    latest,
    confidence,
    basedOnCycles: n,
  };
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map(v => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((s, d) => s + d, 0) / values.length);
}
