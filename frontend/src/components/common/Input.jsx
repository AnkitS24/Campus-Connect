import { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="text-text-muted" size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border border-border bg-surface-light
              px-4 py-2.5 text-text placeholder-text-muted/50
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-error focus:ring-error/50 focus:border-error' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
