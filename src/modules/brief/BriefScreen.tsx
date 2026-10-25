import { Printer, FileText, PlusCircle, Sparkles } from 'lucide-react';
import type { Insights, KnowledgeRule, LogEntry } from '../../shared/types';
import { buildBrief } from './buildBrief';
import { BRIEF_TEXT } from '../../shared/translations';
import { Card } from '../../app/components/Card';
import { Button } from '../../app/components/Button';

export interface BriefScreenProps {
  insights: Insights;
  entries: LogEntry[];
  knowledge: KnowledgeRule[];
  language?: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
  onNavigateToLog?: () => void;
}

export function BriefScreen({
  insights,
  entries,
  knowledge,
  language: parentLanguage,
  onNavigateToLog,
}: BriefScreenProps) {
  const language = parentLanguage ?? 'en';

  const hasNoEntries = entries.length === 0;
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
              ? 'डॉक्टर को दिखाने के लिए 1-पेज की क्लिनिकल चिट्ठी'
              : '1-page consultation brief formatted with FIGO thresholds & cited guidelines'}
          </p>
        </div>

        {/* Primary Obvious Action */}
        <button
          type="button"
          onClick={() => window.print()}
          disabled={hasNoEntries}
          title={hasNoEntries ? (language === 'hi' ? 'प्रिंट करने के लिए डेटा आवश्यक है' : 'Log data to print / save as PDF') : undefined}
          className={`flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            hasNoEntries
              ? 'bg-ink-muted/20 text-ink-muted cursor-not-allowed border border-surface-border'
              : 'bg-primary text-white shadow-soft hover:shadow-card hover:bg-primary-dark cursor-pointer active:scale-95'
          }`}
        >
          <Printer size={16} aria-hidden="true" />
          <span>{language === 'hi' ? 'PDF प्रिंट / डाउनलोड करें' : 'Print / Save as PDF'}</span>
        </button>
      </div>

      {/* If no entries yet, show clean Empty State with clear next steps */}
      {hasNoEntries ? (
        <Card variant="lavender" padding="lg" className="border-primary/20 shadow-soft">
          <div className="max-w-xl mx-auto text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-soft">
              <FileText className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink mb-2">
              {language === 'hi' ? 'अभी कोई एंट्री नहीं है' : 'No entries yet'}
            </h3>

            <p className="text-sm sm:text-base text-ink-muted mb-6 max-w-md mx-auto leading-relaxed">
              {language === 'hi'
                ? 'आज कैसा रहा यह बताइए—2-3 पीरियड्स के बाद आपका पूरा पैटर्न यहाँ दिखने लगेगा।'
                : 'Tell us about today, and your pattern will appear here after a few cycles.'}
            </p>

            {onNavigateToLog && (
              <div className="flex justify-center mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<PlusCircle className="w-5 h-5" />}
                  onClick={onNavigateToLog}
                  className="shadow-soft px-8 font-bold"
                >
                  {language === 'hi' ? 'आज का दिन लॉग करें' : 'Tell us about today'}
                </Button>
              </div>
            )}

            <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-[#E7DCF8] text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'hi'
                    ? 'खाली चिट्ठी डॉक्टर को कुछ नहीं बताती — लॉग करने पर क्या तैयार होगा:'
                    : 'An empty chart tells the doctor nothing. Here is what your brief will include:'}
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-tint-lavender/40 rounded-xl border border-[#E7DCF8]">
                  <span className="font-bold text-ink block mb-0.5">1. {language === 'hi' ? 'पीरियड का पूरा हिसाब' : 'FIGO Metrics'}</span>
                  <p className="text-[11px] text-ink-muted leading-snug">
                    {language === 'hi'
                      ? 'औसत गैप, ब्लीडिंग के दिन और तारीखों में कितना बदलाव रहा।'
                      : 'Average cycle duration, variance, and bleeding duration stats.'}
                  </p>
                </div>

                <div className="p-3 bg-tint-rose/30 rounded-xl border border-[#F8DDE5]">
                  <span className="font-bold text-ink block mb-0.5">2. {language === 'hi' ? 'ध्यान देने वाली बातें (Flags)' : 'Clinical Flags'}</span>
                  <p className="text-[11px] text-ink-muted leading-snug">
                    {language === 'hi'
                      ? 'अगर ब्लीडिंग बहुत ज़्यादा रही या दर्द बहुत रहा, तो मेडिकल गाइडलाइन्स के आधार पर संकेत।'
                      : 'NICE/ACOG cited flags for heavy bleeding or dysmenorrhea.'}
                  </p>
                </div>

                <div className="p-3 bg-tint-mint/40 rounded-xl border border-[#D8F0E4]">
                  <span className="font-bold text-ink block mb-0.5">3. {language === 'hi' ? 'डॉक्टर से पूछने के सवाल' : 'Doctor Questions'}</span>
                  <p className="text-[11px] text-ink-muted leading-snug">
                    {language === 'hi'
                      ? 'आपके लक्षणों के आधार पर डॉक्टर से बात करने के लिए तैयार प्रश्न।'
                      : 'Targeted consultation questions customized to your symptoms.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* The brief itself: this part is what gets printed */
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
              <div className="text-[10px] text-primary font-bold">
                {language === 'hi' ? 'फोन में सुरक्षित · FIGO सत्यापित' : 'Phone-First Storage · FIGO Verified'}
              </div>
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
            <h3 className="font-semibold text-ink">{language === 'hi' ? 'मुख्य लक्षण' : 'Symptoms'}</h3>
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
              {language === 'hi' ? 'डॉक्टर से बात करने योग्य बातें' : 'Worth discussing with a doctor'}
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
              {language === 'hi' ? 'मेडिकल संदर्भ: ' : 'Sources: '}
              {brief.sourcesUsed.join(', ')}
            </p>
          )}
        </footer>
      </article>
      )}

      {/* Print button (hidden when printing and hidden when no entries) */}
      {!hasNoEntries && (
        <div className="print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-dark transition-all cursor-pointer"
          >
            <Printer size={18} aria-hidden="true" />
            {language === 'hi' ? 'PDF प्रिंट / डाउनलोड करें' : 'Print / Save as PDF'}
          </button>
        </div>
      )}
    </div>
  );
}