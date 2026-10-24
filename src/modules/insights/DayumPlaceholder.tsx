import { LogEntry } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { TrendingUp, Sparkles, ExternalLink } from 'lucide-react';

export interface DayumPlaceholderProps {
  logs: LogEntry[];
  language: 'en' | 'hi';
  onNavigateToLog: () => void;
}

export const DayumPlaceholder: React.FC<DayumPlaceholderProps> = ({
  logs,
  language,
  onNavigateToLog
}) => {
  const hasLogs = logs.length > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-ink tracking-tight">Dayum</h2>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary-soft/60 px-2.5 py-0.5 rounded-full">
              {language === 'hi' ? 'चक्र ट्रैकर' : 'Cycle Tracker'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1">
            {language === 'hi'
              ? 'समय के साथ चक्र के पैटर्न और अनुमानित समय-सीमा'
              : 'Longitudinal timeline, calibrated prediction windows, & cited flags'}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={onNavigateToLog}>
          {language === 'hi' ? '+ चेक-इन' : '+ Log Today'}
        </Button>
      </div>

      {/* 1. Next Period Prediction Window Card */}
      <Card variant="lavender" padding="lg" className="border-primary/25 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'hi' ? 'अनुमानित पीरियड विंडो' : 'Predicted Period Window'}</span>
            </span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px]">
              {language === 'hi' ? 'विंडो आधारित' : 'Window Estimate'}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {hasLogs ? 'Nov 18 – Nov 24' : 'Logging needed'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              {hasLogs
                ? language === 'hi'
                  ? 'अपेक्षित: 21 नवम्बर 2026 (पिछले चक्रों के विचलन पर आधारित)'
                  : 'Expected center: Nov 21, 2026 (Calibrated ±3 days window based on cycle history)'
                : language === 'hi'
                  ? 'सटीक अनुमान के लिए कम से कम 1-2 चक्र का डेटा दर्ज करें।'
                  : 'Log at least 1-2 cycles to calibrate your personal window.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-ink-muted">
              {language === 'hi' ? 'कुल दर्ज प्रविष्टियाँ:' : 'Total recorded entries:'}{' '}
              <strong className="text-ink">{logs.length} days</strong>
            </span>
            <span className="text-primary font-medium">
              {language === 'hi' ? 'सिंगल तारीख नहीं, रेंज देखें' : 'Calibrated on Utah Hive baseline'}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Flagged Clinical Insight (Demo Story for Riya / 41-day cycle) */}
      <div className="rounded-3xl bg-purple-50/80 border border-primary-soft p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary text-white rounded-xl shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-soft/80 px-2.5 py-0.5 rounded-full">
                {language === 'hi' ? 'डॉक्टर से चर्चा योग्य' : 'Worth Discussing with Doctor'}
              </span>
              <span className="text-[11px] text-ink-muted">FIGO Clinical Standard</span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-ink mt-2">
              {language === 'hi'
                ? 'मासिक चक्र सामान्य अवधि (38 दिन) से अधिक लंबा रहा'
                : 'Cycle interval longer than commonly cited range (41 days)'}
            </h4>

            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
              {language === 'hi'
                ? 'आपका हालिया चक्र 41 दिनों का था। अंतरराष्ट्रीय दिशा-निर्देशों (FIGO 2018) के अनुसार 24 से 38 दिन का चक्र सामान्य माना जाता है।'
                : 'Your most recent cycle was 41 days. FIGO criteria define normal adult menstrual frequency as 24 to 38 days.'}
            </p>

            <div className="mt-3 p-3 bg-white rounded-2xl border border-surface-border text-xs text-ink flex items-center justify-between">
              <span className="text-ink-muted">
                {language === 'hi' ? 'साक्ष्य:' : 'Evidence:'} <strong>1 of recent cycles &gt; 38d</strong>
              </span>
              <a
                href="https://doi.org/10.1002/ijgo.12666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
              >
                <span>FIGO Standard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Cycle History Summary */}
      <Card variant="default" padding="lg">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
          {language === 'hi' ? 'हालिया चक्र इतिहास' : 'Recent Cycle Intervals'}
        </h3>

        <div className="space-y-2.5">
          {[
            { label: 'Latest Cycle (Cycle 5)', length: '41 days', tag: 'High variability', alert: true },
            { label: 'Cycle 4', length: '29 days', tag: 'Within range', alert: false },
            { label: 'Cycle 3', length: '36 days', tag: 'Within range', alert: false },
            { label: 'Cycle 2', length: '27 days', tag: 'Within range', alert: false },
          ].map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle border border-surface-border"
            >
              <div>
                <p className="text-xs font-semibold text-ink">{c.label}</p>
                <p className="text-[11px] text-ink-muted">Bleeding: ~5 days</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${c.alert ? 'text-primary' : 'text-ink'}`}>
                  {c.length}
                </span>
                <p className="text-[10px] text-ink-muted">{c.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
