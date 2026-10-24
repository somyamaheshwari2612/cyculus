import React from 'react';
import type { SymptomPattern, CycleBand } from '@/shared/types';
import { SYMPTOM_LABELS } from '@/shared/translations';
import { Card } from '@/app/components/Card';
import { Activity, Info } from 'lucide-react';

interface SymptomPatternViewProps {
  patterns: SymptomPattern[];
  language: 'en' | 'hi';
}

const BAND_LABELS: Record<CycleBand, { en: string; hi: string; color: string; bg: string }> = {
  period: {
    en: 'Period',
    hi: 'पीरियड',
    color: 'text-rose-700',
    bg: 'bg-rose-100',
  },
  early: {
    en: 'Post-Period',
    hi: 'पीरियड बाद',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
  },
  mid: {
    en: 'Mid-Cycle',
    hi: 'मध्य चक्र',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
  },
  late: {
    en: 'Pre-Period',
    hi: 'पीरियड पूर्व',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
  },
};

const BANDS: CycleBand[] = ['period', 'early', 'mid', 'late'];

export const SymptomPatternView: React.FC<SymptomPatternViewProps> = ({ patterns, language }) => {
  if (patterns.length === 0) return null;

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {language === 'hi' ? 'लक्षण और चक्र चरण' : 'Symptoms Across Cycle Phases'}
        </h3>
        <span className="text-[10px] text-ink-muted">
          {patterns.length} {language === 'hi' ? 'लक्षण ट्रैक किए गए' : 'symptoms tracked'}
        </span>
      </div>

      {/* Safety notice: no ovulation claims */}
      <div className="flex items-start gap-2 p-2.5 bg-surface-subtle rounded-xl border border-surface-border mb-4 text-[11px] text-ink-muted">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {language === 'hi'
            ? 'चक्र चरण अनुमानित समय-सीमाएं हैं (पीरियड, शुरुआती, मध्य और पूर्व-पीरियड)। यह प्रजनन क्षमता या ओव्यूलेशन का दावा नहीं है।'
            : 'Phases are statistical timeline bands relative to your period start. No ovulation or fertility claims are made.'}
        </p>
      </div>

      {/* Band Legend */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4 text-center">
        {BANDS.map(band => {
          const cfg = BAND_LABELS[band];
          return (
            <div key={band} className={`py-1.5 px-1 rounded-xl ${cfg.bg} border border-black/5`}>
              <span className={`text-[10px] sm:text-xs font-semibold ${cfg.color} block truncate`}>
                {cfg[language]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Symptom bars */}
      <div className="space-y-3">
        {patterns.slice(0, 6).map(pattern => {
          const info = SYMPTOM_LABELS[pattern.symptom] || {
            en: pattern.symptom.replace(/_/g, ' '),
            hi: pattern.symptom,
            emoji: '🩺',
          };
          const total = pattern.totalDays || 1;

          // Find dominant band
          let dominantBand: CycleBand = 'period';
          let maxCount = -1;
          for (const band of BANDS) {
            const count = pattern.byBand[band] || 0;
            if (count > maxCount) {
              maxCount = count;
              dominantBand = band;
            }
          }

          return (
            <div key={pattern.symptom} className="p-3 rounded-2xl bg-surface-subtle border border-surface-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  <span>{info.emoji}</span>
                  <span>{info[language]}</span>
                </div>
                <div className="text-[11px] text-ink-muted">
                  <span className="font-medium text-ink">{pattern.totalDays}</span>{' '}
                  {language === 'hi' ? 'दिन' : 'days'}
                  {maxCount > 0 && (
                    <span className="ml-1.5 text-primary font-medium">
                      ({language === 'hi' ? 'सर्वाधिक:' : 'Peak:'} {BAND_LABELS[dominantBand][language]})
                    </span>
                  )}
                </div>
              </div>

              {/* Segmented horizontal distribution bar */}
              <div className="h-2.5 w-full bg-white rounded-full overflow-hidden flex border border-surface-border">
                {BANDS.map(band => {
                  const count = pattern.byBand[band] || 0;
                  const pct = total > 0 ? (count / total) * 100 : 0;
                  if (pct === 0) return null;

                  const colorClass =
                    band === 'period'
                      ? 'bg-rose-500'
                      : band === 'early'
                      ? 'bg-emerald-500'
                      : band === 'mid'
                      ? 'bg-amber-500'
                      : 'bg-purple-500';

                  return (
                    <div
                      key={band}
                      style={{ width: `${pct}%` }}
                      className={`${colorClass} h-full transition-all`}
                      title={`${BAND_LABELS[band][language]}: ${count}d (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>

              {/* Mini counts */}
              <div className="grid grid-cols-4 gap-1 mt-1.5 text-[10px] text-ink-muted text-center">
                {BANDS.map(band => (
                  <span key={band}>
                    {pattern.byBand[band] || 0}d
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
