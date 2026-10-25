import { useMemo, useState } from 'react';
import type { KnowledgeRule, LogEntry } from '../../shared/types';
import knowledgeJson from '../../shared/knowledge.json';
import entriesJson from '../../shared/mocks/entries.regular.json';
import { computeInsights } from '../insights';
import { BriefScreen } from './BriefScreen';

type EngineKnowledge = Parameters<typeof computeInsights>[1];
type Range = 3 | 6 | 'all';

const allEntries = entriesJson as LogEntry[];
const engineKnowledge = knowledgeJson as unknown as EngineKnowledge;
const rules = (knowledgeJson as unknown as { rules: KnowledgeRule[] }).rules;

const RANGES: { value: Range; label: string }[] = [
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 'all', label: 'All history' },
];

function filterEntries(all: LogEntry[], range: Range, today: string): LogEntry[] {
  if (range === 'all') return all;
  const start = new Date(today);
  start.setMonth(start.getMonth() - range);
  const from = start.toISOString().slice(0, 10);
  return all.filter((e) => e.date >= from && e.date <= today);
}

export function BriefPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [range, setRange] = useState<Range>('all');
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const visible = useMemo(() => filterEntries(allEntries, range, today), [range, today]);
  const insights = useMemo(
    () => computeInsights(visible, engineKnowledge, today),
    [visible, today]
  );

  const langButton = (lang: 'en' | 'hi', label: string) => (
    <button
      key={lang}
      type="button"
      onClick={() => setLanguage(lang)}
      aria-pressed={language === lang}
      className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${
        language === lang ? 'bg-primary text-white' : 'bg-primary-soft text-ink'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={String(r.value)}
            type="button"
            onClick={() => setRange(r.value)}
            aria-pressed={range === r.value}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${
              range === r.value ? 'bg-primary text-white' : 'bg-primary-soft text-ink'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 print:hidden">
        {langButton('en', 'English')}
        {langButton('hi', 'हिन्दी')}
      </div>

      <BriefScreen
        insights={insights}
        entries={visible}
        knowledge={rules}
        language={language}
      />
    </div>
  );
}