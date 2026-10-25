import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-[0.98] select-none min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary text-white shadow-soft hover:bg-primary-hover hover:shadow-lg',
    secondary: 'bg-primary-soft text-primary hover:bg-[#E5DAF7]',
    outline: 'border border-surface-border text-ink bg-white hover:border-primary-soft hover:bg-primary-soft/30 shadow-pill',
    ghost: 'text-ink-muted hover:text-ink hover:bg-primary-soft/40',
    danger: 'bg-severity-urgent text-white hover:bg-red-600 shadow-soft'
  };

  const sizes = {
    sm: 'text-xs px-4 py-2 min-h-[44px]',
    md: 'text-xs sm:text-sm px-5 py-2.5 min-h-[44px]',
    lg: 'text-sm sm:text-base px-7 py-3.5 min-h-[48px]'
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </span>
      )}
    </button>
  );
};
