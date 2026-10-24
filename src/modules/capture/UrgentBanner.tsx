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
    <div className="rounded-3xl bg-red-50 border-2 border-red-300 p-5 shadow-lg mb-6 animate-pulse-subtle">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-red-100 rounded-2xl text-red-600 shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-red-950 flex items-center gap-2">
            <span>
              {language === 'hi'
                ? 'महत्वपूर्ण स्वास्थ्य सूचना: तत्काल डॉक्टरी सलाह लें'
                : 'Clinical Alert: Immediate Medical Evaluation Advised'}
            </span>
          </h4>

          <div className="mt-3 space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="text-xs sm:text-sm text-red-900 bg-white/80 rounded-2xl p-3 border border-red-200">
                <p className="font-semibold text-red-950">{rule.title[language]}</p>
                <p className="mt-1 leading-relaxed text-red-800">{rule.explanation[language]}</p>
                <p className="mt-2 text-xs font-medium text-red-900 bg-red-100/70 py-1.5 px-2.5 rounded-lg">
                  🚨 {rule.discussWithDoctor[language]}
                </p>
                {rule.sources && rule.sources[0] && (
                  <a
                    href={rule.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] text-red-700 underline hover:text-red-900"
                  >
                    <span>{rule.sources[0].name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-red-200 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-red-700 italic">
              {language === 'hi'
                ? 'यह ऐप मेडिकल सलाह नहीं देता। आपात स्थिति में तुरंत अस्पताल जाएं।'
                : 'This app is not a diagnostic device. If symptoms feel emergency, please visit acute care.'}
            </p>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs font-semibold text-red-900 hover:text-red-950 underline px-2 py-1 cursor-pointer"
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
