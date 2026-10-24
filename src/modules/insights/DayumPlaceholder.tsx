import React from 'react';
import { LogEntry, UserProfile } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { TrendingUp, Sparkles, ExternalLink, CheckCircle2, Calendar } from 'lucide-react';
import {
  deriveCycles,
  calculateRollingStats,
  predictNextPeriodWindow,
  getCurrentCycleStatus,
  checkClinicalFlags,
  diffDays
} from './cycleEngine';

export interface DayumPlaceholderProps {
  logs: LogEntry[];
  profile?: UserProfile | null;
  language: 'en' | 'hi';
  onNavigateToLog: () => void;
}

function formatDate(isoDate: string, language: 'en' | 'hi'): string {
  try {
    const d = new Date(isoDate + 'T00:00:00Z');
    const monthEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const day = d.getUTCDate();
    const month = language === 'hi' ? monthHi[d.getUTCMonth()] : monthEn[d.getUTCMonth()];
    return `${month} ${day}`;
  } catch {
    return isoDate;
  }
}

export const DayumPlaceholder: React.FC<DayumPlaceholderProps> = ({
  logs,
  profile,
  language,
  onNavigateToLog
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Derive dynamic cycles, rolling stats, prediction, and flags
  const cycles = deriveCycles(logs, profile);
  const stats = calculateRollingStats(cycles, profile);
  
  const lastCycleStart = cycles.length > 0 
    ? cycles[cycles.length - 1].startDate 
    : (profile?.lastPeriodStartDate || todayStr);

  const prediction = predictNextPeriodWindow(lastCycleStart, stats);
  const cycleStatus = getCurrentCycleStatus(
    lastCycleStart,
    todayStr,
    stats,
    profile?.typicalPeriodDuration || 5
  );
  const flags = checkClinicalFlags(cycles, logs);

  const formattedEarliest = formatDate(prediction.earliest, language);
  const formattedLatest = formatDate(prediction.latest, language);
  const formattedExpected = formatDate(prediction.expected, language);

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
              ? 'समय के साथ चक्र के पैटर्न और व्यक्तिगत अनुमानित समय-सीमा'
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
                  {prediction.confidence === 'high' ? 'High Confidence' : 'Calibrated Window'}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                  {formattedEarliest} – {formattedLatest}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                  {language === 'hi'
                    ? `अपेक्षित केंद्र: ${formattedExpected} (रोलिंग औसत ${stats.avgCycleLength} दिन, ±${diffDays(prediction.latest, prediction.expected)} दिन विचलन)`
                    : `Expected center: ${formattedExpected} (Based on ${stats.avgCycleLength}-day rolling average, ±${diffDays(prediction.latest, prediction.expected)} days window)`}
                </p>
              </div>

              {/* Active Cycle Phase Band Badge */}
              <div className="mt-4 p-3 bg-white/85 rounded-2xl border border-[#E7DCF8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-muted block">
                    {language === 'hi' ? 'वर्तमान चक्र चरण' : 'Current Cycle Phase'}
                  </span>
                  <span className="text-xs font-serif font-bold text-primary">
                    🌸 Cycle Day {cycleStatus.cycleDay} · {language === 'hi' ? cycleStatus.bandLabel.hi : cycleStatus.bandLabel.en}
                  </span>
                </div>
                <span className="text-[11px] text-ink-muted text-right max-w-[160px] hidden sm:inline-block leading-tight">
                  {language === 'hi' ? cycleStatus.bandDescription.hi : cycleStatus.bandDescription.en}
                </span>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E7DCF8]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-ink-muted">
                  {language === 'hi' ? 'कुल दर्ज प्रविष्टियाँ:' : 'Total recorded logs:'}{' '}
                  <strong className="text-ink font-semibold">{logs.length} days</strong>
                </span>
                <span className="text-primary font-medium text-[11px] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  {language === 'hi' ? 'व्यक्तिगत रोलिंग औसत' : `Calibrated on ${stats.cyclesUsed} cycles`}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Flagged Clinical Insight or Healthy Baseline */}
          {flags.length > 0 ? (
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
                    {flags[0].ruleId === 'cycle_long' && (
                      language === 'hi'
                        ? 'मासिक चक्र सामान्य अवधि (38 दिन) से अधिक लंबा रहा'
                        : `Cycle interval longer than commonly cited range (${stats.longest} days)`
                    )}
                    {flags[0].ruleId === 'cycle_short' && (
                      language === 'hi'
                        ? 'मासिक चक्र सामान्य अवधि (24 दिन) से छोटा रहा'
                        : `Cycle interval shorter than standard range (${stats.shortest} days)`
                    )}
                    {flags[0].ruleId === 'cycle_variability_high' && (
                      language === 'hi'
                        ? 'चक्रों की लंबाई में उच्च परिवर्तनशीलता (>9 दिन)'
                        : `Cycle variability exceeds clinical threshold (${stats.longest - stats.shortest}d spread)`
                    )}
                    {flags[0].ruleId === 'heavy_flow_persistent' && (
                      language === 'hi'
                        ? 'लगातार कई दिनों तक भारी रक्तस्राव'
                        : 'Persistent heavy menstrual flow identified'
                    )}
                    {flags[0].ruleId === 'dysmenorrhea_severe' && (
                      language === 'hi'
                        ? 'माहवारी के दौरान गंभीर दर्द (दर्द स्तर ≥ 7)'
                        : 'Severe dysmenorrhea recorded on bleeding days'
                    )}
                  </h4>

                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {language === 'hi'
                      ? 'अंतरराष्ट्रीय दिशा-निर्देशों (FIGO 2018) के अनुसार 24 से 38 दिन का चक्र और ≤7-9 दिन का विचलन सामान्य माना जाता है।'
                      : 'FIGO criteria define normal adult menstrual frequency as 24 to 38 days, with cycle length variability ≤7–9 days.'}
                  </p>

                  <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-[#F8DDE5] text-xs text-ink flex items-center justify-between">
                    <span className="text-ink-muted">
                      {language === 'hi' ? 'साक्ष्य:' : 'Evidence:'} <strong>FIGO criteria threshold met</strong>
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
          ) : (
            <div className="rounded-[2rem] bg-tint-mint/40 border border-[#D8F0E4] p-5 sm:p-6 shadow-card relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-soft shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 px-3 py-0.5 rounded-full border border-[#D8F0E4]">
                      {language === 'hi' ? 'संतुलित चक्र सीमा' : 'Within Clinical Normal Limits'}
                    </span>
                    <span className="text-[11px] text-ink-muted font-medium">FIGO 2018 Standards</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-serif font-bold text-ink mt-2.5 leading-snug">
                    {language === 'hi'
                      ? 'आपके चक्र के आंकड़े सामान्य चिकित्सकीय सीमा (24–38 दिन) में हैं'
                      : `Cycle frequency (${stats.avgCycleLength}d) within normal adult range (24–38 days)`}
                  </h4>

                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {language === 'hi'
                      ? 'कोई असामान्य विचलन नहीं पाया गया। अपने दैनिक लक्षणों और फ्लो को इसी तरह रिकॉर्ड करते रहें।'
                      : 'No abnormal cycle length or prolonged bleeding flags detected across your recorded logs.'}
                  </p>

                  <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-[#D8F0E4] text-xs text-ink flex items-center justify-between">
                    <span className="text-ink-muted">
                      {language === 'hi' ? 'मानक संदर्भ:' : 'Reference:'} <strong>FIGO Menstrual Disorders Classification</strong>
                    </span>
                    <a
                      href="https://doi.org/10.1002/ijgo.12666"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-800 hover:underline text-[11px] font-semibold"
                    >
                      <span>FIGO 2018</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Recent Cycle Intervals & Metrics (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 3. Recent Cycle History Summary */}
          <Card variant="default" padding="lg">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
              {language === 'hi' ? 'हालिया चक्र इतिहास' : 'Recent Cycle Intervals'}
            </h3>

            <div className="space-y-2.5">
              {cycles.length > 0 ? (
                cycles.map((c, i) => {
                  const isCurrent = c.endDate === null;
                  const daysLogged = isCurrent 
                    ? diffDays(todayStr, c.startDate) + 1 
                    : c.lengthDays;
                  const isFlagged = c.lengthDays !== null && (c.lengthDays < 24 || c.lengthDays > 38);

                  return (
                    <div
                      key={c.startDate + i}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isFlagged
                          ? 'bg-tint-rose/30 border-[#F8DDE5]'
                          : isCurrent
                          ? 'bg-tint-lavender/30 border-[#E7DCF8]'
                          : 'bg-white border-surface-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-ink">
                            {isCurrent 
                              ? (language === 'hi' ? 'वर्तमान चक्र (प्रगति पर)' : 'Current Active Cycle')
                              : (language === 'hi' ? `चक्र ${i + 1}` : `Cycle ${i + 1}`)}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-primary bg-white/90 px-2 py-0.5 rounded-full border border-[#E7DCF8]">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-muted mt-0.5">
                          Started: {formatDate(c.startDate, language)} · Bleeding: ~{c.bleedingDays} days
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-serif font-bold ${isFlagged ? 'text-primary' : 'text-ink'}`}>
                          {isCurrent ? `Day ${daysLogged}` : `${c.lengthDays} days`}
                        </span>
                        <p className="text-[10px] text-ink-muted">
                          {isCurrent ? 'In progress' : isFlagged ? 'Outside 24-38d' : 'Within range'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-tint-lavender/30 rounded-2xl border border-[#E7DCF8] text-center text-xs text-ink-muted">
                  <Calendar className="w-6 h-6 mx-auto mb-1 text-primary opacity-60" />
                  <p>{language === 'hi' ? 'कोई चक्र डेटा नहीं मिला।' : 'No cycle data recorded yet.'}</p>
                </div>
              )}
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
                <span className="font-serif font-bold text-base text-ink">{stats.avgCycleLength} days</span>
              </div>
              <div className="p-3 bg-tint-peach/30 rounded-xl border border-[#FADCD0]">
                <span className="text-ink-muted text-[11px] block">Range Spread</span>
                <span className="font-serif font-bold text-base text-ink">{stats.longest - stats.shortest} days</span>
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
