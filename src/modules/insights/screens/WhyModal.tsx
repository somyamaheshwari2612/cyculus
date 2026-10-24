import React from 'react';
import type { KnowledgeRule, Flag } from '@/shared/types';
import { Button } from '@/app/components/Button';
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: KnowledgeRule[];
  activeFlags: Flag[];
  language: 'en' | 'hi';
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  rules,
  activeFlags,
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
                {language === 'hi' ? 'चिकित्सीय नियम और साक्ष्य' : 'Clinical Rules & Evidence'}
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

        {/* Explainability manifesto */}
        <div className="p-3 bg-purple-50/70 rounded-2xl border border-primary/15 text-xs text-ink-muted mb-4 leading-relaxed">
          <p>
            {language === 'hi'
              ? 'साइकुलस किसी भी प्रकार का चिकित्सीय निदान (डायग्नोसिस) नहीं करता है। सभी अलर्ट सीधे अंतरराष्ट्रीय चिकित्सा दिशानिर्देशों (जैसे FIGO 2018 मानक) के सत्यापन पर आधारित हैं।'
              : 'Cyculus never attempts medical diagnoses. Every threshold and flag is evaluated directly against peer-reviewed clinical guidelines (such as FIGO 2018 criteria) with cited sources.'}
          </p>
        </div>

        {/* Active Flags section */}
        {activeFlags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-severity-discuss animate-pulse" />
              {language === 'hi' ? 'वर्तमान में सक्रिय अलर्ट' : 'Currently Active Flags'}
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
                      {language === 'hi' ? 'साक्ष्य डेटा:' : 'Evidence Trigger:'} <strong>{evidenceStr}</strong>
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
            {language === 'hi' ? 'सत्यापित नियम निर्देशिका' : 'Verified Knowledge Rules'}
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
            {language === 'hi' ? 'समझ गया / बंद करें' : 'Got it, close'}
          </Button>
        </div>
      </div>
    </div>
  );
};
