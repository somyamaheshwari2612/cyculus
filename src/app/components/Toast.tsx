import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    error: 'bg-red-50 border-red-200 text-red-950',
    warning: 'bg-amber-50 border-amber-200 text-amber-950',
    info: 'bg-primary-light border-primary-soft text-ink'
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-in">
      <div
        className={clsx(
          'flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md',
          bgStyles[type]
        )}
      >
        <div className="flex items-center gap-3">
          {icons[type]}
          <span className="text-sm font-medium leading-snug">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-ink-muted hover:text-ink min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
