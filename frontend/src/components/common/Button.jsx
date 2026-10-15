import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-4.5 py-2.5 text-sm gap-2',
  }[size];

  const variantStyles = {
    primary: 'bg-teal-700 hover:bg-teal-800 text-white border border-teal-800 focus:ring-teal-600 shadow-2xs',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-slate-400',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-teal-600 shadow-2xs',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white border border-rose-800 focus:ring-rose-500 shadow-2xs',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span>{children}</span>
    </button>
  );
};
