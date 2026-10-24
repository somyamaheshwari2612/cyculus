import type { Insights, KnowledgeRule, LogEntry } from '../../shared/types';
import knowledgeJson from '../../shared/knowledge.json';
import entriesJson from '../../shared/mocks/entries.regular.json';
import { BriefScreen } from './BriefScreen';

const entries = entriesJson as LogEntry[];
const knowledge = knowledgeJson as unknown as KnowledgeRule[];

// TEMPORARY demo insights until Devyani's computeInsights is pushed.
// Replace this whole block with the real computeInsights call before the demo.
const insights: Insights = {
  generatedAt: new Date().toISOString(),
  dataSufficiency: 'ok',
  cycles: [],
  stats: {
    cyclesUsed: 5,
    avgCycleLength: 31,
    cycleLengthSD: 4.2,
    shortest: 26,
    longest: 41,
    avgBleedingDays: 5,
  },
  prediction: null,
  patterns: [],
  flags: [
    { ruleId: 'cycle_long', severity: 'discuss', evidence: { cyclesAbove35: 2, of: 5 } },
  ],
};

export function BriefPage() {
  return <BriefScreen insights={insights} entries={entries} knowledge={knowledge} />;
}