import { AlertOctagon, ExternalLink } from 'lucide-react';
import knowledgeData from '@/shared/knowledge.json';
import { KnowledgeRule } from '@/shared/types';

export interface UrgentBannerProps {
  flagIds: string[];
  language?: 'en' | 'hi';
  onDismiss?: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({
  flagIds,
  language = 'en',
  onDismiss
}) => {
  if (!flagIds || flagIds.length === 0) return null;

  const rules = (knowledgeData.rules as KnowledgeRule[]).filter(r => flagIds.includes(r.id));
  if (rules.length === 0) return null;

  return (
    <div className="rounded-[2rem] bg-rose-50/90 border-2 border-rose-200 p-5 sm:p-6 shadow-card mb-6 animate-pulse-subtle relative overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-700 shrink-0 shadow-soft">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Clinical Red Flag
            </span>
            <span className="text-xs text-rose-700 font-medium">ACOG & FIGO Guideline</span>
          </div>

          <h4 className="text-base sm:text-lg font-serif font-bold text-rose-950 mt-2">
            {language === 'hi'
              ? 'महत्वपूर्ण स्वास्थ्य सूचना: तत्काल डॉक्टरी सलाह लें'
              : 'Clinical Alert: Immediate Medical Evaluation Advised'}
          </h4>

          <div className="mt-3.5 space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="text-xs sm:text-sm text-rose-900 bg-white/90 rounded-2xl p-4 border border-rose-200/80 shadow-soft">
                <p className="font-semibold text-rose-950">{rule.title[language]}</p>
                <p className="mt-1 leading-relaxed text-rose-800">{rule.explanation[language]}</p>
                <p className="mt-2 text-xs font-medium text-rose-950 bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-100">
                  🚨 {rule.discussWithDoctor[language]}
                </p>
                {rule.sources && rule.sources[0] && (
                  <a
                    href={rule.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2.5 text-[11px] text-rose-700 underline hover:text-rose-900 font-medium"
                  >
                    <span>{rule.sources[0].name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3.5 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-rose-700 italic">
              {language === 'hi'
                ? 'यह ऐप मेडिकल सलाह नहीं देता। आपात स्थिति में तुरंत अस्पताल जाएं।'
                : 'This app is not a diagnostic device. If symptoms feel emergency, please visit acute care.'}
            </p>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs font-semibold text-rose-900 hover:text-rose-950 underline px-3 py-1 bg-white/80 rounded-full border border-rose-200 cursor-pointer shadow-soft"
              >
                {language === 'hi' ? 'समझ गई' : 'I understand'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
