import React from 'react';
import { LogEntry, Insights, UserSetup } from '@/shared/types';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { TrendingUp, Sparkles, ExternalLink, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { diffDays } from './computeInsights';

import { PwaUsageGuide } from '@/app/components/PwaUsageGuide';

export interface DayumPlaceholderProps {
  logs: LogEntry[];
  insights: Insights;
  userSetup?: UserSetup | null;
  language: 'en' | 'hi';
  onNavigateToLog: () => void;
  onOpenSetup?: () => void;
  onLoadPersona?: (type: 'riya' | 'regular' | 'heavy') => Promise<void>;
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
  insights,
  userSetup,
  language,
  onNavigateToLog,
  onOpenSetup,
  onLoadPersona
}) => {
  // When in a fresh browser with zero logs and no setup profile, render the full PWA Usage Guide & Instructions
  if (logs.length === 0 && !userSetup) {
    return (
      <div className="space-y-6 pb-12">
        <PwaUsageGuide
          language={language}
          onNavigateToLog={onNavigateToLog}
          onOpenSetup={onOpenSetup}
          onLoadPersona={onLoadPersona}
        />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const { prediction, cycles, stats, flags, dataSufficiency } = insights;

  const formattedEarliest = prediction ? formatDate(prediction.earliest, language) : null;
  const formattedLatest = prediction ? formatDate(prediction.latest, language) : null;
  const formattedExpected = prediction ? formatDate(prediction.expected, language) : null;

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
                  {prediction
                    ? prediction.basedOnCycles >= 3
                      ? 'Validated Window (Utah Hive)'
                      : prediction.basedOnCycles >= 1
                      ? 'Shrinkage Prior Blend'
                      : userSetup?.typicalCycleLength
                      ? 'Prior Estimate (Low Confidence)'
                      : 'Population Avg (29.3d, Bull et al.)'
                    : 'Logging Needed'}
                </span>
              </div>

              <div className="mt-4">
                {prediction ? (
                  <>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight">
                      {formattedEarliest} – {formattedLatest}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                      {language === 'hi'
                        ? `अपेक्षित केंद्र: ${formattedExpected} (विचलन: ±${diffDays(prediction.latest, prediction.expected)} दिन)`
                        : `Expected center: ${formattedExpected} (Calibrated ±${diffDays(prediction.latest, prediction.expected)} days window)`}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
                      {language === 'hi' ? 'लॉगिंग आवश्यक' : 'Logging needed'}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                      {language === 'hi'
                        ? 'अनुमानित विंडो देखने के लिए अपनी पिछली माहवारी की तारीख दर्ज करें या आज का चेक-इन करें।'
                        : 'Log your period start or set up your cycle prior to calibrate your window.'}
                    </p>
                    {onOpenSetup && (
                      <button
                        type="button"
                        onClick={onOpenSetup}
                        className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        + Set up cycle prior →
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Data Sufficiency Badge */}
              <div className="mt-5 pt-3.5 border-t border-[#E7DCF8]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-ink-muted">
                  {language === 'hi' ? 'वास्तविक दर्ज प्रविष्टियाँ:' : 'Real logged entries:'}{' '}
                  <strong className="text-ink font-semibold">{logs.length} days</strong>
                </span>
                <span className="text-primary font-medium text-[11px] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                  {dataSufficiency === 'ok'
                    ? `${stats?.cyclesUsed} completed cycles`
                    : dataSufficiency === 'minimal'
                    ? `${stats?.cyclesUsed} cycle (blending with prior)`
                    : 'Prior only (0 completed cycles)'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Flagged Clinical Insight / Data Sufficiency Info */}
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
                        ? `मासिक चक्र सामान्य अवधि (38 दिन) से अधिक लंबा रहा (${stats?.longest} दिन)`
                        : `Observed cycle interval longer than typical range (${stats?.longest} days)`
                    )}
                    {flags[0].ruleId === 'cycle_short' && (
                      language === 'hi'
                        ? `मासिक चक्र सामान्य अवधि (24 दिन) से छोटा रहा (${stats?.shortest} दिन)`
                        : `Observed cycle interval shorter than typical range (${stats?.shortest} days)`
                    )}
                    {flags[0].ruleId === 'cycle_variability_high' && (
                      language === 'hi'
                        ? 'चक्रों की लंबाई में उच्च परिवर्तनशीलता (>9 दिन)'
                        : `Cycle variability exceeds clinical threshold (${(stats?.longest || 0) - (stats?.shortest || 0)}d spread)`
                    )}
                    {flags[0].ruleId === 'heavy_flow_persistent' && (
                      language === 'hi'
                        ? 'लगातार कई दिनों तक भारी रक्तस्राव'
                        : 'Persistent heavy menstrual flow identified'
                    )}
                    {flags[0].ruleId === 'period_long' && (
                      language === 'hi'
                        ? 'रक्तस्राव की अवधि 8 दिनों से अधिक रही'
                        : 'Bleeding episode duration longer than 8 days'
                    )}
                  </h4>

                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {language === 'hi'
                      ? 'अंतरराष्ट्रीय दिशा-निर्देशों (FIGO 2018) के अनुसार 24 से 38 दिन का चक्र और ≤7-9 दिन का विचलन सामान्य माना जाता है।'
                      : 'FIGO criteria define normal adult menstrual frequency as 24 to 38 days, with cycle length variability ≤7–9 days.'}
                  </p>

                  <div className="mt-4 p-3 bg-white/90 rounded-2xl border border-[#F8DDE5] text-xs text-ink flex items-center justify-between">
                    <span className="text-ink-muted">
                      {language === 'hi' ? 'साक्ष्य:' : 'Evidence:'} <strong>Derived strictly from logged logs</strong>
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
          ) : dataSufficiency === 'ok' ? (
            <div className="rounded-[2rem] bg-tint-mint/40 border border-[#D8F0E4] p-5 sm:p-6 shadow-card relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-soft shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-white/90 px-3 py-0.5 rounded-full border border-[#D8F0E4]">
                      {language === 'hi' ? 'संतुलित चक्र सीमा' : 'Within Normal Clinical Limits'}
                    </span>
                    <span className="text-[11px] text-ink-muted font-medium">FIGO 2018 Standards</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-serif font-bold text-ink mt-2.5 leading-snug">
                    {language === 'hi'
                      ? `आपके चक्र की औसत अवधि (${stats?.avgCycleLength} दिन) सामान्य सीमा (24–38 दिन) में है`
                      : `Observed cycle frequency (${stats?.avgCycleLength}d) within normal adult range (24–38 days)`}
                  </h4>

                  <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
                    {language === 'hi'
                      ? 'कोई असामान्य चक्र विचलन नहीं पाया गया। अपने दैनिक लक्षणों और फ्लो को इसी तरह रिकॉर्ड करते रहें।'
                      : 'No abnormal cycle length or prolonged bleeding flags detected across your logged entries.'}
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
          ) : (
            <div className="rounded-[2rem] bg-tint-lavender/30 border border-[#E7DCF8] p-5 sm:p-6 shadow-card relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-primary-soft text-primary rounded-2xl shadow-soft shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 px-2.5 py-0.5 rounded-full border border-[#E7DCF8]">
                    {language === 'hi' ? 'डेटा पर्याप्तता: कम' : 'Data Sufficiency: Minimal'}
                  </span>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-ink mt-2 leading-snug">
                    {language === 'hi'
                      ? 'क्लिनिकल फ़्लैग के लिए वास्तविक लॉग आवश्यक हैं'
                      : 'Clinical standards require observed logs (<1 completed cycle logged)'}
                  </h4>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {language === 'hi'
                      ? 'हम अनुमानित स्व-सूचित डेटा के आधार पर कभी कोई फ़्लैग नहीं लगाते। जैसे-जैसे आप दैनिक लॉग दर्ज करेंगी, साइकुलस आपके वास्तविक चक्रों का मूल्यांकन करेगा।'
                      : 'To prevent hallucination, Cyculus never fires FIGO flags from self-reported setup data. Real flags evaluate strictly on completed logged cycles.'}
                  </p>
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
              {language === 'hi' ? 'हालिया चक्र इतिहास (वास्तविक लॉग)' : 'Recent Observed Cycle Intervals'}
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
                  <p>{language === 'hi' ? 'कोई चक्र डेटा नहीं मिला। आज का फ्लो दर्ज करें।' : 'No completed cycles logged yet. Log today to start.'}</p>
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
                <span className="text-ink-muted text-[11px] block">Observed Average</span>
                <span className="font-serif font-bold text-base text-ink">
                  {stats ? `${stats.avgCycleLength} days` : '—'}
                </span>
              </div>
              <div className="p-3 bg-tint-peach/30 rounded-xl border border-[#FADCD0]">
                <span className="text-ink-muted text-[11px] block">Range Spread</span>
                <span className="font-serif font-bold text-base text-ink">
                  {stats ? `${stats.longest - stats.shortest} days` : '—'}
                </span>
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
