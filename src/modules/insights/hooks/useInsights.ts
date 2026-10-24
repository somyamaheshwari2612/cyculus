import { useMemo } from 'react';
import type { LogEntry, Insights, KnowledgeBase } from '@/shared/types';
import { computeInsights } from '../engine/computeInsights';
import knowledgeData from '@/shared/knowledge.json';

/**
 * React hook that computes insights whenever the logs change.
 *
 * Takes logs from the parent (passed down from AppShell's useLogs).
 * Recomputes synchronously — the engine is pure and fast.
 */
export function useInsights(logs: LogEntry[]): Insights {
  const knowledge = knowledgeData as KnowledgeBase;
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const insights = useMemo(() => {
    return computeInsights(logs, knowledge, today);
  }, [logs, knowledge, today]);

  return insights;
}
