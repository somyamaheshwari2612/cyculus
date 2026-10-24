import type { LogEntry, Insights, KnowledgeBase } from '@/shared/types';
import { deriveCycles } from './deriveCycles';
import { computeStats } from './computeStats';
import { computePrediction } from './computePrediction';
import { computePatterns } from './computePatterns';
import { evaluateFlags } from './evaluateFlags';

/**
 * Main entry point: compute all insights from raw log entries.
 *
 * Pure function — no side effects, no network calls, no LLM.
 * All thresholds come from knowledge.json.
 *
 * @param entries - Raw daily log entries from the user's local store
 * @param knowledge - The full knowledge base (rules + algorithm config)
 * @param today - Today's date as 'YYYY-MM-DD'
 * @returns The complete Insights object consumed by the UI and Module C
 */
export function computeInsights(
  entries: LogEntry[],
  knowledge: KnowledgeBase,
  today: string
): Insights {
  const { rules, algorithm } = knowledge;

  // Step 1: Derive cycles from bleeding episodes
  const cycles = deriveCycles(entries, algorithm, today);

  // Step 2: Determine data sufficiency
  const completedCycles = cycles.filter(c => c.lengthDays !== null);
  let dataSufficiency: 'none' | 'minimal' | 'ok';
  if (completedCycles.length === 0) {
    dataSufficiency = 'none';
  } else if (completedCycles.length <= 2) {
    dataSufficiency = 'minimal';
  } else {
    dataSufficiency = 'ok';
  }

  // Step 3: Compute stats (null if no completed cycles)
  const stats = computeStats(cycles);

  // Step 4: Prediction window (null if no completed cycles)
  const prediction = computePrediction(cycles, algorithm, today);

  // Step 5: Symptom patterns by cycle band
  const patterns = computePatterns(entries, cycles, algorithm);

  // Step 6: Evaluate flags against knowledge rules
  const flags = evaluateFlags(cycles, entries, rules, algorithm, today);

  return {
    generatedAt: new Date().toISOString(),
    dataSufficiency,
    cycles,
    stats,
    prediction,
    patterns,
    flags,
  };
}
