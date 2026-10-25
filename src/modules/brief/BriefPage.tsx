import { useMemo } from 'react';
import type { KnowledgeRule, LogEntry } from '../../shared/types';
import knowledgeJson from '../../shared/knowledge.json';
import entriesJson from '../../shared/mocks/entries.regular.json';
import { computeInsights } from '../insights';
import { BriefScreen } from './BriefScreen';

// The engine needs the whole knowledge file ({ rules, algorithm })
type EngineKnowledge = Parameters<typeof computeInsights>[1];

const entries = entriesJson as LogEntry[];
const engineKnowledge = knowledgeJson as unknown as EngineKnowledge;

// The brief screen looks up flag text by rule id, so it needs just the rules list
const rules = (knowledgeJson as unknown as { rules: KnowledgeRule[] }).rules;

export function BriefPage() {
  const today = new Date().toISOString().slice(0, 10);

  const insights = useMemo(
    () => computeInsights(entries, engineKnowledge, today),
    [today]
  );

  return <BriefScreen insights={insights} entries={entries} knowledge={rules} />;
}