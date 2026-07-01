import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 focus:ring-primary-500',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 focus:ring-slate-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 focus:ring-red-500',
  ghost: 'hover:bg-slate-700 text-slate-400 hover:text-slate-200 focus:ring-slate-500',
};

const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', isLoading = false,
  leftIcon, rightIcon, children, className = '', disabled, ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? <LoadingSpinner size="sm" /> : leftIcon && <span>{leftIcon}</span>}
    {children}
    {rightIcon && !isLoading && <span>{rightIcon}</span>}
  </button>
);