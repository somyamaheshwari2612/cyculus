import React, { useState } from 'react';
import type { Flag, KnowledgeRule, Severity } from '@/shared/types';
import { AlertTriangle, Info, Clock, AlertCircle, ExternalLink, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FlagCardProps {
  flag: Flag;
  rule: KnowledgeRule;
  language: 'en' | 'hi';
}

const severityConfig: Record<Severity, {
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  badgeBgClass: string;
  label: { en: string; hi: string };
}> = {
  info: {
    icon: <Info className="w-5 h-5" />,
    bgClass: 'bg-severity-info-bg',
    borderClass: 'border-severity-info/20',
    badgeClass: 'text-severity-info',
    badgeBgClass: 'bg-severity-info/10',
    label: { en: 'Info', hi: 'जानकारी' },
  },
  discuss: {
    icon: <HelpCircle className="w-5 h-5" />,
    bgClass: 'bg-severity-discuss-bg',
    borderClass: 'border-severity-discuss/20',
    badgeClass: 'text-severity-discuss',
    badgeBgClass: 'bg-severity-discuss/10',
    label: { en: 'Worth Discussing', hi: 'डॉक्टर से चर्चा योग्य' },
  },
  soon: {
    icon: <Clock className="w-5 h-5" />,
    bgClass: 'bg-severity-soon-bg',
    borderClass: 'border-severity-soon/20',
    badgeClass: 'text-severity-soon',
    badgeBgClass: 'bg-severity-soon/10',
    label: { en: 'Consult Soon', hi: 'जल्द डॉक्टर से मिलें' },
  },
  urgent: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgClass: 'bg-severity-urgent-bg',
    borderClass: 'border-severity-urgent/20',
    badgeClass: 'text-severity-urgent',
    badgeBgClass: 'bg-severity-urgent/10',
    label: { en: 'Urgent', hi: 'तत्काल' },
  },
};

export const FlagCard: React.FC<FlagCardProps> = ({ flag, rule, language }) => {
  const [showWhy, setShowWhy] = useState(false);
  const config = severityConfig[flag.severity];
  const lang = language;

  // Build human-readable evidence string
  const evidenceStr = Object.entries(flag.evidence)
    .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${val}`)
    .join(' · ');

  return (
    <div className={`rounded-3xl ${config.bgClass} border ${config.borderClass} p-4 sm:p-5 shadow-card transition-all duration-200`}>
      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${config.badgeBgClass} ${config.badgeClass}`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: severity badge + source */}
          <div className="flex items-center justify-between flex-wrap gap-1 mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${config.badgeClass} ${config.badgeBgClass} px-2.5 py-0.5 rounded-full`}>
              {config.label[lang]}
            </span>
            {rule.sources.length > 0 && (
              <span className="text-[10px] text-ink-muted truncate max-w-[120px]">
                {rule.sources[0].name.split('(')[0].trim()}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base font-bold text-ink leading-snug">
            {rule.title[lang]}
          </h4>

          {/* Explanation */}
          <p className="text-xs sm:text-sm text-ink-muted mt-1.5 leading-relaxed">
            {rule.explanation[lang]}
          </p>

          {/* Evidence bar */}
          <div className="mt-3 p-2.5 bg-white/80 rounded-2xl border border-surface-border text-xs text-ink flex items-center justify-between gap-2">
            <span className="text-ink-muted truncate">
              {lang === 'hi' ? 'साक्ष्य: ' : 'Evidence: '}
              <strong className="text-ink">{evidenceStr}</strong>
            </span>
            {rule.sources.length > 0 && (
              <a
                href={rule.sources[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium shrink-0"
              >
                <span>{lang === 'hi' ? 'स्रोत' : 'Source'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Discuss with doctor */}
          <p className="text-xs text-ink-muted mt-2 italic leading-relaxed">
            {rule.discussWithDoctor[lang]}
          </p>

          {/* "Why am I seeing this?" expandable */}
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'यह क्यों दिख रहा है?' : 'Why am I seeing this?'}</span>
            {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showWhy && (
            <div className="mt-2 p-3 bg-white/60 rounded-xl border border-surface-border text-xs text-ink-muted space-y-2 animate-in slide-in-from-top-1">
              <p>
                <strong>{lang === 'hi' ? 'नियम:' : 'Rule:'}</strong>{' '}
                {flag.ruleId.replace(/_/g, ' ')}
              </p>
              <p>
                <strong>{lang === 'hi' ? 'थ्रेशोल्ड:' : 'Thresholds:'}</strong>{' '}
                {Object.entries(rule.params).map(([k, v]) => `${k}: ${v}`).join(', ') || 'N/A'}
              </p>
              <p>
                <strong>{lang === 'hi' ? 'आपका डेटा:' : 'Your data:'}</strong>{' '}
                {evidenceStr}
              </p>
              {rule.sources.map((src, i) => (
                <p key={i}>
                  <strong>{lang === 'hi' ? 'स्रोत:' : 'Source:'}</strong>{' '}
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {src.name}
                  </a>
                  {src.note && <span className="block text-[10px] text-ink-light mt-0.5">{src.note}</span>}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FlagListProps {
  flags: Flag[];
  rules: KnowledgeRule[];
  language: 'en' | 'hi';
}

export const FlagList: React.FC<FlagListProps> = ({ flags, rules, language }) => {
  if (flags.length === 0) return null;

  // Sort flags by severity (urgent > soon > discuss > info)
  const severityOrder: Record<Severity, number> = { urgent: 0, soon: 1, discuss: 2, info: 3 };
  const sorted = [...flags].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const count = sorted.length;
  const headline = count === 1
    ? (language === 'hi'
        ? 'आपके चक्र डेटा में 1 पैटर्न डॉक्टर से चर्चा योग्य पाया गया है।'
        : '1 pattern in your cycle data is worth discussing with your doctor.')
    : (language === 'hi'
        ? `आपके चक्र डेटा में ${count} पैटर्न डॉक्टर से चर्चा योग्य पाए गए हैं।`
        : `${count} patterns in your cycle data are worth discussing with your doctor.`);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-severity-discuss flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-severity-discuss" />
          <span>{language === 'hi' ? 'चिकित्सीय अंतर्दृष्टि' : 'Clinical Insights'}</span>
        </h3>
        <h4 className="text-lg sm:text-xl font-serif font-bold text-ink tracking-tight">
          {headline}
        </h4>
      </div>
      {sorted.map(flag => {
        const rule = rules.find(r => r.id === flag.ruleId);
        if (!rule) return null;
        return <FlagCard key={flag.ruleId} flag={flag} rule={rule} language={language} />;
      })}
    </div>
  );
};
