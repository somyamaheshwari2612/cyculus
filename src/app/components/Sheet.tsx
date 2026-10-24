import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className={twMerge(
          clsx(
            'relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-4xl shadow-sheet max-h-[90vh] flex flex-col transform transition-transform duration-300 ease-out animate-slide-up',
            className
          )
        )}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-ink-faint rounded-full mx-auto mt-3 mb-2 shrink-0 cursor-grab" />

        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 py-3 flex items-center justify-between border-b border-surface-border shrink-0">
            <div>
              {title && <h3 className="text-lg font-semibold text-ink">{title}</h3>}
              {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-subtle min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
