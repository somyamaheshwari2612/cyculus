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
      {/* Header: title and primary action (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">
              {language === 'hi' ? 'डॉक्टर ब्रीफ' : 'Doctor Brief'}
            </h2>
            <span className="text-[11px] font-bold text-primary bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8]">
              {language === 'hi' ? 'क्लिनिकल चिट्ठी' : 'clinical chitthi'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            {language === 'hi'
              ? 'डॉक्टर से परामर्श हेतु 1-पेज का संक्षिप्त क्लिनिकल सारांश'
              : '1-page consultation brief formatted with FIGO thresholds & cited guidelines'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quiet language toggle */}
          <div className="flex bg-[#F0E6EE]/70 p-1 rounded-full border border-[#E7DCF8]">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              aria-pressed={language === 'en'}
              className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                language === 'en' ? 'bg-white text-primary shadow-pill' : 'text-ink-muted hover:text-ink'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('hi')}
              aria-pressed={language === 'hi'}
              className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                language === 'hi' ? 'bg-white text-primary shadow-pill' : 'text-ink-muted hover:text-ink'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Primary Obvious Action */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-soft hover:shadow-card hover:bg-primary-dark transition-all cursor-pointer active:scale-95"
          >
            <Printer size={16} aria-hidden="true" />
            <span>{language === 'hi' ? 'PDF प्रिंट / डाउनलोड करें' : 'Print / Save as PDF'}</span>
          </button>
        </div>
      </div>

      {/* The brief itself: this part is what gets printed */}
      <article className="rounded-2xl bg-white p-6 shadow-sm print:shadow-none print:p-0">
        {/* Printable Header - Visible strictly when printing / saving as PDF */}
        <div className="hidden print:block mb-6 pb-3 border-b-2 border-primary">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🌸</span>
                <h1 className="text-xl font-serif font-bold text-ink">Cyculus</h1>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {language === 'hi' ? 'क्लिनिकल स्वास्थ्य सारांश (डॉक्टर ब्रीफ)' : 'Clinical Menstrual Health Summary'}
              </p>
            </div>
            <div className="text-right text-xs text-ink-muted">
              <div className="font-semibold text-ink">
                {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { dateStyle: 'medium' })}
              </div>
              <div className="text-[10px] text-primary font-bold">100% On-Device · FIGO Verified</div>
            </div>
          </div>
        </div>

        <p className="text-base text-ink leading-relaxed">{brief.summary}</p>

        <section className="mt-6 print-avoid-break">
          <h3 className="font-semibold text-ink">{t.cycleCount}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
            {brief.cyclePattern.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        {brief.symptoms.length > 0 && (
          <section className="mt-6 print-avoid-break">
            <h3 className="font-semibold text-ink">{language === 'hi' ? 'लक्षण' : 'Symptoms'}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">
              {brief.symptoms.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {brief.flags.length > 0 && (
          <section className="mt-6 print-avoid-break">
            <h3 className="font-semibold text-ink">
              {language === 'hi' ? 'डॉक्टर से चर्चा करें' : 'Worth discussing with a doctor'}
            </h3>
            <div className="mt-2 space-y-3">
              {brief.flags.map((flag) => (
                <div key={flag.title} className="rounded-xl bg-blush p-4 border border-rose-100 print:bg-gray-50 print:border-gray-200">
                  <p className="font-semibold text-ink">{flag.title}</p>
                  <p className="mt-1 text-sm text-ink">{flag.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {brief.questionsForDoctor.length > 0 && (
          <section className="mt-6 print-avoid-break">
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