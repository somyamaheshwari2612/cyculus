import React, { useState } from 'react';
import type { LogEntry } from '@/shared/types';
import { useInsights } from '../hooks/useInsights';
import knowledgeData from '@/shared/knowledge.json';
import type { KnowledgeBase } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { CycleTimeline } from './CycleTimeline';
import { CycleLengthChart } from './CycleLengthChart';
import { SymptomPatternView } from './SymptomPatternView';
import { FlagList } from './FlagCard';
import { WhyModal } from './WhyModal';
import { EmptyState } from './EmptyState';
import { Sparkles, HelpCircle, ChevronRight, History } from 'lucide-react';

export interface DayumScreenProps {
  logs: LogEntry[];
  language: 'en' | 'hi';
  onNavigateToLog: () => void;
  onOpenSettings?: () => void;
}

export const DayumScreen: React.FC<DayumScreenProps> = ({
  logs,
  language,
  onNavigateToLog,
  onOpenSettings,
}) => {
  const knowledge = knowledgeData as KnowledgeBase;
  const insights = useInsights(logs);
  const [showWhyModal, setShowWhyModal] = useState(false);

  // Format date helper
  const formatDateRange = (startStr: string, endStr: string) => {
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    const locale = language === 'hi' ? 'hi-IN' : 'en-US';

    const sMonth = s.toLocaleDateString(locale, { month: 'short' });
    const sDay = s.getDate();
    const eMonth = e.toLocaleDateString(locale, { month: 'short' });
    const eDay = e.getDate();

    if (sMonth === eMonth) {
      return `${sMonth} ${sDay} – ${eDay}`;
    }
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}`;
  };

  const formatSingleDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasZeroLogs = logs.length === 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">Dayum</h2>
          <span className="text-[11px] font-bold text-primary bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8]">
            {language === 'hi' ? 'चक्र टाइमलाइन' : 'cycle timeline'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
          {language === 'hi'
            ? 'समय के साथ चक्र के पैटर्न और अंशांकित सांख्यिकीय विंडो'
            : 'Longitudinal timeline, calibrated prediction windows, & cited flags'}
        </p>
      </div>

      {/* If absolutely no entries yet, show EmptyState saying what to do next */}
      {hasZeroLogs ? (
        <EmptyState
          language={language}
          dataSufficiency="none"
          onNavigateToLog={onNavigateToLog}
          onOpenSettings={onOpenSettings}
        />
      ) : (
        <>
          {/* 1. Prediction Window Card */}
          {insights.prediction ? (
            <Card variant="lavender" padding="lg" className="border-primary/25 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'hi' ? 'अनुमानित पीरियड विंडो' : 'Predicted Period Window'}</span>
                  </span>
                  <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {insights.prediction.confidence === 'high'
                      ? language === 'hi' ? 'उच्च विश्वास' : 'High Confidence'
                      : insights.prediction.confidence === 'medium'
                      ? language === 'hi' ? 'मध्यम विश्वास' : 'Medium Confidence'
                      : language === 'hi' ? 'सीमित विश्वास' : 'Low Confidence'}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-ink tracking-tight mb-1">
                    {language === 'hi'
                      ? `आपका अगला पीरियड ${formatDateRange(insights.prediction.earliest, insights.prediction.latest)} के बीच आने का अनुमान है।`
                      : `Your next period is predicted between ${formatDateRange(insights.prediction.earliest, insights.prediction.latest)}.`}
                  </h4>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {language === 'hi'
                      ? `अपेक्षित केंद्र: ${formatSingleDate(insights.prediction.expected)} (आपके पिछले ${insights.prediction.basedOnCycles} चक्रों के विचलन पर आधारित)`
                      : `Expected center: ${formatSingleDate(insights.prediction.expected)} (Calibrated window based on last ${insights.prediction.basedOnCycles} cycles)`}
                  </p>
                </div>

                {insights.prediction.basedOnCycles < 3 && (
                  <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-[11px] text-amber-900 flex items-start gap-2.5 leading-relaxed">
                    <span className="shrink-0 text-sm">💡</span>
                    <span>
                      {language === 'hi'
                        ? `प्रारंभिक अनुमान (केवल ${insights.prediction.basedOnCycles} चक्र दर्ज): चक्रों में प्राकृतिक उतार-चढ़ाव (±2–4 दिन) सामान्य है। 3+ चक्र दर्ज करने पर यूटा हाइव मॉडल पूर्ण अंशांकन (~85% कवरेज) प्राप्त करेगा।`
                        : `Early Window (${insights.prediction.basedOnCycles} cycle analyzed): Menstrual cycles naturally fluctuate by ±2–4 days. Logging 3+ cycles achieves full Utah Hive calibration (~85% empirical coverage).`}
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-ink-muted">
                    {language === 'hi' ? 'चक्र इतिहास:' : 'Cycles analyzed:'}{' '}
                    <strong className="text-ink">{insights.stats?.cyclesUsed ?? insights.cycles.length}</strong>
                  </span>
                  <span className="text-primary font-medium flex items-center gap-1">
                    <span>{language === 'hi' ? 'यूटा हाइव बेसलाइन द्वारा अंशांकित (~80% कवरेज)' : 'Calibrated on Utah Hive baseline (~80% coverage)'}</span>
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="lavender" padding="lg" className="border-primary/25 shadow-soft">
              <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'hi' ? 'पहला चक्र प्रगति पर' : 'Cycle 1 in Progress'}</span>
                </span>
                <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  {logs.length} {language === 'hi' ? 'दिन दर्ज' : 'days logged'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                {language === 'hi' ? 'व्यक्तिगत विंडो का अंशांकन' : 'Calibrating Personal Prediction Window'}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'खाली चार्ट कुछ नहीं बताता। जब आपका अगला पीरियड शुरू होगा और पहला चक्र पूरा होगा, तब यूटा हाइव मॉडल द्वारा अंशांकित सांख्यिकीय विंडो (~80% कवरेज) यहाँ सक्रिय हो जाएगा।'
                  : 'An empty chart tells you nothing. When your next period begins to complete Cycle 1, your personalized ±3 day prediction window will be calibrated here.'}
              </p>
            </Card>
          )}

          {/* 2. Flagged Clinical Insights */}
          <FlagList
            flags={insights.flags}
            rules={knowledge.rules}
            language={language}
          />

          {/* 3. Cycle Timeline & Calendar */}
          <CycleTimeline
            logs={logs}
            prediction={insights.prediction}
            language={language}
          />

          {/* 4. Cycle Length Trend Chart */}
          <CycleLengthChart
            cycles={insights.cycles}
            rules={knowledge.rules}
            language={language}
          />

          {/* 5. Symptom Patterns Across Phases */}
          <SymptomPatternView
            patterns={insights.patterns}
            language={language}
          />

          {/* 6. Recent Cycle Intervals Log */}
          {insights.cycles.length > 0 && (
            <Card variant="default" padding="lg">
              <div className="mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2 mb-1">
                  <History className="w-4 h-4 text-primary" />
                  <span>{language === 'hi' ? 'हालिया चक्र इतिहास' : 'Recent Cycle Intervals'}</span>
                </h3>
                <h4 className="text-lg sm:text-xl font-serif font-bold text-ink tracking-tight">
                  {language === 'hi'
                    ? `आपके पिछले ${insights.cycles.length} चक्रों के अंतराल और रक्तस्राव का इतिहास।`
                    : `Tracking your last ${insights.cycles.length} cycle intervals and bleeding durations.`}
                </h4>
              </div>

              <div className="space-y-2.5">
                {[...insights.cycles].reverse().map((c, i) => {
                  const cycleNum = insights.cycles.length - i;
                  const isUnfinished = c.lengthDays === null;
                  const isOutlier = c.lengthDays !== null && (c.lengthDays < 24 || c.lengthDays > 38);

                  return (
                    <div
                      key={c.startDate}
                      className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-surface-border"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-ink">
                            {language === 'hi' ? `चक्र ${cycleNum}` : `Cycle ${cycleNum}`}
                            {isUnfinished && ` (${language === 'hi' ? 'चालू' : 'Current'})`}
                          </p>
                          {isOutlier && (
                            <span className="text-[10px] bg-severity-discuss/15 text-severity-discuss font-bold px-1.5 py-0.2 rounded">
                              {language === 'hi' ? 'परिवर्तनशील' : 'Out of standard range'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          {formatSingleDate(c.startDate)} · {c.bleedingDays} {language === 'hi' ? 'रक्तस्राव के दिन' : 'bleeding days'}
                          {c.maxPain !== null && ` · ${language === 'hi' ? 'अधिकतम दर्द' : 'max pain'} ${c.maxPain}/10`}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-bold ${isOutlier ? 'text-primary' : 'text-ink'}`}>
                          {isUnfinished ? (language === 'hi' ? 'चालू' : 'Ongoing') : `${c.lengthDays} d`}
                        </span>
                        <p className="text-[10px] text-ink-muted">
                          {isUnfinished ? '' : isOutlier ? (language === 'hi' ? 'मार्गदर्शन से भिन्न' : 'Variance') : (language === 'hi' ? 'सामान्य' : 'Typical')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Explainability / Clinical Guidelines CTA */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setShowWhyModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors cursor-pointer p-2 rounded-xl hover:bg-surface-subtle"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'यह एल्गोरिदम कैसे काम करता है? (चिकित्सीय मानक और संदर्भ)'
                  : 'How does this algorithm work? (Clinical guidelines & references)'}
              </span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {/* Explainability Modal */}
      <WhyModal
        isOpen={showWhyModal}
        onClose={() => setShowWhyModal(false)}
        rules={knowledge.rules}
        activeFlags={insights.flags}
        language={language}
      />
    </div>
  );
};
