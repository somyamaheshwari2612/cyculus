import { useMemo } from 'react';
import type { KnowledgeRule, LogEntry } from '../../shared/types';
import knowledgeJson from '../../shared/knowledge.json';
import entriesJson from '../../shared/mocks/entries.regular.json';
import { computeInsights } from '../insights/computeInsights';
import { BriefScreen } from './BriefScreen';

// Demo data for now. Replace with the real LogStore once Module A's useLogs is connected.
const entries = entriesJson as LogEntry[];
const knowledge = knowledgeJson as unknown as KnowledgeRule[];

export function BriefPage() {
  const today = new Date().toISOString().slice(0, 10);

  const insights = useMemo(
    () => computeInsights(entries, knowledge, today),
    [today]
  );

  return <BriefScreen insights={insights} entries={entries} knowledge={knowledge} />;
}