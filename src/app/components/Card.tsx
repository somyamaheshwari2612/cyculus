import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blush' | 'lavender' | 'peach' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-200 border';

  const variants = {
    default: 'bg-white border-surface-border shadow-card',
    blush: 'bg-[#FFF7F9] border-[#FBE0E7] shadow-card',
    lavender: 'bg-[#FAF6FE] border-[#EEDBFA] shadow-card',
    peach: 'bg-[#FFF8F3] border-[#FCE6D7] shadow-card',
    outlined: 'bg-transparent border-surface-border'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7'
  };

  return (
    <div
      className={twMerge(
        clsx(baseStyles, variants[variant], paddings[padding], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
