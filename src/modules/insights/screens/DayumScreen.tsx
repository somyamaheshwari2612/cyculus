import React, { useState } from 'react';
import type { LogEntry } from '@/shared/types';
import { useInsights } from '../hooks/useInsights';
import knowledgeData from '@/shared/knowledge.json';
import type { KnowledgeBase } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
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
}

export const DayumScreen: React.FC<DayumScreenProps> = ({
  logs,
  language,
  onNavigateToLog,
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

  const hasNoData = insights.dataSufficiency === 'none';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-ink tracking-tight">Dayum</h2>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary-soft/60 px-2.5 py-0.5 rounded-full">
              {language === 'hi' ? 'चक्र अंतर्दृष्टि' : 'Cycle Insights'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {language === 'hi'
              ? 'समय के साथ चक्र के पैटर्न और अंशांकित सांख्यिकीय विंडो'
              : 'Longitudinal timeline, calibrated prediction windows, & cited flags'}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={onNavigateToLog}>
          {language === 'hi' ? '+ चेक-इन' : '+ Log Today'}
        </Button>
      </div>

      {/* If absolutely no data, show EmptyState */}
      {hasNoData ? (
        <EmptyState
          language={language}
          dataSufficiency="none"
          cycleCount={insights.stats?.cyclesUsed ?? insights.cycles.filter(c => c.lengthDays !== null).length}
          onNavigateToLog={onNavigateToLog}
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
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {formatDateRange(insights.prediction.earliest, insights.prediction.latest)}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {language === 'hi'
                      ? `अपेक्षित केंद्र: ${formatSingleDate(insights.prediction.expected)} (आपके पिछले ${insights.prediction.basedOnCycles} चक्रों के विचलन पर आधारित)`
                      : `Expected center: ${formatSingleDate(insights.prediction.expected)} (Calibrated window based on last ${insights.prediction.basedOnCycles} cycles)`}
                  </p>
                </div>

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
            <Card variant="lavender" padding="md">
              <p className="text-xs text-ink-muted">
                {language === 'hi'
                  ? 'सटीक विंडो अनुमान के लिए कम से कम 1 पूरा चक्र दर्ज करें।'
                  : 'Log at least 1 completed cycle to calculate your personal prediction window.'}
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
              <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                {language === 'hi' ? 'हालिया चक्र इतिहास' : 'Recent Cycle Intervals'}
              </h3>

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
