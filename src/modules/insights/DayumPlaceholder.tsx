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
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">Dayum</h2>
            <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-tint-lavender px-3 py-1 rounded-full border border-[#E7DCF8]">
              {language === 'hi' ? 'चक्र ट्रैकर' : 'Cycle Tracker'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
            {language === 'hi'
              ? 'समय के साथ चक्र के पैटर्न और अनुमानित समय-सीमा'
              : 'Longitudinal timeline, calibrated prediction windows, & cited clinical flags'}
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={onNavigateToLog} className="rounded-full shadow-pill">
          {language === 'hi' ? '+ चेक-इन' : '+ Log Today'}
        </Button>
      </div>

      {/* Responsive Dual-Column Grid for Desktop (lg:) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Prediction Window & Clinical Flags (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. Next Period Prediction Window Card */}
          <div className="bg-gradient-to-br from-tint-lavender/60 via-white/80 to-tint-peach/40 rounded-[2.25rem] p-6 sm:p-7 border border-[#E7DCF8] shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'hi' ? 'अनुमानित पीरियड विंडो' : 'Predicted Period Window'}</span>
                </span>
                <span className="bg-white/90 text-primary px-3 py-0.5 rounded-full text-[11px] font-bold border border-[#E7DCF8] shadow-soft">
                  {language === 'hi' ? 'विंडो आधारित' : 'Window Estimate'}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                  {hasLogs ? 'Nov 18 – Nov 24' : 'Logging needed'}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                  {hasLogs
                    ? language === 'hi'
                      ? 'अपेक्षित: 21 नवम्बर 2026 (पिछले चक्रों के विचलन पर आधारित ±3 दिन)'
                      : 'Expected center: Nov 21, 2026 (Calibrated ±3 days window based on cycle history)'
                    : language === 'hi'
                      ? 'सटीक अनुमान के लिए कम से कम 1-2 चक्र का डेटा दर्ज करें।'
                      : 'Log at least 1-2 cycles to calibrate your personal window.'}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E7DCF8]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-ink-muted">
                  {language === 'hi' ? 'कुल दर्ज प्रविष्टियाँ:' : 'Total recorded entries:'}{' '}
                  <strong className="text-ink font-semibold">{logs.length} days</strong>
                </span>
                <span className="text-primary font-medium text-[11px] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'सिंगल तारीख नहीं, रेंज देखें' : 'Calibrated on Utah Hive baseline'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Flagged Clinical Insight (Demo Story for Riya / 41-day cycle) */}
          <div className="rounded-[2rem] bg-tint-rose/40 border border-[#F8DDE5] p-5 sm:p-6 shadow-card relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-brand-plum text-white rounded-2xl shadow-soft shrink-0 mt-0.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-white/90 px-3 py-0.5 rounded-full border border-[#F8DDE5]">
                    {language === 'hi' ? 'डॉक्टर से चर्चा योग्य' : 'Worth Discussing with Doctor'}
                  </span>
                  <span className="text-[11px] text-ink-muted font-medium">FIGO Clinical Standard</span>
                </div>

                <h4 className="text-base sm:text-lg font-serif font-bold text-ink mt-2.5 leading-snug">
                  {language === 'hi'
                    ? 'मासिक चक्र सामान्य अवधि (38 दिन) से अधिक लंबा रहा'
                    : 'Cycle interval longer than commonly cited range (41 days)'}
                </h4>

                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                  {language === 'hi'
                    ? 'आपका हालिया चक्र 41 दिनों का था। अंतरराष्ट्रीय दिशा-निर्देशों (FIGO 2018) के अनुसार 24 से 38 दिन का चक्र सामान्य माना जाता है।'
                    : 'Your most recent cycle was 41 days. FIGO criteria define normal adult menstrual frequency as 24 to 38 days.'}
                </p>

                <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-[#F8DDE5] text-xs text-ink flex items-center justify-between">
                  <span className="text-ink-muted">
                    {language === 'hi' ? 'साक्ष्य:' : 'Evidence:'} <strong>1 of recent cycles &gt; 38d</strong>
                  </span>
                  <a
                    href="https://doi.org/10.1002/ijgo.12666"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-semibold"
                  >
                    <span>FIGO Standard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Cycle Intervals & Metrics (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3. Recent Cycle History Summary */}
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
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
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    c.alert
                      ? 'bg-tint-rose/30 border-[#F8DDE5]'
                      : 'bg-white border-surface-border'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-ink">{c.label}</p>
                    <p className="text-[11px] text-ink-muted">Bleeding: ~5 days</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-serif font-bold ${c.alert ? 'text-primary' : 'text-ink'}`}>
                      {c.length}
                    </span>
                    <p className="text-[10px] text-ink-muted">{c.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Longitudinal Metrics Card */}
          <div className="bg-white/80 p-5 rounded-[2rem] border border-surface-border shadow-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
              {language === 'hi' ? 'लंबे समय के चक्र आंकड़े' : 'Longitudinal Cycle Metrics'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-tint-lavender/30 rounded-xl border border-[#E7DCF8]">
                <span className="text-ink-muted text-[11px] block">Average Length</span>
                <span className="font-serif font-bold text-base text-ink">33.2 days</span>
              </div>
              <div className="p-3 bg-tint-peach/30 rounded-xl border border-[#FADCD0]">
                <span className="text-ink-muted text-[11px] block">Range Spread</span>
                <span className="font-serif font-bold text-base text-ink">14 days</span>
              </div>
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              Based on empirical normal limits (Bull et al. 2019, <em>npj Digital Medicine</em>) and FIGO standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
