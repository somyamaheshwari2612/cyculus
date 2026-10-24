import { useState } from 'react';
import { Printer } from 'lucide-react';
import type { Insights, KnowledgeRule, LogEntry } from '../../shared/types';
import { buildBrief } from './buildBrief';
import { BRIEF_TEXT } from '../../shared/translations';

export interface BriefScreenProps {
  insights: Insights;
  entries: LogEntry[];
  knowledge: KnowledgeRule[];
  language?: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
}

export function BriefScreen({
  insights,
  entries,
  knowledge,
  language: parentLanguage,
  onLanguageChange,
}: BriefScreenProps) {
  const [localLanguage, setLocalLanguage] = useState<'en' | 'hi'>(parentLanguage ?? 'en');
  const language = parentLanguage ?? localLanguage;

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLocalLanguage(lang);
    onLanguageChange?.(lang);
  };

  const brief = buildBrief(insights, entries, knowledge, language);
  const t = BRIEF_TEXT[language];

  return (
    <div className="space-y-6 pb-12">
      {/* Header: title and language switch (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-ink">
            {language === 'hi' ? 'डॉक्टर ब्रीफ' : 'Doctor Brief'}
          </h2>
          <p className="text-xs uppercase tracking-wide text-primary">
            {language === 'hi' ? 'चिट्ठी' : 'Chitthi'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            aria-pressed={language === 'en'}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold cursor-pointer transition-all ${
              language === 'en' ? 'bg-primary text-white shadow-soft' : 'bg-primary-soft text-ink hover:bg-primary-soft/80'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('hi')}
            aria-pressed={language === 'hi'}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold cursor-pointer transition-all ${
              language === 'hi' ? 'bg-primary text-white shadow-soft' : 'bg-primary-soft text-ink hover:bg-primary-soft/80'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* The brief itself: this part is what gets printed */}
      <article className="rounded-2xl bg-white p-6 shadow-sm print:shadow-none">
        <p className="text-base text-ink">{brief.summary}</p>

        <section className="mt-6">
          <h3 className="font-semibold text-ink">{t.cycleCount}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
            {brief.cyclePattern.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {brief.symptoms.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold text-ink">{language === 'hi' ? 'लक्षण' : 'Symptoms'}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              {brief.symptoms.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {brief.flags.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold text-ink">
              {language === 'hi' ? 'डॉक्टर से चर्चा करें' : 'Worth discussing with a doctor'}
            </h3>
            <div className="mt-2 space-y-3">
              {brief.flags.map((flag) => (
                <div key={flag.title} className="rounded-xl bg-blush p-4">
                  <p className="font-semibold text-ink">{flag.title}</p>
                  <p className="mt-1 text-sm text-ink">{flag.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {brief.questionsForDoctor.length > 0 && (
          <section className="mt-6">
            <h3 className="font-semibold text-ink">
              {language === 'hi' ? 'डॉक्टर से पूछने के सवाल' : 'Questions to ask your doctor'}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              {brief.questionsForDoctor.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-8 border-t border-primary-soft pt-4 text-xs text-ink/70">
          <p>{brief.disclaimer}</p>
          {brief.sourcesUsed.length > 0 && (
            <p className="mt-2">
              {language === 'hi' ? 'स्रोत: ' : 'Sources: '}
              {brief.sourcesUsed.join(', ')}
            </p>
          )}
        </footer>
      </article>

      {/* Print button (hidden when printing) */}
      <div className="print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white"
        >
          <Printer size={18} aria-hidden="true" />
          {language === 'hi' ? 'PDF के लिए प्रिंट करें' : 'Print / Save as PDF'}
        </button>
      </div>
    </div>
  );
}