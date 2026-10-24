import React from 'react';
import { clsx } from 'clsx';
import { Globe } from 'lucide-react';

export interface LanguageToggleProps {
  language: 'en' | 'hi';
  onToggle: (lang: 'en' | 'hi') => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onToggle,
  className
}) => {
  return (
    <div
      className={clsx(
        'inline-flex items-center bg-white border border-surface-border rounded-full p-1 shadow-pill',
        className
      )}
    >
      <div className="flex items-center pl-2 pr-1 text-ink-muted">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => onToggle('en')}
        className={clsx(
          'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 min-h-[30px] cursor-pointer',
          language === 'en'
            ? 'bg-primary text-white shadow-soft'
            : 'text-ink-muted hover:text-ink'
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onToggle('hi')}
        className={clsx(
          'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 min-h-[30px] cursor-pointer font-devanagari',
          language === 'hi'
            ? 'bg-primary text-white shadow-soft'
            : 'text-ink-muted hover:text-ink'
        )}
      >
        हिन्दी
      </button>
    </div>
  );
};
