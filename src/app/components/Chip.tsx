import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'flow' | 'severity';
  color?: string;
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  className,
  disabled = false
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 min-h-[44px] cursor-pointer select-none active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
          selected
            ? 'bg-primary text-white shadow-soft border border-primary'
            : 'bg-white text-ink border border-surface-border shadow-pill hover:border-primary/30 hover:bg-[#FAF6FE]',
          className
        )
      )}
    >
      {icon && <span className="shrink-0 text-base">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
