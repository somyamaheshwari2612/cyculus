import React from 'react';
import type { KnowledgeRule, Flag, Prediction } from '@/shared/types';
import { Button } from '@/app/components/Button';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: KnowledgeRule[];
  activeFlags: Flag[];
  prediction?: Prediction | null;
  language: 'en' | 'hi';
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  rules,
  activeFlags,
  prediction,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-surface-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                {language === 'hi' ? 'मेडिकल नियम और संदर्भ' : 'Clinical Rules & Evidence'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                {language === 'hi' ? '100% पारदर्शी, बिना किसी AI डायग्नोसिस के' : '100% Deterministic · Zero AI Diagnoses'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-border flex items-center justify-center text-ink cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Prediction Window Explanation (Why am I seeing this?) */}
        {prediction && (
          <div className="mb-4 p-4 rounded-2xl bg-tint-lavender/50 border border-[#E7DCF8] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>
                  {language === 'hi' ? 'यह अंदाज़ा कैसे निकाला गया?' : 'Why am I seeing this prediction?'}
                </span>
              </span>
              <span className="text-[10px] font-bold text-primary bg-white px-2.5 py-0.5 rounded-full border border-primary/20 shadow-pill">
                {language === 'hi'
                  ? `पिछले ${prediction.basedOnCycles} पीरियड्स के हिसाब से`
                  : `Based on ${prediction.basedOnCycles} ${prediction.basedOnCycles === 1 ? 'cycle' : 'cycles'}`}
              </span>
            </div>

            <p className="text-ink-muted leading-relaxed">
              {language === 'hi'
                ? `यह विंडो आपके पिछले ${prediction.basedOnCycles} पूरे पीरियड्स के गैप और वैज्ञानिक मॉडल (Utah Hive) पर आधारित है।`
                : `This window is calculated from the variance across your last ${prediction.basedOnCycles} completed ${prediction.basedOnCycles === 1 ? 'cycle' : 'cycles'}, calibrated against the Utah Hive empirical model.`}
            </p>

            <div className="pt-0.5 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white/90 rounded-xl border border-[#E7DCF8]">
                <span className="text-ink-muted block text-[10px] font-medium">
                  {language === 'hi' ? 'अनुमानित केंद्र:' : 'Expected Center:'}
                </span>
                <span className="font-bold text-ink">
                  {new Date(prediction.expected + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-[#E7DCF8]">
                <span className="text-ink-muted block text-[10px] font-medium">
                  {language === 'hi' ? 'अनुमानित दायरा:' : 'Window Range:'}
                </span>
                <span className="font-bold text-primary">
                  {new Date(prediction.earliest + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' })} – {new Date(prediction.latest + 'T00:00:00').toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed pt-1">
              <strong>💡 {language === 'hi' ? 'दायरा क्यों, एक तारीख क्यों नहीं?' : 'Why a window instead of a single day?'}</strong>{' '}
              {language === 'hi'
                ? 'पीरियड्स में 2 से 4 दिन का आगे-पीछे होना पूरी तरह स्वाभाविक है। एक निश्चित तारीख तय करने के बजाय 80% संभावना का दायरा दिखाना ज़्यादा व्यावहारिक और सच्चा तरीका है।'
                : 'Menstrual cycles naturally fluctuate by ±2 to 4 days across months. Pinpointing an exact single day is clinically false; an empirical ±3 day window provides ~80% coverage for realistic preparation.'}
            </p>
          </div>
        )}

        {/* Explainability manifesto */}
        <div className="p-3 bg-purple-50/70 rounded-2xl border border-primary/15 text-xs text-ink-muted mb-4 leading-relaxed">
          <p>
            {language === 'hi'
              ? 'साइकुलस किसी बीमारी का इलाज या जांच (डायग्नोसिस) नहीं करता। सभी अलर्ट सीधे अंतरराष्ट्रीय मेडिकल गाइडलाइन्स (जैसे FIGO 2018 मानक) पर आधारित हैं।'
              : 'Cyculus never attempts medical diagnoses. Every threshold and flag is evaluated directly against peer-reviewed clinical guidelines (such as FIGO 2018 criteria) with cited sources.'}
          </p>
        </div>

        {/* Active Flags section */}
        {activeFlags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-severity-discuss animate-pulse" />
              {language === 'hi' ? 'ध्यान देने योग्य अलर्ट' : 'Currently Active Flags'}
            </h4>
            <div className="space-y-2">
              {activeFlags.map(flag => {
                const rule = rules.find(r => r.id === flag.ruleId);
                if (!rule) return null;
                const evidenceStr = Object.entries(flag.evidence)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ');

                return (
                  <div key={flag.ruleId} className="p-3 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                    <p className="font-bold text-ink mb-1">{rule.title[language]}</p>
                    <p className="text-ink-muted mb-1.5">{rule.explanation[language]}</p>
                    <div className="text-[11px] text-primary font-medium bg-white p-2 rounded-lg border border-surface-border">
                      {language === 'hi' ? 'लॉग किया गया डेटा:' : 'Evidence Trigger:'} <strong>{evidenceStr}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Reference Rules */}
        <div>
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            {language === 'hi' ? 'सत्यापित मेडिकल नियम' : 'Verified Knowledge Rules'}
          </h4>

          <div className="space-y-2.5">
            {rules.map(rule => (
              <div key={rule.id} className="p-3 rounded-xl border border-surface-border bg-white text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{rule.title[language]}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {rule.status}
                  </span>
                </div>

                <p className="text-ink-muted text-[11px] leading-relaxed">
                  {rule.explanation[language]}
                </p>

                {/* Thresholds */}
                <div className="text-[10px] text-ink-muted font-mono bg-surface-subtle px-2 py-1 rounded">
                  thresholds: {Object.entries(rule.params).map(([k, v]) => `${k}=${v}`).join(', ')}
                </div>

                {/* Citations */}
                {rule.sources.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                    {rule.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <span>{src.name}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-surface-border flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            {language === 'hi' ? 'समझ आ गया / बंद करें' : 'Got it, close'}
          </Button>
        </div>
      </div>
    </div>
  );
};
