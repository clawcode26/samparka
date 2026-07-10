import React from 'react';
import styles from './Button.module.css';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const rootClasses = [
      styles.btn,
      styles[variant],
      (disabled || isLoading) ? styles.disabled : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={rootClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <LoadingSpinner size={16} color="currentColor" /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
