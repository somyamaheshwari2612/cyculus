import { useMemo } from 'react';
import type { KnowledgeRule, LogEntry } from '../../shared/types';
import knowledgeJson from '../../shared/knowledge.json';
import entriesJson from '../../shared/mocks/entries.regular.json';
import { computeInsights } from '../insights';
import { BriefScreen } from './BriefScreen';

const entries = entriesJson as LogEntry[];
const knowledge = knowledgeJson as unknown as KnowledgeRule[];

export function BriefPage() {
  const today = new Date().toISOString().slice(0, 10);

  // Real engine output from Devyani's computeInsights
  const insights = useMemo(
    () => computeInsights(entries, knowledge, today),
    [today]
  );

  return <BriefScreen insights={insights} entries={entries} knowledge={knowledge} />;
}