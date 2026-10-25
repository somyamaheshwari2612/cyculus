import React from 'react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { CalendarDays, BarChart3, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  language: 'en' | 'hi';
  dataSufficiency: 'none' | 'minimal';
  cycleCount?: number;
  onNavigateToLog: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  language,
  dataSufficiency,
  cycleCount = 0,
  onNavigateToLog,
}) => {
  const isNone = dataSufficiency === 'none';

  // Determine which step is currently active (1, 2, or 3)
  const currentStep = isNone ? 1 : cycleCount === 1 ? 2 : 3;

  const steps = [
    {
      num: 1,
      title: {
        en: 'Cycle 1 · Baseline',
        hi: 'चक्र 1 · बेसलाइन',
      },
      desc: {
        en: 'Log period days to detect your first bleeding episode and establish onset date.',
        hi: 'पीरियड के दिन दर्ज करें ताकि पहला चक्र और शुरुआत की तारीख स्थापित हो सके।',
      },
      tag: {
        en: 'Onset Detection',
        hi: 'शुरुआत की पहचान',
      },
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      num: 2,
      title: {
        en: 'Cycle 2 · Interval & Variance',
        hi: 'चक्र 2 · अंतराल और भिन्नता',
      },
      desc: {
        en: 'First cycle length computed. FIGO variation tracking and preliminary trends begin.',
        hi: 'पहली चक्र अवधि की गणना। FIGO मानक अनुसार भिन्नता ट्रैकिंग शुरू होती है।',
      },
      tag: {
        en: 'Variance Tracking',
        hi: 'भिन्नता ट्रैकिंग',
      },
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      num: 3,
      title: {
        en: 'Cycle 3+ · Calibrated Window',
        hi: 'चक्र 3+ · अंशांकित विंडो',
      },
      desc: {
        en: 'Probabilistic prediction window unlocked (~80% empirical Utah Hive coverage).',
        hi: 'संभावित भविष्यवाणी विंडो अनलॉक (~80% यूटा हाइव मानक कवरेज)।',
      },
      tag: {
        en: '~80% Coverage Window',
        hi: '~80% कवरेज विंडो',
      },
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  return (
    <Card variant="lavender" padding="lg" className="text-left max-w-xl mx-auto shadow-card">
      {/* Top Banner Icon & Message */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          {isNone ? <CalendarDays className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink">
            {isNone
              ? language === 'hi'
                ? 'अभी तक कोई चक्र दर्ज नहीं है'
                : 'No cycle data recorded yet'
              : language === 'hi'
              ? 'सीमित चक्र डेटा उपलब्ध है'
              : 'Limited cycle data available'}
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            {isNone
              ? language === 'hi'
                ? 'साइकुलस एक निश्चित तारीख का तुक्का नहीं लगाता, बल्कि आपके व्यक्तिगत डेटा से अंशांकित सांख्यिकीय विंडो तैयार करता है।'
                : 'Cyculus avoids single-date guesswork. As you log, our clinical engine unlocks calibrated prediction windows.'
              : language === 'hi'
              ? 'सटीक अनुमान के लिए 3 या अधिक पूर्ण चक्रों का डेटा दर्ज करें।'
              : 'Log 3 or more complete cycles for fully calibrated prediction windows.'}
          </p>
        </div>
      </div>

      {/* Visual 3-Step Milestone Roadmap */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            {language === 'hi' ? 'चक्र अंतर्दृष्टि रोडमैप' : 'Insight Activation Roadmap'}
          </span>
          <span className="text-[10px] text-ink-muted bg-white/80 px-2 py-0.5 rounded-full border border-surface-border">
            {language === 'hi' ? `चरण ${currentStep} / 3` : `Step ${currentStep} of 3`}
          </span>
        </div>

        <div className="space-y-3 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-primary/20 pointer-events-none -z-0" />

          {steps.map(s => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <div
                key={s.num}
                className={`relative z-10 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-white border-primary shadow-sm ring-1 ring-primary/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white/50 border-surface-border opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step status circle */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-surface-subtle text-ink-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{s.num}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap mb-0.5">
                      <h4 className="text-xs sm:text-sm font-bold text-ink">
                        {s.title[language]}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-subtle text-ink-muted'
                        }`}
                      >
                        {s.tag[language]}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-ink-muted leading-relaxed">
                      {s.desc[language]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/15">
        <span className="text-[11px] text-ink-muted text-center sm:text-left">
          {language === 'hi'
            ? 'आज के लक्षण और पीरियड फ्लो तुरंत दर्ज करें।'
            : 'Takes ~10 seconds per day. Zero account required.'}
        </span>
        <Button variant="primary" size="md" onClick={onNavigateToLog} className="w-full sm:w-auto">
          {language === 'hi' ? '+ आज का चेक-इन करें' : '+ Log Today'}
        </Button>
      </div>
    </Card>
  );
};
