import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white',
  secondary: 'bg-surface-lighter hover:bg-surface-lighter/80 text-text border border-border',
  ghost: 'hover:bg-surface-lighter text-text-muted hover:text-text',
  danger: 'bg-error hover:bg-error/90 text-white',
  gradient: 'bg-gradient-to-r from-primary to-secondary text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

export default Button;
