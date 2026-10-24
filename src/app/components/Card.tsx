import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'blush' | 'lavender' | 'outlined';
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
    blush: 'bg-blush-soft border-blush/60 shadow-card',
    lavender: 'bg-primary-light border-primary-soft shadow-card',
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
